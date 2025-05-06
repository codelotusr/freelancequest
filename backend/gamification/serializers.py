from rest_framework import serializers

from gamification.models import (
    Badge,
    GamificationProfile,
    Mission,
    PlatformBenefit,
    UserBadge,
    UserBenefit,
    UserMissionProgress,
)


class GamificationProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GamificationProfile
        fields = ["xp", "level", "points"]


class MissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mission
        fields = "__all__"


class UserMissionProgressSerializer(serializers.ModelSerializer):
    mission = MissionSerializer(read_only=True)
    seen = serializers.BooleanField()

    class Meta:
        model = UserMissionProgress
        fields = "__all__"
        read_only_fields = ["user", "mission", "completed", "completed_at"]


class BadgeSerializer(serializers.ModelSerializer):
    unlocked = serializers.BooleanField()

    class Meta:
        model = Badge
        fields = "__all__"


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer()

    class Meta:
        model = UserBadge
        fields = "__all__"


class PlatformBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformBenefit
        fields = "__all__"


class UserBenefitSerializer(serializers.ModelSerializer):
    benefit = PlatformBenefitSerializer()

    class Meta:
        model = UserBenefit
        fields = "__all__"
