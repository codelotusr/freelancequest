from django.contrib import admin

from .models import Gig, Review


@admin.register(Gig)
class GigAdmin(admin.ModelAdmin):
    list_display = ("title", "client", "freelancer", "status", "created_at")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("gig", "rating", "created_at")
