import re
from decimal import Decimal, InvalidOperation
from typing import List, Tuple

from django.db import transaction
from django.db.models import Max

from .models import OnboardingEvent, RoadmapItem, RoadmapPlan

ITEM_PATTERN = re.compile(r"<\s*(?P<priority>\d+)\.(?P<title>[^-]+)-(?P<weeks>[\d.]+)-(?P<importance>[\d.]+)\s*>")
FINAL_PATTERN = re.compile(r"<\s*final\.([^>-]+)-([\d.]+)\s*>", re.IGNORECASE)
TITLE_PATTERN = re.compile(r"제목:\s*<TITLE-([^>-]+)-([^>]+)>", re.IGNORECASE)


def parse_roadmap_text(raw_text: str) -> Tuple[dict, List[dict]]:
    raw_text = raw_text or ""
    items = []
    for match in ITEM_PATTERN.finditer(raw_text):
        items.append(
            {
                "priority": int(match.group("priority")),
                "title": match.group("title").strip(),
                "duration_weeks": match.group("weeks"),
                "importance": match.group("importance"),
            }
        )

    final_match = FINAL_PATTERN.search(raw_text)
    title = ""
    total_months = None
    if final_match:
        title = final_match.group(1).strip()
        total_months = _to_decimal_or_none(final_match.group(2))

    if not title:
        title_match = TITLE_PATTERN.search(raw_text)
        if title_match:
            title = title_match.group(1).strip()

    return {"title": title, "total_months": total_months}, items


def sync_roadmap_plan(onboarding: OnboardingEvent) -> RoadmapPlan | None:
    if not onboarding.roadmap_result:
        return None

    latest_plan = onboarding.roadmap_plans.order_by("-version").first()
    if latest_plan and latest_plan.raw_text == onboarding.roadmap_result:
        return latest_plan

    plan_meta, items = parse_roadmap_text(onboarding.roadmap_result)
    aggregate = onboarding.roadmap_plans.aggregate(Max("version"))
    next_version = aggregate.get("version__max") or 0
    next_version += 1

    with transaction.atomic():
        plan = RoadmapPlan.objects.create(
            event=onboarding,
            version=next_version,
            raw_text=onboarding.roadmap_result,
            title=plan_meta.get("title", ""),
            total_months=plan_meta.get("total_months"),
        )

        bulk_items = []
        for item in items:
            weeks = item.get("duration_weeks")
            importance = item.get("importance")
            weeks_value = _to_decimal_or_none(weeks)
            importance_value = _to_decimal_or_none(importance)

            bulk_items.append(
                RoadmapItem(
                    plan=plan,
                    priority=item.get("priority", 0),
                    title=item.get("title", ""),
                    duration_weeks=weeks_value,
                    importance_score=importance_value,
                    detail_text="",
                )
            )

        RoadmapItem.objects.bulk_create(bulk_items)

    return plan


def _to_decimal_or_none(value):
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None
