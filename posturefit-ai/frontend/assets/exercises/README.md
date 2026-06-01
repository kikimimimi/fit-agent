# Exercise PNG Assets

Exercise photos are loaded in this order:

```text
female/{exercise_ref_id}.png or male/{exercise_ref_id}.png
{exercise_ref_id}.png
SVG fallback
```

Use the gender folders for curated model libraries. Shared generated images can
remain in the root folder. If a file is missing, the frontend asks
`/api/exercise-images` to generate a shared PNG when OpenAI image generation is
enabled. If generation is disabled or fails, the app shows the local SVG
fallback.

To split 4 contact sheets into one gender library:

```powershell
python scripts/split_exercise_contact_sheets.py `
  --gender female `
  --sheets path\to\female-1.png path\to\female-2.png path\to\female-3.png path\to\female-4.png
```

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
