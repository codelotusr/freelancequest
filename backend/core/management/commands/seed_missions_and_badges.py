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
            {
                "code": "daily_apply",
                "title": "Dienos paraiška",
                "description": "Pateik bent vieną paraišką šiandien",
                "xp_reward": 60,
                "point_reward": 10,
                "type": "daily",
                "goal_count": 1,
            },
            {
                "code": "daily_review",
                "title": "Dienos įvertinimas",
                "description": "Parašyk bent vieną atsiliepimą šiandien",
                "xp_reward": 70,
                "point_reward": 10,
                "type": "daily",
                "goal_count": 1,
            },
            {
                "code": "daily_chat",
                "title": "Bendrauk šiandien",
                "description": "Išsiųsk bent vieną žinutę pokalbyje",
                "xp_reward": 40,
                "point_reward": 5,
                "type": "daily",
                "goal_count": 1,
            },
            # === Weekly Missions ===
            {
                "code": "weekly_5_apps",
                "title": "Savaitės paraiškos",
                "description": "Pateik 5 paraiškas šią savaitę",
                "xp_reward": 200,
                "point_reward": 30,
                "type": "weekly",
                "goal_count": 5,
            },
            {
                "code": "weekly_submissions",
                "title": "Atlik savaitės darbus",
                "description": "Pateik 3 atliktus darbus šią savaitę",
                "xp_reward": 300,
                "point_reward": 40,
                "type": "weekly",
                "goal_count": 3,
            },
            {
                "code": "weekly_login_streak",
                "title": "Kasdienis aktyvumas",
                "description": "Prisijunk kiekvieną dieną šią savaitę",
                "xp_reward": 350,
                "point_reward": 50,
                "type": "weekly",
                "goal_count": 7,
            },
            # === Monthly Missions ===
            {
                "code": "monthly_apps",
                "title": "Mėnesio aktyvumas",
                "description": "Pateik 20 paraiškų per šį mėnesį",
                "xp_reward": 500,
                "point_reward": 70,
                "type": "monthly",
                "goal_count": 20,
            },
            {
                "code": "monthly_submissions",
                "title": "Darbingas mėnuo",
                "description": "Pateik 10 darbų šį mėnesį",
                "xp_reward": 700,
                "point_reward": 90,
                "type": "monthly",
                "goal_count": 10,
            },
            {
                "code": "monthly_reviews",
                "title": "Vertintojas",
                "description": "Parašyk 10 atsiliepimų šį mėnesį",
                "xp_reward": 400,
                "point_reward": 50,
                "type": "monthly",
                "goal_count": 10,
            },
            # === Yearly Missions ===
            {
                "code": "yearly_100_apps",
                "title": "Šimtmečio kandidatas",
                "description": "Pateik 100 paraiškų per metus",
                "xp_reward": 2000,
                "point_reward": 200,
                "type": "yearly",
                "goal_count": 100,
            },
            {
                "code": "yearly_50_submissions",
                "title": "Metų specialistas",
                "description": "Pateik 50 atliktų darbų per metus",
                "xp_reward": 2500,
                "point_reward": 250,
                "type": "yearly",
                "goal_count": 50,
            },
            {
                "code": "yearly_mission_master",
                "title": "Metų užduočių meistras",
                "description": "Įvykdyk 100 misijų per metus",
                "xp_reward": 3000,
                "point_reward": 300,
                "type": "yearly",
                "goal_count": 100,
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
