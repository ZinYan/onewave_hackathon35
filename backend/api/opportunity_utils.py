import datetime
import json
import logging
import re
from dataclasses import dataclass
from typing import List, Sequence
from urllib.parse import urljoin, urlencode

import requests
from bs4 import BeautifulSoup
from django.conf import settings
from django.core.cache import cache
from django.db import models, transaction
from django.utils import timezone

from .ai_utils import generate_onboarding_reply
from .models import (
    OnboardingEvent,
    Opportunity,
    OpportunityConfig,
    OpportunityMatch,
    RoadmapItem,
    RoadmapPlan,
)
from .roadmap_utils import sync_roadmap_plan

logger = logging.getLogger(__name__)

JOBKOREA_SEARCH_URL = "https://www.jobkorea.co.kr/Search/?{query}"
DATAPORTAL_CONTEST_URL = "https://www.data.go.kr/tcs/dss/selectContestList.do"
DEFAULT_HEADERS = {
    "User-Agent": "CareerPathfinderBot/1.0 (+career-pathfinder)"
}
KEYWORD_WEIGHT = 0.45
ROADMAP_WEIGHT = 0.25
DEADLINE_WEIGHT = 0.10
PROFILE_WEIGHT = 0.20
CONFIG_CACHE_KEY = "opportunity_config_active"
CONFIG_CACHE_TIMEOUT = 300


@dataclass
class CrawledOpportunity:
    source: str
    source_id: str
    title: str
    link: str
    summary: str = ""
    category: str = ""
    location: str = ""
    deadline: datetime.date | None = None
    tags: List[str] | None = None
    metadata: dict | None = None


def _default_opportunity_config() -> dict:
    return {
        "jobkorea_keywords": list(settings.OPPORTUNITY_JOBKOREA_KEYWORDS or []),
        "dataportal_keywords": list(settings.OPPORTUNITY_DATAPORTAL_KEYWORDS or []),
        "max_items_per_source": settings.OPPORTUNITY_MAX_ITEMS_PER_SOURCE,
        "recent_days": settings.OPPORTUNITY_RECENT_DAYS,
        "min_score": settings.OPPORTUNITY_MIN_SCORE,
        "source": "env",
        "updated_at": None,
    }


def get_opportunity_config(force_refresh: bool = False) -> dict:
    if not force_refresh:
        cached = cache.get(CONFIG_CACHE_KEY)
        if cached:
            return cached

    data = _default_opportunity_config()
    config = OpportunityConfig.objects.order_by("-updated_at").first()
    if config:
        data.update(
            {
                "jobkorea_keywords": list(config.jobkorea_keywords or []),
                "dataportal_keywords": list(config.dataportal_keywords or []),
                "max_items_per_source": config.max_items_per_source,
                "recent_days": config.recent_days,
                "min_score": float(config.min_score),
                "source": "db",
                "updated_at": config.updated_at,
            }
        )

    cache.set(CONFIG_CACHE_KEY, data, CONFIG_CACHE_TIMEOUT)
    return data


def invalidate_opportunity_config_cache():
    cache.delete(CONFIG_CACHE_KEY)


def crawl_jobkorea(keyword: str, *, limit: int = 10) -> List[CrawledOpportunity]:
    params = urlencode({"stext": keyword})
    url = JOBKOREA_SEARCH_URL.format(query=params)
    html = _safe_get_html(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    cards = soup.select(".list-post .post") or soup.select(".list-default > ul > li")
    results: List[CrawledOpportunity] = []

    for card in cards:
        link_tag = card.select_one("a[href]")
        title_tag = card.select_one(".post-list-info strong") or link_tag
        if not link_tag or not title_tag:
            continue

        title = title_tag.get_text(strip=True)
        href = link_tag.get("href", "").strip()
        link = urljoin("https://www.jobkorea.co.kr", href)
        source_id = card.get("data-gno") or _extract_id_from_url(href)
        summary = card.select_one(".post-list-info .desc")
        summary_text = summary.get_text(" ", strip=True) if summary else ""
        company_tag = card.select_one(".post-list-corp a") or card.select_one(".post-list-corp")
        category = company_tag.get_text(strip=True) if company_tag else ""
        location_tag = card.select_one(".option .loc")
        location = location_tag.get_text(" ", strip=True) if location_tag else ""
        deadline_tag = card.select_one(".option .date")
        deadline = _parse_deadline(deadline_tag.get_text(strip=True) if deadline_tag else "")

        metadata = {
            "keyword": keyword,
            "company": category,
            "raw_location": location,
        }
        opp = CrawledOpportunity(
            source="jobkorea",
            source_id=source_id or link,
            title=title,
            link=link,
            summary=summary_text,
            category=category,
            location=location,
            deadline=deadline,
            tags=[keyword],
            metadata=metadata,
        )
        results.append(opp)
        if len(results) >= limit:
            break

    return results


def crawl_dataportal(keyword: str = "", *, limit: int = 10) -> List[CrawledOpportunity]:
    params = {
        "keyword": keyword,
        "page": 1,
    }
    html = _safe_get_html(f"{DATAPORTAL_CONTEST_URL}?{urlencode(params)}")
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    rows = soup.select("table tbody tr")
    results: List[CrawledOpportunity] = []

    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 4:
            continue

        title_tag = cols[1].select_one("a[href]")
        if not title_tag:
            continue

        title = title_tag.get_text(strip=True)
        link = urljoin(DATAPORTAL_CONTEST_URL, title_tag.get("href", ""))
        source_id = row.get("data-uid") or _extract_id_from_url(link)
        host = cols[2].get_text(strip=True)
        period_text = cols[3].get_text(" ", strip=True)
        deadline = _parse_deadline(_extract_deadline_from_period(period_text))

        summary = cols[1].get_text(" ", strip=True)
        metadata = {
            "keyword": keyword,
            "host": host,
            "period": period_text,
        }
        opp = CrawledOpportunity(
            source="data_portal",
            source_id=source_id or link,
            title=title,
            link=link,
            summary=summary,
            category=host,
            location="온라인",
            deadline=deadline,
            tags=[keyword] if keyword else [],
            metadata=metadata,
        )
        results.append(opp)
        if len(results) >= limit:
            break

    return results


def sync_crawled_opportunities(records: Sequence[CrawledOpportunity]) -> int:
    created_or_updated = 0
    with transaction.atomic():
        for record in records:
            defaults = {
                "title": record.title,
                "link": record.link,
                "summary": record.summary,
                "category": record.category,
                "location": record.location,
                "deadline": record.deadline,
                "tags": record.tags or [],
                "metadata": record.metadata or {},
            }
            _, created = Opportunity.objects.update_or_create(
                source=record.source,
                source_id=record.source_id,
                defaults=defaults,
            )
            if created:
                created_or_updated += 1
    return created_or_updated


def refresh_opportunities_from_sources() -> int:
    config = get_opportunity_config()
    jobkorea_keywords = config.get("jobkorea_keywords", [])
    dataportal_keywords = config.get("dataportal_keywords", [])
    limit = config.get("max_items_per_source", settings.OPPORTUNITY_MAX_ITEMS_PER_SOURCE)

    collected: List[CrawledOpportunity] = []
    for keyword in jobkorea_keywords:
        collected.extend(crawl_jobkorea(keyword, limit=limit))
    for keyword in dataportal_keywords:
        collected.extend(crawl_dataportal(keyword, limit=limit))

    if not collected:
        logger.info("No opportunities collected from configured sources")
        return 0

    count = sync_crawled_opportunities(collected)
    logger.info("Opportunity sync completed", extra={"count": count})
    return count


def evaluate_opportunities_for_event(event: OnboardingEvent) -> int:
    if not event.final_company and not event.final_role:
        return 0

    config = get_opportunity_config()
    recent_days = config.get("recent_days", settings.OPPORTUNITY_RECENT_DAYS)
    min_score = config.get("min_score", settings.OPPORTUNITY_MIN_SCORE)
    now = timezone.now()
    cutoff = now - datetime.timedelta(days=recent_days)

    opportunities = Opportunity.objects.filter(fetched_at__gte=cutoff).order_by("-fetched_at")
    if not opportunities.exists():
        return 0

    keywords = _derive_event_keywords(event)
    plan = event.roadmap_plans.prefetch_related("items").order_by("-version").first()
    item_keywords = _extract_plan_keywords(plan)
    profile_focus = _build_profile_focus(event, plan)
    matches_created = 0

    for opportunity in opportunities:
        score, details = _compute_match_score(
            opportunity,
            keywords,
            item_keywords,
            profile_focus,
            now.date(),
        )
        if score < min_score:
            continue

        feedback = generate_opportunity_feedback(event, opportunity, details)
        match, created = OpportunityMatch.objects.get_or_create(
            event=event,
            opportunity=opportunity,
            defaults={"score": score, "ai_feedback": feedback, "priority_score": score},
        )
        if created:
            matches_created += 1
        elif match.status == "pending":
            match.score = score
            match.ai_feedback = feedback
            match.priority_score = score
            match.save(update_fields=["score", "ai_feedback", "priority_score"])

        ensure_recommendation_item(match, details)

    return matches_created


def evaluate_opportunities_for_all_events() -> int:
    total = 0
    for event in OnboardingEvent.objects.select_related("user").all():
        total += evaluate_opportunities_for_event(event)
    return total


def generate_opportunity_feedback(event: OnboardingEvent, opportunity: Opportunity, details: dict) -> str:
    template = (settings.PROMPT_OPPORTUNITY_EVAL or "").strip()
    if not template:
        return ""

    plan = event.roadmap_plans.order_by("-version").first()
    plan_summary = _summarize_plan(plan)

    context = (
        f"사용자 타깃 회사: {event.final_company or '미정'}\n"
        f"사용자 타깃 직무: {event.final_role or '미정'}\n"
        f"핵심 키워드: {', '.join(details['keyword_hits']) or '없음'}\n"
        f"로드맵 상위 항목: {plan_summary or '로드맵 없음'}\n"
        "\n[기회 정보]\n"
        f"제목: {opportunity.title}\n"
        f"카테고리/주관: {opportunity.category or '미정'}\n"
        f"위치: {opportunity.location or '온라인'}\n"
        f"마감일: {opportunity.deadline or '미정'}\n"
        f"요약: {opportunity.summary or '요약 없음'}\n"
        f"링크: {opportunity.link}\n"
        "\n[매칭 지표]\n"
        f"키워드 점수: {details['keyword_score']}\n"
        f"로드맵 점수: {details['roadmap_score']}\n"
        f"마감일 점수: {details['deadline_score']}\n"
        f"프로필 점수: {details.get('profile_score', 0)}\n"
        "이 기회가 얼마나 적합한지 짧은 평가와 조언을 제공하라."
    )

    try:
        ai_message, _ = generate_onboarding_reply(
            history=[],
            summary="",
            system_prompt=template,
            user_input=context,
        )
        return ai_message
    except Exception:  # pragma: no cover - AI best effort
        return ""


def run_opportunity_pipeline() -> dict:
    fetched = refresh_opportunities_from_sources()
    matched = evaluate_opportunities_for_all_events()
    archived = 0
    reprioritized = 0
    for event in OnboardingEvent.objects.select_related("user").all():
        archived += archive_expired_recommendations(event)
        reprioritized += apply_ai_prioritization(event)
    return {
        "fetched": fetched,
        "matched": matched,
        "archived": archived,
        "reprioritized": reprioritized,
    }


def _safe_get_html(url: str) -> str:
    try:
        response = requests.get(url, timeout=15, headers=DEFAULT_HEADERS)
        response.raise_for_status()
        return response.text
    except requests.RequestException as exc:
        logger.warning("Failed to fetch HTML", extra={"url": url, "error": str(exc)})
        return ""


def _extract_id_from_url(url: str) -> str:
    match = re.search(r"[?&](?:id|no|seq)=([^&#]+)", url)
    if match:
        return match.group(1)
    return url


def _parse_deadline(text: str) -> datetime.date | None:
    cleaned = (text or "").strip()
    if not cleaned:
        return None
    if "수시" in cleaned or "상시" in cleaned or "채용시" in cleaned:
        return None

    patterns = ["%Y.%m.%d", "%Y-%m-%d", "%Y/%m/%d", "%m.%d", "%m-%d"]
    today = timezone.now().date()
    for pattern in patterns:
        try:
            parsed = datetime.datetime.strptime(cleaned, pattern)
            if "%Y" not in pattern:
                parsed = parsed.replace(year=today.year)
                if parsed.date() < today:
                    parsed = parsed.replace(year=today.year + 1)
            return parsed.date()
        except ValueError:
            continue
    return None


def _extract_deadline_from_period(period_text: str) -> str:
    if not period_text:
        return ""
    parts = re.split(r"[~\-]", period_text)
    if parts:
        return parts[-1].strip()
    return period_text


def _derive_event_keywords(event: OnboardingEvent) -> List[str]:
    seeds = []
    seeds.extend(_split_keywords(event.final_company))
    seeds.extend(_split_keywords(event.final_role))
    seeds.extend(_split_keywords(event.user_input))
    return sorted({kw.lower() for kw in seeds if len(kw) >= 2})


def _split_keywords(value: str | None) -> List[str]:
    if not value:
        return []
    return re.split(r"[\s/,|]+", value.strip())


def _extract_plan_keywords(plan) -> List[dict]:
    if not plan:
        return []
    items = list(plan.items.all())
    max_priority = max((item.priority for item in items), default=0)
    payload = []
    for item in items:
        keywords = _split_keywords(item.title) + _split_keywords(item.category)
        payload.append({
            "keywords": [kw.lower() for kw in keywords if kw],
            "priority": item.priority,
            "importance": float(item.importance_score or 0),
            "max_priority": max_priority or 1,
        })
    return payload


def _compute_match_score(
    opportunity: Opportunity,
    keywords: Sequence[str],
    plan_keywords: Sequence[dict],
    profile_focus: dict,
    today: datetime.date,
):
    haystack = " ".join(
        [
            opportunity.title,
            opportunity.summary or "",
            opportunity.category or "",
            " ".join(opportunity.tags or []),
        ]
    ).lower()

    hits = [kw for kw in keywords if kw and kw in haystack]
    keyword_score = min(100.0, len(hits) * 25.0)
    keyword_component = keyword_score * KEYWORD_WEIGHT

    roadmap_score = 0.0
    for info in plan_keywords:
        if any(kw and kw in haystack for kw in info["keywords"]):
            priority_factor = (info["max_priority"] + 1 - info["priority"]) / (info["max_priority"] + 1)
            importance_factor = min(info["importance"] / 10.0, 1.0)
            roadmap_score = max(roadmap_score, (priority_factor * 100.0 * 0.6) + (importance_factor * 40.0))
    roadmap_component = roadmap_score * ROADMAP_WEIGHT

    deadline_score = 0.0
    if opportunity.deadline:
        days_left = (opportunity.deadline - today).days
        if days_left < 0:
            deadline_score = 0.0
        elif days_left <= 3:
            deadline_score = 100.0
        elif days_left <= 7:
            deadline_score = 70.0
        elif days_left <= 14:
            deadline_score = 40.0
        else:
            deadline_score = 10.0
    deadline_component = deadline_score * DEADLINE_WEIGHT
    profile_score, profile_hits = _calculate_profile_score(opportunity, profile_focus, haystack)
    profile_component = profile_score * PROFILE_WEIGHT

    total = round(keyword_component + roadmap_component + deadline_component + profile_component, 2)
    details = {
        "keyword_score": round(keyword_component, 2),
        "roadmap_score": round(roadmap_component, 2),
        "deadline_score": round(deadline_component, 2),
        "keyword_hits": hits,
        "profile_score": round(profile_component, 2),
        "profile_hits": profile_hits,
        "estimated_duration_weeks": float(opportunity.metadata.get("duration_weeks", 0))
        if isinstance(opportunity.metadata, dict)
        else None,
    }
    return total, details


def _summarize_plan(plan) -> str:
    if not plan:
        return ""
    items = plan.items.order_by("priority")[:3]
    summaries = [f"{item.priority}. {item.title}" for item in items]
    return ", ".join(summaries)


def _calculate_profile_score(opportunity: Opportunity, profile_focus: dict, haystack: str):
    if not profile_focus:
        return 0.0, []

    score = 0.0
    hits = []
    target_company = profile_focus.get("target_company")
    target_role = profile_focus.get("target_role")
    categories = profile_focus.get("priority_categories", [])

    if target_company and target_company.lower() in haystack:
        score += 60.0
        hits.append(target_company)
    if target_role and target_role.lower() in haystack:
        score += 60.0
        hits.append(target_role)

    for category in categories:
        if category.lower() in haystack:
            score += 20.0
            hits.append(category)

    return min(100.0, score), hits


def _build_profile_focus(event: OnboardingEvent, plan: RoadmapPlan | None) -> dict:
    categories = []
    if plan:
        categories = [
            item.category
            for item in plan.items.order_by("priority")[:5]
            if item.category
        ]
    return {
        "target_company": (event.final_company or "").strip(),
        "target_role": (event.final_role or "").strip(),
        "priority_categories": categories,
    }


def _duration_in_days(duration_weeks: float | None) -> int:
    weeks = duration_weeks or settings.OPPORTUNITY_DEFAULT_DURATION_WEEKS
    return max(7, int(round(weeks * 7)))


def find_available_window(plan: RoadmapPlan, duration_weeks: float | None, deadline: datetime.date | None):
    today = timezone.now().date()
    duration_days = _duration_in_days(duration_weeks)
    intervals = []
    blocking_items = plan.items.filter(
        recommendation_status__in=["none", "approved"]
    ).exclude(start_date__isnull=True)
    for item in blocking_items:
        start = item.start_date
        end = item.end_date
        if not end:
            end = start + datetime.timedelta(days=_duration_in_days(float(item.duration_weeks or 1)))
        intervals.append((start, end))
    intervals.sort(key=lambda pair: pair[0])

    if deadline:
        start_date = max(today, deadline - datetime.timedelta(days=duration_days))
    else:
        start_date = today
    end_date = start_date + datetime.timedelta(days=duration_days)

    def has_overlap(left, right):
        for interval_start, interval_end in intervals:
            if right <= interval_start or left >= interval_end:
                continue
            return True
        return False

    while has_overlap(start_date, end_date):
        for interval_start, interval_end in intervals:
            if end_date <= interval_start or start_date >= interval_end:
                continue
            start_date = interval_end + datetime.timedelta(days=1)
            end_date = start_date + datetime.timedelta(days=duration_days)
            break

    if deadline and end_date > deadline:
        start_date = max(today, deadline - datetime.timedelta(days=duration_days))
        end_date = start_date + datetime.timedelta(days=duration_days)

    return start_date, end_date


def ensure_recommendation_item(match: OpportunityMatch, details: dict) -> RoadmapItem | None:
    if match.inserted_item_id and match.inserted_item:
        return match.inserted_item

    plan = match.event.roadmap_plans.order_by("-version").first()
    if not plan:
        plan = sync_roadmap_plan(match.event)
    if not plan:
        return None

    duration_weeks = details.get("estimated_duration_weeks") or settings.OPPORTUNITY_DEFAULT_DURATION_WEEKS
    start_date, end_date = find_available_window(plan, duration_weeks, match.opportunity.deadline)
    detail = (
        f"추천 이유: 키워드 {', '.join(details.get('keyword_hits', [])) or '없음'}\n"
        f"AI 피드백: {match.ai_feedback or '대기 중'}\n"
        f"링크: {match.opportunity.link}"
    )

    item = RoadmapItem.objects.create(
        plan=plan,
        priority=(plan.items.aggregate(models.Max("priority")).get("priority__max") or 0) + 1,
        title=match.opportunity.title[:255],
        duration_weeks=duration_weeks,
        importance_score=None,
        start_date=start_date,
        end_date=end_date,
        category=match.opportunity.category or "Opportunity",
        detail_text=detail,
        is_recommendation=True,
        recommendation_status="pending",
        origin_opportunity=match.opportunity,
    )

    match.inserted_item = item
    match.save(update_fields=["inserted_item"])
    return item


def approve_recommendation_item(match: OpportunityMatch) -> RoadmapItem | None:
    item = match.inserted_item or ensure_recommendation_item(match, {})
    if not item:
        return None

    duration_weeks = float(item.duration_weeks or settings.OPPORTUNITY_DEFAULT_DURATION_WEEKS)
    duration_days = _duration_in_days(duration_weeks)
    today = timezone.now().date()

    if match.opportunity.deadline:
        end_date = match.opportunity.deadline
        start_date = max(today, end_date - datetime.timedelta(days=duration_days))
    else:
        start_date = item.start_date or today
        end_date = start_date + datetime.timedelta(days=duration_days)

    item.is_recommendation = False
    item.recommendation_status = "approved"
    item.start_date = start_date
    item.end_date = end_date
    item.save(
        update_fields=[
            "is_recommendation",
            "recommendation_status",
            "start_date",
            "end_date",
        ]
    )
    rebalance_plan_schedule(item.plan)
    return item


def reject_recommendation_item(match: OpportunityMatch):
    item = match.inserted_item
    if not item:
        return
    item.recommendation_status = "rejected"
    item.is_recommendation = True
    item.save(update_fields=["recommendation_status", "is_recommendation"])


def rebalance_plan_schedule(plan: RoadmapPlan):
    items = plan.items.filter(recommendation_status__in=["none", "approved"]).order_by("priority")
    current_date = None
    for item in items:
        duration_days = _duration_in_days(float(item.duration_weeks or settings.OPPORTUNITY_DEFAULT_DURATION_WEEKS))
        if item.start_date and item.end_date and item.end_date >= item.start_date:
            current_date = item.end_date + datetime.timedelta(days=1)
            continue

        if current_date is None:
            current_date = timezone.now().date()
        start = max(current_date, item.start_date or current_date)
        end = start + datetime.timedelta(days=duration_days)
        item.start_date = start
        item.end_date = end
        item.save(update_fields=["start_date", "end_date"])
        current_date = end + datetime.timedelta(days=1)


def archive_expired_recommendations(event: OnboardingEvent) -> int:
    today = timezone.now().date()
    matches = event.opportunity_matches.filter(
        opportunity__deadline__lt=today,
        status__in=["pending", "accepted", "injected"],
    )
    archived = 0
    for match in matches:
        reject_recommendation_item(match)
        match.status = "dismissed"
        match.save(update_fields=["status"])
        archived += 1
    return archived


def apply_ai_prioritization(event: OnboardingEvent) -> int:
    template = (settings.PROMPT_RECOMMENDATION_PRIORITIZATION or "").strip()
    if not template:
        return 0

    pending_matches = list(
        event.opportunity_matches.filter(status="pending")
        .select_related("opportunity")
        .order_by("-priority_score", "-score")[:10]
    )
    if not pending_matches:
        return 0

    plan = event.roadmap_plans.order_by("-version").first()
    context_payload = [
        {
            "match_id": match.id,
            "title": match.opportunity.title,
            "deadline": match.opportunity.deadline.isoformat() if match.opportunity.deadline else None,
            "score": float(match.score),
            "category": match.opportunity.category,
            "ai_feedback": match.ai_feedback,
        }
        for match in pending_matches
    ]

    prompt = _render_priority_prompt(event, plan, context_payload, template)
    try:
        ai_message, _ = generate_onboarding_reply(
            history=[],
            summary="",
            system_prompt="너는 JSON만 반환해야 한다.",
            user_input=prompt,
        )
    except Exception:
        return 0

    priorities = _parse_priority_response(ai_message)
    if not priorities:
        return 0

    updated = 0
    for match in pending_matches:
        if match.id not in priorities:
            continue
        match.priority_score = priorities[match.id]
        match.save(update_fields=["priority_score"])
        updated += 1
    return updated


def _render_priority_prompt(event: OnboardingEvent, plan: RoadmapPlan | None, payload: list, template: str) -> str:
    roadmap_summary = _summarize_plan(plan)
    profile = {
        "target_company": event.final_company or "미정",
        "target_role": event.final_role or "미정",
    }
    return template.format(
        profile=json.dumps(profile, ensure_ascii=False),
        roadmap_summary=roadmap_summary,
        opportunities=json.dumps(payload, ensure_ascii=False),
    )


def _parse_priority_response(ai_message: str) -> dict[int, float]:
    if not ai_message:
        return {}

    text = _extract_json_block(ai_message)
    if not text:
        return {}

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return {}

    mapping = {}
    if isinstance(data, dict):
        data = [data]

    for entry in data:
        if not isinstance(entry, dict):
            continue
        match_id = entry.get("match_id")
        priority = entry.get("priority")
        confidence = entry.get("confidence", 0.0)
        if not isinstance(match_id, int) or not isinstance(priority, (int, float)):
            continue
        priority_score = _calculate_priority_score(priority, confidence)
        mapping[match_id] = priority_score
    return mapping


def _extract_json_block(value: str) -> str | None:
    fenced = re.search(r"```json(.*?)```", value, re.DOTALL | re.IGNORECASE)
    if fenced:
        return fenced.group(1).strip()
    trimmed = value.strip()
    if trimmed.startswith("[") or trimmed.startswith("{"):
        return trimmed
    return None


def _calculate_priority_score(priority: float, confidence: float) -> float:
    priority = max(1.0, float(priority))
    confidence = max(0.0, min(1.0, float(confidence)))
    base = 200.0 - (priority - 1.0) * 20.0
    return round(base + (confidence * 10.0), 2)
