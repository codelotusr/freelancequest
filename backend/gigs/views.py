import json
from typing import cast

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import GigFilter, ReviewFilter
from .models import Application, Gig, Review
from .serializers import (
    ApplicationSerializer,
    ClientInstructionSerializer,
    GigSerializer,
    GigSubmissionListSerializer,
    GigSubmissionSerializer,
    ReviewSerializer,
)


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

    def _set_gig_skills(self, gig, data):
        skill_ids = data.get("skill_ids", [])
        if isinstance(skill_ids, str):
            try:
                skill_ids = json.loads(skill_ids)
            except json.JSONDecodeError:
                skill_ids = []

        if isinstance(skill_ids, list):
            gig.skills.set(skill_ids)

    def perform_create(self, serializer):
        gig = serializer.save(client=self.request.user)
        self._set_gig_skills(gig, self.request.data)

    def perform_update(self, serializer):
        gig = serializer.save()
        self._set_gig_skills(gig, self.request.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        gig = serializer.save(client=request.user)
        self._set_gig_skills(gig, request.data)

        response_serializer = self.get_serializer(gig)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def assign(self, request, pk=None):
        gig = cast(Gig, self.get_object())

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

        application.status = "accepted"
        application.save()

        Application.objects.filter(gig=gig).exclude(
            applicant=application.applicant
        ).update(status="rejected")

        return Response(self.get_serializer(gig).data)

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

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def my(self, request):
        gigs = Gig.objects.filter(freelancer=request.user)
        serializer = self.get_serializer(gigs, many=True)
        return Response(serializer.data)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def submit_work(self, request, pk=None):
        gig = self.get_object()

        if gig.freelancer != request.user:
            return Response(
                {"detail": "Tik paskirtas specialistas gali pateikti darbą."},
                status=403,
            )

        serializer = GigSubmissionSerializer(
            data={
                "file": request.FILES.get("file"),
                "message": request.data.get("message", ""),
            },
            context={"gig": gig, "request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        gig.status = "pending"
        gig.save()

        return Response({"detail": "Darbas pateiktas."}, status=201)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def approve_submission(self, request, pk=None):
        gig = self.get_object()

        if gig.client != request.user:
            return Response(
                {"detail": "Tik klientas gali patvirtinti darbą."}, status=403
            )

        latest_submission = gig.submissions.order_by("-submitted_at").first()
        if not latest_submission:
            return Response({"detail": "Darbas dar nepateiktas."}, status=400)

        if gig.status != "pending":
            return Response(
                {"detail": "Darbas jau patvirtintas arba netinkamoje būsenoje."},
                status=400,
            )

        gig.status = "completed"
        gig.save()

        rating = request.data.get("rating")
        feedback = request.data.get("feedback")

        if rating and feedback:
            if hasattr(gig, "review"):
                return Response({"detail": "Atsiliepimas jau egzistuoja."}, status=400)

            Review.objects.create(gig=gig, rating=int(rating), feedback=feedback)

        return Response(
            {"detail": "Darbas patvirtintas ir atsiliepimas pateiktas."}, status=200
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def decline_submission(self, request, pk=None):
        gig = self.get_object()

        if gig.client != request.user:
            return Response({"detail": "Tik klientas gali atmesti darbą."}, status=403)

        latest_submission = gig.submissions.order_by("-submitted_at").first()
        if not latest_submission:
            return Response({"detail": "Darbas dar nepateiktas."}, status=400)

        if gig.status != "pending":
            return Response(
                {"detail": "Tik laukiami darbai gali būti atmesti."}, status=400
            )

        gig.status = "in_progress"
        gig.save()

        return Response(
            {"detail": "Darbas atmestas. Specialistas gali pateikti iš naujo."},
            status=200,
        )

    @action(
        detail=True,
        methods=["get"],
        url_path="submissions",
        permission_classes=[permissions.IsAuthenticated],
    )
    def list_submissions(self, request, pk=None):
        gig = self.get_object()

        if gig.client != request.user and gig.freelancer != request.user:
            return Response(
                {
                    "detail": "Tik klientas arba paskirtas specialistas gali matyti pateikimus."
                },
                status=403,
            )

        submissions = gig.submissions.all().order_by("-submitted_at")
        serializer = GigSubmissionListSerializer(
            submissions, many=True, context=self.get_serializer_context()
        )
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["get"],
        url_path="instructions",
        permission_classes=[permissions.IsAuthenticated],
    )
    def list_instructions(self, request, pk=None):
        gig = self.get_object()

        if gig.client != request.user and gig.freelancer != request.user:
            return Response(
                {
                    "detail": "Tik klientas arba paskirtas specialistas gali matyti nurodymus."
                },
                status=403,
            )

        instructions = gig.instructions.all().order_by("-uploaded_at")
        serializer = ClientInstructionSerializer(
            instructions, many=True, context=self.get_serializer_context()
        )
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        url_path="submit-instruction",
        permission_classes=[permissions.IsAuthenticated],
    )
    def submit_instruction(self, request, pk=None):
        gig = self.get_object()

        if gig.client != request.user:
            return Response(
                {"detail": "Tik klientas gali pateikti nurodymus."}, status=403
            )

        serializer = ClientInstructionSerializer(
            data=request.data, context={"request": request, "gig": gig}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=201)


class MyApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = Application.objects.filter(
            applicant=request.user
        ).select_related("gig")
        serializer = ApplicationSerializer(
            applications, many=True, context={"request": request}
        )
        return Response(serializer.data)


class ReviewViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Review.objects.select_related("gig__freelancer", "gig__client")
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ReviewFilter
