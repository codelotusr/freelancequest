from datetime import date

from rest_framework import serializers

from gigs.models import Application, ClientInstruction, Gig, GigSubmission, Review
from users.models import Skill
from users.serializers import SkillSerializer


class ReviewSerializer(serializers.ModelSerializer):
    gig_title = serializers.CharField(source="gig.title", read_only=True)
    freelancer_id = serializers.IntegerField(source="gig.freelancer.id", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "gig",
            "gig_title",
            "freelancer_id",
            "rating",
            "feedback",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "gig_title", "freelancer_id"]
        extra_kwargs = {
            "gig": {"write_only": True},
        }


class GigSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GigSubmission
        fields = ["id", "gig", "user", "file", "message", "submitted_at"]
        read_only_fields = ["id", "submitted_at", "gig", "user"]

    def create(self, validated_data):
        validated_data["gig"] = self.context["gig"]
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if instance.file and request:
            data["file"] = request.build_absolute_uri(instance.file.url)
        return data


class GigSubmissionListSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = GigSubmission
        fields = ["id", "file", "file_url", "message", "submitted_at", "user"]
        read_only_fields = fields

    def get_file_url(self, instance):
        request = self.context.get("request")
        if instance.file and request:
            return request.build_absolute_uri(instance.file.url)
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return data


class ClientInstructionSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ClientInstruction
        fields = [
            "id",
            "gig",
            "uploaded_by",
            "file",
            "file_url",
            "description",
            "uploaded_at",
        ]
        read_only_fields = ["id", "gig", "uploaded_by", "uploaded_at"]

    def create(self, validated_data):
        validated_data["gig"] = self.context["gig"]
        validated_data["uploaded_by"] = self.context["request"].user
        return super().create(validated_data)

    def get_file_url(self, instance):
        request = self.context.get("request")
        if instance.file and request:
            return request.build_absolute_uri(instance.file.url)
        return None


class ApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    applicant_username = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    gig_title = serializers.CharField(source="gig.title", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "gig",
            "gig_title",
            "applicant",
            "applicant_name",
            "applicant_username",
            "status",
            "status_display",
            "applied_at",
        ]
        read_only_fields = [
            "id",
            "applicant",
            "applied_at",
            "applicant_name",
            "status_display",
        ]

    def get_applicant_name(self, obj):
        return f"{obj.applicant.first_name} {obj.applicant.last_name}"

    def get_applicant_username(self, obj):
        return obj.applicant.username

    def create(self, validated_data):
        validated_data["applicant"] = self.context["request"].user
        return super().create(validated_data)


class GigSerializer(serializers.ModelSerializer):
    review = ReviewSerializer(required=False, allow_null=True)
    client_name = serializers.SerializerMethodField()
    client_username = serializers.SerializerMethodField()
    freelancer_name = serializers.SerializerMethodField()
    freelancer_username = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    applications = ApplicationSerializer(many=True, read_only=True)
    already_applied = serializers.SerializerMethodField()
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Skill.objects.all(), source="skills"
    )
    submissions = GigSubmissionListSerializer(many=True, read_only=True)
    latest_submission = serializers.SerializerMethodField()
    latest_instruction = serializers.SerializerMethodField()

    class Meta:
        model = Gig
        fields = [
            "id",
            "title",
            "description",
            "price",
            "status",
            "status_display",
            "client",
            "client_name",
            "client_username",
            "freelancer",
            "freelancer_name",
            "freelancer_username",
            "review",
            "applications",
            "already_applied",
            "skills",
            "skill_ids",
            "due_date",
            "submissions",
            "latest_submission",
            "latest_instruction",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "client", "created_at", "updated_at"]

    def get_client_name(self, obj):
        return f"{obj.client.first_name} {obj.client.last_name}" if obj.client else None

    def get_client_username(self, obj):
        return obj.client.username if obj.client else None

    def get_freelancer_name(self, obj):
        return (
            f"{obj.freelancer.first_name} {obj.freelancer.last_name}"
            if obj.freelancer
            else None
        )

    def get_freelancer_username(self, obj):
        return obj.freelancer.username if obj.freelancer else None

    def get_already_applied(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.applications.filter(applicant=request.user).exists()

    def get_latest_submission(self, obj):
        latest = obj.submissions.order_by("-submitted_at").first()
        if latest:
            request = self.context.get("request")
            serializer = GigSubmissionListSerializer(
                latest, context={"request": request}
            )
            return serializer.data
        return None

    def get_latest_instruction(self, obj):
        latest = obj.instructions.order_by("-uploaded_at").first()
        if latest:
            request = self.context.get("request")
            serializer = ClientInstructionSerializer(
                latest, context={"request": request}
            )
            return serializer.data
        return None

    def validate_due_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("Terminas negali būti praeityje.")
        return value

    def create(self, validated_data):
        validated_data["client"] = self.context["request"].user
        return super().create(validated_data)
