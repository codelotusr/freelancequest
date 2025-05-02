from django.core.management.base import BaseCommand

from users.models import Skill

SKILLS = [
    # Grafinis dizainas
    "Logotipų kūrimas",
    "Vizitinės kortelės",
    "Plakatų dizainas",
    "Prekės ženklo identitetas",
    "Sąsajų dizainas (UI)",
    "Naudotojo patirties dizainas (UX)",
    "Socialinių tinklų dizainas",
    "Infografikos kūrimas",
    "Brošiūrų dizainas",
    "Produktų etikečių kūrimas",
    # Programavimas ir IT
    "Svetainių kūrimas",
    "WordPress",
    "WooCommerce",
    "Front-end programavimas",
    "Back-end programavimas",
    "Elektroninės parduotuvės",
    "Mobiliosios aplikacijos",
    "API kūrimas",
    "Duomenų bazės",
    "Django",
    # Skaitmeninė rinkodara
    "Facebook reklamos",
    "Google Ads",
    "SEO (optimizavimas paieškos sistemoms)",
    "Turinio rinkodara",
    "El. pašto rinkodara",
    "Socialinių tinklų valdymas",
    "Reklamos strategija",
    "Konversijų optimizavimas",
    "Influencerių rinkodara",
    "Youtube kanalų valdymas",
    # Rašymas ir vertimas
    "SEO tekstų rašymas",
    "Techninių tekstų kūrimas",
    "Blogų įrašai",
    "Turinio redagavimas",
    "Anglų-lietuvių vertimas",
    "Lietuvių-anglų vertimas",
    "CV rašymas",
    "Produktų aprašymų kūrimas",
    "Akademinis rašymas",
    "Scenarijų kūrimas",
    # Vaizdo ir garso gamyba
    "Vaizdo montažas",
    "Animacijos kūrimas",
    "2D animacija",
    "3D animacija",
    "Vaizdo subtitrai",
    "Garso redagavimas",
    "Podcastų montažas",
    "Video intro/outro",
    "Muzikos kūrimas",
    "Garso efektų kūrimas",
    # Verslo paslaugos
    "Verslo planų rašymas",
    "Finansinė analizė",
    "Excel makrokomandos",
    "Pardavimų strategijos",
    "Projektų valdymas",
    "Klientų aptarnavimo mokymai",
    "CRM sistemos",
    "Virtualus asistentas",
    "Prezentacijų kūrimas",
    "Rinkos tyrimai",
    # Klientų aptarnavimas / pagalba
    "Live chat aptarnavimas",
    "Pagalba el. paštu",
    "Pagalba telefonu",
    "Klientų aptarnavimo analizė",
    "Pagalbos centro turinio kūrimas",
    "Chatbotų konfigūravimas",
    "Pagalbos bilietų valdymas",
    "Atsiliepimų analizė",
    "Pagalbos dokumentacijos vertimas",
    "Pagalba Shopify klientams",
]


class Command(BaseCommand):
    help = "Seeds the database with common Lithuanian freelance skills"

    def handle(self, *args, **kwargs):
        created = 0
        for name in SKILLS:
            skill, is_new = Skill.objects.get_or_create(name=name)
            if is_new:
                created += 1
        self.stdout.write(self.style.SUCCESS(f"Sukurta {created} įgūdžių."))
