import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone

from gamification.models import Badge, Mission, UserBadge, UserMissionProgress

User = get_user_model()


@pytest.mark.django_db
def test_xp_level_up():
    user = User.objects.create_user(email="u1@example.com", password="pass")
    profile = user.gamification_profile

    profile.add_xp(100)
    profile.refresh_from_db()
    assert profile.level == 2
    assert profile.xp == 0

    profile.add_xp(200)
    profile.refresh_from_db()
    assert profile.level == 3
    assert profile.xp == 0

    profile.add_xp(150)
    profile.refresh_from_db()
    assert profile.level == 3
    assert profile.xp == 150


@pytest.mark.django_db
def test_points_add_and_spend():
    user = User.objects.create_user(email="u2@example.com", password="pass")
    profile = user.gamification_profile

    profile.add_points(100)
    profile.refresh_from_db()
    assert profile.points == 100

    success = profile.spend_points(40)
    assert success
    profile.refresh_from_db()
    assert profile.points == 60

    failed = profile.spend_points(100)
    assert not failed
    profile.refresh_from_db()
    assert profile.points == 60


@pytest.mark.django_db
def test_user_mission_completion_awards_xp_and_points():
    user = User.objects.create_user(email="u3@example.com", password="pass")
    profile = user.gamification_profile

    mission = Mission.objects.create(
        title="Test Mission",
        description="Desc",
        xp_reward=50,
        point_reward=20,
        code="test_mission",
        goal_count=1,
    )

    progress = UserMissionProgress.objects.create(user=user, mission=mission)
    progress.complete()
    progress.refresh_from_db()
    assert progress.completed
    assert progress.completed_at is not None

    profile = user.gamification_profile
    profile.refresh_from_db()
    assert profile.xp == 50
    assert profile.points == 20


@pytest.mark.django_db
def test_badge_award_and_uniqueness():
    user = User.objects.create_user(email="u5@example.com", password="pass")
    badge = Badge.objects.create(
        name="Starter", description="Welcome", code="start", icon="star.png"
    )

    awarded = UserBadge.objects.create(user=user, badge=badge)
    assert str(awarded) == f"{user.first_name} – {badge.name}"

    with pytest.raises(Exception):
        UserBadge.objects.create(user=user, badge=badge)
