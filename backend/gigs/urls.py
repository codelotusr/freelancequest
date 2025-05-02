from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import GigViewSet, MyApplicationsView

router = DefaultRouter()
router.register(r"gigs", GigViewSet, basename="gig")

urlpatterns = [
    path("", include(router.urls)),
    path("applications/my/", MyApplicationsView.as_view(), name="my-applications"),
]
