from django.core.management.base import BaseCommand

from gamification.models import Badge, Mission


class Command(BaseCommand):
    help = "Seed missions and badges"

    def handle(self, *args, **options):

        missions = [
            {
                "code": "daily_login",
                "title": "Prisijunk šiandien",
                "description": "Prisijunk prie platformos šiandien",
                "xp_reward": 50,
                "point_reward": 10,
                "type": "daily",
            },
            {
                "code": "submit_first_gig",
                "title": "Sukurk pirmą darbą",
                "description": "Sukurk savo pirmą pasiūlymą",
                "xp_reward": 100,
                "point_reward": 20,
                "type": "once",
            },
            {
                "code": "first_application",
                "title": "Pirma paraiška",
                "description": "Pateik pirmą paraišką į darbą",
                "xp_reward": 100,
                "point_reward": 20,
                "type": "once",
            },
            {
                "code": "once_10_apps",
                "title": "10 paraiškų",
                "description": "Pateik 10 paraiškų",
                "xp_reward": 500,
                "point_reward": 50,
                "type": "once",
            },
            {
                "code": "first_submission",
                "title": "Pirmas atliktas darbas",
                "description": "Pateik savo pirmą atliktą darbą",
                "xp_reward": 200,
                "point_reward": 30,
                "type": "once",
            },
            {
                "code": "write_first_review",
                "title": "Parašyk atsiliepimą",
                "description": "Palik pirmą atsiliepimą",
                "xp_reward": 100,
                "point_reward": 10,
                "type": "once",
            },
            {
                "code": "receive_review",
                "title": "Gauk atsiliepimą",
                "description": "Gauk pirmą atsiliepimą",
                "xp_reward": 100,
                "point_reward": 10,
                "type": "once",
            },
            {
                "code": "first_finish",
                "title": "Užbaik darbą",
                "description": "Sėkmingai užbaik pirmą paskirtą darbą",
                "xp_reward": 150,
                "point_reward": 20,
                "type": "once",
            },
            {
                "code": "veteran",
                "title": "Veteranas",
                "description": "Įvykdyk 10 paskirtų darbų",
                "xp_reward": 1000,
                "point_reward": 100,
                "type": "once",
            },
            {
                "code": "mission_master",
                "title": "Misijų meistras",
                "description": "Įvykdyk 10 misijų",
                "xp_reward": 1000,
                "point_reward": 100,
                "type": "once",
            },
            {
                "code": "weekly_login_3x",
                "title": "Prisijunk 3 kartus per savaitę",
                "description": "Prisijunk bent 3 skirtingomis dienomis per savaitę",
                "xp_reward": 200,
                "point_reward": 40,
                "type": "weekly",
            },
            {
                "code": "monthly_submission",
                "title": "Mėnesio atliktas darbas",
                "description": "Pateik bent vieną darbą per mėnesį",
                "xp_reward": 300,
                "point_reward": 60,
                "type": "monthly",
            },
            {
                "code": "daily_check_gigs",
                "title": "Peržiūrėk darbus šiandien",
                "description": "Atsidaryk pasiūlymų sąrašą bent kartą per dieną",
                "xp_reward": 50,
                "point_reward": 10,
                "type": "daily",
            },
            {
                "code": "apply_streak_3",
                "title": "3 paraiškų serija",
                "description": "Pateik paraiškas 3 dienas iš eilės",
                "xp_reward": 250,
                "point_reward": 50,
                "type": "daily",
            },
            {
                "code": "yearly_legend",
                "title": "Metų legenda",
                "description": "Būk aktyvus bent kartą per mėnesį ištisus metus",
                "xp_reward": 5000,
                "point_reward": 500,
                "type": "yearly",
            },
        ]

        badges = [
            {
                "code": "first_finish",
                "name": "Pirmasis",
                "description": "Pabaigei savo pirmą darbą",
                "icon": "🥇",
            },
            {
                "code": "veteran",
                "name": "Veteranas",
                "description": "Įvykdei 10 darbų",
                "icon": "🏆",
            },
            {
                "code": "reviewer",
                "name": "Atsiliepėjas",
                "description": "Parašei 5 atsiliepimus",
                "icon": "📝",
            },
            {
                "code": "mission_master",
                "name": "Misijų Meistras",
                "description": "Įvykdei 10 misijų",
                "icon": "🎯",
            },
            {
                "code": "loyal_user",
                "name": "Ištikimas vartotojas",
                "description": "Prisijungei kiekvieną dieną savaitę iš eilės",
                "icon": "💎",
            },
        ]

        for data in missions:
            Mission.objects.update_or_create(code=data["code"], defaults=data)

        for data in badges:
            Badge.objects.update_or_create(code=data["code"], defaults=data)

        self.stdout.write(self.style.SUCCESS("Missions and badges seeded."))
