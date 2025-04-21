import random

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from gamification.models import GamificationProfile
from users.models import Address, ClientProfile, FreelancerProfile, User

freelancers = [
    {
        "email": "paulius.barankevicius@gmail.com",
        "username": "paulbarank",
        "first_name": "Paulius",
        "last_name": "Barankevičius",
        "bio": "Labai profesionalus ir talentingas žmogus",
        "skills": ["Grafinis dizainas", "Konsultavimas", "Logotipų kūrimas"],
        "address": {
            "street": "Galnių pr. 21",
            "city": "Kaunas",
            "postal_code": "12345",
            "country": "Lietuva",
        },
        "xp": 1465,
    },
    {
        "email": "albertas.einsteinas@gmail.com",
        "username": "fizikosdievas",
        "first_name": "Albertas",
        "last_name": "Einšteinas",
        "bio": "Atradau reliatyvumo teoriją",
        "skills": ["Matematika", "Fizika"],
        "address": {
            "street": "Galvoių pr. 21",
            "city": "Kaunas",
            "postal_code": "12345",
            "country": "Lietuva",
        },
        "xp": 5224,
    },
    {
        "email": "kalpekasss@gmail.com",
        "username": "kinoteatromatrica",
        "first_name": "Vanesa",
        "last_name": "Durabytė",
        "bio": "Geriausia psichologė lietuvoje",
        "skills": ["Konsultacijos", "Psichologija"],
        "address": {
            "street": "Alvonių pr. 21",
            "city": "Kaunas",
            "postal_code": "12345",
            "country": "Lietuva",
        },
        "xp": 4455,
    },
]

clients = [
    {
        "email": "laura@interjeroerdve.lt",
        "username": "interjeroerdve",
        "first_name": "Laura",
        "last_name": "Kazlauskienė",
        "organization": "UAB Korepetitorių salonas",
        "business_description": "Suteikiame korepetitorių paslaugas",
        "address": {
            "street": "Bangos g. 12",
            "city": "Vilnius",
            "postal_code": "12345",
            "country": "Lietuva",
        },
    },
    {
        "email": "jurate@versloteise.lt",
        "username": "versloteise",
        "first_name": "Jūratė",
        "last_name": "Grigaitė",
        "organization": "UAB Verslo teisės centras",
        "business_description": "Siūlome profesionalias teisines paslaugas verslui ir privatiems klientams.",
        "address": {
            "street": "Galvonių pr. 21",
            "city": "Kaunas",
            "postal_code": "12345",
            "country": "Lietuva",
        },
    },
]


class Command(BaseCommand):
    help = "Seed freelancers, clients, and gamification profiles"

    def handle(self, *args, **kwargs):
        for f in freelancers:
            user, created = User.objects.get_or_create(
                email=f["email"],
                defaults={
                    "username": slugify(f["username"]),
                    "first_name": f["first_name"],
                    "last_name": f["last_name"],
                    "role": "freelancer",
                    "is_active": True,
                },
            )
            address_obj = Address.objects.create(**f["address"])
            user.address = address_obj
            user.set_password("testpass123")
            user.save()

            FreelancerProfile.objects.get_or_create(
                user=user,
                defaults={
                    "bio": f["bio"],
                    "skills": f["skills"],
                    "portfolio_links": [],
                },
            )

            gp, _ = GamificationProfile.objects.get_or_create(user=user)
            gp.xp = f["xp"]
            gp.recalculate_level()
            gp.save()

            self.stdout.write(self.style.SUCCESS(f"Created freelancer {user.username}"))

        for c in clients:
            user, created = User.objects.get_or_create(
                email=c["email"],
                defaults={
                    "username": slugify(c["username"]),
                    "first_name": c["first_name"],
                    "last_name": c["last_name"],
                    "role": "client",
                    "is_active": True,
                },
            )
            address_obj = Address.objects.create(**c["address"])
            user.address = address_obj

            user.set_password("testpass123")
            user.save()

            ClientProfile.objects.get_or_create(
                user=user,
                defaults={
                    "organization": c["organization"],
                    "business_description": c["business_description"],
                    "website": "",
                },
            )

            GamificationProfile.objects.get_or_create(user=user)

            self.stdout.write(self.style.SUCCESS(f"Created client {user.username}"))
