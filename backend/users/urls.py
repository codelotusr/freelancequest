from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SkillViewSet, check_username

router = DefaultRouter()
router.register("skills", SkillViewSet, basename="skills")

urlpatterns = [
    path("", include(router.urls)),
    path("check-username/", check_username, name="check-username"),
]
