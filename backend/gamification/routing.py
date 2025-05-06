from django.urls import re_path

from gamification.consumers import GamificationConsumer

websocket_urlpatterns = [
    re_path(r"ws/gamification/$", GamificationConsumer.as_asgi()),
]
