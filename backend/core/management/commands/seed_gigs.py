from django.core.management.base import BaseCommand
from users.models import User
from gigs.models import Gig, Review
from faker import Faker
import random

fake = Faker("lt_LT")


class Command(BaseCommand):
    help = "Seed gigs and reviews"

    def handle(self, *args, **kwargs):
        freelancers = User.objects.filter(role="freelancer")
        clients = User.objects.filter(role="client")

        for client in clients:
            for _ in range(3):
                title = fake.job()
                description = fake.text(max_nb_chars=200)
                status = random.choice(["available", "in_progress", "completed"])
                gig = Gig.objects.create(
                    client=client,
                    title=title,
                    description=description,
                    status=status,
                )

                if status in ["in_progress", "completed"]:
                    gig.freelancer = random.choice(freelancers)
                    gig.save()

                if status == "completed":
                    Review.objects.create(
                        gig=gig,
                        rating=random.randint(3, 5),
                        feedback=fake.paragraph(nb_sentences=3),
                    )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created gig '{gig.title}' [{gig.status}] for {client.username}"
                    )
                )
