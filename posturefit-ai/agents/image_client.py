from __future__ import annotations

import base64
import os
import time
from dataclasses import dataclass
from pathlib import Path

try:
    from openai import OpenAI
except Exception:  # pragma: no cover - optional dependency fallback
    OpenAI = None  # type: ignore[assignment]


@dataclass
class ImageGenerationResult:
    status: str
    src: str = ""
    provider: str = "local_mock"
    model: str = "rule_based_fallback"
    latency_ms: int = 0
    error_message: str = ""
    enabled: bool = False
    prompt: str = ""


class ExerciseImageClient:
    """Optional OpenAI image generator for missing exercise PNG assets."""

    def __init__(self) -> None:
        self.provider = (
            os.getenv("IMAGE_GENERATION_PROVIDER")
            or os.getenv("LLM_PROVIDER", "local")
        ).strip().lower()
        self.model = os.getenv("IMAGE_MODEL", "gpt-image-1").strip()
        self.quality = os.getenv("IMAGE_QUALITY", "medium").strip()
        self.size = os.getenv("IMAGE_SIZE", "1024x1024").strip()
        self.openai_api_key = os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY")

    def enabled(self) -> bool:
        return self.provider == "openai" and bool(self.openai_api_key) and OpenAI is not None

    def generate_exercise_image(
        self,
        *,
        exercise_ref_id: str,
        exercise_name: str,
        scenario: str,
        target_muscles: list[str],
        instruction: str,
        output_path: Path,
    ) -> ImageGenerationResult:
        prompt = self._build_prompt(
            exercise_name=exercise_name,
            scenario=scenario,
            target_muscles=target_muscles,
            instruction=instruction,
        )
        if output_path.exists():
            return ImageGenerationResult(
                status="cached",
                provider=self.provider,
                model=self.model,
                enabled=self.enabled(),
                prompt=prompt,
            )
        if self.provider != "openai":
            return ImageGenerationResult(
                status="skipped",
                error_message="IMAGE_GENERATION_PROVIDER or LLM_PROVIDER is not openai.",
                prompt=prompt,
            )
        if not self.openai_api_key:
            return ImageGenerationResult(
                status="skipped",
                provider="openai",
                model=self.model,
                error_message="OPENAI_API_KEY is not set.",
                prompt=prompt,
            )
        if OpenAI is None:
            return ImageGenerationResult(
                status="skipped",
                provider="openai",
                model=self.model,
                error_message="openai package is not installed.",
                prompt=prompt,
            )

        started = time.perf_counter()
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            image_bytes = self._generate_png_bytes(prompt)
            output_path.write_bytes(image_bytes)
            return ImageGenerationResult(
                status="success",
                provider="openai",
                model=self.model,
                latency_ms=int((time.perf_counter() - started) * 1000),
                enabled=True,
                prompt=prompt,
            )
        except Exception as exc:
            return ImageGenerationResult(
                status="failed",
                provider="openai",
                model=self.model,
                latency_ms=int((time.perf_counter() - started) * 1000),
                error_message=str(exc)[:500],
                enabled=True,
                prompt=prompt,
            )

    def _generate_png_bytes(self, prompt: str) -> bytes:
        client = OpenAI(api_key=self.openai_api_key)
        if not hasattr(client, "images"):
            raise RuntimeError("Installed OpenAI SDK does not expose client.images.")

        try:
            response = client.images.generate(
                model=self.model,
                prompt=prompt,
                size=self.size,
                quality=self.quality,
            )
        except Exception as exc:
            if "quality" not in str(exc).lower():
                raise
            response = client.images.generate(
                model=self.model,
                prompt=prompt,
                size=self.size,
            )

        data = getattr(response, "data", None) or []
        if not data:
            raise RuntimeError("Image API returned no image data.")
        first = data[0]
        b64_json = getattr(first, "b64_json", None)
        if not b64_json and isinstance(first, dict):
            b64_json = first.get("b64_json")
        if not b64_json:
            raise RuntimeError("Image API did not return base64 PNG data.")
        return base64.b64decode(b64_json)

    def _build_prompt(
        self,
        *,
        exercise_name: str,
        scenario: str,
        target_muscles: list[str],
        instruction: str,
    ) -> str:
        scene = self._scene_instruction(scenario)
        muscles = ", ".join(target_muscles) if target_muscles else "the primary working muscles"
        return "\n".join(
            [
                "Use case: scientific-educational",
                "Asset type: exercise card image for a fitness planning web app",
                f"Primary request: realistic fitness instruction photo of {exercise_name}.",
                f"Scene/backdrop: {scene}",
                "Subject: one adult fitness model, neutral sportswear, clear full-body pose.",
                "Style/medium: realistic fitness instruction photo, clean studio lighting.",
                "Composition/framing: consistent camera angle, full body visible, centered, enough padding around the body.",
                f"Exercise cue: {instruction}",
                f"Target muscle emphasis: subtly highlight {muscles} in translucent red anatomical overlay.",
                "Constraints: white background, no watermark, no text, no logo, no brand marks, no extra people.",
                "Avoid: cartoon, SVG, line art, exaggerated anatomy, cropped limbs, cluttered background.",
            ]
        )

    def _scene_instruction(self, scenario: str) -> str:
        if scenario == "gym":
            return "white studio background with only the specific gym equipment needed for this exercise, clean and uncluttered."
        return (
            "white home-training setup using only home-appropriate items such as a mat, wall, doorway, or stable step; "
            "do not include gym machines, cable stations, barbells, sleds, treadmills, or commercial gym equipment."
        )
