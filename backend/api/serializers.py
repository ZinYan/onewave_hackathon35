from rest_framework import serializers

from .models import RoadmapProgressEntry


class OnboardingRequestSerializer(serializers.Serializer):
    user_input = serializers.CharField()

    def validate_user_input(self, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("User input must not be empty.")
        return cleaned


class OnboardingResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    final_company = serializers.CharField(allow_blank=True)
    final_role = serializers.CharField(allow_blank=True)
    roadmap_result = serializers.CharField(allow_blank=True, required=False)


class TalentScorePhaseOneRequestSerializer(serializers.Serializer):
    company = serializers.CharField()
    role = serializers.CharField()
    candidate_profile = serializers.CharField(required=False, allow_blank=True)


class TalentScorePhaseOneResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    company = serializers.CharField()
    role = serializers.CharField()


class ResumeScoreRequestSerializer(serializers.Serializer):
    resume_text = serializers.CharField()


class ResumeScoreResponseSerializer(serializers.Serializer):
    message = serializers.CharField()


class RoadmapProgressEntrySerializer(serializers.Serializer):
    status = serializers.CharField()
    percent_complete = serializers.IntegerField()
    note = serializers.CharField(allow_blank=True)
    created_at = serializers.DateTimeField()


class RoadmapJournalEntrySerializer(serializers.Serializer):
    user_note = serializers.CharField()
    ai_evaluation = serializers.CharField(allow_blank=True)
    created_at = serializers.DateTimeField()


class RoadmapItemDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    priority = serializers.IntegerField()
    title = serializers.CharField()
    duration_weeks = serializers.FloatField(allow_null=True)
    importance_score = serializers.FloatField(allow_null=True)
    category = serializers.CharField(allow_blank=True)
    detail_text = serializers.CharField(allow_blank=True)
    latest_progress = RoadmapProgressEntrySerializer(allow_null=True)
    recent_journals = RoadmapJournalEntrySerializer(many=True)


class RoadmapPlanSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    version = serializers.IntegerField()
    title = serializers.CharField(allow_blank=True)
    total_months = serializers.FloatField(allow_null=True)
    raw_text = serializers.CharField()
    created_at = serializers.DateTimeField()


class RoadmapMetricsSerializer(serializers.Serializer):
    overall_percent_complete = serializers.FloatField()
    importance_weighted_percent = serializers.FloatField()
    completed_items = serializers.IntegerField()
    total_items = serializers.IntegerField()
    estimated_weeks_completed = serializers.FloatField()
    estimated_weeks_total = serializers.FloatField()


class RoadmapProgressUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[choice[0] for choice in RoadmapProgressEntry.STATUS_CHOICES])
    percent_complete = serializers.IntegerField(min_value=0, max_value=100)
    note = serializers.CharField(required=False, allow_blank=True)


class RoadmapJournalCreateSerializer(serializers.Serializer):
    note = serializers.CharField()
    request_ai_evaluation = serializers.BooleanField(required=False, default=True)
