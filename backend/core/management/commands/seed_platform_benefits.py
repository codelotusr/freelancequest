from django.core.management.base import BaseCommand

from gamification.models import PlatformBenefit


class Command(BaseCommand):
    help = "Seed initial platform benefits"

    def handle(self, *args, **kwargs):
        benefits = [
            {
                "name": "10% nuolaida mokesčiams",
                "description": "Sumažina platformos mokestį 10% visam laikui",
                "cost": 1000,
                "effect_code": "discount_10",
            },
            {
                "name": "Pirmenybė paraiškose",
                "description": "Tavo paraiškos rodomos aukščiau",
                "cost": 2500,
                "effect_code": "priority_applications",
            },
        ]

        for b in benefits:
            PlatformBenefit.objects.get_or_create(
                effect_code=b["effect_code"], defaults=b
            )

        self.stdout.write(self.style.SUCCESS("Platform benefits seeded."))
