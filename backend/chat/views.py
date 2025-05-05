from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Message
from .serializers import MessageSerializer

User = get_user_model()


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = request.user
        other_user = User.objects.get(username=username)

        messages = Message.objects.filter(
            sender__in=[user, other_user], recipient__in=[user, other_user]
        ).order_by("timestamp")

        return Response(MessageSerializer(messages, many=True).data)
