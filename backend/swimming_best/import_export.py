from __future__ import annotations

import csv
from collections import defaultdict
from datetime import date
from decimal import Decimal
from io import StringIO
from typing import Any
from uuid import uuid4

from swimming_best.repository import Repository, today, utcnow

SOURCE_TYPES = {"training", "test", "competition", "single"}


def parse_csv(file_storage: Any) -> list[dict[str, str]]:
    raw_bytes = file_storage.read()
    try:
      text = raw_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
      text = raw_bytes.decode("gbk")

    reader = csv.DictReader(StringIO(text))
    rows: list[dict[str, str]] = []
    for row in reader:
      normalized = {key: (value or "").strip() for key, value in row.items()}
      if any(normalized.values()):
        rows.append(normalized)
    return rows


def generate_template() -> str:
    return "\n".join(
        [
            "swimmer_slug,event_display,performed_on,time_seconds,source_type,tags",
            "alice,50m 自由泳 短池,2026-04-01,25.90,competition,达标赛;春季",
            "bob,100m 蛙泳 长池,2026-04-01,78.45,training,",
        ]
    )


def validate_import_rows(rows: list[dict[str, str]], repo: Repository) -> dict[str, Any]:
    valid_rows = []
    error_rows = []

    for line, row in enumerate(rows, start=1):
        errors = []
        swimmer = repo.connection.execute(
            "SELECT id, slug FROM swimmers WHERE slug = ?",
            (row.get("swimmer_slug", ""),),
        ).fetchone()
        if swimmer is None:
            errors.append(f"选手不存在: {row.get('swimmer_slug', '')}")

        event = repo.connection.execute(
            "SELECT id, display_name FROM events WHERE display_name = ?",
            (row.get("event_display", ""),),
        ).fetchone()
        if event is None:
            errors.append(f"项目不存在: {row.get('event_display', '')}")

        performed_on = row.get("performed_on", "")
        try:
            parsed_date = date.fromisoformat(performed_on)
            if parsed_date > date.fromisoformat(today()):
                errors.append("日期不能晚于今天")
        except ValueError:
            errors.append(f"日期非法: {performed_on}")

        time_seconds_text = row.get("time_seconds", "")
        try:
            time_seconds = Decimal(time_seconds_text)
            if time_seconds <= 0:
                errors.append("成绩必须大于 0")
        except Exception:
            errors.append(f"成绩非法: {time_seconds_text}")
            time_seconds = Decimal(0)

        source_type = row.get("source_type", "") or "single"
        if source_type not in SOURCE_TYPES:
            errors.append(f"来源类型非法: {source_type}")

        tags = [item.strip() for item in row.get("tags", "").split(";") if item.strip()]

        if errors:
            error_rows.append({"line": line, "raw": row, "errors": errors})
            continue

        valid_rows.append(
            {
                "line": line,
                "swimmerId": swimmer["id"],
                "swimmerSlug": swimmer["slug"],
                "eventId": event["id"],
                "eventDisplay": event["display_name"],
                "performedOn": performed_on,
                "timeSeconds": float(time_seconds),
                "timeMs": int(time_seconds * Decimal(1000)),
                "sourceType": source_type,
                "tags": tags,
            }
        )

    return {
        "validRows": valid_rows,
        "errorRows": error_rows,
        "summary": {
            "total": len(rows),
            "valid": len(valid_rows),
            "errors": len(error_rows),
        },
    }


def execute_import(rows: list[dict[str, Any]], repo: Repository) -> dict[str, int]:
    connection = repo.connection
    contexts: dict[tuple[str, str], str] = {}
    contexts_created = 0
    performances_created = 0
    existing_tags = {
        row["name"] for row in connection.execute("SELECT name FROM tags").fetchall()
    }

    try:
        connection.execute("BEGIN")
        for row in rows:
            key = (row["sourceType"], row["performedOn"])
            if key not in contexts:
                context_id = str(uuid4())
                contexts[key] = context_id
                connection.execute(
                    """
                    INSERT INTO record_contexts (
                      id, source_type, title, performed_on, location, public_note, admin_note,
                      created_at, updated_at
                    ) VALUES (?, ?, ?, ?, '', '', '', ?, ?)
                    """,
                    (
                        context_id,
                        row["sourceType"],
                        f"批量导入 - {row['performedOn']}",
                        row["performedOn"],
                        utcnow(),
                        utcnow(),
                    ),
                )
                contexts_created += 1

            performance_id = str(uuid4())
            connection.execute(
                """
                INSERT INTO performances (
                  id, context_id, swimmer_id, event_id, time_ms, performed_on, result_status,
                  public_note, admin_note, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'valid', '', '', ?, ?)
                """,
                (
                    performance_id,
                    contexts[key],
                    row["swimmerId"],
                    row["eventId"],
                    int(row["timeMs"]),
                    row["performedOn"],
                    utcnow(),
                    utcnow(),
                ),
            )
            performances_created += 1

            for tag_name in row.get("tags", []):
                tag_id = repo._find_or_create_tag(tag_name)  # noqa: SLF001
                connection.execute(
                    """
                    INSERT OR IGNORE INTO performance_tags (performance_id, tag_id)
                    VALUES (?, ?)
                    """,
                    (performance_id, tag_id),
                )

        connection.commit()
    except Exception:
        connection.rollback()
        raise

    current_tags = {
        row["name"] for row in connection.execute("SELECT name FROM tags").fetchall()
    }
    return {
        "imported": len(rows),
        "contextsCreated": contexts_created,
        "performancesCreated": performances_created,
        "tagsCreated": len(current_tags - existing_tags),
    }


def export_swimmer_csv(swimmer_id: str, repo: Repository) -> str:
    rows = repo.connection.execute(
        """
        SELECT p.id, p.context_id, p.event_id, p.time_ms, p.performed_on, p.result_status,
               e.display_name, rc.source_type
        FROM performances p
        JOIN events e ON e.id = p.event_id
        JOIN record_contexts rc ON rc.id = p.context_id
        WHERE p.swimmer_id = ?
        ORDER BY p.performed_on ASC, p.created_at ASC
        """,
        (swimmer_id,),
    ).fetchall()

    output = StringIO()
    writer = csv.writer(output, lineterminator="\n")
    writer.writerow(["项目", "日期", "成绩(秒)", "来源类型", "状态", "标签"])
    for row in rows:
        writer.writerow(
            [
                row["display_name"],
                row["performed_on"],
                f"{Decimal(row['time_ms']) / Decimal(1000):.3f}",
                row["source_type"],
                row["result_status"],
                ";".join(repo.list_tags_for_performance(row["id"], row["context_id"])),
            ]
        )
    return output.getvalue()


def export_team_csv(team_id: str, repo: Repository) -> str:
    rows = repo.connection.execute(
        """
        SELECT p.id, p.context_id, p.swimmer_id, p.event_id,
               p.time_ms, p.performed_on, p.result_status,
               s.slug, s.nickname, e.display_name, rc.source_type
        FROM performances p
        JOIN swimmers s ON s.id = p.swimmer_id
        JOIN events e ON e.id = p.event_id
        JOIN record_contexts rc ON rc.id = p.context_id
        WHERE s.team_id = ?
        ORDER BY s.slug ASC, e.display_name ASC, p.performed_on ASC, p.created_at ASC
        """,
        (team_id,),
    ).fetchall()

    best_times: dict[tuple[str, str], int] = defaultdict(int)
    for row in rows:
        if row["result_status"] != "valid":
            continue
        key = (row["swimmer_id"], row["event_id"])
        current = best_times.get(key)
        if current in (None, 0) or row["time_ms"] < current:
            best_times[key] = row["time_ms"]

    output = StringIO()
    writer = csv.writer(output, lineterminator="\n")
    writer.writerow(
        ["选手slug", "选手昵称", "项目", "日期", "成绩(秒)", "来源类型", "状态", "是否PB"]
    )
    for row in rows:
        key = (row["swimmer_id"], row["event_id"])
        writer.writerow(
            [
                row["slug"],
                row["nickname"],
                row["display_name"],
                row["performed_on"],
                f"{Decimal(row['time_ms']) / Decimal(1000):.3f}",
                row["source_type"],
                row["result_status"],
                (
                    "是"
                    if row["result_status"] == "valid"
                    and row["time_ms"] == best_times[key]
                    else ""
                ),
            ]
        )
    return output.getvalue()
