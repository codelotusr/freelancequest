import json

from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from dj_rest_auth.registration.serializers import (
    RegisterSerializer as DjRegisterSerializer,
)
from dj_rest_auth.serializers import UserDetailsSerializer
from django.db.utils import IntegrityError
from rest_framework import serializers

from gamification.serializers import GamificationProfileSerializer
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
        fields = ["bio", "skills", "portfolio_links"]


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = ["organization", "business_description", "website"]


class CustomUserDetailsSerializer(UserDetailsSerializer):
    username = serializers.SlugField(required=False, allow_null=True, allow_blank=True)
    address = AddressSerializer(read_only=True)
    freelancer_profile = FreelancerProfileSerializer(read_only=True)
    client_profile = ClientProfileSerializer(read_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=False)
    gamification_profile = GamificationProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "pk",
            "email",
            "username",
            "first_name",
            "last_name",
            "profile_picture",
            "address",
            "role",
            "freelancer_profile",
            "client_profile",
            "gamification_profile",
        ]
        read_only_fields = ["email"]

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.username = self.initial_data.get("username", instance.username)

        instance.role = validated_data.get("role", instance.role)

        profile_picture = validated_data.get("profile_picture")
        if profile_picture:
            instance.profile_picture = profile_picture

        address_data = {
            "street": self.initial_data.get("address.street"),
            "city": self.initial_data.get("address.city"),
            "postal_code": self.initial_data.get("address.postal_code"),
            "country": self.initial_data.get("address.country"),
        }

        if all(address_data.values()):
            if instance.address:
                for attr, value in address_data.items():
                    setattr(instance.address, attr, value)
                instance.address.save()
            else:
                address = Address.objects.create(**address_data)
                instance.address = address

        request = self.context.get("request")
        role = validated_data.get("role") or request.data.get("role")

        if role == "freelancer":
            freelancer_data = {
                "bio": request.data.get("freelancer_profile.bio"),
                "skills": json.loads(
                    request.data.get("freelancer_profile.skills", "[]")
                ),
                "portfolio_links": json.loads(
                    request.data.get("freelancer_profile.portfolio_links", "[]")
                ),
            }
            if (
                freelancer_data["bio"]
                or freelancer_data["skills"]
                or freelancer_data["portfolio_links"]
            ):
                profile, _ = FreelancerProfile.objects.get_or_create(user=instance)
                profile.bio = freelancer_data["bio"] or profile.bio
                profile.skills = freelancer_data["skills"] or profile.skills
                profile.portfolio_links = (
                    freelancer_data["portfolio_links"] or profile.portfolio_links
                )
                profile.save()

        elif role == "client":
            client_data = {
                "organization": request.data.get("client_profile.organization"),
                "business_description": request.data.get(
                    "client_profile.business_description"
                ),
                "website": request.data.get("client_profile.website"),
            }

            if any(client_data.values()):
                profile, _ = ClientProfile.objects.get_or_create(user=instance)
                profile.organization = (
                    client_data["organization"] or profile.organization
                )
                profile.business_description = (
                    client_data["business_description"] or profile.business_description
                )
                profile.website = client_data["website"] or profile.website
                profile.save()

        instance.save()
        return instance
