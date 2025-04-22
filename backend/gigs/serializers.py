from rest_framework import serializers

from gigs.models import Gig, Review


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "gig", "rating", "feedback", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "gig": {"write_only": True},
        }


class GigSerializer(serializers.ModelSerializer):
    review = ReviewSerializer(required=False, allow_null=True)
    client_name = serializers.SerializerMethodField()
    freelancer_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)

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
            "review",
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

    def create(self, validated_data):
        validated_data["client"] = self.context["request"].user
        return super().create(validated_data)
