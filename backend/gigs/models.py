from django.conf import settings
from django.db import models


class Gig(models.Model):
    STATUS_CHOICES = [
        ("available", "Laisvas"),
        ("pending", "Laukiama patvirtinimo"),
        ("in_progress", "Vykdomas"),
        ("completed", "Įvykdytas"),
        ("cancelled", "Atšauktas"),
    ]

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gigs_created"
    )
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="gigs_taken",
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="available"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Review(models.Model):
    gig = models.OneToOneField(Gig, on_delete=models.CASCADE, related_name="review")
    rating = models.PositiveSmallIntegerField()
    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.gig.title}"


class Application(models.Model):
    STATUS_CHOICES = [
        ("pending", "Laukiama"),
        ("accepted", "Patvirtinta"),
        ("rejected", "Atmesta"),
    ]

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="gig_applications",
    )
    gig = models.ForeignKey(
        "gigs.Gig", on_delete=models.CASCADE, related_name="applications"
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("applicant", "gig")

    def __str__(self):
        return f"{self.applicant} -> {self.gig.title} ({self.status})"
