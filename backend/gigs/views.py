from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Gig
from .serializers import GigSerializer, ReviewSerializer


class IsClientOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.method in permissions.SAFE_METHODS or obj.client == request.user


class GigViewSet(viewsets.ModelViewSet):
    queryset = Gig.objects.all().select_related("client", "freelancer")
    serializer_class = GigSerializer
    permission_classes = [permissions.IsAuthenticated, IsClientOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def assign(self, request, pk=None):
        gig = self.get_object()

        if gig.status != "available":
            return Response({"detail": "Gig is not available."}, status=400)

        gig.freelancer = request.user
        gig.status = "in_progress"
        gig.save()

        return Response(self.get_serializer(gig).data)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def complete(self, request, pk=None):
        gig = self.get_object()

        if gig.client != request.user:
            return Response(
                {"detail": "Only the client can mark the gig as completed."}, status=403
            )

        if gig.status != "in_progress":
            return Response(
                {"detail": "Only in-progress gigs can be marked as completed."},
                status=400,
            )

        gig.status = "completed"
        gig.save()

        return Response({"detail": "Gig marked as completed."}, status=200)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def review(self, request, pk=None):
        gig = self.get_object()

        if gig.client != request.user:
            return Response(
                {"detail": "Only the client can leave a review."}, status=403
            )

        if gig.status != "completed":
            return Response(
                {"detail": "You can only review completed gigs."}, status=400
            )

        if hasattr(gig, "review"):
            return Response(
                {"detail": "Review already exists for this gig."}, status=400
            )

        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(gig=gig)

        return Response(serializer.data, status=201)
