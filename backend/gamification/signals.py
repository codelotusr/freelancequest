from django.conf import settings
from django.contrib.auth.signals import user_logged_in
from django.db.models.signals import post_save
from django.dispatch import receiver

from gamification.models import (
    Badge,
    GamificationProfile,
    Mission,
    UserBadge,
    UserMissionProgress,
)
from gigs.models import Application, Gig, GigSubmission, Review

from .utils import notify_user_gamification


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_gamification_profile(sender, instance, created, **kwargs):
    if created:
        GamificationProfile.objects.get_or_create(user=instance)


def award_mission(user, code, increment=1):
    try:
        mission = Mission.objects.get(code=code)
    except Mission.DoesNotExist:
        return

    progress, _ = UserMissionProgress.objects.get_or_create(user=user, mission=mission)

    if progress.completed:
        return

    progress.current_count = (progress.current_count or 0) + increment

    if progress.current_count >= (mission.goal_count or 1):
        progress.complete()
    else:
        progress.save()


def award_badge(user, code):
    try:
        badge = Badge.objects.get(code=code)
    except Badge.DoesNotExist:
        return

    user_badge, created = UserBadge.objects.get_or_create(user=user, badge=badge)
    if created:
        notify_user_gamification(
            user,
            {
                "type": "badge_unlocked",
                "title": badge.name,
                "description": badge.description,
                "icon": getattr(badge.icon, "url", badge.icon),
            },
        )


@receiver(post_save, sender=Gig)
def handle_gig_created(sender, instance, created, **kwargs):
    if created and instance.client:
        award_mission(instance.client, "submit_first_gig")


@receiver(post_save, sender=Application)
def handle_application_created(sender, instance, created, **kwargs):
    if created:
        user = instance.applicant
        award_mission(user, "first_application")
        award_mission(user, "once_10_apps")

        count = Application.objects.filter(applicant=user).count()

        if count == 1:
            award_badge(user, "first_application")
        if count >= 10:
            award_badge(user, "application_spammer")


@receiver(post_save, sender=GigSubmission)
def handle_submission_created(sender, instance, created, **kwargs):
    if created:
        award_mission(instance.gig.freelancer, "first_submission")
        award_mission(instance.gig.freelancer, "once_5_submissions")


@receiver(post_save, sender=Review)
def handle_review_created(sender, instance, created, **kwargs):
    if created:
        client = instance.gig.client
        freelancer = instance.gig.freelancer

        award_mission(client, "write_first_review")
        award_mission(client, "write_5_reviews")

        review_count = Review.objects.filter(gig__client=client).count()
        if review_count >= 5:
            award_badge(client, "reviewer")

        award_mission(freelancer, "receive_review")

        finished = Gig.objects.filter(freelancer=freelancer, status="completed").count()
        if finished >= 1:
            award_badge(freelancer, "first_finish")
        if finished >= 10:
            award_badge(freelancer, "veteran")


@receiver(post_save, sender=UserMissionProgress)
def handle_mission_completion(sender, instance, created, **kwargs):
    if instance.completed and not instance.seen:
        notify_user_gamification(
            instance.user,
            {
                "type": "mission_completed",
                "title": instance.mission.title,
                "xp": instance.mission.xp_reward,
                "points": instance.mission.point_reward,
            },
        )

        total_completed = UserMissionProgress.objects.filter(
            user=instance.user, completed=True
        ).count()
        if total_completed >= 10:
            award_badge(instance.user, "mission_master")


@receiver(user_logged_in)
def handle_user_login(sender, request, user, **kwargs):
    award_mission(user, "daily_login")
