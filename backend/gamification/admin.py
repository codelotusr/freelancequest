from django.contrib import admin

from .models import GamificationProfile


@admin.register(GamificationProfile)
class GamificationProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "xp", "level")
