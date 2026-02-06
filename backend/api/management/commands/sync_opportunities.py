from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from api.models import OnboardingEvent
from api.opportunity_utils import (
    evaluate_opportunities_for_all_events,
    evaluate_opportunities_for_event,
    refresh_opportunities_from_sources,
)


class Command(BaseCommand):
    help = "Fetch external opportunities and refresh user matches."

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-fetch",
            action="store_true",
            help="Skip external crawling and only recompute matches.",
        )
        parser.add_argument(
            "--user",
            dest="username",
            help="Limit match refresh to a specific username.",
        )

    def handle(self, *args, **options):
        fetched = 0
        if not options["skip_fetch"]:
            fetched = refresh_opportunities_from_sources()

        username = options.get("username")
        if username:
            try:
                user = get_user_model().objects.get(username=username)
            except get_user_model().DoesNotExist as exc:  # pragma: no cover - defensive
                raise CommandError(f"User '{username}' not found") from exc
            try:
                event = OnboardingEvent.objects.get(user=user)
            except OnboardingEvent.DoesNotExist as exc:
                raise CommandError("Target user does not have an onboarding event") from exc
            matched = evaluate_opportunities_for_event(event)
        else:
            matched = evaluate_opportunities_for_all_events()

        self.stdout.write(
            self.style.SUCCESS(
                f"Opportunity sync complete. fetched={fetched} matched={matched}"
            )
        )
