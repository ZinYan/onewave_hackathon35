from django.urls import path

from .views import (
    OnboardingView,
    TalentScorePhaseOneView,
    TalentScorePhaseTwoView,
    RoadmapPlanView,
    RoadmapProgressUpdateView,
    RoadmapJournalView,
    OpportunityMatchListView,
    OpportunityMatchActionView,
    OpportunityMatchRefreshView,
    OpportunityMatchPrioritizeView,
    OpportunityMatchArchiveExpiredView,
    OpportunityConfigView,
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
    path("opportunities/matches/", OpportunityMatchListView.as_view(), name="opportunity-match-list"),
    path(
        "opportunities/matches/<int:match_id>/",
        OpportunityMatchActionView.as_view(),
        name="opportunity-match-action",
    ),
    path(
        "opportunities/matches/refresh/",
        OpportunityMatchRefreshView.as_view(),
        name="opportunity-match-refresh",
    ),
    path(
        "opportunities/matches/prioritize/",
        OpportunityMatchPrioritizeView.as_view(),
        name="opportunity-match-prioritize",
    ),
    path(
        "opportunities/matches/archive-expired/",
        OpportunityMatchArchiveExpiredView.as_view(),
        name="opportunity-match-archive",
    ),
    path("opportunities/config/", OpportunityConfigView.as_view(), name="opportunity-config"),
]
