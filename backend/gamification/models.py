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
    points = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} – Lvl {self.level} ({self.xp} XP)"

    def add_xp(self, amount: int):
        self.xp += amount

        while self.xp >= self._xp_needed_for_next_level():
            self.xp -= self._xp_needed_for_next_level()
            self.level += 1

        self.save()

    def _xp_needed_for_next_level(self) -> int:
        return 100 * (2 ** (self.level - 1))

    def add_points(self, amount: int):
        self.points += amount
        self.save()

    def spend_points(self, amount: int) -> bool:
        if self.points >= amount:
            self.points -= amount
            self.save()
            return True
        return False


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
    point_reward = models.PositiveIntegerField(default=0)
    code = models.CharField(max_length=100, unique=True)
    goal_count = models.PositiveIntegerField(default=1)
    track_model = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} ({self.xp_reward} XP)"


class PlatformBenefit(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    cost = models.PositiveIntegerField()
    effect_code = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} – {self.cost} points"


class UserBenefit(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    benefit = models.ForeignKey(PlatformBenefit, on_delete=models.CASCADE)
    acquired_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("user", "benefit")

    def __str__(self):
        return f"{self.user.get_full_name()} – {self.benefit.name}"


class UserMissionProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    seen = models.BooleanField(default=False)
    current_count = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "mission")

    def complete(self):
        if not self.completed:
            self.completed = True
            self.completed_at = timezone.now()
            self.save()

            profile = self.user.gamification_profile
            profile.add_xp(self.mission.xp_reward)
            profile.add_points(self.mission.point_reward)

    def __str__(self):
        return f"{self.user.first_name} – {self.mission.title} – {'true' if self.completed else 'false'}"


class Badge(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    code = models.CharField(max_length=50, unique=True)
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
