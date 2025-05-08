from django.core.management.base import BaseCommand

from gamification.models import PlatformBenefit


class Command(BaseCommand):
    help = "Seed initial platform benefits"

    def handle(self, *args, **kwargs):

        benefits = [
            {
                "name": "10% nuolaida mokesčiams",
                "description": "Sumažina komisinį mokestį 10% visam laikui",
                "cost": 1000,
                "effect_code": "discount_10",
            },
            {
                "name": "Pirmenybė paraiškose",
                "description": "Tavo paraiškos rodomos aukščiau kitų",
                "cost": 2500,
                "effect_code": "priority_applications",
            },
            {
                "name": "Analizės įrankis",
                "description": "Matyk, kiek žmonių peržiūrėjo tavo paraiškas ir kokiu metu.",
                "cost": 2200,
                "effect_code": "application_analytics",
            },
            {
                "name": "Greitas atsakas",
                "description": "Tavo paraiškos gauna atsakymą per 24 val., kitaip klientas gauna įspėjimą.",
                "cost": 3000,
                "effect_code": "response_guarantee",
            },
        ]

        for b in benefits:
            PlatformBenefit.objects.get_or_create(
                effect_code=b["effect_code"], defaults=b
            )

        self.stdout.write(self.style.SUCCESS("Platform benefits seeded."))
