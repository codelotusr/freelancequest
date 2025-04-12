from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from users.serializers import RegisterSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"info": "Send a POST with email, password, and role."})

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            assert isinstance(user, User)

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "email": user.email,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = (
            "freelancer"
            if hasattr(user, "freelancer_profile")
            else "client" if hasattr(user, "client_profile") else "unknown"
        )

        return Response(
            {
                "email": user.email,
                "role": role,
                "id": user.id,
            }
        )
