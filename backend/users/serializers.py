from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from users.models import ClientProfile, FreelancerProfile, User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=[("freelancer", "freelancer"), ("client", "client")]
    )

    class Meta:
        model = User
        fields = ("email", "password", "role")

    def create(self, validated_data):
        role = validated_data.pop("role")
        user = User.objects.create_user(**validated_data)

        if role == "freelancer":
            FreelancerProfile.objects.create(user=user)
        else:
            ClientProfile.objects.create(user=user)

        print(User.objects.count())

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email:
            email = email.lower()

        user = authenticate(
            request=self.context.get("request"), email=email, password=password
        )

        if not user:
            raise serializers.ValidationError(
                "No active account found with the given credentials"
            )

        data = super().validate(attrs)
        assert isinstance(user, User)
        data["email"] = user.email
        return data
