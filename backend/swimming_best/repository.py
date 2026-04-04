from __future__ import annotations

import re
import sqlite3
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from swimming_best.event_catalog import build_event_display_name


class RepositoryError(Exception):
    pass


class ConflictError(RepositoryError):
    pass


class NotFoundError(RepositoryError):
    pass


class ValidationError(RepositoryError):
    pass


class Repository:
    def __init__(self, connection: sqlite3.Connection):
        self.connection = connection

    def create_team(self, payload: dict[str, Any]) -> dict[str, Any]:
        now = utcnow()
        name = (payload.get("name") or "").strip()
        if not name:
            raise ValidationError("team name is required")

        team = {
            "id": str(uuid4()),
            "name": name,
            "sortOrder": int(payload.get("sortOrder") or 0),
            "isActive": bool(payload.get("isActive", True)),
            "createdAt": now,
            "updatedAt": now,
        }
        self._execute(
            """
            INSERT INTO teams (id, name, sort_order, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                team["id"],
                team["name"],
                team["sortOrder"],
                int(team["isActive"]),
                team["createdAt"],
                team["updatedAt"],
            ),
        )
        self.connection.commit()
        return team

    def list_teams(self) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            """
            SELECT id, name, sort_order, is_active, created_at, updated_at
            FROM teams
            ORDER BY sort_order ASC, created_at ASC
            """
        ).fetchall()
        return [self._row_to_team(row) for row in rows]

    def get_team(self, team_id: str) -> dict[str, Any]:
        row = self.connection.execute(
            """
            SELECT id, name, sort_order, is_active, created_at, updated_at
            FROM teams
            WHERE id = ?
            """,
            (team_id,),
        ).fetchone()
        if row is None:
            raise NotFoundError("not_found")
        return self._row_to_team(row)

    def update_team(self, team_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        team = self.get_team(team_id)
        name = (payload.get("name") or team["name"]).strip()
        if not name:
            raise ValidationError("team name is required")

        updated = {
            **team,
            "name": name,
            "sortOrder": int(payload.get("sortOrder", team["sortOrder"]) or 0),
            "isActive": bool(payload.get("isActive", team["isActive"])),
            "updatedAt": utcnow(),
        }
        self._execute(
            """
            UPDATE teams
            SET name = ?, sort_order = ?, is_active = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                updated["name"],
                updated["sortOrder"],
                int(updated["isActive"]),
                updated["updatedAt"],
                team_id,
            ),
        )
        self.connection.commit()
        return updated

    def create_swimmer(self, payload: dict[str, Any]) -> dict[str, Any]:
        now = utcnow()
        real_name = payload.get("realName", "").strip()
        if not real_name:
            raise ValidationError("real name is required")

        nickname = payload.get("nickname", "").strip() or real_name
        public_name_mode = payload.get("publicNameMode") or "nickname"
        is_public = bool(payload.get("isPublic", False))
        if public_name_mode == "hidden":
            is_public = False
        team = self._require_team(payload.get("teamId"))

        swimmer = {
            "id": str(uuid4()),
            "slug": self._unique_slug(slugify(nickname)),
            "realName": real_name,
            "nickname": nickname,
            "publicNameMode": public_name_mode,
            "isPublic": is_public,
            "avatarUrl": payload.get("avatarUrl", "").strip(),
            "birthYear": int(payload.get("birthYear") or 0),
            "gender": normalize_gender(payload.get("gender")),
            "teamId": team["id"],
            "team": team,
            "notes": payload.get("notes", "").strip(),
            "createdAt": now,
            "updatedAt": now,
        }

        self._execute(
            """
            INSERT INTO swimmers (
              id, slug, real_name, nickname, public_name_mode, is_public,
              avatar_url, birth_year, gender, team_id, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                swimmer["id"],
                swimmer["slug"],
                swimmer["realName"],
                swimmer["nickname"],
                swimmer["publicNameMode"],
                int(swimmer["isPublic"]),
                swimmer["avatarUrl"],
                swimmer["birthYear"],
                swimmer["gender"],
                swimmer["teamId"],
                swimmer["notes"],
                swimmer["createdAt"],
                swimmer["updatedAt"],
            ),
        )
        self.connection.commit()
        return self.get_swimmer(swimmer["id"])

    def update_swimmer(self, swimmer_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        swimmer = self.get_swimmer(swimmer_id)
        real_name = payload.get("realName", swimmer["realName"]).strip()
        nickname = payload.get("nickname", swimmer["nickname"]).strip() or real_name
        public_name_mode = payload.get("publicNameMode", swimmer["publicNameMode"])
        is_public = bool(payload.get("isPublic", swimmer["isPublic"]))
        if public_name_mode == "hidden":
            is_public = False
        next_team_id = payload.get("teamId", swimmer["teamId"])
        team = self._require_team(
            next_team_id,
            allow_inactive=str(next_team_id) == swimmer["teamId"],
        )

        updated = {
            **swimmer,
            "realName": real_name,
            "nickname": nickname,
            "publicNameMode": public_name_mode,
            "isPublic": is_public,
            "avatarUrl": payload.get("avatarUrl", swimmer["avatarUrl"]).strip(),
            "birthYear": int(payload.get("birthYear", swimmer["birthYear"]) or 0),
            "gender": normalize_gender(payload.get("gender", swimmer["gender"])),
            "teamId": team["id"],
            "team": team,
            "notes": payload.get("notes", swimmer["notes"]).strip(),
            "updatedAt": utcnow(),
        }

        self._execute(
            """
            UPDATE swimmers
            SET real_name = ?, nickname = ?, public_name_mode = ?, is_public = ?, avatar_url = ?,
                birth_year = ?, gender = ?, team_id = ?, notes = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                updated["realName"],
                updated["nickname"],
                updated["publicNameMode"],
                int(updated["isPublic"]),
                updated["avatarUrl"],
                updated["birthYear"],
                updated["gender"],
                updated["teamId"],
                updated["notes"],
                updated["updatedAt"],
                swimmer_id,
            ),
        )
        self.connection.commit()
        return self.get_swimmer(swimmer_id)

    def list_swimmers(self, team_id: str | None = None) -> list[dict[str, Any]]:
        clauses: list[str] = []
        params: list[Any] = []
        if team_id:
            clauses.append("s.team_id = ?")
            params.append(team_id)
        return self._list_swimmers(clauses, params)

    def list_public_swimmers(self, team_id: str | None = None) -> list[dict[str, Any]]:
        clauses = ["s.is_public = 1", "s.public_name_mode != 'hidden'"]
        params: list[Any] = []
        if team_id:
            clauses.append("s.team_id = ?")
            params.append(team_id)
        return self._list_swimmers(clauses, params)

    def get_swimmer(self, swimmer_id: str) -> dict[str, Any]:
        swimmers = self._list_swimmers(["s.id = ?"], [swimmer_id])
        if not swimmers:
            raise NotFoundError("not_found")
        return swimmers[0]

    def get_public_swimmer_by_slug(self, slug: str) -> dict[str, Any]:
        swimmers = self._list_swimmers(
            ["s.slug = ?", "s.is_public = 1", "s.public_name_mode != 'hidden'"],
            [slug],
        )
        if not swimmers:
            raise NotFoundError("not_found")
        return swimmers[0]

    def get_public_swimmer_by_id(self, swimmer_id: str) -> dict[str, Any]:
        swimmers = self._list_swimmers(
            ["s.id = ?", "s.is_public = 1", "s.public_name_mode != 'hidden'"],
            [swimmer_id],
        )
        if not swimmers:
            raise NotFoundError("not_found")
        return swimmers[0]

    def create_event(self, payload: dict[str, Any]) -> dict[str, Any]:
        now = utcnow()
        pool_length = int(payload.get("poolLengthM") or 0)
        distance = int(payload.get("distanceM") or 0)
        stroke = (payload.get("stroke") or "").strip()
        effort_type = "standard"
        if pool_length not in {25, 50} or distance <= 0 or not stroke:
            raise ValidationError("invalid event")
        duplicate = self.connection.execute(
            """
            SELECT id
            FROM events
            WHERE pool_length_m = ? AND distance_m = ? AND stroke = ?
            """,
            (pool_length, distance, stroke),
        ).fetchone()
        if duplicate is not None:
            return self.get_event(duplicate["id"])

        event = {
            "id": str(uuid4()),
            "poolLengthM": pool_length,
            "distanceM": distance,
            "stroke": stroke,
            "effortType": effort_type,
            "displayName": build_event_display_name(pool_length, distance, stroke),
            "sortOrder": int(payload.get("sortOrder") or 0),
            "isActive": bool(payload.get("isActive", True)),
            "createdAt": now,
            "updatedAt": now,
        }

        self._execute(
            """
            INSERT INTO events (
              id, pool_length_m, distance_m, stroke, effort_type, display_name, sort_order,
              is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event["id"],
                event["poolLengthM"],
                event["distanceM"],
                event["stroke"],
                event["effortType"],
                event["displayName"],
                event["sortOrder"],
                int(event["isActive"]),
                event["createdAt"],
                event["updatedAt"],
            ),
        )
        self.connection.commit()
        return event

    def list_events(self) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            """
            SELECT id, pool_length_m, distance_m, stroke, effort_type, display_name, sort_order,
                   is_active, created_at, updated_at
            FROM events
            ORDER BY sort_order ASC, created_at ASC
            """
        ).fetchall()
        return [self._row_to_event(row) for row in rows]

    def get_event(self, event_id: str) -> dict[str, Any]:
        row = self.connection.execute(
            """
            SELECT id, pool_length_m, distance_m, stroke, effort_type, display_name, sort_order,
                   is_active, created_at, updated_at
            FROM events
            WHERE id = ?
            """,
            (event_id,),
        ).fetchone()
        if row is None:
            raise NotFoundError("not_found")
        return self._row_to_event(row)

    def create_context(self, payload: dict[str, Any]) -> dict[str, Any]:
        now = utcnow()
        context = {
            "id": str(uuid4()),
            "sourceType": payload.get("sourceType") or "single",
            "title": payload.get("title") or "Quick Entry",
            "performedOn": payload.get("performedOn") or today(),
            "location": payload.get("location", "").strip(),
            "publicNote": payload.get("publicNote", "").strip(),
            "adminNote": payload.get("adminNote", "").strip(),
            "createdAt": now,
            "updatedAt": now,
        }
        self._execute(
            """
            INSERT INTO record_contexts (
              id, source_type, title, performed_on, location, public_note, admin_note,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                context["id"],
                context["sourceType"],
                context["title"],
                context["performedOn"],
                context["location"],
                context["publicNote"],
                context["adminNote"],
                context["createdAt"],
                context["updatedAt"],
            ),
        )
        self.connection.commit()
        return context

    def get_context(self, context_id: str) -> dict[str, Any]:
        row = self.connection.execute(
            """
            SELECT id, source_type, title, performed_on, location, public_note, admin_note,
                   created_at, updated_at
            FROM record_contexts
            WHERE id = ?
            """,
            (context_id,),
        ).fetchone()
        if row is None:
            raise NotFoundError("not_found")
        return self._row_to_context(row)

    def create_performance(self, payload: dict[str, Any]) -> dict[str, Any]:
        now = utcnow()
        performance = {
            "id": str(uuid4()),
            "contextId": payload["contextId"],
            "swimmerId": payload["swimmerId"],
            "eventId": payload["eventId"],
            "timeMs": int(payload["timeMs"]),
            "performedOn": payload.get("performedOn") or today(),
            "resultStatus": payload.get("resultStatus") or "valid",
            "publicNote": payload.get("publicNote", "").strip(),
            "adminNote": payload.get("adminNote", "").strip(),
            "createdAt": now,
            "updatedAt": now,
        }
        self._execute(
            """
            INSERT INTO performances (
              id, context_id, swimmer_id, event_id, time_ms, performed_on, result_status,
              public_note, admin_note, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                performance["id"],
                performance["contextId"],
                performance["swimmerId"],
                performance["eventId"],
                performance["timeMs"],
                performance["performedOn"],
                performance["resultStatus"],
                performance["publicNote"],
                performance["adminNote"],
                performance["createdAt"],
                performance["updatedAt"],
            ),
        )
        self.connection.commit()
        return performance

    def attach_context_tags(self, context_id: str, tags: list[str]) -> None:
        for tag_name in normalized_tags(tags):
            tag_id = self._find_or_create_tag(tag_name)
            self.connection.execute(
                """
                INSERT OR IGNORE INTO context_tags (context_id, tag_id)
                VALUES (?, ?)
                """,
                (context_id, tag_id),
            )
        self.connection.commit()

    def attach_performance_tags(self, performance_id: str, tags: list[str]) -> None:
        for tag_name in normalized_tags(tags):
            tag_id = self._find_or_create_tag(tag_name)
            self.connection.execute(
                """
                INSERT OR IGNORE INTO performance_tags (performance_id, tag_id)
                VALUES (?, ?)
                """,
                (performance_id, tag_id),
            )
        self.connection.commit()

    def create_goal(self, payload: dict[str, Any]) -> dict[str, Any]:
        now = utcnow()
        goal = {
            "id": str(uuid4()),
            "swimmerId": payload["swimmerId"],
            "eventId": payload["eventId"],
            "parentGoalId": payload.get("parentGoalId", "").strip(),
            "horizon": payload["horizon"],
            "title": payload["title"].strip(),
            "targetTimeMs": int(payload["targetTimeMs"]),
            "targetDate": payload["targetDate"],
            "baselineTimeMs": int(payload.get("baselineTimeMs") or 0),
            "status": payload.get("status") or "active",
            "isPublic": bool(payload.get("isPublic", True)),
            "publicNote": payload.get("publicNote", "").strip(),
            "adminNote": payload.get("adminNote", "").strip(),
            "achievedAt": payload.get("achievedAt", "").strip(),
            "createdAt": now,
            "updatedAt": now,
        }
        self._execute(
            """
            INSERT INTO goals (
              id, swimmer_id, event_id, parent_goal_id, horizon, title, target_time_ms,
              target_date, baseline_time_ms, status, is_public, public_note, admin_note,
              achieved_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                goal["id"],
                goal["swimmerId"],
                goal["eventId"],
                goal["parentGoalId"],
                goal["horizon"],
                goal["title"],
                goal["targetTimeMs"],
                goal["targetDate"],
                goal["baselineTimeMs"],
                goal["status"],
                int(goal["isPublic"]),
                goal["publicNote"],
                goal["adminNote"],
                goal["achievedAt"],
                goal["createdAt"],
                goal["updatedAt"],
            ),
        )
        self.connection.commit()
        return goal

    def list_goals(self, public_only: bool = False) -> list[dict[str, Any]]:
        query = """
        SELECT g.id, g.swimmer_id, g.event_id, g.parent_goal_id, g.horizon, g.title,
               g.target_time_ms, g.target_date, g.baseline_time_ms, g.status, g.is_public,
               g.public_note, g.admin_note, g.achieved_at, g.created_at, g.updated_at,
               s.id AS swimmer_ref_id, s.slug AS swimmer_slug, s.real_name, s.nickname,
               s.public_name_mode, s.is_public AS swimmer_is_public, s.avatar_url, s.birth_year,
               s.gender,
               s.team_id, s.notes,
               t.name AS team_name, t.sort_order AS team_sort_order,
               t.is_active AS team_is_active, t.created_at AS team_created_at,
               t.updated_at AS team_updated_at,
               e.id AS event_ref_id, e.pool_length_m, e.distance_m, e.stroke, e.effort_type,
               e.display_name, e.sort_order, e.is_active
        FROM goals g
        JOIN swimmers s ON s.id = g.swimmer_id
        JOIN teams t ON t.id = s.team_id
        JOIN events e ON e.id = g.event_id
        """
        params: list[Any] = []
        if public_only:
            query += " WHERE g.is_public = 1"
        query += " ORDER BY g.created_at DESC"
        rows = self.connection.execute(query, params).fetchall()
        return [self._row_to_goal(row, include_nested=True) for row in rows]

    def list_recent_performances(self, limit: int = 20) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            """
            SELECT p.id, p.context_id, p.swimmer_id, p.event_id, p.time_ms, p.performed_on,
                   p.result_status, p.public_note, p.admin_note, p.created_at, p.updated_at,
                   s.id AS swimmer_ref_id, s.slug AS swimmer_slug, s.real_name, s.nickname,
                   s.public_name_mode, s.is_public AS swimmer_is_public, s.avatar_url, s.birth_year,
                   s.gender,
                   s.team_id, s.notes,
                   t.name AS team_name, t.sort_order AS team_sort_order,
                   t.is_active AS team_is_active, t.created_at AS team_created_at,
                   t.updated_at AS team_updated_at,
                   e.id AS event_ref_id, e.pool_length_m, e.distance_m, e.stroke, e.effort_type,
                   e.display_name, e.sort_order, e.is_active
            FROM performances p
            JOIN swimmers s ON s.id = p.swimmer_id
            JOIN teams t ON t.id = s.team_id
            JOIN events e ON e.id = p.event_id
            ORDER BY p.performed_on DESC, p.created_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        performances = [self._row_to_performance(row, include_nested=True) for row in rows]
        for performance in performances:
            performance["tags"] = self.list_tags_for_performance(
                performance["id"],
                performance["contextId"],
            )
        return performances

    def create_standard(self, payload: dict[str, Any]) -> dict[str, Any]:
        standard = {
            "id": str(uuid4()),
            "tierGroup": (payload.get("tierGroup") or "").strip(),
            "name": (payload.get("name") or "").strip(),
            "tierOrder": int(payload.get("tierOrder") or 0),
            "colorHex": (payload.get("colorHex") or "#6b7280").strip() or "#6b7280",
            "createdAt": utcnow(),
        }
        if not standard["tierGroup"] or not standard["name"]:
            raise ValidationError("tier group and name are required")

        self._execute(
            """
            INSERT INTO time_standards (id, tier_group, name, tier_order, color_hex, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                standard["id"],
                standard["tierGroup"],
                standard["name"],
                standard["tierOrder"],
                standard["colorHex"],
                standard["createdAt"],
            ),
        )
        self.connection.commit()
        return self.get_standard(standard["id"])

    def list_standards(self) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            """
            SELECT id, tier_group, name, tier_order, color_hex, created_at
            FROM time_standards
            ORDER BY tier_group ASC, tier_order ASC, created_at ASC
            """
        ).fetchall()
        return [self._row_to_standard(row) for row in rows]

    def get_standard(self, standard_id: str) -> dict[str, Any]:
        row = self.connection.execute(
            """
            SELECT id, tier_group, name, tier_order, color_hex, created_at
            FROM time_standards
            WHERE id = ?
            """,
            (standard_id,),
        ).fetchone()
        if row is None:
            raise NotFoundError("not_found")
        return self._row_to_standard(row)

    def update_standard(self, standard_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        standard = self.get_standard(standard_id)
        updated = {
            **standard,
            "tierGroup": (payload.get("tierGroup", standard["tierGroup"]) or "").strip(),
            "name": (payload.get("name", standard["name"]) or "").strip(),
            "tierOrder": int(payload.get("tierOrder", standard["tierOrder"]) or 0),
            "colorHex": (payload.get("colorHex", standard["colorHex"]) or "#6b7280").strip()
            or "#6b7280",
        }
        if not updated["tierGroup"] or not updated["name"]:
            raise ValidationError("tier group and name are required")

        self._execute(
            """
            UPDATE time_standards
            SET tier_group = ?, name = ?, tier_order = ?, color_hex = ?
            WHERE id = ?
            """,
            (
                updated["tierGroup"],
                updated["name"],
                updated["tierOrder"],
                updated["colorHex"],
                standard_id,
            ),
        )
        self.connection.commit()
        return self.get_standard(standard_id)

    def delete_standard(self, standard_id: str) -> None:
        self.get_standard(standard_id)
        self.connection.execute("DELETE FROM time_standards WHERE id = ?", (standard_id,))
        self.connection.commit()

    def create_standard_entry(self, payload: dict[str, Any]) -> dict[str, Any]:
        standard = self.get_standard(str(payload.get("standardId") or ""))
        event = self._require_event(payload.get("eventId"))
        entry = {
            "id": str(uuid4()),
            "standardId": standard["id"],
            "eventId": event["id"],
            "gender": normalize_standard_gender(payload.get("gender")),
            "qualifyingTimeMs": int(payload.get("qualifyingTimeMs") or 0),
            "createdAt": utcnow(),
        }
        if entry["qualifyingTimeMs"] <= 0:
            raise ValidationError("qualifying time is required")

        self._execute(
            """
            INSERT INTO time_standard_entries (
              id, standard_id, event_id, gender, qualifying_time_ms, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                entry["id"],
                entry["standardId"],
                entry["eventId"],
                entry["gender"],
                entry["qualifyingTimeMs"],
                entry["createdAt"],
            ),
        )
        self.connection.commit()
        return self.get_standard_entry(entry["id"])

    def list_standard_entries(
        self,
        standard_id: str | None = None,
        event_id: str | None = None,
        gender: str | None = None,
    ) -> list[dict[str, Any]]:
        clauses: list[str] = []
        params: list[Any] = []
        if standard_id:
            clauses.append("e.standard_id = ?")
            params.append(standard_id)
        if event_id:
            clauses.append("e.event_id = ?")
            params.append(event_id)
        if gender:
            clauses.append("e.gender = ?")
            params.append(gender)

        query = """
        SELECT e.id, e.standard_id, e.event_id, e.gender, e.qualifying_time_ms, e.created_at,
               s.tier_group, s.name, s.tier_order, s.color_hex,
               ev.display_name
        FROM time_standard_entries e
        JOIN time_standards s ON s.id = e.standard_id
        JOIN events ev ON ev.id = e.event_id
        """
        if clauses:
            query += " WHERE " + " AND ".join(f"({clause})" for clause in clauses)
        query += " ORDER BY s.tier_group ASC, s.tier_order ASC, ev.display_name ASC, e.gender ASC"
        rows = self.connection.execute(query, params).fetchall()
        return [self._row_to_standard_entry(row) for row in rows]

    def get_standard_entry(self, entry_id: str) -> dict[str, Any]:
        entries = self.list_standard_entries()
        for entry in entries:
            if entry["id"] == entry_id:
                return entry
        raise NotFoundError("not_found")

    def update_standard_entry(self, entry_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        entry = self.get_standard_entry(entry_id)
        standard_id = str(payload.get("standardId", entry["standardId"]) or "")
        event_id = str(payload.get("eventId", entry["eventId"]) or "")
        self.get_standard(standard_id)
        self._require_event(event_id)
        updated = {
            **entry,
            "standardId": standard_id,
            "eventId": event_id,
            "gender": normalize_standard_gender(payload.get("gender", entry["gender"])),
            "qualifyingTimeMs": int(
                payload.get("qualifyingTimeMs", entry["qualifyingTimeMs"]) or 0
            ),
        }
        if updated["qualifyingTimeMs"] <= 0:
            raise ValidationError("qualifying time is required")

        self._execute(
            """
            UPDATE time_standard_entries
            SET standard_id = ?, event_id = ?, gender = ?, qualifying_time_ms = ?
            WHERE id = ?
            """,
            (
                updated["standardId"],
                updated["eventId"],
                updated["gender"],
                updated["qualifyingTimeMs"],
                entry_id,
            ),
        )
        self.connection.commit()
        return self.get_standard_entry(entry_id)

    def delete_standard_entry(self, entry_id: str) -> None:
        self.get_standard_entry(entry_id)
        self.connection.execute("DELETE FROM time_standard_entries WHERE id = ?", (entry_id,))
        self.connection.commit()

    def list_custom_standards_for_event(
        self,
        event_id: str,
        swimmer_gender: str,
    ) -> list[dict[str, Any]]:
        genders = ["all"] if swimmer_gender == "unknown" else [swimmer_gender, "all"]
        placeholders = ",".join("?" for _ in genders)
        rows = self.connection.execute(
            f"""
            SELECT e.id, e.standard_id, e.event_id, e.gender, e.qualifying_time_ms, e.created_at,
                   s.tier_group, s.name, s.tier_order, s.color_hex,
                   ev.display_name
            FROM time_standard_entries e
            JOIN time_standards s ON s.id = e.standard_id
            JOIN events ev ON ev.id = e.event_id
            WHERE e.event_id = ? AND e.gender IN ({placeholders})
            ORDER BY s.tier_group ASC, s.tier_order ASC, e.created_at ASC
            """,
            [event_id, *genders],
        ).fetchall()

        preferred: dict[str, dict[str, Any]] = {}
        for row in rows:
            entry = self._row_to_standard_entry(row)
            existing = preferred.get(entry["standardId"])
            if existing is None:
                preferred[entry["standardId"]] = entry
                continue
            if existing["gender"] == "all" and entry["gender"] == swimmer_gender:
                preferred[entry["standardId"]] = entry

        return sorted(
            preferred.values(),
            key=lambda item: (item["tierGroup"], item["tierOrder"], item["name"]),
        )

    def get_next_custom_standard(
        self,
        time_ms: int,
        event_id: str,
        swimmer_gender: str,
    ) -> dict[str, Any] | None:
        for standard in self.list_custom_standards_for_event(event_id, swimmer_gender):
            if time_ms > standard["qualifyingTimeMs"]:
                return {
                    **standard,
                    "gapMs": time_ms - standard["qualifyingTimeMs"],
                }
        return None

    def best_time_ms(self, swimmer_id: str, event_id: str) -> int:
        row = self.connection.execute(
            """
            SELECT MIN(time_ms) AS best_time_ms
            FROM performances
            WHERE swimmer_id = ? AND event_id = ? AND result_status = 'valid'
            """,
            (swimmer_id, event_id),
        ).fetchone()
        return int(row["best_time_ms"] or 0)

    def strongest_event_id(self, swimmer_id: str) -> str:
        row = self.connection.execute(
            """
            SELECT event_id, MIN(time_ms) AS best_time_ms
            FROM performances
            WHERE swimmer_id = ? AND result_status = 'valid'
            GROUP BY event_id
            ORDER BY best_time_ms ASC
            LIMIT 1
            """,
            (swimmer_id,),
        ).fetchone()
        return row["event_id"] if row is not None else ""

    def list_events_for_swimmer(self, swimmer_id: str) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            """
            SELECT DISTINCT e.id, e.pool_length_m, e.distance_m, e.stroke, e.effort_type,
                   e.display_name, e.sort_order, e.is_active, e.created_at, e.updated_at
            FROM events e
            JOIN performances p ON p.event_id = e.id
            WHERE p.swimmer_id = ?
            ORDER BY e.sort_order ASC, e.created_at ASC
            """,
            (swimmer_id,),
        ).fetchall()
        return [self._row_to_event(row) for row in rows]

    def list_performances_for_swimmer_event(
        self, swimmer_id: str, event_id: str
    ) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            """
            SELECT p.id, p.context_id, p.swimmer_id, p.event_id, p.time_ms, p.performed_on,
                   p.result_status, p.public_note, p.admin_note, p.created_at, p.updated_at,
                   rc.source_type
            FROM performances p
            JOIN record_contexts rc ON rc.id = p.context_id
            WHERE p.swimmer_id = ? AND p.event_id = ?
            ORDER BY p.performed_on ASC, p.created_at ASC
            """,
            (swimmer_id, event_id),
        ).fetchall()
        return [self._row_to_performance_with_source(row) for row in rows]

    def list_performances_for_event_and_swimmers(
        self, event_id: str, swimmer_ids: list[str]
    ) -> list[dict[str, Any]]:
        if not swimmer_ids:
            return []
        placeholders = ",".join("?" for _ in swimmer_ids)
        rows = self.connection.execute(
            f"""
            SELECT id, context_id, swimmer_id, event_id, time_ms, performed_on, result_status,
                   public_note, admin_note, created_at, updated_at
            FROM performances
            WHERE event_id = ? AND swimmer_id IN ({placeholders})
            ORDER BY performed_on ASC, created_at ASC
            """,
            [event_id, *swimmer_ids],
        ).fetchall()
        return [self._row_to_performance(row) for row in rows]

    def _unique_slug(self, base: str) -> str:
        candidate = base or str(uuid4())[:8]
        index = 1
        while (
            self.connection.execute(
                "SELECT 1 FROM swimmers WHERE slug = ?",
                (candidate,),
            ).fetchone()
            is not None
        ):
            candidate = f"{base}-{index}"
            index += 1
        return candidate

    def _find_or_create_tag(self, tag_name: str) -> str:
        existing = self.connection.execute(
            "SELECT id FROM tags WHERE name = ?",
            (tag_name,),
        ).fetchone()
        if existing is not None:
            return existing["id"]

        tag_id = str(uuid4())
        self.connection.execute(
            """
            INSERT INTO tags (id, name, color, created_at)
            VALUES (?, ?, '', ?)
            """,
            (tag_id, tag_name, utcnow()),
        )
        return tag_id

    def list_tags_for_performance(self, performance_id: str, context_id: str) -> list[str]:
        rows = self.connection.execute(
            """
            SELECT DISTINCT t.name
            FROM tags t
            LEFT JOIN performance_tags pt ON pt.tag_id = t.id
            LEFT JOIN context_tags ct ON ct.tag_id = t.id
            WHERE pt.performance_id = ? OR ct.context_id = ?
            ORDER BY t.name ASC
            """,
            (performance_id, context_id),
        ).fetchall()
        return [row["name"] for row in rows]

    def _execute(self, query: str, params: tuple[Any, ...]) -> None:
        try:
            self.connection.execute(query, params)
        except sqlite3.IntegrityError as exc:
            raise ConflictError("conflict") from exc

    def _require_team(self, team_id: Any, allow_inactive: bool = False) -> dict[str, Any]:
        normalized_team_id = str(team_id or "").strip()
        if not normalized_team_id:
            raise ValidationError("team is required")
        try:
            team = self.get_team(normalized_team_id)
        except NotFoundError as exc:
            raise ValidationError("team not found") from exc
        if not allow_inactive and not team["isActive"]:
            raise ValidationError("team is inactive")
        return team

    def _require_event(self, event_id: Any) -> dict[str, Any]:
        normalized_event_id = str(event_id or "").strip()
        if not normalized_event_id:
            raise ValidationError("event is required")
        try:
            return self.get_event(normalized_event_id)
        except NotFoundError as exc:
            raise ValidationError("event not found") from exc

    def _list_swimmers(
        self,
        where_clauses: list[str] | None = None,
        params: list[Any] | None = None,
    ) -> list[dict[str, Any]]:
        query = """
        SELECT s.id, s.slug, s.real_name, s.nickname, s.public_name_mode, s.is_public,
               s.avatar_url, s.birth_year, s.gender, s.team_id, s.notes, s.created_at, s.updated_at,
               t.name AS team_name, t.sort_order AS team_sort_order,
               t.is_active AS team_is_active, t.created_at AS team_created_at,
               t.updated_at AS team_updated_at
        FROM swimmers s
        JOIN teams t ON t.id = s.team_id
        """
        if where_clauses:
            query += " WHERE " + " AND ".join(f"({clause})" for clause in where_clauses)
        query += " ORDER BY t.sort_order ASC, t.created_at ASC, s.created_at ASC"
        rows = self.connection.execute(query, params or []).fetchall()
        return [self._row_to_swimmer(row) for row in rows]

    def _row_to_team(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["id"],
            "name": row["name"],
            "sortOrder": row["sort_order"],
            "isActive": bool(row["is_active"]),
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }

    def _team_from_swimmer_row(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["team_id"],
            "name": row["team_name"],
            "sortOrder": row["team_sort_order"],
            "isActive": bool(row["team_is_active"]),
            "createdAt": row["team_created_at"],
            "updatedAt": row["team_updated_at"],
        }

    def _row_to_swimmer(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["id"],
            "slug": row["slug"],
            "realName": row["real_name"],
            "nickname": row["nickname"],
            "publicNameMode": row["public_name_mode"],
            "isPublic": bool(row["is_public"]),
            "avatarUrl": row["avatar_url"],
            "birthYear": row["birth_year"],
            "gender": row["gender"],
            "teamId": row["team_id"],
            "team": self._team_from_swimmer_row(row),
            "notes": row["notes"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }

    def _row_to_event(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["id"],
            "poolLengthM": row["pool_length_m"],
            "distanceM": row["distance_m"],
            "stroke": row["stroke"],
            "effortType": row["effort_type"],
            "displayName": build_event_display_name(
                row["pool_length_m"],
                row["distance_m"],
                row["stroke"],
            ),
            "sortOrder": row["sort_order"],
            "isActive": bool(row["is_active"]),
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }

    def _row_to_standard(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["id"],
            "tierGroup": row["tier_group"],
            "name": row["name"],
            "tierOrder": row["tier_order"],
            "colorHex": row["color_hex"],
            "createdAt": row["created_at"],
        }

    def _row_to_standard_entry(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["id"],
            "standardId": row["standard_id"],
            "eventId": row["event_id"],
            "gender": row["gender"],
            "qualifyingTimeMs": row["qualifying_time_ms"],
            "createdAt": row["created_at"],
            "tierGroup": row["tier_group"],
            "name": row["name"],
            "tierOrder": row["tier_order"],
            "colorHex": row["color_hex"],
            "eventDisplayName": row["display_name"],
        }

    def _row_to_context(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["id"],
            "sourceType": row["source_type"],
            "title": row["title"],
            "performedOn": row["performed_on"],
            "location": row["location"],
            "publicNote": row["public_note"],
            "adminNote": row["admin_note"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }

    def _row_to_performance(
        self, row: sqlite3.Row, include_nested: bool = False
    ) -> dict[str, Any]:
        performance = {
            "id": row["id"],
            "contextId": row["context_id"],
            "swimmerId": row["swimmer_id"],
            "eventId": row["event_id"],
            "timeMs": row["time_ms"],
            "performedOn": row["performed_on"],
            "resultStatus": row["result_status"],
            "publicNote": row["public_note"],
            "adminNote": row["admin_note"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
        if include_nested:
            performance["swimmer"] = {
                "id": row["swimmer_ref_id"],
                "slug": row["swimmer_slug"],
                "realName": row["real_name"],
                "nickname": row["nickname"],
                "publicNameMode": row["public_name_mode"],
                "isPublic": bool(row["swimmer_is_public"]),
                "avatarUrl": row["avatar_url"],
                "birthYear": row["birth_year"],
                "gender": row["gender"],
                "teamId": row["team_id"],
                "team": self._team_from_swimmer_row(row),
                "notes": row["notes"],
            }
            performance["event"] = {
                "id": row["event_ref_id"],
                "poolLengthM": row["pool_length_m"],
                "distanceM": row["distance_m"],
                "stroke": row["stroke"],
                "effortType": row["effort_type"],
                "displayName": row["display_name"],
                "sortOrder": row["sort_order"],
                "isActive": bool(row["is_active"]),
            }
        return performance

    def _row_to_performance_with_source(self, row: sqlite3.Row) -> dict[str, Any]:
        performance = self._row_to_performance(row)
        performance["sourceType"] = row["source_type"]
        return performance

    def _row_to_goal(self, row: sqlite3.Row, include_nested: bool = False) -> dict[str, Any]:
        goal = {
            "id": row["id"],
            "swimmerId": row["swimmer_id"],
            "eventId": row["event_id"],
            "parentGoalId": row["parent_goal_id"],
            "horizon": row["horizon"],
            "title": row["title"],
            "targetTimeMs": row["target_time_ms"],
            "targetDate": row["target_date"],
            "baselineTimeMs": row["baseline_time_ms"],
            "status": row["status"],
            "isPublic": bool(row["is_public"]),
            "publicNote": row["public_note"],
            "adminNote": row["admin_note"],
            "achievedAt": row["achieved_at"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
        if include_nested:
            goal["swimmer"] = {
                "id": row["swimmer_ref_id"],
                "slug": row["swimmer_slug"],
                "realName": row["real_name"],
                "nickname": row["nickname"],
                "publicNameMode": row["public_name_mode"],
                "isPublic": bool(row["swimmer_is_public"]),
                "avatarUrl": row["avatar_url"],
                "birthYear": row["birth_year"],
                "gender": row["gender"],
                "teamId": row["team_id"],
                "team": self._team_from_swimmer_row(row),
                "notes": row["notes"],
            }
            goal["event"] = {
                "id": row["event_ref_id"],
                "poolLengthM": row["pool_length_m"],
                "distanceM": row["distance_m"],
                "stroke": row["stroke"],
                "effortType": row["effort_type"],
                "displayName": row["display_name"],
                "sortOrder": row["sort_order"],
                "isActive": bool(row["is_active"]),
            }
        return goal


def slugify(value: str) -> str:
    normalized = value.strip().lower()
    normalized = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "-", normalized)
    normalized = normalized.strip("-")
    if not normalized:
        return "swimmer"
    return normalized


def today() -> str:
    return datetime.now(UTC).date().isoformat()


def utcnow() -> str:
    return datetime.now(UTC).isoformat()


def normalized_tags(tags: list[str]) -> list[str]:
    unique_tags = []
    seen: set[str] = set()
    for raw_tag in tags:
        tag = raw_tag.strip()
        if not tag or tag in seen:
            continue
        seen.add(tag)
        unique_tags.append(tag)
    return unique_tags


def normalize_gender(value: Any) -> str:
    gender = str(value or "unknown").strip().lower()
    if gender not in {"male", "female", "unknown"}:
        raise ValidationError("invalid gender")
    return gender


def normalize_standard_gender(value: Any) -> str:
    gender = str(value or "all").strip().lower()
    if gender not in {"male", "female", "all"}:
        raise ValidationError("invalid standard gender")
    return gender
