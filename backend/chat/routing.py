from django.urls import path

from .consumers import ChatConsumer
from .views import ChatHistoryView

websocket_urlpatterns = [
    path("ws/chat/<str:username>/", ChatConsumer.as_asgi()),
]
