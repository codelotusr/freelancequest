import pytest
from rest_framework.test import APIClient

from users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(api_client, faker):
    def _create_user(email=faker.unique.email(), password="Testing123Secure!"):
        response = api_client.post(
            "/api/auth/registration/",
            {
                "email": email,
                "password1": password,
                "password2": password,
            },
            format="json",
        )
        assert response.status_code == 201
        return response.data

    return _create_user


@pytest.mark.django_db
def test_register_success(api_client):
    response = api_client.post(
        "/api/auth/registration/",
        {
            "email": "newuser@example.com",
            "password1": "Testing123Secure!",
            "password2": "Testing123Secure!",
        },
        format="json",
    )
    assert response.status_code == 201
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["user"]["email"] == "newuser@example.com"


@pytest.mark.django_db
def test_register_duplicate_email(api_client, faker):
    email = faker.unique.email()
    password = "StrongTestPass123!"
    response_1 = api_client.post(
        "/api/auth/registration/",
        {"email": email, "password1": password, "password2": password},
        format="json",
    )
    assert response_1.status_code == 201

    response_2 = api_client.post(
        "/api/auth/registration/",
        {
            "email": email,
            "password1": password,
            "password2": password,
        },
        format="json",
    )
    assert response_2.status_code == 400
    assert "email" in response_2.data or "non_field_errors" in response_2.data


@pytest.mark.django_db
def test_login_success(api_client):
    api_client.post(
        "/api/auth/registration/",
        {
            "email": "loginuser@example.com",
            "password1": "MyPass12345!",
            "password2": "MyPass12345!",
        },
        format="json",
    )

    response = api_client.post(
        "/api/auth/login/",
        {
            "email": "loginuser@example.com",
            "password": "MyPass12345!",
        },
        format="json",
    )
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_login_invalid_credentials(api_client):
    response = api_client.post(
        "/api/auth/login/",
        {"email": "fake@example.com", "password": "wrongpass"},
        format="json",
    )
    assert response.status_code == 400
    assert "non_field_errors" in response.data


@pytest.mark.django_db
def test_logout_success(api_client, create_user):
    create_user(email="logout@example.com", password="Testing123Secure!")
    login = api_client.post(
        "/api/auth/login/",
        {"email": "logout@example.com", "password": "Testing123Secure!"},
        format="json",
    )
    refresh_token = login.data["refresh"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    response = api_client.post("/api/auth/logout/", {"refresh": refresh_token})
    assert response.status_code == 200
