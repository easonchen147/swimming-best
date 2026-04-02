from __future__ import annotations

from pathlib import Path
from typing import Iterator

import pytest
from werkzeug.security import generate_password_hash

from swimming_best.app import create_app


@pytest.fixture()
def app(tmp_path: Path):
    db_path = tmp_path / "test.db"
    app = create_app(
        {
            "TESTING": True,
            "SECRET_KEY": "test-secret",
            "DATABASE_PATH": str(db_path),
            "SESSION_COOKIE_NAME": "swimming_best_admin",
            "ADMINS": [
                {
                    "username": "coach",
                    "password_hash": generate_password_hash("secret-pass"),
                }
            ],
        }
    )
    yield app


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def admin_client(client):
    response = client.post(
        "/api/admin/login",
        json={"username": "coach", "password": "secret-pass"},
    )
    assert response.status_code == 200
    return client


@pytest.fixture()
def seeded_data(admin_client) -> Iterator[dict[str, str]]:
    team_alpha = admin_client.post(
        "/api/admin/teams",
        json={
            "name": "海豚预备队",
            "sortOrder": 1,
            "isActive": True,
        },
    ).get_json()
    team_beta = admin_client.post(
        "/api/admin/teams",
        json={
            "name": "浪花竞速队",
            "sortOrder": 2,
            "isActive": True,
        },
    ).get_json()
    team_hidden = admin_client.post(
        "/api/admin/teams",
        json={
            "name": "观察组",
            "sortOrder": 3,
            "isActive": True,
        },
    ).get_json()

    swimmer_a = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Alice Wang",
            "nickname": "小海豚",
            "publicNameMode": "nickname",
            "isPublic": True,
            "teamId": team_alpha["id"],
        },
    ).get_json()
    swimmer_b = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Bella Chen",
            "nickname": "小海豚",
            "publicNameMode": "nickname",
            "isPublic": True,
            "teamId": team_beta["id"],
        },
    ).get_json()
    hidden_swimmer = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Cara Li",
            "nickname": "秘密选手",
            "publicNameMode": "hidden",
            "isPublic": False,
            "teamId": team_hidden["id"],
        },
    ).get_json()
    event = admin_client.post(
        "/api/admin/events",
        json={
            "poolLengthM": 25,
            "distanceM": 25,
            "stroke": "freestyle",
            "effortType": "sprint",
            "displayName": "25m 自由泳 冲刺",
        },
    ).get_json()

    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer_a["id"],
            "eventId": event["id"],
            "timeMs": 15000,
            "sourceType": "test",
            "performedOn": "2026-04-01",
        },
    )
    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer_a["id"],
            "eventId": event["id"],
            "timeMs": 14800,
            "sourceType": "test",
            "performedOn": "2026-04-08",
        },
    )
    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer_b["id"],
            "eventId": event["id"],
            "timeMs": 15400,
            "sourceType": "test",
            "performedOn": "2026-04-01",
        },
    )
    admin_client.post(
        "/api/admin/goals",
        json={
            "swimmerId": swimmer_a["id"],
            "eventId": event["id"],
            "horizon": "short",
            "title": "4 月游进 14.50",
            "targetTimeMs": 14500,
            "targetDate": "2026-04-30",
            "isPublic": True,
        },
    )
    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer_a["id"],
            "eventId": event["id"],
            "timeMs": 14650,
            "sourceType": "test",
            "performedOn": "2026-04-15",
        },
    )

    yield {
        "team_alpha_id": team_alpha["id"],
        "team_beta_id": team_beta["id"],
        "team_hidden_id": team_hidden["id"],
        "swimmer_a_id": swimmer_a["id"],
        "swimmer_a_slug": swimmer_a["slug"],
        "swimmer_b_id": swimmer_b["id"],
        "hidden_swimmer_id": hidden_swimmer["id"],
        "hidden_swimmer_slug": hidden_swimmer["slug"],
        "event_id": event["id"],
    }
