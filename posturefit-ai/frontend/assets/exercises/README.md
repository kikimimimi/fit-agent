# Exercise PNG Assets

Generated exercise photos are cached here as:

```text
{exercise_ref_id}.png
```

The app loads these PNG files first. If a file is missing, the frontend asks
`/api/exercise-images` to generate it when OpenAI image generation is enabled.
If generation is disabled or fails, the app shows the local SVG fallback.

Prompt style:

```text
realistic fitness instruction photo
white background
single adult model
neutral sportswear
clear full-body pose
target muscle subtly highlighted in red
no watermark
no text
consistent camera angle
```
