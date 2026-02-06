import logging
import os
from functools import lru_cache
from typing import List, Tuple

from django.conf import settings
from google import genai
from google.genai import types as genai_types
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI


logger = logging.getLogger(__name__)


class GeminiConfigurationError(RuntimeError):
    """Raised when Gemini is misconfigured."""


@lru_cache(maxsize=1)
def _get_gemini_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise GeminiConfigurationError("GEMINI_API_KEY is not configured")
    return genai.Client(api_key=api_key)


@lru_cache(maxsize=1)
def _get_langchain_llm() -> ChatGoogleGenerativeAI:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise GeminiConfigurationError("GEMINI_API_KEY is not configured")
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL_NAME,
        temperature=settings.GEMINI_TEMPERATURE,
        api_key=api_key,
    )


def _convert_history(history: List[dict]) -> List:
    converted = []
    for message in history or []:
        role = message.get("role")
        content = (message.get("content") or "").strip()
        if not content:
            continue
        if role == "user":
            converted.append(HumanMessage(content=content))
        elif role == "assistant":
            converted.append(AIMessage(content=content))
        elif role == "system":
            converted.append(SystemMessage(content=content))
    return converted


def _render_history(history: List[dict]) -> str:
    lines = []
    for message in history or []:
        role = message.get("role")
        content = (message.get("content") or "").strip()
        if not content:
            continue
        if role == "user":
            prefix = "[User]"
        elif role == "assistant":
            prefix = "[Assistant]"
        else:
            prefix = "[System]"
        lines.append(f"{prefix} {content}")
    return "\n".join(lines)


def _summarize_history(llm: ChatGoogleGenerativeAI, prior_summary: str, messages: List[dict]) -> str:
    if not messages:
        return prior_summary

    history_text = _render_history(messages)
    prompt_messages = [
        SystemMessage(
            content=(
                "당신은 진로 상담 세션을 요약하는 보조 도우미입니다. "
                "사용자 선호, 기술, 확정된 사실만 간결하게 정리하세요."
            )
        ),
        HumanMessage(
            content=(
                "기존 요약:\n"
                f"{prior_summary or '(없음)'}\n\n"
                "새로운 대화:\n"
                f"{history_text}\n\n"
                "업데이트된 요약만 한국어로 출력하세요."
            )
        ),
    ]

    try:
        result = llm.invoke(prompt_messages)
        summary_text = getattr(result, "content", str(result)) or prior_summary
        return summary_text.strip() or prior_summary
    except Exception:  # pragma: no cover - fallback on summarization failure
        return prior_summary


def generate_onboarding_reply(*, history: List[dict], summary: str, system_prompt: str, user_input: str) -> Tuple[str, str]:
    """Return the assistant reply and updated summary using LangChain chat primitives."""

    llm = _get_langchain_llm()
    messages = []
    system_prompt = (system_prompt or "").strip()
    if system_prompt:
        messages.append(SystemMessage(content=system_prompt))
    messages.extend(_convert_history(history))
    messages.append(HumanMessage(content=user_input))

    result = llm.invoke(messages)
    if hasattr(result, "content"):
        reply_text = result.content or ""
    elif isinstance(result, str):
        reply_text = result
    else:
        reply_text = str(result)
    reply_text = reply_text.strip()

    updated_history = list(history or [])
    updated_history.append({"role": "user", "content": user_input})
    updated_history.append({"role": "assistant", "content": reply_text})

    max_history = max(settings.ONBOARDING_MAX_HISTORY, settings.ONBOARDING_KEEP_RECENT, 1)
    overflow = len(updated_history) - max_history
    summary_text = summary or ""
    if overflow > 0:
        to_summarize = updated_history[:overflow]
        summary_text = _summarize_history(llm, summary_text, to_summarize)

    return reply_text, summary_text


def get_gemini_response(prompt: str) -> str:
    client = _get_gemini_client()
    config = genai_types.GenerateContentConfig(
        temperature=settings.GEMINI_TEMPERATURE,
    )
    logger.info(
        "Gemini request start", extra={
            "model": settings.GEMINI_MODEL_NAME,
            "stub": settings.ONBOARDING_STUB_AI,
            "prompt_preview": prompt[:200],
        }
    )
    response = client.models.generate_content(
        model=settings.GEMINI_MODEL_NAME,
        contents=prompt,
        config=config,
    )
    logger.debug("Gemini raw response: %s", response)

    text = getattr(response, "text", None)
    if text:
        return text

    output_text = getattr(response, "output_text", None)
    if output_text:
        return output_text

    candidates = getattr(response, "candidates", None) or []
    parts = []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        for part in getattr(content, "parts", []) or []:
            part_text = getattr(part, "text", "")
            if part_text:
                parts.append(part_text)

    if parts:
        return "\n".join(parts)

    logger.error("Gemini response missing text payload: %s", response)
    raise RuntimeError("Gemini response did not contain text content")
