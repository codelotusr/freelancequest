from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Message

User = get_user_model()


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "profile_picture")


class MessageSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer()
    recipient = UserMiniSerializer()

    class Meta:
        model = Message
        fields = "__all__"
