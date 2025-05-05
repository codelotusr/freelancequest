from urllib.parse import parse_qs

from channels.middleware import BaseMiddleware
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware that reads the JWT access token from the cookie or query string for dev/testing.
    """

    async def __call__(self, scope, receive, send):
        headers = dict(scope.get("headers", []))
        cookies = headers.get(b"cookie", b"").decode()

        token = None
        for cookie in cookies.split(";"):
            name, _, value = cookie.strip().partition("=")
            if name == settings.REST_AUTH["JWT_AUTH_COOKIE"]:
                token = value
                break

        if not token:
            query_string = scope.get("query_string", b"").decode()
            query_params = parse_qs(query_string)
            token_list = query_params.get("token")
            if token_list:
                token = token_list[0]

        try:
            validated_token = AccessToken(token)
            user_id = validated_token.get("user_id")
            close_old_connections()
            user = await User.objects.aget(id=user_id)
        except Exception:
            user = AnonymousUser()

        scope["user"] = user
        return await super().__call__(scope, receive, send)
