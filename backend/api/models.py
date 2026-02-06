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
    score_one_result = models.TextField(blank=True, default="")
    score_two_result = models.TextField(blank=True, default="")
    roadmap_result = models.TextField(blank=True, default="")
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


class RoadmapPlan(models.Model):
    event = models.ForeignKey(
        OnboardingEvent,
        on_delete=models.CASCADE,
        related_name="roadmap_plans",
    )
    version = models.PositiveIntegerField()
    raw_text = models.TextField()
    title = models.CharField(max_length=255, blank=True, default="")
    total_months = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("event", "version")
        ordering = ["-created_at"]

    def __str__(self):
        return f"RoadmapPlan(event={self.event_id}, v={self.version})"


class RoadmapItem(models.Model):
    RECOMMENDATION_STATUS_CHOICES = [
        ("none", "None"),
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    plan = models.ForeignKey(
        RoadmapPlan,
        on_delete=models.CASCADE,
        related_name="items",
    )
    priority = models.PositiveIntegerField(default=0)
    title = models.CharField(max_length=255)
    duration_weeks = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    importance_score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    category = models.CharField(max_length=255, blank=True, default="")
    detail_text = models.TextField(blank=True, default="")
    is_recommendation = models.BooleanField(default=False)
    recommendation_status = models.CharField(
        max_length=20,
        choices=RECOMMENDATION_STATUS_CHOICES,
        default="none",
    )
    origin_opportunity = models.ForeignKey(
        "Opportunity",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="roadmap_items",
    )

    class Meta:
        ordering = ["priority", "id"]

    def __str__(self):
        return f"RoadmapItem(plan={self.plan_id}, p={self.priority})"


class RoadmapProgressEntry(models.Model):
    STATUS_CHOICES = [
        ("not_started", "Not Started"),
        ("in_progress", "In Progress"),
        ("blocked", "Blocked"),
        ("done", "Done"),
    ]

    item = models.ForeignKey(
        RoadmapItem,
        on_delete=models.CASCADE,
        related_name="progress_entries",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="not_started")
    percent_complete = models.PositiveIntegerField(default=0)
    note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class RoadmapJournalEntry(models.Model):
    item = models.ForeignKey(
        RoadmapItem,
        on_delete=models.CASCADE,
        related_name="journal_entries",
    )
    user_note = models.TextField()
    ai_evaluation = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Opportunity(models.Model):
    SOURCE_CHOICES = [
        ("jobkorea", "JobKorea"),
        ("data_portal", "DataPortal"),
    ]

    source = models.CharField(max_length=50, choices=SOURCE_CHOICES)
    source_id = models.CharField(max_length=255, blank=True, default="")
    title = models.CharField(max_length=255)
    link = models.URLField(max_length=500)
    summary = models.TextField(blank=True, default="")
    category = models.CharField(max_length=255, blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    deadline = models.DateField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    fetched_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("source", "source_id", "link")

    def __str__(self):
        return f"Opportunity({self.source}:{self.title})"


class OpportunityMatch(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("dismissed", "Dismissed"),
        ("injected", "Injected"),
    ]

    event = models.ForeignKey(
        OnboardingEvent,
        on_delete=models.CASCADE,
        related_name="opportunity_matches",
    )
    opportunity = models.ForeignKey(
        Opportunity,
        on_delete=models.CASCADE,
        related_name="matches",
    )
    score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    ai_feedback = models.TextField(blank=True, default="")
    inserted_item = models.ForeignKey(
        RoadmapItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="opportunity_sources",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("event", "opportunity")
        ordering = ["-score", "-created_at"]


class OpportunityConfig(models.Model):
    jobkorea_keywords = models.JSONField(default=list, blank=True)
    dataportal_keywords = models.JSONField(default=list, blank=True)
    max_items_per_source = models.PositiveIntegerField(default=5)
    recent_days = models.PositiveIntegerField(default=14)
    min_score = models.FloatField(default=40.0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Opportunity Configuration"
        verbose_name_plural = "Opportunity Configurations"

    def __str__(self):
        return "OpportunityConfig"
