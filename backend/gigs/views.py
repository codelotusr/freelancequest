from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import GigFilter
from .models import Application, Gig
from .serializers import GigSerializer, ReviewSerializer


class IsClientOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.method in permissions.SAFE_METHODS or obj.client == request.user


class GigViewSet(viewsets.ModelViewSet):
    queryset = (
        Gig.objects.all()
        .select_related("client", "freelancer")
        .prefetch_related("applications__applicant")
    )
    serializer_class = GigSerializer
    permission_classes = [permissions.IsAuthenticated, IsClientOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = GigFilter

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def assign(self, request, pk=None):
        gig = self.get_object()

        if gig.status != "available":
            return Response({"detail": "Pasiūlymas nėra atviras."}, status=400)

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
                {"detail": "Only the client can mark the gig as completed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if gig.status != "in_progress":
            return Response(
                {"detail": "Only in-progress gigs can be marked as completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        gig.status = "completed"
        gig.save()

        return Response(
            {"detail": "Darbas pažymėtas kaip atliktas."}, status=status.HTTP_200_OK
        )

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def review(self, request, pk=None):
        gig = self.get_object()

        if gig.client != request.user:
            return Response(
                {"detail": "Tik klientas gali palikti atsiliepimą."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if gig.status != "completed":
            return Response(
                {"detail": "Galima pateikti atsiliepimą tik jau padarytams darbams."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if hasattr(gig, "review"):
            return Response(
                {"detail": "Atsiliepimas šiam darbui jau egzistuoją."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(gig=gig)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def apply(self, request, pk=None):
        gig = self.get_object()

        if gig.status != "available":
            return Response(
                {"detail": "Negalima aplikuoti šiam darbui"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Application.objects.filter(gig=gig, applicant=request.user).exists():
            return Response(
                {"detail": "Jūs jau esate pateikę paraišką."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if gig.freelancer:
            return Response(
                {"detail": "Šis darbas jau paskirtas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Application.objects.create(gig=gig, applicant=request.user)
        return Response(
            {"detail": "Paraiška pateikta."}, status=status.HTTP_201_CREATED
        )

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def confirm(self, request, pk=None):
        gig = self.get_object()

        if gig.client != request.user:
            return Response(
                {"detail": "Tik klientas gali pasirinkti specialistą."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if gig.status != "available":
            return Response(
                {"detail": "Šis pasiūlymas jau paskirtas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        freelancer_id = request.data.get("freelancer_id")
        try:
            application = Application.objects.get(gig=gig, applicant_id=freelancer_id)
        except Application.DoesNotExist:
            return Response(
                {"detail": "Paraiška nerasta."}, status=status.HTTP_404_NOT_FOUND
            )

        gig.freelancer = application.applicant
        gig.status = "in_progress"
        gig.save()
        Application.objects.filter(gig=gig).exclude(
            applicant=application.applicant
        ).delete()

        return Response(GigSerializer(gig, context=self.get_serializer_context()).data)

    @action(
        detail=True,
        methods=["delete"],
        url_path="applications/(?P<freelancer_id>[^/.]+)",
        permission_classes=[permissions.IsAuthenticated],
    )
    def delete_application(self, request, pk=None, freelancer_id=None):
        gig = self.get_object()
        user = request.user

        if user.role == "freelancer" and user.id == int(freelancer_id):
            deleted, _ = gig.applications.filter(applicant_id=freelancer_id).delete()
            if deleted == 0:
                return Response(
                    {"detail": "Paraiška nerasta."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(
                {"detail": "Paraiška atšaukta."},
                status=status.HTTP_204_NO_CONTENT,
            )

        if gig.client == user:
            deleted, _ = gig.applications.filter(applicant_id=freelancer_id).delete()
            if deleted == 0:
                return Response(
                    {"detail": "Paraiška nerasta."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(
                {"detail": "Paraiška atmesta."},
                status=status.HTTP_204_NO_CONTENT,
            )

        deleted, _ = gig.applications.filter(applicant_id=freelancer_id).delete()
        if deleted == 0:
            return Response(
                {"detail": "Paraiška nerasta."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"detail": "Paraiška atmesta."}, status=status.HTTP_204_NO_CONTENT
        )
