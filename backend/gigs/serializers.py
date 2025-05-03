from rest_framework import serializers

from gigs.models import Application, Gig, GigSubmission, Review
from users.models import Skill
from users.serializers import SkillSerializer


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "gig", "rating", "feedback", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "gig": {"write_only": True},
        }


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
    freelancer_name = serializers.SerializerMethodField()
    freelancer_username = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    applications = ApplicationSerializer(many=True, read_only=True)
    already_applied = serializers.SerializerMethodField()
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Skill.objects.all(), source="skills"
    )

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
            "freelancer",
            "freelancer_name",
            "freelancer_username",
            "review",
            "applications",
            "already_applied",
            "skills",
            "skill_ids",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "client", "created_at", "updated_at"]

    def get_client_name(self, obj):
        return f"{obj.client.first_name} {obj.client.last_name}" if obj.client else None

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

    def create(self, validated_data):
        validated_data["client"] = self.context["request"].user
        return super().create(validated_data)


class GigSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GigSubmission
        fields = ["id", "gig", "file", "message", "submitted_at"]
        read_only_fields = ["id", "submitted_at", "gig"]

    def create(self, validated_data):
        validated_data["gig"] = self.context["gig"]
        return super().create(validated_data)
