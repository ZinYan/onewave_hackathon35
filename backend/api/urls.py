from django.urls import path

from .views import (
    OnboardingView,
    TalentScorePhaseOneView,
    TalentScorePhaseTwoView,
    RoadmapPlanView,
    RoadmapProgressUpdateView,
    RoadmapJournalView,
)

urlpatterns = [
    path("onboarding/", OnboardingView.as_view(), name="onboarding"),
    path("onboarding/score/1/", TalentScorePhaseOneView.as_view(), name="onboarding-score-phase-one"),
    path("onboarding/score/2/", TalentScorePhaseTwoView.as_view(), name="onboarding-score-phase-two"),
    path("roadmap/", RoadmapPlanView.as_view(), name="roadmap-plan"),
    path(
        "roadmap/items/<int:item_id>/progress/",
        RoadmapProgressUpdateView.as_view(),
        name="roadmap-item-progress",
    ),
    path(
        "roadmap/items/<int:item_id>/journal/",
        RoadmapJournalView.as_view(),
        name="roadmap-item-journal",
    ),
]
