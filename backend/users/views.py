from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from users.models import User


@api_view(["GET"])
def check_username(request):
    username = request.query_params.get("username", "").strip().lower()
    if not username:
        return Response(
            {"detail": "Username is required."}, status=status.HTTP_400_BAD_REQUEST
        )

    reserved = {"admin", "api", "auth", "login", "logout", "register", "dashboard"}
    if username in reserved:
        return Response(
            {"detail": "This username is reserved."}, status=status.HTTP_409_CONFLICT
        )

    exists = User.objects.filter(username__iexact=username).exists()
    if exists:
        return Response(
            {"detail": "This username is already taken."},
            status=status.HTTP_409_CONFLICT,
        )

    return Response({"available": True})
