import math

from django.conf import settings
from django.db import models
from django.utils import timezone


class GamificationProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="gamification_profile",
    )
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} – Lvl {self.level} ({self.xp} XP)"

    def add_xp(self, amount: int):
        self.xp += amount
        self.recalculate_level()
        self.save()

    def recalculate_level(self):
        self.level = max(1, math.floor((self.xp / 100) ** 0.5))


class Mission(models.Model):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"
    ONCE = "once"

    TYPE_CHOICES = [
        (DAILY, "Daily"),
        (WEEKLY, "Weekly"),
        (MONTHLY, "Monthly"),
        (YEARLY, "Yearly"),
        (ONCE, "One-time"),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField()
    xp_reward = models.PositiveIntegerField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=ONCE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} ({self.xp_reward} XP)"


class UserMissionProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "mission")

    def __str__(self):
        return f"{self.user.first_name} – {self.mission.title} – {'true' if self.completed else 'false'}"


class Badge(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("user", "badge")

    def __str__(self):
        return f"{self.user.first_name} – {self.badge.name}"
