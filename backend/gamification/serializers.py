from rest_framework import serializers

from gamification.models import GamificationProfile


class GamificationProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GamificationProfile
        fields = ["xp", "level"]
