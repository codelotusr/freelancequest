# Generated by Django 5.2 on 2025-05-02 21:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gigs', '0005_gigsubmission'),
        ('users', '0006_remove_freelancerprofile_skills_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='gig',
            name='skills',
            field=models.ManyToManyField(blank=True, related_name='gigs', to='users.skill'),
        ),
    ]
