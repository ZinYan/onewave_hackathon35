from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    major = models.CharField(max_length=100, blank=True, null=True)
    interest_field = models.CharField(max_length=100, blank=True, null=True)
    target_period_months = models.PositiveIntegerField(blank=True, null=True)

    onboarding_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} Profile"
