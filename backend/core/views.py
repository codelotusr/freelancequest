import os
import time

import redis
from django.conf import settings
from django.db import connections
from django.db.utils import OperationalError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

APP_START_TIME = time.time()


class PingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        health = {
            "status": "pong",
            "database": "unknown",
            "redis": "unknown",
            "uptime": None,
        }

        uptime_seconds = round(time.time() - APP_START_TIME)
        health["uptime"] = f"{uptime_seconds}"

        try:
            db_conn = connections["default"]
            db_conn.cursor()
            health["database"] = "ok"
        except OperationalError:
            health["database"] = "error"

        try:
            redis_client = redis.Redis.from_url(settings.REDIS_URL)
            redis_client.ping()
            health["redis"] = "ok"
        except Exception as e:
            health["redis"] = f"error: {str(e)}"

        return Response(health)
