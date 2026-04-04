from __future__ import annotations

from collections import defaultdict
from typing import Any

from swimming_best.analytics import build_series, goal_progress
from swimming_best.official_grade_baseline import evaluate_official_grade
from swimming_best.repository import Repository


class AdminService:
    def __init__(self, repository: Repository):
        self.repository = repository

    def list_teams(self) -> list[dict[str, Any]]:
        return self.repository.list_teams()

    def create_team(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.create_team(payload)

    def update_team(self, team_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.update_team(team_id, payload)

    def list_swimmers(self, team_id: str | None = None) -> list[dict[str, Any]]:
        return self.repository.list_swimmers(team_id=team_id)

    def create_swimmer(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.create_swimmer(payload)

    def update_swimmer(self, swimmer_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        return self.repository.update_swimmer(swimmer_id, payload)

    def list_events(self) -> list[dict[str, Any]]:
        return self.repository.list_events()

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


class PublicService:
    def __init__(self, repository: Repository):
        self.repository = repository

    def list_swimmers(self, team_id: str | None = None) -> list[dict[str, Any]]:
        swimmers = self.repository.list_public_swimmers(team_id=team_id)
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
        official_grade = evaluate_official_grade(
            gender=swimmer["gender"],
            event=event,
            current_best_time_ms=series["currentBestTimeMs"],
        )
        custom_standards = []
        benchmark_lines = []
        next_custom_standard = None
        if series["currentBestTimeMs"] > 0:
            standards = self.repository.list_custom_standards_for_event(event_id, swimmer["gender"])
            for standard in standards:
                achieved = series["currentBestTimeMs"] <= standard["qualifyingTimeMs"]
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
                series["currentBestTimeMs"],
                event_id,
                swimmer["gender"],
            )
        goals = self.repository.list_goals(public_only=True)
        goal_payload = []
        for goal in goals:
            if goal["swimmerId"] != swimmer["id"] or goal["eventId"] != event_id:
                continue
            goal_payload.append(
                {
                    "id": goal["id"],
                    "title": goal["title"],
                    "horizon": goal["horizon"],
                    "targetTimeMs": goal["targetTimeMs"],
                    "targetDate": goal["targetDate"],
                    "baselineTimeMs": goal["baselineTimeMs"],
                    "currentBestTimeMs": series["currentBestTimeMs"],
                    "progress": goal_progress(
                        goal["baselineTimeMs"],
                        series["currentBestTimeMs"],
                        goal["targetTimeMs"],
                    ),
                }
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


def public_display_name(swimmer: dict[str, Any]) -> str:
    if swimmer["publicNameMode"] == "real_name":
        return swimmer["realName"]
    return swimmer["nickname"] or swimmer["realName"]
