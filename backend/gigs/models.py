from django.conf import settings
from django.db import models

from users.models import Skill


class Gig(models.Model):
    STATUS_CHOICES = [
        ("available", "Laisvas"),
        ("in_progress", "Vykdomas"),
        ("pending", "Laukiama patvirtinimo"),
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
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="available"
    )
    skills = models.ManyToManyField(Skill, blank=True, related_name="gigs")
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


def submission_upload_path(instance, filename):
    return f"submissions/gig_{instance.gig.id}/user_{instance.user.id}/{filename}"


def instruction_upload_path(instance, filename):
    return (
        f"instructions/gig_{instance.gig.id}/user_{instance.uploaded_by.id}/{filename}"
    )


class GigSubmission(models.Model):
    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name="submissions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to=submission_upload_path)
    message = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission by {self.user} for {self.gig.title}"


class ClientInstruction(models.Model):
    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name="instructions")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to=instruction_upload_path)
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Instruction by {self.uploaded_by} for {self.gig.title}"
