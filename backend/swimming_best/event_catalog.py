from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

STROKE_LABELS = {
    "freestyle": "自由泳",
    "backstroke": "仰泳",
    "breaststroke": "蛙泳",
    "butterfly": "蝶泳",
    "medley": "混合泳",
}

POOL_LABELS = {
    25: "短池",
    50: "长池",
}


def stroke_label(stroke: str) -> str:
    return STROKE_LABELS.get(stroke, stroke)


def pool_label(pool_length_m: int) -> str:
    return POOL_LABELS.get(pool_length_m, f"{pool_length_m}米池")


def build_event_display_name(pool_length_m: int, distance_m: int, stroke: str) -> str:
    return f"{distance_m}米 {stroke_label(stroke)}（{pool_label(pool_length_m)}）"


@lru_cache(maxsize=1)
def list_builtin_events() -> list[dict[str, Any]]:
    resource_path = (
        Path(__file__).resolve().parent
        / "resources"
        / "official_swimming_grade_standards.cn-2025.json"
    )
    payload = json.loads(resource_path.read_text(encoding="utf-8"))

    seen: set[tuple[int, int, str]] = set()
    events: list[dict[str, Any]] = []
    sort_order = 10

    for row in payload["events"]:
        for pool_key in row["timesByPool"].keys():
            key = (int(pool_key), int(row["distanceM"]), str(row["stroke"]))
            if key in seen:
                continue
            seen.add(key)
            pool_length_m, distance_m, stroke = key
            events.append(
                {
                    "id": f"builtin-{pool_length_m}-{distance_m}-{stroke}",
                    "poolLengthM": pool_length_m,
                    "distanceM": distance_m,
                    "stroke": stroke,
                    "effortType": "standard",
                    "displayName": build_event_display_name(
                        pool_length_m,
                        distance_m,
                        stroke,
                    ),
                    "sortOrder": sort_order,
                    "isActive": True,
                }
            )
            sort_order += 10

    events.sort(key=lambda item: (item["poolLengthM"], item["distanceM"], item["stroke"]))
    return events
