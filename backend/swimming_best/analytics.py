from __future__ import annotations

from collections.abc import Iterable


def build_series(performances: Iterable[dict]) -> dict:
    filtered = [
        performance
        for performance in performances
        if performance["resultStatus"] == "valid"
    ]
    filtered.sort(key=lambda item: (item["performedOn"], item["createdAt"]))

    raw: list[dict] = []
    pb: list[dict] = []
    trend: list[dict] = []
    current_best = 0
    moving: list[int] = []

    for index, performance in enumerate(filtered):
        point = {
            "performedOn": performance["performedOn"],
            "timeMs": performance["timeMs"],
        }
        raw.append(point)

        if index == 0 or performance["timeMs"] < current_best:
            current_best = performance["timeMs"]
        pb.append({"performedOn": performance["performedOn"], "timeMs": current_best})

        moving.append(performance["timeMs"])
        if len(moving) > 3:
            moving = moving[1:]
        trend.append(
            {
                "performedOn": performance["performedOn"],
                "timeMs": sum(moving) // len(moving),
            }
        )

    return {
        "raw": raw,
        "pb": pb,
        "trend": trend,
        "currentBestTimeMs": current_best,
    }


def goal_progress(baseline: int, current_best: int, target: int) -> float:
    if baseline <= 0 or target <= 0 or baseline == target:
        return 0.0

    progress = float(baseline - current_best) / float(baseline - target)
    if progress < 0:
        return 0.0
    if progress > 1:
        return 1.0
    return progress
