from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


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
    current_count = serializers.IntegerField()
    goal_count = serializers.SerializerMethodField()
    seen = serializers.BooleanField()

    class Meta:
        model = UserMissionProgress
        fields = "__all__"
        read_only_fields = ["user", "mission", "completed", "completed_at"]

    def get_goal_count(self, obj):
        return obj.mission.goal_count


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


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    level = serializers.IntegerField(source="gamification_profile.level")
    xp = serializers.IntegerField(source="gamification_profile.xp")
    points = serializers.IntegerField(source="gamification_profile.points")
    profile_picture = serializers.ImageField(allow_null=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "profile_picture",
            "level",
            "xp",
            "points",
        ]
