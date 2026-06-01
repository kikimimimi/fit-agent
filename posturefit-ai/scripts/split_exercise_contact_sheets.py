from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw


SHEET_MAP = [
    [
        "home_glute_bridge",
        "home_clamshell",
        "home_side_lying_abduction",
        "home_bodyweight_squat",
        "home_wall_angel",
        "home_bird_dog",
        "home_dead_bug",
        "home_plank",
    ],
    [
        "home_side_plank",
        "home_hip_flexor_stretch",
        "home_chest_stretch",
        "home_reverse_snow_angel",
        "home_step_up",
        "home_split_squat",
        "home_good_morning",
        "home_calf_raise",
    ],
    [
        "home_mountain_climber",
        "home_glute_march",
        "gym_hip_abduction_machine",
        "gym_cable_hip_abduction",
        "gym_romanian_deadlift",
        "gym_seated_row",
        "gym_lat_pulldown",
        "gym_face_pull",
    ],
    [
        "gym_leg_press",
        "gym_goblet_squat",
        "gym_cable_pull_through",
        "gym_back_extension",
        "gym_chest_supported_row",
        "gym_pallof_press",
        "gym_treadmill_incline_walk",
        "gym_sled_push",
    ],
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Split 2x4 exercise contact sheets into per-exercise PNG assets, cropping off bottom labels."
    )
    parser.add_argument("--gender", choices=["female", "male"], required=True)
    parser.add_argument(
        "--sheets",
        nargs=4,
        required=True,
        type=Path,
        metavar=("SHEET1", "SHEET2", "SHEET3", "SHEET4"),
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=Path("frontend/assets/exercises"),
        help="Base exercise asset directory. Gender subfolder is created under this path.",
    )
    parser.add_argument(
        "--label-crop-ratio",
        type=float,
        default=0.82,
        help="Keep this portion of each tile height to remove bottom labels.",
    )
    return parser.parse_args()


def split_sheet(sheet_path: Path, names: list[str], out_dir: Path, label_crop_ratio: float) -> None:
    image = Image.open(sheet_path).convert("RGB")
    width, height = image.size
    tile_width = width / 2
    tile_height = height / 4
    gutter = max(4, round(min(width, height) * 0.006))

    for index, asset_id in enumerate(names):
        row = index // 2
        col = index % 2
        left = round(col * tile_width + gutter)
        top = round(row * tile_height + gutter)
        right = round((col + 1) * tile_width - gutter)
        bottom = round((row + 1) * tile_height - gutter)
        crop = image.crop((left, top, right, bottom))
        draw = ImageDraw.Draw(crop)
        label_top = round(crop.height * label_crop_ratio)
        draw.rectangle((0, label_top, crop.width, crop.height), fill=(255, 255, 255))
        crop.save(out_dir / f"{asset_id}.png", optimize=True)


def main() -> None:
    args = parse_args()
    out_dir = args.out_dir / args.gender
    out_dir.mkdir(parents=True, exist_ok=True)

    for sheet_path, names in zip(args.sheets, SHEET_MAP):
        if not sheet_path.exists():
            raise FileNotFoundError(sheet_path)
        split_sheet(sheet_path, names, out_dir, args.label_crop_ratio)

    print(f"Saved {sum(len(names) for names in SHEET_MAP)} images to {out_dir}")


if __name__ == "__main__":
    main()
