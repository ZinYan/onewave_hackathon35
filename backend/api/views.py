import re

from django.conf import settings
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_utils import generate_onboarding_reply
from .models import OnboardingEvent, OnboardingMessage
from .serializers import OnboardingRequestSerializer, OnboardingResponseSerializer


class OnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if settings.ONBOARDING_DEV_MODE:
            return []
        return super().get_permissions()

    def post(self, request):
        user = self._resolve_user(request)
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
            }
        ).data

        return Response(response_data, status=status.HTTP_201_CREATED)

    def _build_system_prompt(self, event: OnboardingEvent, user_text: str, *, include_template: bool) -> str:
        normalized = user_text.strip() if isinstance(user_text, str) else ""
        template = (settings.ONBOARDING_PROMPT_TEMPLATE or "").strip()
        reminder = (settings.ONBOARDING_PROMPT_REMINDER or "").strip()
        summary = (event.summary or "").strip()

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

        if reminder:
            prompt_sections.append(reminder)

        if prompt_sections:
            return "\n\n".join(prompt_sections)
        return "You are a helpful onboarding assistant."

    def _parse_final(self, ai_message: str):
        match = re.search(r"final\.<([^>-]+)-([^>]+)>", ai_message)
        if not match:
            return None

        final_company = match.group(1).strip()
        final_role = match.group(2).strip()
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

    def _resolve_user(self, request):
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
