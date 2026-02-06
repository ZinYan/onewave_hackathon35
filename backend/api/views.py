import re

from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_utils import generate_onboarding_reply
from .models import (
    OnboardingEvent,
    OnboardingMessage,
    OpportunityConfig,
    OpportunityMatch,
    RoadmapItem,
    RoadmapJournalEntry,
    RoadmapPlan,
    RoadmapProgressEntry,
)
from .roadmap_utils import sync_roadmap_plan
from .serializers import (
    OnboardingRequestSerializer,
    OnboardingResponseSerializer,
    TalentScorePhaseOneRequestSerializer,
    TalentScorePhaseOneResponseSerializer,
    ResumeScoreRequestSerializer,
    ResumeScoreResponseSerializer,
    RoadmapPlanSerializer,
    RoadmapItemDetailSerializer,
    RoadmapProgressEntrySerializer,
    RoadmapJournalEntrySerializer,
    RoadmapMetricsSerializer,
    RoadmapProgressUpdateSerializer,
    RoadmapJournalCreateSerializer,
    OpportunityMatchSerializer,
    OpportunityMatchActionSerializer,
    OpportunityConfigSerializer,
    OpportunityConfigUpdateSerializer,
)
from .opportunity_utils import (
    approve_recommendation_item,
    evaluate_opportunities_for_event,
    get_opportunity_config,
    invalidate_opportunity_config_cache,
    reject_recommendation_item,
)


FINAL_BRACKET_PATTERN = re.compile(r"final\.<([^>-]+)-([^>]+)>", re.IGNORECASE)
FINAL_SIMPLE_PATTERN = re.compile(r"final\.([^\n\r]+)", re.IGNORECASE)


def resolve_onboarding_user(request):
    if request.user.is_authenticated:
        return request.user
    if not settings.ONBOARDING_DEV_MODE:
        return request.user

    user_model = get_user_model()
    user, created = user_model.objects.get_or_create(
        username="onboarding_dev_user",
        defaults={"email": "dev-onboarding@example.com"},
    )
    if created:
        user.set_unusable_password()
        user.save(update_fields=["password"])
    return user


class OnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if settings.ONBOARDING_DEV_MODE:
            return []
        return super().get_permissions()

    def post(self, request):
        user = resolve_onboarding_user(request)
        onboarding, created = OnboardingEvent.objects.get_or_create(user=user)

        serializer = OnboardingRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        user_input = payload.get("user_input", "")
        system_prompt = self._build_system_prompt(
            onboarding,
            user_input,
            include_template=created,
        )

        try:
            ai_message, summary_text = self._get_ai_message(
                onboarding,
                system_prompt,
                payload,
            )
        except Exception as exc:  # pragma: no cover - defensive guard for external API
            return Response(
                {"detail": "Failed to retrieve onboarding guidance.", "error": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        final_result = self._parse_final(ai_message)
        onboarding.user_input = payload.get("user_input", "")
        onboarding.ai_response = ai_message
        update_fields = ["user_input", "ai_response"]
        if final_result is not None:
            onboarding.final_company, onboarding.final_role = final_result
            update_fields.extend(["final_company", "final_role"])
        onboarding.save(update_fields=update_fields)

        messages_payload = []
        if created and system_prompt:
            messages_payload.append({"role": "system", "content": system_prompt})

        messages_payload.append({"role": "user", "content": payload.get("user_input", "")})
        messages_payload.append({"role": "assistant", "content": ai_message})
        self._record_messages(onboarding, messages_payload, summary_text=summary_text)

        response_data = OnboardingResponseSerializer(
            {
                "message": ai_message,
                "final_company": onboarding.final_company,
                "final_role": onboarding.final_role,
                "roadmap_result": onboarding.roadmap_result,
            }
        ).data

        return Response(response_data, status=status.HTTP_201_CREATED)

    def _build_system_prompt(self, event: OnboardingEvent, user_text: str, *, include_template: bool) -> str:
        normalized = user_text.strip() if isinstance(user_text, str) else ""
        template = (settings.ONBOARDING_PROMPT_TEMPLATE or "").strip()
        reminder = (settings.ONBOARDING_PROMPT_REMINDER or "").strip()
        summary = (event.summary or "").strip()
        final_company = (event.final_company or "").strip()
        final_role = (event.final_role or "").strip()

        prompt_sections = []

        if include_template and template:
            try:
                prompt_sections.append(
                    template.format(user_input=normalized, user_text=normalized)
                )
            except KeyError as exc:
                raise ValueError("Prompt template is missing required placeholders") from exc
        elif template:
            prompt_sections.append(template)

        if summary:
            prompt_sections.append(f"현재까지 대화 요약:\n{summary}")

        if final_company and final_role:
            prompt_sections.append(
                f"현재 추론된 후보 회사/직무: {final_company} / {final_role}. "
                "추가 질문으로 검증하거나 필요 시 업데이트해라."
            )

        if reminder:
            prompt_sections.append(reminder)

        if prompt_sections:
            return "\n\n".join(prompt_sections)
        return "You are a helpful onboarding assistant."

    def _parse_final(self, ai_message: str):
        if not ai_message:
            return None

        match = FINAL_BRACKET_PATTERN.search(ai_message)
        if match:
            final_company = match.group(1).strip()
            final_role = match.group(2).strip()
            if final_company and final_role:
                return final_company, final_role

        simple_match = FINAL_SIMPLE_PATTERN.search(ai_message)
        if not simple_match:
            return None

        candidate = simple_match.group(1).strip()
        if "-" not in candidate:
            return None

        final_company, final_role = candidate.split("-", 1)
        final_company = final_company.strip()
        final_role = final_role.strip()
        if not final_company or not final_role:
            return None
        return final_company, final_role

    def _get_ai_message(self, event: OnboardingEvent, system_prompt: str, payload: dict):
        if settings.ONBOARDING_STUB_AI:
            user_input = payload.get("user_input", "")
            if "pass" in user_input.lower():
                return "pass", event.summary
            return "final.<로컬테스트기업-로컬테스트직무>", event.summary

        user_input = payload.get("user_input", "")
        return generate_onboarding_reply(
            history=list(event.history or []),
            summary=event.summary or "",
            system_prompt=system_prompt,
            user_input=user_input,
        )

    def _record_messages(self, event: OnboardingEvent, messages_payload, *, summary_text: str | None = None):
        stored = []
        for message in messages_payload:
            role = message.get("role")
            content = (message.get("content") or "").strip()
            if not role or not content:
                continue
            OnboardingMessage.objects.create(
                event=event,
                role=role,
                content=content,
            )
            stored.append({"role": role, "content": content})

        update_fields = []
        if stored:
            history = list(event.history or [])
            history.extend(stored)
            max_history = max(settings.ONBOARDING_MAX_HISTORY, settings.ONBOARDING_KEEP_RECENT, 1)
            if len(history) > max_history:
                history = history[-max_history:]
            event.history = history
            update_fields.append("history")

        if summary_text is not None:
            event.summary = summary_text
            update_fields.append("summary")

        if update_fields:
            event.save(update_fields=update_fields)


class TalentScorePhaseOneView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if settings.ONBOARDING_DEV_MODE:
            return []
        return super().get_permissions()

    def post(self, request):
        user = resolve_onboarding_user(request)
        onboarding, _ = OnboardingEvent.objects.get_or_create(user=user)

        serializer = TalentScorePhaseOneRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        company = payload["company"].strip()
        role = payload["role"].strip()
        candidate_profile = (payload.get("candidate_profile") or "").strip()

        template = (settings.PROMPT_TALENT_MODEL or "").strip()
        if not template:
            return Response(
                {"detail": "Talent scoring prompt is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        company_role = f"{company}-{role}" if company and role else "회사-직무"
        system_prompt = template.replace("<회사-직무>", company_role)
        user_input = candidate_profile or "후보자 세부 정보가 제공되지 않았습니다. 일반적인 역량 모델을 생성하세요."

        try:
            ai_message, _ = generate_onboarding_reply(
                history=[],
                summary="",
                system_prompt=system_prompt,
                user_input=user_input,
            )
        except Exception as exc:  # pragma: no cover - upstream API errors
            return Response(
                {"detail": "Failed to generate talent guidance.", "error": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        onboarding.score_one_result = ai_message
        onboarding.save(update_fields=["score_one_result"])
        maybe_generate_roadmap(onboarding)

        response_data = TalentScorePhaseOneResponseSerializer(
            {"message": ai_message, "company": company, "role": role}
        ).data
        return Response(response_data, status=status.HTTP_200_OK)


class TalentScorePhaseTwoView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if settings.ONBOARDING_DEV_MODE:
            return []
        return super().get_permissions()

    def post(self, request):
        user = resolve_onboarding_user(request)
        onboarding, _ = OnboardingEvent.objects.get_or_create(user=user)

        serializer = ResumeScoreRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resume_text = serializer.validated_data["resume_text"].strip()

        template = (settings.PROMPT_RESUME_SCORING or "").strip()
        if not template:
            return Response(
                {"detail": "Resume scoring prompt is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        system_prompt = template
        user_input = (
            resume_text
            if resume_text
            else "지원서 정보가 제공되지 않았습니다. 가상의 지원서로 일반적인 채용 평가를 수행하세요."
        )

        try:
            ai_message, _ = generate_onboarding_reply(
                history=[],
                summary="",
                system_prompt=system_prompt,
                user_input=user_input,
            )
        except Exception as exc:  # pragma: no cover - upstream API errors
            return Response(
                {"detail": "Failed to generate resume scoring.", "error": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        onboarding.score_two_result = ai_message
        onboarding.save(update_fields=["score_two_result"])
        maybe_generate_roadmap(onboarding)

        response_data = ResumeScoreResponseSerializer({"message": ai_message}).data
        return Response(response_data, status=status.HTTP_200_OK)


def maybe_generate_roadmap(onboarding: OnboardingEvent):
    if onboarding.roadmap_result:
        return
    if not onboarding.score_one_result or not onboarding.score_two_result:
        return

    template = (settings.PROMPT_ROADMAP_GENERATION or "").strip()
    if not template:
        return

    combined_input = (
        "[스코어1 결과]\n"
        f"{onboarding.score_one_result}\n\n[스코어2 결과]\n"
        f"{onboarding.score_two_result}"
    )

    try:
        ai_message, _ = generate_onboarding_reply(
            history=[],
            summary="",
            system_prompt=template,
            user_input=combined_input,
        )
    except Exception:  # pragma: no cover - roadmap generation best-effort
        return

    onboarding.roadmap_result = ai_message
    onboarding.save(update_fields=["roadmap_result"])
    sync_roadmap_plan(onboarding)


class RoadmapPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if settings.ONBOARDING_DEV_MODE:
            return []
        return super().get_permissions()

    def get(self, request):
        user = resolve_onboarding_user(request)
        onboarding = getattr(user, "onboarding_event", None)
        if onboarding is None:
            return Response({"detail": "Onboarding has not started."}, status=status.HTTP_404_NOT_FOUND)

        plan = onboarding.roadmap_plans.order_by("-version").first()
        if not plan:
            plan = sync_roadmap_plan(onboarding)
        if not plan:
            return Response({"detail": "Roadmap is not ready yet."}, status=status.HTTP_404_NOT_FOUND)

        payload = build_roadmap_payload(plan)
        return Response(payload, status=status.HTTP_200_OK)


class RoadmapProgressUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if settings.ONBOARDING_DEV_MODE:
            return []
        return super().get_permissions()

    def post(self, request, item_id: int):
        user = resolve_onboarding_user(request)
        item = get_object_or_404(
            RoadmapItem.objects.select_related("plan__event__user"),
            id=item_id,
            plan__event__user=user,
        )

        serializer = RoadmapProgressUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        entry = RoadmapProgressEntry.objects.create(
            item=item,
            status=data["status"],
            percent_complete=data["percent_complete"],
            note=data.get("note", ""),
        )

        response_data = RoadmapProgressEntrySerializer(entry).data
        return Response(response_data, status=status.HTTP_201_CREATED)


class RoadmapJournalView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if settings.ONBOARDING_DEV_MODE:
            return []
        return super().get_permissions()

    def post(self, request, item_id: int):
        user = resolve_onboarding_user(request)
        item = get_object_or_404(
            RoadmapItem.objects.select_related("plan__event__user"),
            id=item_id,
            plan__event__user=user,
        )

        serializer = RoadmapJournalCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        evaluation = ""
        if data.get("request_ai_evaluation", True):
            evaluation = evaluate_progress_with_ai(item, data["note"])

        entry = RoadmapJournalEntry.objects.create(
            item=item,
            user_note=data["note"],
            ai_evaluation=evaluation or "",
        )

        response_data = RoadmapJournalEntrySerializer(entry).data
        return Response(response_data, status=status.HTTP_201_CREATED)


class OpportunityMatchListView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if settings.ONBOARDING_DEV_MODE:
            return []
        return super().get_permissions()

    def get(self, request):
        user = resolve_onboarding_user(request)
        onboarding = getattr(user, "onboarding_event", None)
        if onboarding is None:
            return Response({"detail": "Onboarding session not found."}, status=status.HTTP_404_NOT_FOUND)

        status_param = request.query_params.get("status")
        matches = onboarding.opportunity_matches.select_related("opportunity", "inserted_item").order_by("-score", "-created_at")
        if status_param:
            matches = matches.filter(status=status_param)

        payload = []
        for match in matches:
            item = match.inserted_item
            payload.append(
                {
                    "id": match.id,
                    "score": float(match.score),
                    "status": match.status,
                    "ai_feedback": match.ai_feedback,
                    "created_at": match.created_at,
                    "inserted_item": item.id if item else None,
                    "recommendation_status": item.recommendation_status if item else None,
                    "is_recommendation": bool(item.is_recommendation) if item else False,
                    "opportunity": {
                        "id": match.opportunity.id,
                        "source": match.opportunity.source,
                        "title": match.opportunity.title,
                        "link": match.opportunity.link,
                        "summary": match.opportunity.summary,
                        "category": match.opportunity.category,
                        "location": match.opportunity.location,
                        "deadline": match.opportunity.deadline,
                        "tags": match.opportunity.tags or [],
                        "metadata": match.opportunity.metadata or {},
                        "fetched_at": match.opportunity.fetched_at,
                    },
                }
            )
        data = OpportunityMatchSerializer(payload, many=True).data
        return Response(data, status=status.HTTP_200_OK)


class OpportunityMatchRefreshView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if settings.ONBOARDING_DEV_MODE:
            return []
        return super().get_permissions()

    def post(self, request):
        user = resolve_onboarding_user(request)
        onboarding = getattr(user, "onboarding_event", None)
        if onboarding is None:
            return Response({"detail": "Onboarding session not found."}, status=status.HTTP_404_NOT_FOUND)

        created = evaluate_opportunities_for_event(onboarding)
        return Response({"created": created}, status=status.HTTP_200_OK)


class OpportunityMatchActionView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if settings.ONBOARDING_DEV_MODE:
            return []
        return super().get_permissions()

    def post(self, request, match_id: int):
        user = resolve_onboarding_user(request)
        onboarding = getattr(user, "onboarding_event", None)
        if onboarding is None:
            return Response({"detail": "Onboarding session not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = OpportunityMatchActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]

        match = get_object_or_404(
            OpportunityMatch.objects.select_related("event", "opportunity"),
            id=match_id,
            event=onboarding,
        )

        if action == "accept":
            item = approve_recommendation_item(match)
            match.status = "accepted"
            match.save(update_fields=["status"])
            return Response(
                {"status": match.status, "item_id": item.id if item else None},
                status=status.HTTP_200_OK,
            )

        if action == "dismiss":
            reject_recommendation_item(match)
            match.status = "dismissed"
            match.save(update_fields=["status"])
            return Response({"status": match.status}, status=status.HTTP_200_OK)

        if action == "inject":
            item = approve_recommendation_item(match)
            if not item:
                return Response(
                    {"detail": "로드맵이 아직 생성되지 않아 항목을 추가할 수 없습니다."},
                    status=status.HTTP_409_CONFLICT,
                )
            match.status = "injected"
            match.save(update_fields=["status"])
            return Response({"status": match.status, "item_id": item.id}, status=status.HTTP_200_OK)

        return Response({"detail": "Unsupported action."}, status=status.HTTP_400_BAD_REQUEST)


class OpportunityConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if settings.ONBOARDING_DEV_MODE:
            return []
        return super().get_permissions()

    def get(self, request):
        config = get_opportunity_config()
        data = OpportunityConfigSerializer(config).data
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = OpportunityConfigUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        defaults = {
            "jobkorea_keywords": settings.OPPORTUNITY_JOBKOREA_KEYWORDS,
            "dataportal_keywords": settings.OPPORTUNITY_DATAPORTAL_KEYWORDS,
            "max_items_per_source": settings.OPPORTUNITY_MAX_ITEMS_PER_SOURCE,
            "recent_days": settings.OPPORTUNITY_RECENT_DAYS,
            "min_score": settings.OPPORTUNITY_MIN_SCORE,
        }
        config_obj, _ = OpportunityConfig.objects.get_or_create(id=1, defaults=defaults)

        for field in [
            "jobkorea_keywords",
            "dataportal_keywords",
            "max_items_per_source",
            "recent_days",
            "min_score",
        ]:
            if field in payload:
                setattr(config_obj, field, payload[field])

        config_obj.save()
        invalidate_opportunity_config_cache()
        data = OpportunityConfigSerializer(get_opportunity_config(force_refresh=True)).data
        return Response(data, status=status.HTTP_200_OK)


def build_roadmap_payload(plan: RoadmapPlan):
    items = list(
        plan.items.prefetch_related("progress_entries", "journal_entries")
    )

    item_payloads = []
    total_percent = 0.0
    weighted_percent_sum = 0.0
    importance_total = 0.0
    weeks_total = 0.0
    weeks_completed = 0.0
    completed_items = 0

    for item in items:
        latest_progress = item.progress_entries.first()
        progress_percent = latest_progress.percent_complete if latest_progress else 0
        include_in_metrics = item.recommendation_status in {"none", "approved"}
        importance_value = _decimal_to_float(item.importance_score)
        duration_value = _decimal_to_float(item.duration_weeks)

        if include_in_metrics:
            total_percent += progress_percent

            importance = importance_value if importance_value is not None else 0.0
            weighted_percent_sum += progress_percent * importance
            importance_total += importance

            duration = duration_value if duration_value is not None else 0.0
            weeks_total += duration
            weeks_completed += duration * (progress_percent / 100.0)

            if progress_percent >= 100 or (latest_progress and latest_progress.status == "done"):
                completed_items += 1
        recent_journals = list(item.journal_entries.all()[:3])

        item_payloads.append(
            {
                "id": item.id,
                "priority": item.priority,
                "title": item.title,
                "duration_weeks": duration_value,
                "importance_score": importance_value,
                "category": item.category,
                "detail_text": item.detail_text,
                "is_recommendation": item.is_recommendation,
                "recommendation_status": item.recommendation_status,
                "origin_opportunity": item.origin_opportunity_id,
                "latest_progress": RoadmapProgressEntrySerializer(latest_progress).data if latest_progress else None,
                "recent_journals": RoadmapJournalEntrySerializer(recent_journals, many=True).data,
            }
        )

    total_items = len([item for item in items if item.recommendation_status in {"none", "approved"}])
    overall_percent = (total_percent / total_items) if total_items else 0.0
    importance_weighted_percent = (
        (weighted_percent_sum / importance_total) if importance_total else overall_percent
    )

    metrics = {
        "overall_percent_complete": round(overall_percent, 2),
        "importance_weighted_percent": round(importance_weighted_percent, 2),
        "completed_items": completed_items,
        "total_items": total_items,
        "estimated_weeks_completed": round(weeks_completed, 2),
        "estimated_weeks_total": round(weeks_total, 2),
    }

    response = {
        "plan": RoadmapPlanSerializer(plan).data,
        "items": RoadmapItemDetailSerializer(item_payloads, many=True).data,
        "metrics": RoadmapMetricsSerializer(metrics).data,
    }
    return response


def _decimal_to_float(value):
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def evaluate_progress_with_ai(item: RoadmapItem, note: str) -> str:
    template = (settings.PROMPT_PROGRESS_EVAL or "").strip()
    if not template:
        return ""

    context = (
        f"로드맵 항목: {item.title}\n"
        f"예상 기간(주): {item.duration_weeks or '미정'}\n"
        f"중요도: {item.importance_score or '미정'}\n"
        "사용자 진행 보고:\n"
        f"{note}\n"
        "필요 시 개선 제안을 포함해라."
    )

    try:
        ai_message, _ = generate_onboarding_reply(
            history=[],
            summary="",
            system_prompt=template,
            user_input=context,
        )
        return ai_message
    except Exception:  # pragma: no cover - evaluation best-effort
        return ""
