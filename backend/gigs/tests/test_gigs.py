import pytest
from rest_framework.test import APIClient

from gigs.models import Gig
from users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_create_gig(api_client):
    client = User.objects.create_user(
        email="client2@example.com", password="pass123", role="client"
    )
    login = api_client.post(
        "/api/auth/login/", {"email": client.email, "password": "pass123"}
    )
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
    )  # ✅ fixed

    response = api_client.post(
        "/api/gigs/",
        {
            "title": "New Gig",
            "description": "Do stuff",
            "price": 100,
            "due_date": "2025-12-31",
            "skill_ids": [],
        },
        format="json",
    )
    assert response.status_code == 201
    assert response.data["title"] == "New Gig"


@pytest.mark.django_db
def test_apply_to_gig(api_client):
    client = User.objects.create_user(
        email="client3@example.com", password="pass123", role="client"
    )
    freelancer = User.objects.create_user(
        email="freelancer1@example.com", password="pass123", role="freelancer"
    )
    gig = Gig.objects.create(
        title="Gig A",
        description="Test",
        price=100,
        client=client,
        status="available",
        due_date="2025-12-12",
    )

    login = api_client.post(
        "/api/auth/login/", {"email": freelancer.email, "password": "pass123"}
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    res = api_client.post(f"/api/gigs/{gig.id}/apply/")
    assert res.status_code == 201


@pytest.mark.django_db
def test_confirm_application(api_client):
    client = User.objects.create_user(
        email="client4@example.com", password="pass123", role="client"
    )
    freelancer = User.objects.create_user(
        email="freelancer2@example.com", password="pass123", role="freelancer"
    )
    gig = Gig.objects.create(
        title="Gig B",
        description="Confirm me",
        price=200,
        client=client,
        status="available",
        due_date="2025-12-12",
    )

    # Freelancer applies
    login_f = api_client.post(
        "/api/auth/login/", {"email": freelancer.email, "password": "pass123"}
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_f.data['access']}")
    api_client.post(f"/api/gigs/{gig.id}/apply/")

    # Client confirms
    login_c = api_client.post(
        "/api/auth/login/", {"email": client.email, "password": "pass123"}
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_c.data['access']}")
    res = api_client.post(
        f"/api/gigs/{gig.id}/confirm/", {"freelancer_id": freelancer.id}
    )
    assert res.status_code == 200
    assert res.data["freelancer"] == freelancer.id


@pytest.mark.django_db
def test_get_my_gigs(api_client):
    freelancer = User.objects.create_user(
        email="freelancer3@example.com", password="pass123", role="freelancer"
    )
    client = User.objects.create_user(
        email="client5@example.com", password="pass123", role="client"
    )
    gig = Gig.objects.create(
        title="My gig",
        description="mine",
        price=100,
        client=client,
        freelancer=freelancer,
        status="in_progress",
        due_date="2025-12-12",
    )

    login = api_client.post(
        "/api/auth/login/", {"email": freelancer.email, "password": "pass123"}
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    res = api_client.get("/api/gigs/my/")
    assert res.status_code == 200
    assert any(g["id"] == gig.id for g in res.data)


@pytest.mark.django_db
def test_delete_application_by_freelancer(api_client):
    client = User.objects.create_user(
        email="client6@example.com", password="pass123", role="client"
    )
    freelancer = User.objects.create_user(
        email="freelancer4@example.com", password="pass123", role="freelancer"
    )
    gig = Gig.objects.create(
        title="Gig C",
        description="Withdrawable",
        price=123,
        client=client,
        status="available",
        due_date="2025-12-12",
    )

    login_f = api_client.post(
        "/api/auth/login/", {"email": freelancer.email, "password": "pass123"}
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_f.data['access']}")
    apply = api_client.post(f"/api/gigs/{gig.id}/apply/")
    assert apply.status_code == 201

    delete = api_client.delete(f"/api/gigs/{gig.id}/applications/{freelancer.id}/")
    assert delete.status_code == 204


@pytest.mark.django_db
def test_submit_work(api_client, tmp_path):
    client = User.objects.create_user(
        email="client7@example.com", password="pass123", role="client"
    )
    freelancer = User.objects.create_user(
        email="freelancer7@example.com", password="pass123", role="freelancer"
    )
    gig = Gig.objects.create(
        title="Submitable gig",
        description="test",
        price=200,
        client=client,
        freelancer=freelancer,
        status="in_progress",
        due_date="2025-12-12",
    )

    login = api_client.post(
        "/api/auth/login/", {"email": freelancer.email, "password": "pass123"}
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    file = tmp_path / "submission.txt"
    file.write_text("Here is my work")

    with file.open("rb") as f:
        res = api_client.post(
            f"/api/gigs/{gig.id}/submit_work/",
            {"file": f, "message": "Done!"},
            format="multipart",
        )
    assert res.status_code == 201


@pytest.mark.django_db
def test_approve_submission(api_client, tmp_path):
    client = User.objects.create_user(
        email="client8@example.com", password="pass123", role="client"
    )
    freelancer = User.objects.create_user(
        email="freelancer8@example.com", password="pass123", role="freelancer"
    )
    gig = Gig.objects.create(
        title="Approvable",
        description="test",
        price=300,
        client=client,
        freelancer=freelancer,
        status="in_progress",
        due_date="2025-12-12",
    )

    # Submit work
    login_f = api_client.post(
        "/api/auth/login/", {"email": freelancer.email, "password": "pass123"}
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_f.data['access']}")
    file = tmp_path / "work.txt"
    file.write_text("Work!")
    with file.open("rb") as f:
        api_client.post(
            f"/api/gigs/{gig.id}/submit_work/",
            {"file": f, "message": "Work submitted"},
            format="multipart",
        )

    # Approve work
    login_c = api_client.post(
        "/api/auth/login/", {"email": client.email, "password": "pass123"}
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_c.data['access']}")
    res = api_client.post(
        f"/api/gigs/{gig.id}/approve_submission/", {"rating": 5, "feedback": "Superb"}
    )
    assert res.status_code == 200
