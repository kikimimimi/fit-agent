from __future__ import annotations

import os
import time
from dataclasses import dataclass


try:
    from openai import OpenAI
except Exception:  # pragma: no cover - optional dependency fallback
    OpenAI = None  # type: ignore[assignment]


@dataclass
class LLMResult:
    text: str = ""
    provider: str = "local_mock"
    model: str = "rule_based_agent"
    prompt_type: str = "unknown"
    prompt_tokens: int = 0
    completion_tokens: int = 0
    latency_ms: int = 0
    status: str = "skipped"
    error_message: str = ""

    def to_log(self) -> dict:
        return {
            "provider": self.provider,
            "model": self.model,
            "prompt_type": self.prompt_type,
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "latency_ms": self.latency_ms,
            "status": self.status,
            "error_message": self.error_message,
        }


class LLMClient:
    """Small provider wrapper that keeps the rule-based agent usable without an API key."""

    def __init__(self) -> None:
        self.provider = os.getenv("LLM_PROVIDER", "local").strip().lower()
        self.model = os.getenv("LLM_MODEL", "gpt-4o-mini").strip()
        self.openai_api_key = os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY")
        self.openai_base_url = os.getenv("OPENAI_BASE_URL") or os.getenv("LLM_BASE_URL")

    def enabled(self) -> bool:
        return self.provider == "openai" and bool(self.openai_api_key) and OpenAI is not None

    def complete(self, prompt_type: str, system_prompt: str, user_prompt: str, max_tokens: int = 420) -> LLMResult:
        if self.provider != "openai":
            return LLMResult(prompt_type=prompt_type, error_message="LLM_PROVIDER is not openai.")
        if not self.openai_api_key:
            return LLMResult(provider="openai", model=self.model, prompt_type=prompt_type, error_message="OPENAI_API_KEY is not set.")
        if OpenAI is None:
            return LLMResult(provider="openai", model=self.model, prompt_type=prompt_type, error_message="openai package is not installed.")

        started = time.perf_counter()
        try:
            client_kwargs = {"api_key": self.openai_api_key}
            if self.openai_base_url:
                client_kwargs["base_url"] = self.openai_base_url
            client = OpenAI(**client_kwargs)
            response = self._responses_create(client, system_prompt, user_prompt, max_tokens)
            text = self._extract_response_text(response)
            usage = getattr(response, "usage", None)
            return LLMResult(
                text=text.strip(),
                provider="openai",
                model=self.model,
                prompt_type=prompt_type,
                prompt_tokens=self._usage_value(usage, "input_tokens", "prompt_tokens"),
                completion_tokens=self._usage_value(usage, "output_tokens", "completion_tokens"),
                latency_ms=int((time.perf_counter() - started) * 1000),
                status="success" if text.strip() else "empty",
            )
        except Exception as exc:
            return LLMResult(
                provider="openai",
                model=self.model,
                prompt_type=prompt_type,
                latency_ms=int((time.perf_counter() - started) * 1000),
                status="failed",
                error_message=str(exc)[:500],
            )

    def _responses_create(self, client, system_prompt: str, user_prompt: str, max_tokens: int):
        if hasattr(client, "responses"):
            return client.responses.create(
                model=self.model,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_output_tokens=max_tokens,
            )
        return client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=max_tokens,
        )

    def _extract_response_text(self, response) -> str:
        output_text = getattr(response, "output_text", None)
        if output_text:
            return str(output_text)
        choices = getattr(response, "choices", None)
        if choices:
            message = getattr(choices[0], "message", None)
            content = getattr(message, "content", None)
            return str(content or "")
        output = getattr(response, "output", None) or []
        chunks: list[str] = []
        for item in output:
            for content in getattr(item, "content", []) or []:
                text = getattr(content, "text", None)
                if text:
                    chunks.append(str(text))
        return "\n".join(chunks)

    def _usage_value(self, usage, *names: str) -> int:
        if usage is None:
            return 0
        for name in names:
            value = getattr(usage, name, None)
            if value is not None:
                return int(value)
            if isinstance(usage, dict) and usage.get(name) is not None:
                return int(usage[name])
        return 0
