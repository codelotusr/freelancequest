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
                "goal_count": 1,
            },
            {
                "code": "submit_first_gig",
                "title": "Sukurk pirmą darbą",
                "description": "Sukurk savo pirmą pasiūlymą",
                "xp_reward": 100,
                "point_reward": 20,
                "type": "once",
                "goal_count": 1,
            },
            {
                "code": "first_application",
                "title": "Pirma paraiška",
                "description": "Pateik pirmą paraišką į darbą",
                "xp_reward": 100,
                "point_reward": 20,
                "type": "once",
                "goal_count": 1,
            },
            {
                "code": "once_10_apps",
                "title": "10 paraiškų",
                "description": "Pateik 10 paraiškų",
                "xp_reward": 500,
                "point_reward": 50,
                "type": "once",
                "goal_count": 10,
            },
            {
                "code": "first_submission",
                "title": "Pirmas atliktas darbas",
                "description": "Pateik savo pirmą atliktą darbą",
                "xp_reward": 200,
                "point_reward": 30,
                "type": "once",
                "goal_count": 1,
            },
            {
                "code": "once_5_submissions",
                "title": "5 atlikti darbai",
                "description": "Pateik 5 atliktus darbus",
                "xp_reward": 600,
                "point_reward": 100,
                "type": "once",
                "goal_count": 5,
            },
            {
                "code": "write_first_review",
                "title": "Parašyk atsiliepimą",
                "description": "Palik pirmą atsiliepimą",
                "xp_reward": 100,
                "point_reward": 10,
                "type": "once",
                "goal_count": 1,
            },
            {
                "code": "write_5_reviews",
                "title": "Atsiliepimų serija",
                "description": "Parašyk 5 atsiliepimus",
                "xp_reward": 400,
                "point_reward": 50,
                "type": "once",
                "goal_count": 5,
            },
            {
                "code": "receive_review",
                "title": "Gauk atsiliepimą",
                "description": "Gauk pirmą atsiliepimą",
                "xp_reward": 100,
                "point_reward": 10,
                "type": "once",
                "goal_count": 1,
            },
            {
                "code": "first_finish",
                "title": "Užbaik darbą",
                "description": "Sėkmingai užbaik pirmą paskirtą darbą",
                "xp_reward": 150,
                "point_reward": 20,
                "type": "once",
                "goal_count": 1,
            },
            {
                "code": "veteran",
                "title": "Veteranas",
                "description": "Įvykdyk 10 paskirtų darbų",
                "xp_reward": 1000,
                "point_reward": 100,
                "type": "once",
                "goal_count": 10,
            },
            {
                "code": "mission_master",
                "title": "Misijų meistras",
                "description": "Įvykdyk 10 misijų",
                "xp_reward": 1000,
                "point_reward": 100,
                "type": "once",
                "goal_count": 10,
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
            {
                "code": "first_application",
                "name": "Pirmoji paraiška",
                "description": "Pateikei savo pirmą paraišką į darbą",
                "icon": "📄",
            },
            {
                "code": "first_finish",
                "name": "Pirmasis",
                "description": "Pabaigei savo pirmą darbą",
                "icon": "🥇",
            },
        ]

        for data in missions:
            Mission.objects.update_or_create(code=data["code"], defaults=data)

        for data in badges:
            Badge.objects.update_or_create(code=data["code"], defaults=data)

        self.stdout.write(self.style.SUCCESS("Missions and badges seeded."))
