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


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_gamification_profile(sender, instance, created, **kwargs):
    if created:
        GamificationProfile.objects.get_or_create(user=instance)


def award_mission(user, code):
    try:
        mission = Mission.objects.get(code=code)
    except Mission.DoesNotExist:
        return

    progress, created = UserMissionProgress.objects.get_or_create(
        user=user, mission=mission
    )
    if not progress.completed:
        progress.complete()


def award_badge(user, code):
    try:
        badge = Badge.objects.get(code=code)
    except Badge.DoesNotExist:
        return

    UserBadge.objects.get_or_create(user=user, badge=badge)


@receiver(post_save, sender=Gig)
def handle_gig_created(sender, instance, created, **kwargs):
    if created and instance.client:
        award_mission(instance.client, "submit_first_gig")


@receiver(post_save, sender=Application)
def handle_application_created(sender, instance, created, **kwargs):
    if created:
        user = instance.applicant
        award_mission(user, "first_application")

        count = Application.objects.filter(applicant=user).count()
        if count >= 10:
            award_mission(user, "once_10_apps")


@receiver(post_save, sender=GigSubmission)
def handle_submission_created(sender, instance, created, **kwargs):
    if created:
        award_mission(instance.gig.freelancer, "first_submission")


@receiver(post_save, sender=Review)
def handle_review_created(sender, instance, created, **kwargs):
    if created:
        award_mission(instance.gig.client, "write_first_review")
        reviewer_count = Review.objects.filter(gig__client=instance.gig.client).count()
        if reviewer_count >= 5:
            award_badge(instance.gig.client, "reviewer")

        award_mission(instance.gig.freelancer, "receive_review")

        finished = Gig.objects.filter(
            freelancer=instance.gig.freelancer, status="completed"
        ).count()
        if finished >= 1:
            award_badge(instance.gig.freelancer, "first_finish")
        if finished >= 10:
            award_badge(instance.gig.freelancer, "veteran")


@receiver(post_save, sender=UserMissionProgress)
def handle_mission_completion(sender, instance, created, **kwargs):
    if instance.completed:
        total_completed = UserMissionProgress.objects.filter(
            user=instance.user, completed=True
        ).count()
        if total_completed >= 10:
            award_badge(instance.user, "mission_master")


@receiver(user_logged_in)
def handle_user_login(sender, request, user, **kwargs):
    award_mission(user, "daily_login")
