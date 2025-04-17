from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from dj_rest_auth.registration.serializers import (
    RegisterSerializer as DjRegisterSerializer,
)
from dj_rest_auth.serializers import UserDetailsSerializer
from django.contrib.auth import authenticate
from django.db.utils import IntegrityError
from rest_framework import serializers

from users.models import Address, ClientProfile, FreelancerProfile, User


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["street", "city", "postal_code", "country"]


class CustomRegisterSerializer(DjRegisterSerializer):
    username = None
    first_name = None
    last_name = None

    class Meta:
        model = User
        fields = ("email", "password1", "password2")

    def get_cleaned_data(self):
        return {
            "email": self.validated_data.get("email", ""),
            "password1": self.validated_data.get("password1", ""),
            "password2": self.validated_data.get("password2", ""),
        }

    def save(self, request):
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        try:
            adapter.save_user(request, user, self)
            setup_user_email(request, user, [])
            user.set_password(self.cleaned_data["password1"])
            user.save()
        except IntegrityError:
            raise serializers.ValidationError(
                {"email": "A user with this email already exists."}
            )
        return user


class FreelancerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreelancerProfile
        fields = ["bio", "skills", "xp", "portfolio_links"]


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = ["organization", "business_description", "website"]


class CustomUserDetailsSerializer(UserDetailsSerializer):
    address = AddressSerializer(read_only=True)
    freelancer_profile = FreelancerProfileSerializer(read_only=True)
    client_profile = ClientProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "pk",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "phone_number",
            "address",
            "role",
            "freelancer_profile",
            "client_profile",
        ]
        read_only_fields = ["email"]

    def get_role(self, obj):
        if hasattr(obj, "freelancer_profile"):
            return "freelancer"
        elif hasattr(obj, "client_profile"):
            return "client"
        return None
