import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from chat.models import Message

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_chat_history_view(api_client):
    user1 = User.objects.create_user(
        email="alice@example.com", password="pass123", username="alice"
    )
    user2 = User.objects.create_user(
        email="bob@example.com", password="pass123", username="bob"
    )

    Message.objects.create(sender=user1, recipient=user2, content="Hello Bob!")
    Message.objects.create(sender=user2, recipient=user1, content="Hi Alice!")

    login = api_client.post(
        "/api/auth/login/", {"email": "alice@example.com", "password": "pass123"}
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    response = api_client.get(f"/api/chat/history/{user2.username}/")
    assert response.status_code == 200
    assert len(response.data) == 2
    assert response.data[0]["sender"]["username"] == "alice"
    assert response.data[1]["sender"]["username"] == "bob"
