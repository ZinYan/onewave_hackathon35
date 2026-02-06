import json
from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from api.models import OnboardingEvent, Opportunity, OpportunityConfig, OpportunityMatch


def log_api_response(label: str, response):
    payload = getattr(response, "data", response)
    try:
        serialized = json.dumps(payload, ensure_ascii=False, default=str)
    except TypeError:
        serialized = str(payload)
    print(f"[API TEST OUTPUT] {label}: {serialized}")


@override_settings(ONBOARDING_DEV_MODE=True)
class OpportunityConfigViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_get_returns_default_structure(self):
        response = self.client.get(reverse("opportunity-config"))
        log_api_response("GET /api/opportunities/config/", response)
        self.assertEqual(response.status_code, 200)
        data = response.data
        for field in [
            "jobkorea_keywords",
            "dataportal_keywords",
            "max_items_per_source",
            "recent_days",
            "min_score",
            "source",
        ]:
            self.assertIn(field, data)

    def test_put_updates_database_and_cache(self):
        payload = {
            "jobkorea_keywords": ["데이터", "AI"],
            "dataportal_keywords": ["공모전"],
            "max_items_per_source": 3,
            "recent_days": 10,
            "min_score": 55.5,
        }
        response = self.client.put(reverse("opportunity-config"), data=payload, format="json")
        log_api_response("PUT /api/opportunities/config/", response)
        self.assertEqual(response.status_code, 200)
        config = OpportunityConfig.objects.get(id=1)
        self.assertEqual(config.max_items_per_source, 3)
        self.assertEqual(config.recent_days, 10)
        self.assertAlmostEqual(config.min_score, 55.5)
        self.assertListEqual(config.jobkorea_keywords, ["데이터", "AI"])


@override_settings(ONBOARDING_DEV_MODE=True)
class OpportunityMatchViewsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        user_model = get_user_model()
        self.dev_user, _ = user_model.objects.get_or_create(username="onboarding_dev_user")
        self.event = OnboardingEvent.objects.create(user=self.dev_user)
        self.opportunity = Opportunity.objects.create(
            source="jobkorea",
            source_id="abc",
            title="데이터 엔지니어 공고",
            link="https://example.com",
        )
        self.match = OpportunityMatch.objects.create(
            event=self.event,
            opportunity=self.opportunity,
            score=75,
            priority_score=75,
        )

    @patch("api.views.approve_recommendation_item")
    def test_accept_action_updates_status(self, mock_approve):
        mock_approve.return_value = SimpleNamespace(id=99)
        url = reverse("opportunity-match-action", args=[self.match.id])
        response = self.client.post(url, data={"action": "accept"}, format="json")
        log_api_response(f"POST {url} action=accept", response)
        self.assertEqual(response.status_code, 200)
        self.match.refresh_from_db()
        self.assertEqual(self.match.status, "accepted")
        self.assertEqual(response.data["item_id"], 99)

    @patch("api.views.reject_recommendation_item")
    def test_dismiss_action_marks_match(self, mock_reject):
        url = reverse("opportunity-match-action", args=[self.match.id])
        response = self.client.post(url, data={"action": "dismiss"}, format="json")
        log_api_response(f"POST {url} action=dismiss", response)
        self.assertEqual(response.status_code, 200)
        self.match.refresh_from_db()
        self.assertEqual(self.match.status, "dismissed")
        mock_reject.assert_called_once()

    @patch("api.views.apply_ai_prioritization", return_value=5)
    @patch("api.views.archive_expired_recommendations", return_value=2)
    @patch("api.views.evaluate_opportunities_for_event", return_value=3)
    def test_refresh_endpoint_runs_pipeline(self, mock_eval, mock_archive, mock_prioritize):
        url = reverse("opportunity-match-refresh")
        response = self.client.post(url)
        log_api_response("POST /api/opportunities/matches/refresh/", response)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"created": 3, "archived": 2, "prioritized": 5})
        mock_eval.assert_called_once_with(self.event)
        mock_archive.assert_called_once_with(self.event)
        mock_prioritize.assert_called_once_with(self.event)

    @patch("api.views.apply_ai_prioritization", return_value=4)
    def test_prioritize_endpoint_returns_count(self, mock_prioritize):
        url = reverse("opportunity-match-prioritize")
        response = self.client.post(url)
        log_api_response("POST /api/opportunities/matches/prioritize/", response)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"updated": 4})
        mock_prioritize.assert_called_once_with(self.event)

    @patch("api.views.archive_expired_recommendations", return_value=1)
    def test_archive_endpoint_returns_count(self, mock_archive):
        url = reverse("opportunity-match-archive")
        response = self.client.post(url)
        log_api_response("POST /api/opportunities/matches/archive-expired/", response)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"archived": 1})
        mock_archive.assert_called_once_with(self.event)
