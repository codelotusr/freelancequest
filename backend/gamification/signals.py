from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from gamification.models import GamificationProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_gamification_profile(sender, instance, created, **kwargs):
    if created:
        GamificationProfile.objects.get_or_create(user=instance)
