from __future__ import annotations

import json
from dataclasses import dataclass
from decimal import Decimal
from functools import lru_cache
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class OfficialGradeResult:
    official_grade: dict[str, Any] | None
    next_official_grade: dict[str, Any] | None
    status: str


def evaluate_official_grade(
    *,
    gender: str,
    event: dict[str, Any],
    current_best_time_ms: int,
) -> OfficialGradeResult:
    if gender == "unknown":
        return OfficialGradeResult(None, None, "missing_gender")

    standards = list_standards_for_event(
        gender=gender,
        pool_length_m=int(event["poolLengthM"]),
        distance_m=int(event["distanceM"]),
        stroke=str(event["stroke"]),
    )
    if not standards:
        return OfficialGradeResult(None, None, "unavailable_for_event")
    if current_best_time_ms <= 0:
        return OfficialGradeResult(None, None, "no_valid_performance")

    achieved = [
        standard for standard in standards if current_best_time_ms <= standard["qualifyingTimeMs"]
    ]
    achieved_grade = achieved[-1] if achieved else None

    if achieved_grade is None:
        next_grade = build_next_grade(standards[0], current_best_time_ms)
        return OfficialGradeResult(None, next_grade, "ok")

    next_candidates = [
        standard for standard in standards if standard["order"] > achieved_grade["order"]
    ]
    next_grade = (
        build_next_grade(next_candidates[0], current_best_time_ms)
        if next_candidates
        else None
    )
    return OfficialGradeResult(strip_gap(achieved_grade), next_grade, "ok")


def list_standards_for_event(
    *,
    gender: str,
    pool_length_m: int,
    distance_m: int,
    stroke: str,
) -> list[dict[str, Any]]:
    baseline = load_official_grade_baseline()
    return baseline["entries"].get((gender, pool_length_m, distance_m, stroke), [])


def build_next_grade(standard: dict[str, Any], current_best_time_ms: int) -> dict[str, Any]:
    payload = strip_gap(standard)
    payload["gapMs"] = max(current_best_time_ms - standard["qualifyingTimeMs"], 0)
    return payload


def strip_gap(standard: dict[str, Any]) -> dict[str, Any]:
    return {
        "code": standard["code"],
        "label": standard["label"],
        "order": standard["order"],
        "qualifyingTimeMs": standard["qualifyingTimeMs"],
        "qualifyingTime": standard["qualifyingTime"],
    }


@lru_cache(maxsize=1)
def load_official_grade_baseline() -> dict[str, Any]:
    resource_path = Path(__file__).resolve().parent / "resources" / (
        "official_swimming_grade_standards.cn-2025.json"
    )
    payload = json.loads(resource_path.read_text(encoding="utf-8"))

    tiers_by_code = {
        tier["code"]: tier
        for tier in payload["tiers"]
    }
    flattened: dict[tuple[str, int, int, str], list[dict[str, Any]]] = {}

    for row in payload["events"]:
        for pool_key, pool_times in row["timesByPool"].items():
            standards = []
            for tier_code, time_text in pool_times.items():
                if not time_text or str(time_text).strip() == "-":
                    continue
                tier = tiers_by_code[tier_code]
                standards.append(
                    {
                        "code": tier["code"],
                        "label": tier["label"],
                        "order": tier["order"],
                        "qualifyingTime": time_text,
                        "qualifyingTimeMs": parse_time_text(time_text),
                    }
                )
            standards.sort(key=lambda item: item["order"])
            if not standards:
                continue
            flattened[
                (
                    row["gender"],
                    int(pool_key),
                    int(row["distanceM"]),
                    row["stroke"],
                )
            ] = standards

    return {
        "specCode": payload["specCode"],
        "specName": payload["specName"],
        "effectiveDate": payload["effectiveDate"],
        "sourceImages": payload["sourceImages"],
        "tiers": payload["tiers"],
        "entries": flattened,
    }


def parse_time_text(value: str) -> int:
    normalized = str(value).strip()
    if ":" in normalized:
        minute_text, second_text = normalized.split(":", 1)
        total_seconds = Decimal(minute_text) * Decimal(60) + Decimal(second_text)
    else:
        total_seconds = Decimal(normalized)
    return int(total_seconds * Decimal(1000))
