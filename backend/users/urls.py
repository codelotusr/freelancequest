from django.urls import path

from users.views import MeView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("auth/me/", MeView.as_view(), name="me"),
]
