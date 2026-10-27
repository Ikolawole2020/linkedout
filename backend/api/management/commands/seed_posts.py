from django.core.management.base import BaseCommand
from api.models import User, Post

class Command(BaseCommand):
    help = "Seed the database with sample posts"

    def handle(self, *args, **options):
        users = []
        for i in range(1, 4):
            u, created = User.objects.get_or_create(username=f"demo_user{i}", defaults={"email": f"demo{i}@example.com"})
            if created:
                u.set_password("password123")
                u.bio = "Sharing my exit story."
                u.company = "Tech Corp"
                u.save()
            users.append(u)

        titles = [
            "Why I finally walked away",
            "The day I stopped caring",
            "Burnout is real",
            "Toxic management at its finest",
            "Low pay, high expectations",
            "No growth, no future",
            "Work-life balance is a myth",
            "Micromanagement drove me out",
            "Harassment I couldn't ignore",
            "Other reasons I left",
        ]
        reasons = [c[0] for c in Post.REASON_CHOICES]
        companies = ["TechNova", "BrightPath", "GreenLeaf", "CloudNine", "DataForge", "PixelWorks"]

        count = 0
        for i in range(20):
            author = users[i % len(users)]
            Post.objects.create(
                author=author,
                company_name=companies[i % len(companies)],
                company_anonymous=(i % 3 == 0),
                reason_category=reasons[i % len(reasons)],
                title=f"{titles[i % len(titles)]} #{i+1}",
                content=f"This is a seeded story #{i+1}. It describes the real reasons behind leaving a toxic workplace. The environment was challenging and growth was limited.",
                is_anonymous=(i % 4 == 0),
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {count} posts."))