from typing import Any

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import QuerySet
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

User = get_user_model()

from gamification.models import (
    Badge,
    Mission,
    PlatformBenefit,
    UserBadge,
    UserBenefit,
    UserMissionProgress,
)
from gamification.serializers import (
    BadgeSerializer,
    LeaderboardEntrySerializer,
    MissionSerializer,
    PlatformBenefitSerializer,
    UserBadgeSerializer,
    UserBenefitSerializer,
    UserMissionProgressSerializer,
)


class MissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Mission.objects.filter(is_active=True)
    serializer_class = MissionSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserMissionProgressViewSet(viewsets.ModelViewSet):
    serializer_class = UserMissionProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Any]:
        return UserMissionProgress.objects.filter(
            user=self.request.user
        ).select_related("mission")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        progress = self.get_object()
        if not progress.completed:
            progress.complete()
            return Response(
                {
                    "completed": True,
                    "mission": UserMissionProgressSerializer(progress).data,
                    "message": f"Įvykdei misiją: {progress.mission.title}!",
                }
            )
        return Response(
            {
                "completed": False,
                "message": "Misija jau įvykdyta.",
            }
        )

    @action(detail=False, methods=["get"])
    def recent(self, request):
        recent = UserMissionProgress.objects.filter(
            user=request.user, completed=True, seen=False
        ).select_related("mission")
        serializer = self.get_serializer(recent, many=True)
        return Response(serializer.data)


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        user_badge_ids = UserBadge.objects.filter(user=user).values_list(
            "badge_id", flat=True
        )
        return Badge.objects.annotate(
            unlocked=models.Case(
                models.When(id__in=user_badge_ids, then=models.Value(True)),
                default=models.Value(False),
                output_field=models.BooleanField(),
            )
        )


class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Any]:
        return UserBadge.objects.filter(user=self.request.user).select_related("badge")


class UserBenefitViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserBenefitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Any]:
        return UserBenefit.objects.filter(user=self.request.user).select_related(
            "benefit"
        )


class PlatformBenefitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PlatformBenefit.objects.all()
    serializer_class = PlatformBenefitSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"])
    def buy(self, request, pk=None):
        user = request.user
        benefit = self.get_object()
        profile = user.gamification_profile

        if UserBenefit.objects.filter(user=user, benefit=benefit).exists():
            return Response(
                {"detail": "Jau turi šią naudą."}, status=status.HTTP_400_BAD_REQUEST
            )

        if profile.points < benefit.cost:
            return Response(
                {"detail": "Nepakanka taškų."}, status=status.HTTP_400_BAD_REQUEST
            )

        success = profile.spend_points(benefit.cost)
        if success:
            UserBenefit.objects.create(user=user, benefit=benefit)
            return Response({"detail": "Nauda įsigyta!"})
        return Response(
            {"detail": "Nepavyko nusipirkti naudos."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class LeaderboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=["get"])
    def freelancers(self, request):
        freelancers = (
            User.objects.filter(role="freelancer")
            .select_related("gamification_profile")
            .order_by("-gamification_profile__xp", "-gamification_profile__level")
        )
        serializer = LeaderboardEntrySerializer(freelancers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def clients(self, request):
        clients = (
            User.objects.filter(role="client")
            .select_related("gamification_profile")
            .order_by("-gamification_profile__xp", "-gamification_profile__level")
        )
        serializer = LeaderboardEntrySerializer(clients, many=True)
        return Response(serializer.data)
