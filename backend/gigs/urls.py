from rest_framework.routers import DefaultRouter

from .views import GigViewSet

router = DefaultRouter()
router.register(r"gigs", GigViewSet, basename="gig")

urlpatterns = router.urls
