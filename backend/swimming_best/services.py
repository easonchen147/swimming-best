from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta
from typing import Any

from swimming_best.analytics import build_series, goal_progress
from swimming_best.official_grade_baseline import (
    evaluate_official_grade,
    list_standards_for_event,
)
from swimming_best.repository import Repository


class AdminService:
    def __init__(self, repository: Repository):
        self.repository = repository

    def list_teams(self, search: str | None = None) -> list[dict[str, Any]]:
        return self.repository.list_teams(search=search)

    def create_team(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.create_team(payload)

    def update_team(self, team_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.update_team(team_id, payload)

    def list_swimmers(
        self,
        team_id: str | None = None,
        search: str | None = None,
    ) -> list[dict[str, Any]]:
        return self.repository.list_swimmers(team_id=team_id, search=search)

    def create_swimmer(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.create_swimmer(payload)

    def update_swimmer(self, swimmer_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.update_swimmer(swimmer_id, payload)

    def list_events(self, search: str | None = None) -> list[dict[str, Any]]:
        return self.repository.list_events(search=search)

    def create_event(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.create_event(payload)

    def quick_record_performance(self, payload: dict[str, Any]) -> dict[str, Any]:
        record_context = self.repository.create_context(
            {
                "sourceType": payload.get("sourceType") or "single",
                "title": "Quick Entry",
                "performedOn": payload.get("performedOn"),
            }
        )
        performance = self.repository.create_performance(
            {
                "contextId": record_context["id"],
                "swimmerId": payload["swimmerId"],
                "eventId": payload["eventId"],
                "timeMs": payload["timeMs"],
                "performedOn": payload.get("performedOn"),
                "resultStatus": "valid",
                "publicNote": payload.get("publicNote", ""),
                "adminNote": payload.get("adminNote", ""),
            }
        )
        self.repository.attach_performance_tags(performance["id"], payload.get("tags", []))
        return {"context": record_context, "performance": performance}

    def create_context(self, payload: dict[str, Any]) -> dict[str, Any]:
        record_context = self.repository.create_context(payload)
        self.repository.attach_context_tags(record_context["id"], payload.get("tags", []))
        return record_context

    def add_context_performances(
        self, context_id: str, performances: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        record_context = self.repository.get_context(context_id)
        created = []
        for performance in performances:
            created.append(
                self.repository.create_performance(
                    {
                        "contextId": context_id,
                        "swimmerId": performance["swimmerId"],
                        "eventId": performance["eventId"],
                        "timeMs": performance["timeMs"],
                        "performedOn": record_context["performedOn"],
                        "resultStatus": performance.get("resultStatus") or "valid",
                        "publicNote": performance.get("publicNote", ""),
                        "adminNote": performance.get("adminNote", ""),
                    }
                )
            )
            self.repository.attach_performance_tags(
                created[-1]["id"],
                performance.get("tags", []),
            )
        return created

    def create_goal(self, payload: dict[str, Any]) -> dict[str, Any]:
        baseline = self.repository.best_time_ms(payload["swimmerId"], payload["eventId"])
        return self.repository.create_goal(
            {
                **payload,
                "baselineTimeMs": baseline,
                "status": "active",
            }
        )

    def list_goals(self) -> list[dict[str, Any]]:
        return self.repository.list_goals()

    def list_recent_performances(self) -> list[dict[str, Any]]:
        return self.repository.list_recent_performances()

    def list_standards(self) -> list[dict[str, Any]]:
        return self.repository.list_standards()

    def create_standard(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.create_standard(payload)

    def update_standard(self, standard_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.update_standard(standard_id, payload)

    def delete_standard(self, standard_id: str) -> None:
        self.repository.delete_standard(standard_id)

    def list_standard_entries(self, standard_id: str) -> list[dict[str, Any]]:
        return self.repository.list_standard_entries(standard_id=standard_id)

    def create_standard_entry(
        self,
        standard_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        return self.repository.create_standard_entry({**payload, "standardId": standard_id})

    def update_standard_entry(self, entry_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.update_standard_entry(entry_id, payload)

    def delete_standard_entry(self, entry_id: str) -> None:
        self.repository.delete_standard_entry(entry_id)

    def swimmer_export_summary(self, swimmer_id: str) -> dict[str, Any]:
        swimmer = self.repository.get_swimmer(swimmer_id)
        events = self.repository.list_events_for_swimmer(swimmer_id)
        all_goals = [
            goal for goal in self.repository.list_goals() if goal["swimmerId"] == swimmer_id
        ]

        highlights = []
        achieved_goal_count = 0
        active_goal_count = 0

        for goal in all_goals:
            if goal["status"] == "active":
                active_goal_count += 1
            current_best = self.repository.best_time_ms(swimmer_id, goal["eventId"])
            if current_best > 0 and current_best <= goal["targetTimeMs"]:
                achieved_goal_count += 1

        for event in events:
            performances = self.repository.list_performances_for_swimmer_event(
                swimmer_id,
                event["id"],
            )
            series = build_series(performances)
            current_best_time_ms = series["currentBestTimeMs"]
            if current_best_time_ms <= 0:
                continue

            official_grade = evaluate_official_grade(
                gender=swimmer["gender"],
                event=event,
                current_best_time_ms=current_best_time_ms,
            )
            progress_30 = recent_window_progress_ms(performances, 30)
            progress_90 = recent_window_progress_ms(performances, 90)

            highlights.append(
                {
                    "eventId": event["id"],
                    "eventDisplayName": event["displayName"],
                    "bestTimeMs": current_best_time_ms,
                    "officialGradeLabel": (
                        official_grade.official_grade["label"]
                        if official_grade.official_grade
                        else None
                    ),
                    "nextOfficialGradeLabel": (
                        official_grade.next_official_grade["label"]
                        if official_grade.next_official_grade
                        else None
                    ),
                    "nextOfficialGradeGapMs": (
                        official_grade.next_official_grade["gapMs"]
                        if official_grade.next_official_grade
                        else None
                    ),
                    "progress30dMs": progress_30,
                    "progress90dMs": progress_90,
                    "_gradeOrder": (
                        official_grade.official_grade["order"]
                        if official_grade.official_grade
                        else 0
                    ),
                }
            )

        highlights.sort(
            key=lambda item: (
                -item["_gradeOrder"],
                -item["progress30dMs"],
                -item["progress90dMs"],
                item["bestTimeMs"],
            )
        )

        strongest_highlights = [
            {k: v for k, v in item.items() if not k.startswith("_")}
            for item in highlights[:3]
        ]

        goal_payload = []
        for goal in all_goals:
            current_best = self.repository.best_time_ms(swimmer_id, goal["eventId"])
            gap_ms = (
                max(current_best - goal["targetTimeMs"], 0)
                if current_best > 0 and goal["targetTimeMs"] > 0
                else 0
            )
            goal_payload.append(
                {
                    "id": goal["id"],
                    "title": goal["title"],
                    "horizon": goal["horizon"],
                    "targetTimeMs": goal["targetTimeMs"],
                    "targetDate": goal["targetDate"],
                    "baselineTimeMs": goal["baselineTimeMs"],
                    "currentBestTimeMs": current_best,
                    "progress": goal_progress(
                        goal["baselineTimeMs"],
                        current_best,
                        goal["targetTimeMs"],
                    ),
                    "gapMs": gap_ms,
                    "isAchieved": current_best > 0 and current_best <= goal["targetTimeMs"],
                }
            )

        standout_progress_30 = max(
            (item["progress30dMs"] for item in strongest_highlights),
            default=0,
        )
        standout_progress_90 = max(
            (item["progress90dMs"] for item in strongest_highlights),
            default=0,
        )

        return {
            "swimmer": {
                "id": swimmer["id"],
                "realName": swimmer["realName"],
                "nickname": swimmer["nickname"],
                "displayName": public_display_name(swimmer),
                "gender": swimmer["gender"],
                "birthYear": swimmer["birthYear"],
                "ageBucket": swimmer.get("ageBucket", "unknown"),
                "teamId": swimmer["teamId"],
                "team": swimmer["team"],
            },
            "summary": {
                "strongestEventCount": len(strongest_highlights),
                "achievedGoalCount": achieved_goal_count,
                "activeGoalCount": active_goal_count,
                "standoutProgress30dMs": standout_progress_30,
                "standoutProgress90dMs": standout_progress_90,
            },
            "highlights": strongest_highlights,
            "goals": goal_payload,
        }


class PublicService:
    def __init__(self, repository: Repository):
        self.repository = repository

    def list_swimmers(
        self,
        team_id: str | None = None,
        search: str | None = None,
    ) -> list[dict[str, Any]]:
        swimmers = self.repository.list_public_swimmers(team_id=team_id, search=search)
        summaries = []
        for swimmer in swimmers:
            summaries.append(
                {
                    "id": swimmer["id"],
                    "slug": swimmer["slug"],
                    "displayName": public_display_name(swimmer),
                    "teamId": swimmer["teamId"],
                    "team": swimmer["team"],
                    "strongestEventId": self.repository.strongest_event_id(swimmer["id"]),
                }
            )
        return summaries

    def swimmer_detail(self, slug: str) -> dict[str, Any]:
        swimmer = self.repository.get_public_swimmer_by_slug(slug)
        return {
            "id": swimmer["id"],
            "slug": swimmer["slug"],
            "displayName": public_display_name(swimmer),
            "gender": swimmer["gender"],
            "teamId": swimmer["teamId"],
            "team": swimmer["team"],
        }

    def swimmer_events(self, slug: str) -> list[dict[str, Any]]:
        swimmer = self.repository.get_public_swimmer_by_slug(slug)
        events = self.repository.list_events_for_swimmer(swimmer["id"])
        summaries = []
        for event in events:
            summaries.append(
                {
                    "event": event,
                    "currentBestTimeMs": self.repository.best_time_ms(swimmer["id"], event["id"]),
                }
            )
        return summaries

    def event_analytics(self, slug: str, event_id: str) -> dict[str, Any]:
        swimmer = self.repository.get_public_swimmer_by_slug(slug)
        event = self.repository.get_event(event_id)
        performances = self.repository.list_performances_for_swimmer_event(swimmer["id"], event_id)
        series = build_series(performances)
        current_best_time_ms = series["currentBestTimeMs"]
        official_grade = evaluate_official_grade(
            gender=swimmer["gender"],
            event=event,
            current_best_time_ms=current_best_time_ms,
        )
        official_benchmarks = build_official_benchmarks(
            gender=swimmer["gender"],
            event=event,
            current_best_time_ms=current_best_time_ms,
        )
        custom_standards = []
        benchmark_lines = []
        next_custom_standard = None
        if current_best_time_ms > 0:
            standards = self.repository.list_custom_standards_for_event(event_id, swimmer["gender"])
            for standard in standards:
                achieved = current_best_time_ms <= standard["qualifyingTimeMs"]
                custom_standards.append({**standard, "achieved": achieved})
                benchmark_lines.append(
                    {
                        "name": standard["name"],
                        "tierGroup": standard["tierGroup"],
                        "colorHex": standard["colorHex"],
                        "qualifyingTimeMs": standard["qualifyingTimeMs"],
                    }
                )
            next_custom_standard = self.repository.get_next_custom_standard(
                current_best_time_ms,
                event_id,
                swimmer["gender"],
            )
        goals = self.repository.list_goals(public_only=True)
        goal_payload = []
        for goal in goals:
            if goal["swimmerId"] != swimmer["id"] or goal["eventId"] != event_id:
                continue
            gap_ms = (
                max(current_best_time_ms - goal["targetTimeMs"], 0)
                if current_best_time_ms > 0 and goal["targetTimeMs"] > 0
                else 0
            )
            goal_payload.append(
                {
                    "id": goal["id"],
                    "title": goal["title"],
                    "horizon": goal["horizon"],
                    "targetTimeMs": goal["targetTimeMs"],
                    "targetDate": goal["targetDate"],
                    "baselineTimeMs": goal["baselineTimeMs"],
                    "currentBestTimeMs": current_best_time_ms,
                    "progress": goal_progress(
                        goal["baselineTimeMs"],
                        current_best_time_ms,
                        goal["targetTimeMs"],
                    ),
                    "gapMs": gap_ms,
                    "isAchieved": current_best_time_ms > 0
                    and current_best_time_ms <= goal["targetTimeMs"],
                }
            )
        goal_payload.sort(
            key=lambda item: (item["targetDate"], item["targetTimeMs"], item["title"])
        )
        return {
            "swimmer": {
                "id": swimmer["id"],
                "slug": swimmer["slug"],
                "displayName": public_display_name(swimmer),
                "teamId": swimmer["teamId"],
                "team": swimmer["team"],
            },
            "event": event,
            "series": series,
            "goals": goal_payload,
            "officialBenchmarks": official_benchmarks,
            "officialGrade": official_grade.official_grade,
            "nextOfficialGrade": official_grade.next_official_grade,
            "officialGradeStatus": official_grade.status,
            "customStandards": custom_standards,
            "nextCustomStandard": next_custom_standard,
            "benchmarkLines": benchmark_lines,
        }

    def compare(self, event_id: str, swimmer_ids: list[str]) -> dict[str, Any]:
        if not event_id:
            raise ValueError("event id is required")
        if not swimmer_ids:
            raise ValueError("at least one swimmer is required")

        swimmers = [
            self.repository.get_public_swimmer_by_id(swimmer_id)
            for swimmer_id in swimmer_ids
        ]
        performances = self.repository.list_performances_for_event_and_swimmers(
            event_id,
            swimmer_ids,
        )
        grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for performance in performances:
            grouped[performance["swimmerId"]].append(performance)

        compare_swimmers = []
        for swimmer in swimmers:
            series = build_series(grouped[swimmer["id"]])
            improvement_time_ms = 0
            improvement_ratio = 0.0
            if series["raw"]:
                first_time = series["raw"][0]["timeMs"]
                improvement_time_ms = first_time - series["currentBestTimeMs"]
                if first_time > 0:
                    improvement_ratio = improvement_time_ms / first_time
            compare_swimmers.append(
                {
                    "swimmerId": swimmer["id"],
                    "displayName": public_display_name(swimmer),
                    "teamId": swimmer["teamId"],
                    "team": swimmer["team"],
                    "series": series,
                    "currentBestTimeMs": series["currentBestTimeMs"],
                    "improvementTimeMs": improvement_time_ms,
                    "improvementRatio": improvement_ratio,
                }
            )

        return {
            "event": self.repository.get_event(event_id),
            "swimmers": compare_swimmers,
        }

    def arena_board(
        self,
        *,
        gender: str | None = None,
        pool_length_m: int | None = None,
        team_id: str | None = None,
        age_bucket: str | None = None,
    ) -> dict[str, Any]:
        rows = self.repository.list_public_best_performances_for_arena(
            team_id=team_id,
            gender=gender,
            pool_length_m=pool_length_m,
            age_bucket=age_bucket,
        )

        ranking_gender = gender or "all"
        grouped: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
        for row in rows:
            group_gender = (
                ranking_gender if ranking_gender == "all" else row["swimmer"]["gender"]
            )
            group_age_bucket = row["swimmer"]["ageBucket"] if age_bucket else "all"
            group_key = (row["event"]["id"], f"{group_gender}:{group_age_bucket}")
            grouped[group_key].append(row)

        groups = []
        for (event_id, gender_and_age), ranks in grouped.items():
            ranks.sort(key=lambda item: item["bestTimeMs"])
            event = ranks[0]["event"]
            arena_gender, arena_age_bucket = gender_and_age.split(":", 1)
            competitor_count = len(ranks)
            leader = ranks[0]
            second = ranks[1] if competitor_count > 1 else None
            leader_gap_ms = (
                max(second["bestTimeMs"] - leader["bestTimeMs"], 0)
                if second is not None
                else 0
            )
            leader_gap_percent = (
                leader_gap_ms / second["bestTimeMs"]
                if second is not None and second["bestTimeMs"] > 0
                else 0.0
            )
            heat_score = calculate_arena_heat_score(ranks)
            groups.append(
                {
                    "groupKey": f"{event_id}:{arena_gender}:{arena_age_bucket}",
                    "gender": arena_gender,
                    "ageBucket": arena_age_bucket,
                    "event": event,
                    "competitorCount": competitor_count,
                    "heatScore": heat_score,
                    "heatLabel": arena_heat_label(heat_score),
                    "leaderGapMs": leader_gap_ms,
                    "leaderGapPercent": leader_gap_percent,
                    "leader": {
                        "swimmerId": leader["swimmer"]["id"],
                        "displayName": public_display_name(leader["swimmer"]),
                        "teamId": leader["swimmer"]["teamId"],
                        "team": leader["swimmer"]["team"],
                        "bestTimeMs": leader["bestTimeMs"],
                    },
                    "rankings": [
                        {
                            "rank": index + 1,
                            "swimmerId": item["swimmer"]["id"],
                            "displayName": public_display_name(item["swimmer"]),
                            "teamId": item["swimmer"]["teamId"],
                            "team": item["swimmer"]["team"],
                            "ageBucket": item["swimmer"]["ageBucket"],
                            "bestTimeMs": item["bestTimeMs"],
                            "gapFromLeaderMs": item["bestTimeMs"] - leader["bestTimeMs"],
                        }
                        for index, item in enumerate(ranks[:8])
                    ],
                }
            )

        groups.sort(
            key=lambda item: (
                -item["heatScore"],
                -item["competitorCount"],
                item["event"]["sortOrder"],
                item["event"]["displayName"],
                item["gender"],
                item["ageBucket"],
            )
        )

        return {
            "filters": {
                "gender": gender or "all",
                "poolLengthM": pool_length_m,
                "teamId": team_id or "",
                "ageBucket": age_bucket or "all",
            },
            "summary": {
                "groupCount": len(groups),
                "competitorCount": sum(item["competitorCount"] for item in groups),
            },
            "groups": groups,
        }


def public_display_name(swimmer: dict[str, Any]) -> str:
    if swimmer["publicNameMode"] == "real_name":
        return swimmer["realName"]
    return swimmer["nickname"] or swimmer["realName"]


def build_official_benchmarks(
    *,
    gender: str,
    event: dict[str, Any],
    current_best_time_ms: int,
) -> list[dict[str, Any]]:
    if gender == "unknown" or current_best_time_ms <= 0:
        return []

    standards = list_standards_for_event(
        gender=gender,
        pool_length_m=int(event["poolLengthM"]),
        distance_m=int(event["distanceM"]),
        stroke=str(event["stroke"]),
    )
    return [
        {
            **standard,
            "achieved": current_best_time_ms <= standard["qualifyingTimeMs"],
            "gapMs": max(current_best_time_ms - standard["qualifyingTimeMs"], 0),
        }
        for standard in standards
    ]


def calculate_arena_heat_score(rankings: list[dict[str, Any]]) -> int:
    competitor_count = len(rankings)
    if competitor_count == 0:
        return 0
    if competitor_count == 1:
        return 28

    leader_time = rankings[0]["bestTimeMs"]
    comparison_time = rankings[min(2, competitor_count - 1)]["bestTimeMs"]
    relative_spread = (
        (comparison_time - leader_time) / leader_time
        if leader_time > 0
        else 1.0
    )
    density = min(competitor_count / 8, 1.0)
    tightness = max(0.0, 1 - min(relative_spread / 0.08, 1.0))
    return round((tightness * 0.65 + density * 0.35) * 100)


def arena_heat_label(heat_score: int) -> str:
    if heat_score >= 80:
        return "白热"
    if heat_score >= 60:
        return "激烈"
    if heat_score >= 40:
        return "活跃"
    return "观察"


def recent_window_progress_ms(performances: list[dict[str, Any]], days: int) -> int:
    valid = [
        performance
        for performance in performances
        if performance["resultStatus"] == "valid"
    ]
    if len(valid) < 2:
        return 0

    valid.sort(key=lambda item: (item["performedOn"], item["createdAt"]))
    latest_date = date.fromisoformat(valid[-1]["performedOn"])
    cutoff = latest_date - timedelta(days=days)
    window = [
        performance
        for performance in valid
        if date.fromisoformat(performance["performedOn"]) >= cutoff
    ]
    if len(window) < 2:
        return 0
    first_time = window[0]["timeMs"]
    best_time = min(item["timeMs"] for item in window)
    return max(first_time - best_time, 0)
