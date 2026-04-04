from __future__ import annotations

from pathlib import Path

from swimming_best.db import connect_database, init_db
from swimming_best.repository import Repository


def test_init_db_backfills_unknown_gender_for_legacy_swimmers(tmp_path: Path):
    connection = connect_database(str(tmp_path / "legacy-gender.db"))
    connection.executescript(
        """
        CREATE TABLE teams (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE swimmers (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          real_name TEXT NOT NULL,
          nickname TEXT NOT NULL,
          public_name_mode TEXT NOT NULL,
          is_public INTEGER NOT NULL,
          avatar_url TEXT NOT NULL DEFAULT '',
          birth_year INTEGER NOT NULL DEFAULT 0,
          team_id TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE RESTRICT
        );

        INSERT INTO teams (
          id, name, sort_order, is_active, created_at, updated_at
        ) VALUES (
          'team-1', 'Alpha Dolphins', 1, 1,
          '2026-04-01T00:00:00+00:00', '2026-04-01T00:00:00+00:00'
        );

        INSERT INTO swimmers (
          id, slug, real_name, nickname, public_name_mode, is_public, avatar_url,
          birth_year, team_id, notes, created_at, updated_at
        ) VALUES (
          'swimmer-1', 'alice', 'Alice Wang', 'Little Dolphin', 'nickname', 1, '',
          2016, 'team-1', '', '2026-04-01T00:00:00+00:00',
          '2026-04-01T00:00:00+00:00'
        );
        """
    )
    connection.commit()

    init_db(connection)

    swimmer_columns = {
        row["name"] for row in connection.execute("PRAGMA table_info(swimmers)").fetchall()
    }
    assert "gender" in swimmer_columns

    repository = Repository(connection)
    swimmer = repository.list_swimmers()[0]
    assert swimmer["gender"] == "unknown"


def test_admin_swimmer_api_persists_gender(admin_client):
    team = admin_client.post(
        "/api/admin/teams",
        json={"name": "Gender Test Team", "sortOrder": 1, "isActive": True},
    ).get_json()

    create_response = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Alice Wang",
            "nickname": "Little Dolphin",
            "publicNameMode": "nickname",
            "isPublic": True,
            "teamId": team["id"],
            "gender": "male",
        },
    )
    assert create_response.status_code == 201
    swimmer = create_response.get_json()
    assert swimmer["gender"] == "male"

    update_response = admin_client.patch(
        f"/api/admin/swimmers/{swimmer['id']}",
        json={
            "realName": swimmer["realName"],
            "nickname": swimmer["nickname"],
            "publicNameMode": swimmer["publicNameMode"],
            "isPublic": swimmer["isPublic"],
            "teamId": swimmer["teamId"],
            "gender": "female",
        },
    )
    assert update_response.status_code == 200
    assert update_response.get_json()["gender"] == "female"


def test_public_analytics_returns_official_grade_for_supported_event(admin_client):
    team = admin_client.post(
        "/api/admin/teams",
        json={"name": "Official Grade Team", "sortOrder": 1, "isActive": True},
    ).get_json()
    swimmer = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Alice Wang",
            "nickname": "Little Dolphin",
            "publicNameMode": "nickname",
            "isPublic": True,
            "teamId": team["id"],
            "gender": "male",
        },
    ).get_json()
    event = admin_client.post(
        "/api/admin/events",
        json={
            "poolLengthM": 25,
            "distanceM": 50,
            "stroke": "freestyle",
            "effortType": "race",
            "displayName": "50m Freestyle Short Course",
        },
    ).get_json()
    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer["id"],
            "eventId": event["id"],
            "timeMs": 25900,
            "sourceType": "competition",
            "performedOn": "2026-04-01",
        },
    )

    analytics_response = admin_client.get(
        f"/api/public/swimmers/{swimmer['slug']}/events/{event['id']}/analytics"
    )
    assert analytics_response.status_code == 200
    analytics = analytics_response.get_json()

    assert analytics["officialGradeStatus"] == "ok"
    assert analytics["officialGrade"]["label"] == "二级运动员"
    assert analytics["nextOfficialGrade"]["label"] == "一级运动员"
    assert analytics["nextOfficialGrade"]["gapMs"] == 2300

    official_benchmarks = analytics["officialBenchmarks"]
    assert len(official_benchmarks) >= 2
    assert official_benchmarks[0]["achieved"] is True
    assert official_benchmarks[1]["label"] == analytics["officialGrade"]["label"]
    assert official_benchmarks[1]["achieved"] is True
    next_grade_benchmark = next(
        item
        for item in official_benchmarks
        if item["label"] == analytics["nextOfficialGrade"]["label"]
    )
    assert next_grade_benchmark["gapMs"] == 2300


def test_public_analytics_reports_missing_gender_and_unavailable_event(admin_client):
    team = admin_client.post(
        "/api/admin/teams",
        json={"name": "Status Test Team", "sortOrder": 1, "isActive": True},
    ).get_json()
    swimmer = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Bella Chen",
            "nickname": "Wave Kid",
            "publicNameMode": "nickname",
            "isPublic": True,
            "teamId": team["id"],
        },
    ).get_json()
    supported_event = admin_client.post(
        "/api/admin/events",
        json={
            "poolLengthM": 25,
            "distanceM": 50,
            "stroke": "freestyle",
            "effortType": "race",
            "displayName": "50m Freestyle Short Course",
        },
    ).get_json()
    unsupported_event = admin_client.post(
        "/api/admin/events",
        json={
            "poolLengthM": 50,
            "distanceM": 100,
            "stroke": "medley",
            "effortType": "race",
            "displayName": "100m Medley Long Course",
        },
    ).get_json()
    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer["id"],
            "eventId": supported_event["id"],
            "timeMs": 31000,
            "sourceType": "test",
            "performedOn": "2026-04-01",
        },
    )
    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer["id"],
            "eventId": unsupported_event["id"],
            "timeMs": 81000,
            "sourceType": "test",
            "performedOn": "2026-04-01",
        },
    )

    missing_gender_response = admin_client.get(
        f"/api/public/swimmers/{swimmer['slug']}/events/{supported_event['id']}/analytics"
    )
    assert missing_gender_response.status_code == 200
    missing_gender = missing_gender_response.get_json()
    assert missing_gender["officialGradeStatus"] == "missing_gender"
    assert missing_gender["officialGrade"] is None
    assert missing_gender["nextOfficialGrade"] is None
    assert missing_gender["officialBenchmarks"] == []

    admin_client.patch(
        f"/api/admin/swimmers/{swimmer['id']}",
        json={
            "realName": swimmer["realName"],
            "nickname": swimmer["nickname"],
            "publicNameMode": swimmer["publicNameMode"],
            "isPublic": swimmer["isPublic"],
            "teamId": swimmer["teamId"],
            "gender": "female",
        },
    )

    unavailable_response = admin_client.get(
        f"/api/public/swimmers/{swimmer['slug']}/events/{unsupported_event['id']}/analytics"
    )
    assert unavailable_response.status_code == 200
    unavailable = unavailable_response.get_json()
    assert unavailable["officialGradeStatus"] == "unavailable_for_event"
    assert unavailable["officialGrade"] is None
    assert unavailable["nextOfficialGrade"] is None
    assert unavailable["officialBenchmarks"] == []
