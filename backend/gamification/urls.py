from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    BadgeViewSet,
    LeaderboardViewSet,
    MissionViewSet,
    PlatformBenefitViewSet,
    UserBadgeViewSet,
    UserBenefitViewSet,
    UserMissionProgressViewSet,
)

router = DefaultRouter()
router.register("missions", MissionViewSet, basename="missions")
router.register("progress", UserMissionProgressViewSet, basename="mission-progress")
router.register("badges", BadgeViewSet, basename="badges")
router.register("user-badges", UserBadgeViewSet, basename="user-badges")
router.register("user-benefits", UserBenefitViewSet, basename="user-benefits")
router.register(
    "platform-benefits", PlatformBenefitViewSet, basename="platform-benefits"
)
router.register("leaderboard", LeaderboardViewSet, basename="leaderboard")

urlpatterns = router.urls
