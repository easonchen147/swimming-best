from __future__ import annotations

import sqlite3
from pathlib import Path
from uuid import uuid4

from flask import Flask, current_app, g

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS swimmers (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  real_name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  public_name_mode TEXT NOT NULL,
  is_public INTEGER NOT NULL,
  avatar_url TEXT NOT NULL DEFAULT '',
  birth_year INTEGER NOT NULL DEFAULT 0,
  gender TEXT NOT NULL DEFAULT 'unknown',
  team_id TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  pool_length_m INTEGER NOT NULL,
  distance_m INTEGER NOT NULL,
  stroke TEXT NOT NULL,
  effort_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(pool_length_m, distance_m, stroke, effort_type)
);

CREATE TABLE IF NOT EXISTS record_contexts (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  performed_on TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  public_note TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS performances (
  id TEXT PRIMARY KEY,
  context_id TEXT NOT NULL,
  swimmer_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  time_ms INTEGER NOT NULL,
  performed_on TEXT NOT NULL,
  result_status TEXT NOT NULL,
  public_note TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (context_id) REFERENCES record_contexts(id) ON DELETE CASCADE,
  FOREIGN KEY (swimmer_id) REFERENCES swimmers(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  swimmer_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  parent_goal_id TEXT NOT NULL DEFAULT '',
  horizon TEXT NOT NULL,
  title TEXT NOT NULL,
  target_time_ms INTEGER NOT NULL,
  target_date TEXT NOT NULL,
  baseline_time_ms INTEGER NOT NULL,
  status TEXT NOT NULL,
  is_public INTEGER NOT NULL,
  public_note TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '',
  achieved_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (swimmer_id) REFERENCES swimmers(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS time_standards (
  id TEXT PRIMARY KEY,
  tier_group TEXT NOT NULL,
  name TEXT NOT NULL,
  tier_order INTEGER NOT NULL,
  color_hex TEXT NOT NULL DEFAULT '#6b7280',
  created_at TEXT NOT NULL,
  UNIQUE (tier_group, name)
);

CREATE TABLE IF NOT EXISTS time_standard_entries (
  id TEXT PRIMARY KEY,
  standard_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'all',
  qualifying_time_ms INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (standard_id) REFERENCES time_standards(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE (standard_id, event_id, gender)
);

CREATE TABLE IF NOT EXISTS context_tags (
  context_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (context_id, tag_id),
  FOREIGN KEY (context_id) REFERENCES record_contexts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS performance_tags (
  performance_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (performance_id, tag_id),
  FOREIGN KEY (performance_id) REFERENCES performances(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_performances_swimmer_event_date
  ON performances (swimmer_id, event_id, performed_on);

CREATE INDEX IF NOT EXISTS idx_goals_swimmer_event_date
  ON goals (swimmer_id, event_id, target_date);

CREATE INDEX IF NOT EXISTS idx_time_standard_entries_lookup
  ON time_standard_entries (event_id, gender, qualifying_time_ms);

"""


def connect_database(path: str) -> sqlite3.Connection:
    database_path = Path(path)
    database_path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON;")
    connection.execute("PRAGMA journal_mode = WAL;")
    return connection


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = connect_database(current_app.config["DATABASE_PATH"])
    return g.db


def init_db(connection: sqlite3.Connection) -> None:
    connection.executescript(SCHEMA_SQL)
    migrate_legacy_team_model(connection)
    migrate_swimmer_gender(connection)
    connection.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_swimmers_team_id
        ON swimmers (team_id)
        """
    )
    connection.commit()


def close_db(_: object | None = None) -> None:
    connection = g.pop("db", None)
    if connection is not None:
        connection.close()


def init_app(app: Flask) -> None:
    app.teardown_appcontext(close_db)


def migrate_legacy_team_model(connection: sqlite3.Connection) -> None:
    swimmer_columns = {row["name"] for row in connection.execute("PRAGMA table_info(swimmers)")}
    if "team_name" not in swimmer_columns:
        if "team_id" in swimmer_columns:
            validate_managed_team_integrity(connection)
            return
        raise RuntimeError("swimmers table is missing both team_id and team_name")

    has_team_id = "team_id" in swimmer_columns
    team_id_select = ", team_id" if has_team_id else ""
    legacy_rows = connection.execute(
        f"""
        SELECT id, slug, real_name, nickname, public_name_mode, is_public, avatar_url,
               birth_year, team_name, notes, created_at, updated_at{team_id_select}
        FROM swimmers
        ORDER BY created_at ASC
        """
    ).fetchall()

    foreign_keys_enabled = bool(connection.execute("PRAGMA foreign_keys").fetchone()[0])
    if foreign_keys_enabled:
        connection.execute("PRAGMA foreign_keys = OFF")

    try:
        connection.execute("BEGIN")
        team_assignments = build_team_assignments(connection, legacy_rows, has_team_id=has_team_id)
        connection.execute("DROP TABLE IF EXISTS swimmers_managed")
        connection.execute(
            """
            CREATE TABLE swimmers_managed (
              id TEXT PRIMARY KEY,
              slug TEXT NOT NULL UNIQUE,
              real_name TEXT NOT NULL,
              nickname TEXT NOT NULL,
              public_name_mode TEXT NOT NULL,
              is_public INTEGER NOT NULL,
              avatar_url TEXT NOT NULL DEFAULT '',
              birth_year INTEGER NOT NULL DEFAULT 0,
              gender TEXT NOT NULL DEFAULT 'unknown',
              team_id TEXT NOT NULL,
              notes TEXT NOT NULL DEFAULT '',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE RESTRICT
            )
            """
        )

        for row in legacy_rows:
            connection.execute(
                """
                INSERT INTO swimmers_managed (
                  id, slug, real_name, nickname, public_name_mode, is_public,
                  avatar_url, birth_year, gender, team_id, notes, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    row["id"],
                    row["slug"],
                    row["real_name"],
                    row["nickname"],
                    row["public_name_mode"],
                    row["is_public"],
                    row["avatar_url"],
                    row["birth_year"],
                    "unknown",
                    team_assignments[row["id"]],
                    row["notes"],
                    row["created_at"],
                    row["updated_at"],
                ),
            )

        connection.execute("DROP TABLE swimmers")
        connection.execute("ALTER TABLE swimmers_managed RENAME TO swimmers")
        connection.commit()
    except Exception:
        connection.rollback()
        connection.execute("DROP TABLE IF EXISTS swimmers_managed")
        raise
    finally:
        if foreign_keys_enabled:
            connection.execute("PRAGMA foreign_keys = ON")

    foreign_key_issues = connection.execute("PRAGMA foreign_key_check").fetchall()
    if foreign_key_issues:
        raise RuntimeError(f"managed team migration foreign key check failed: {foreign_key_issues}")

    validate_managed_team_integrity(connection)


def build_team_assignments(
    connection: sqlite3.Connection,
    legacy_rows: list[sqlite3.Row],
    *,
    has_team_id: bool,
) -> dict[str, str]:
    assignments: dict[str, str] = {}
    existing_team_ids = {
        row["id"]
        for row in connection.execute("SELECT id FROM teams").fetchall()
    }
    team_name_cache: dict[str, str] = {}
    current_max_sort = connection.execute(
        "SELECT COALESCE(MAX(sort_order), 0) AS max_sort_order FROM teams"
    ).fetchone()["max_sort_order"]
    next_sort_order = int(current_max_sort) + 1

    for row in legacy_rows:
        existing_team_id = str(row["team_id"] or "").strip() if has_team_id else ""
        if existing_team_id and existing_team_id in existing_team_ids:
            assignments[row["id"]] = existing_team_id
            continue

        raw_name = (row["team_name"] or "").strip() or "未分组"
        if raw_name not in team_name_cache:
            existing = connection.execute(
                "SELECT id FROM teams WHERE name = ?",
                (raw_name,),
            ).fetchone()
            if existing is None:
                team_id = str(uuid4())
                connection.execute(
                    """
                    INSERT INTO teams (id, name, sort_order, is_active, created_at, updated_at)
                    VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    """,
                    (team_id, raw_name, next_sort_order),
                )
                team_name_cache[raw_name] = team_id
                existing_team_ids.add(team_id)
                next_sort_order += 1
            else:
                team_name_cache[raw_name] = existing["id"]
                existing_team_ids.add(existing["id"])
        assignments[row["id"]] = team_name_cache[raw_name]

    return assignments


def validate_managed_team_integrity(connection: sqlite3.Connection) -> None:
    missing_team_ids = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM swimmers
        WHERE team_id IS NULL OR TRIM(team_id) = ''
        """
    ).fetchone()["count"]
    if missing_team_ids:
        raise RuntimeError("managed team migration left swimmers without team_id")

    orphaned_teams = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM swimmers s
        LEFT JOIN teams t ON t.id = s.team_id
        WHERE t.id IS NULL
        """
    ).fetchone()["count"]
    if orphaned_teams:
        raise RuntimeError("managed team migration left swimmers with orphaned team references")


def migrate_swimmer_gender(connection: sqlite3.Connection) -> None:
    swimmer_columns = {row["name"] for row in connection.execute("PRAGMA table_info(swimmers)")}
    if "gender" in swimmer_columns:
        return

    connection.execute(
        """
        ALTER TABLE swimmers
        ADD COLUMN gender TEXT NOT NULL DEFAULT 'unknown'
        """
    )
    connection.execute(
        """
        UPDATE swimmers
        SET gender = 'unknown'
        WHERE gender IS NULL OR TRIM(gender) = ''
        """
    )
    connection.commit()
