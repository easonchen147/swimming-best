from __future__ import annotations

from pathlib import Path

from swimming_best.db import connect_database, init_db
from swimming_best.repository import Repository


def test_init_db_migrates_legacy_team_name_schema(tmp_path: Path):
    connection = connect_database(str(tmp_path / "legacy.db"))
    connection.executescript(
        """
        CREATE TABLE swimmers (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          real_name TEXT NOT NULL,
          nickname TEXT NOT NULL,
          public_name_mode TEXT NOT NULL,
          is_public INTEGER NOT NULL,
          avatar_url TEXT NOT NULL DEFAULT '',
          birth_year INTEGER NOT NULL DEFAULT 0,
          team_name TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        INSERT INTO swimmers (
          id, slug, real_name, nickname, public_name_mode, is_public,
          avatar_url, birth_year, team_name, notes, created_at, updated_at
        ) VALUES (
          'swimmer-1', 'alice', 'Alice Wang', '小海豚', 'nickname', 1,
          '', 2016, '海豚预备队', '', '2026-04-01T00:00:00+00:00', '2026-04-01T00:00:00+00:00'
        );
        """
    )
    connection.commit()

    init_db(connection)

    swimmer_columns = {
        row["name"] for row in connection.execute("PRAGMA table_info(swimmers)").fetchall()
    }
    assert "team_id" in swimmer_columns
    assert "team_name" not in swimmer_columns
    assert "birth_date" in swimmer_columns

    repository = Repository(connection)
    teams = repository.list_teams()
    assert len(teams) == 1
    assert teams[0]["name"] == "海豚预备队"

    swimmers = repository.list_swimmers()
    assert swimmers[0]["teamId"] == teams[0]["id"]
    assert swimmers[0]["team"]["name"] == "海豚预备队"
    assert swimmers[0]["birthYear"] == 2016
    assert swimmers[0]["birthDate"] == ""
