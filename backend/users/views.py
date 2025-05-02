from dj_rest_auth.views import LogoutView
from rest_framework import permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet

from users.models import Skill, User
from users.serializers import SkillSerializer


@api_view(["GET"])
def check_username(request):
    username = request.query_params.get("username", "").strip().lower()
    if not username:
        return Response(
            {"detail": "Slapyvardis yra privalomas."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    reserved = {"admin", "api", "auth", "login", "logout", "register", "dashboard"}
    if username in reserved:
        return Response(
            {"detail": "Šis slapyvardis rezervuotas."}, status=status.HTTP_409_CONFLICT
        )

    exists = User.objects.filter(username__iexact=username).exists()
    if exists:
        return Response(
            {"detail": "Šis slapyvardis jau užimtas."},
            status=status.HTTP_409_CONFLICT,
        )

    return Response({"available": True})


class CustomLogoutView(LogoutView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        response.delete_cookie("access")
        response.delete_cookie("refresh")
        return response


class SkillViewSet(ReadOnlyModelViewSet):
    queryset = Skill.objects.all().order_by("name")
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]
