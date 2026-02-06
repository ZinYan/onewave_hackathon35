from django.conf import settings
from django.db import models


class OnboardingEvent(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="onboarding_event",
    )
    user_input = models.TextField(default="")
    ai_response = models.TextField(blank=True, default="")
    final_company = models.CharField(max_length=255, blank=True, default="")
    final_role = models.CharField(max_length=255, blank=True, default="")
    history = models.JSONField(default=list, blank=True)
    summary = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Onboarding Event"
        verbose_name_plural = "Onboarding Events"

    def __str__(self):
        return f"OnboardingEvent(user={self.user_id}, final={self.final_company}-{self.final_role})"


class OnboardingMessage(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
        ("system", "System"),
    ]

    event = models.ForeignKey(
        OnboardingEvent,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.event_id}:{self.role}"
