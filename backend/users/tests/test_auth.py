import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user():
    def _create_user(
        email="test@example.com", password="testing123", role="freelancer"
    ):
        user = User.objects.create_user(email=email, password=password)
        if role == "freelancer":
            from users.models import FreelancerProfile

            FreelancerProfile.objects.create(user=user)
        else:
            from users.models import ClientProfile

            ClientProfile.objects.create(user=user)
        return user

    return _create_user


@pytest.mark.django_db
def test_register_success(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {"email": "newuser@example.com", "password": "testing123", "role": "client"},
    )
    assert response.status_code == 201
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_register_duplicate_email(api_client, create_user):
    create_user(email="existing@example.com")
    response = api_client.post(
        "/api/auth/register/",
        {
            "email": "existing@example.com",
            "password": "testing123",
            "role": "freelancer",
        },
    )
    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.django_db
def test_login_success(api_client, create_user):
    user = create_user(email="loginuser@example.com", password="mypassword")
    response = api_client.post(
        "/api/token/", {"email": "loginuser@example.com", "password": "mypassword"}
    )
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_login_invalid_credentials(api_client):
    response = api_client.post(
        "/api/token/", {"email": "fake@example.com", "password": "wrongpass"}
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_me_endpoint(api_client, create_user):
    user = create_user(email="me@example.com", password="testing123")
    login = api_client.post(
        "/api/token/", {"email": "me@example.com", "password": "testing123"}
    )
    token = login.data["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    response = api_client.get("/api/auth/me/")
    assert response.status_code == 200
    assert response.data["email"] == "me@example.com"


def test_me_requires_auth(api_client):
    response = api_client.get("/api/auth/me/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_logout_success(api_client, create_user):
    user = create_user(email="logout@example.com", password="testing123")
    login = api_client.post(
        "/api/token/", {"email": "logout@example.com", "password": "testing123"}
    )
    refresh_token = login.data["refresh"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    response = api_client.post("/api/auth/logout/", {"refresh": refresh_token})
    assert response.status_code == 205
