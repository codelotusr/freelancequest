from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from users.serializers import ClientOnboardingSerializer, FreelancerOnboardingSerializer


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


class FreelancerOnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FreelancerOnboardingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Freelancer profile created"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ClientOnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ClientOnboardingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Client profile created"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
