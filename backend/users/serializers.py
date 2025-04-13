from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from dj_rest_auth.registration.serializers import (
    RegisterSerializer as DjRegisterSerializer,
)
from django.contrib.auth import authenticate
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
        adapter.save_user(request, user, self)
        setup_user_email(request, user, [])
        user.set_password(self.cleaned_data["password1"])
        user.save()
        return user


class FreelancerOnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreelancerProfile
        fields = ("bio", "skills", "xp", "portfolio_links")


class ClientOnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = ("organization", "business_description")
