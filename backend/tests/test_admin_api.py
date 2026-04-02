from __future__ import annotations


def test_admin_api_supports_managed_team_roster_and_recording(admin_client):
    team_response = admin_client.post(
        "/api/admin/teams",
        json={
            "name": "海星提升队",
            "sortOrder": 10,
            "isActive": True,
        },
    )
    assert team_response.status_code == 201
    team = team_response.get_json()
    assert team["name"] == "海星提升队"

    second_team_response = admin_client.post(
        "/api/admin/teams",
        json={
            "name": "海豚冲刺队",
            "sortOrder": 20,
            "isActive": True,
        },
    )
    assert second_team_response.status_code == 201
    second_team = second_team_response.get_json()

    swimmer_response = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Alice Wang",
            "nickname": "小海豚",
            "publicNameMode": "nickname",
            "isPublic": True,
            "teamId": team["id"],
        },
    )
    assert swimmer_response.status_code == 201
    swimmer = swimmer_response.get_json()
    assert swimmer["teamId"] == team["id"]
    assert swimmer["team"]["name"] == "海星提升队"

    update_response = admin_client.patch(
        f"/api/admin/swimmers/{swimmer['id']}",
        json={
            "realName": "Alice Wang",
            "nickname": "小海豚",
            "publicNameMode": "nickname",
            "isPublic": True,
            "teamId": second_team["id"],
        },
    )
    assert update_response.status_code == 200
    assert update_response.get_json()["teamId"] == second_team["id"]
    assert update_response.get_json()["team"]["name"] == "海豚冲刺队"

    team_update_response = admin_client.patch(
        f"/api/admin/teams/{second_team['id']}",
        json={
            "name": "海豚冲刺一队",
            "sortOrder": 30,
            "isActive": True,
        },
    )
    assert team_update_response.status_code == 200
    assert team_update_response.get_json()["name"] == "海豚冲刺一队"

    event_response = admin_client.post(
        "/api/admin/events",
        json={
            "poolLengthM": 25,
            "distanceM": 50,
            "stroke": "freestyle",
            "effortType": "race",
        },
    )
    assert event_response.status_code == 201
    event = event_response.get_json()

    quick_response = admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer["id"],
            "eventId": event["id"],
            "timeMs": 32000,
            "sourceType": "competition",
            "performedOn": "2026-04-01",
        },
    )
    assert quick_response.status_code == 201

    goal_response = admin_client.post(
        "/api/admin/goals",
        json={
            "swimmerId": swimmer["id"],
            "eventId": event["id"],
            "horizon": "mid",
            "title": "暑假前游进 31 秒",
            "targetTimeMs": 31000,
            "targetDate": "2026-08-01",
            "isPublic": True,
        },
    )
    assert goal_response.status_code == 201

    context_response = admin_client.post(
        "/api/admin/contexts",
        json={
            "sourceType": "training",
            "title": "周三训练",
            "performedOn": "2026-04-03",
            "tags": ["月测"],
        },
    )
    assert context_response.status_code == 201
    context = context_response.get_json()

    add_performance_response = admin_client.post(
        f"/api/admin/contexts/{context['id']}/performances",
        json={
            "performances": [
                {
                    "swimmerId": swimmer["id"],
                    "eventId": event["id"],
                    "timeMs": 31500,
                    "resultStatus": "valid",
                    "tags": ["出发好"],
                }
            ]
        },
    )
    assert add_performance_response.status_code == 201

    teams_response = admin_client.get("/api/admin/teams")
    assert teams_response.status_code == 200
    teams = teams_response.get_json()["teams"]
    assert [item["name"] for item in teams] == ["海星提升队", "海豚冲刺一队"]

    swimmers_response = admin_client.get(f"/api/admin/swimmers?teamId={second_team['id']}")
    assert swimmers_response.status_code == 200
    swimmers = swimmers_response.get_json()["swimmers"]
    assert len(swimmers) == 1
    assert swimmers[0]["team"]["name"] == "海豚冲刺一队"

    goals_response = admin_client.get("/api/admin/goals")
    assert goals_response.status_code == 200
    assert goals_response.get_json()["goals"][0]["title"] == "暑假前游进 31 秒"
    assert goals_response.get_json()["goals"][0]["swimmer"]["team"]["name"] == "海豚冲刺一队"

    performances_response = admin_client.get("/api/admin/performances")
    assert performances_response.status_code == 200
    assert (
        performances_response.get_json()["performances"][0]["swimmer"]["team"]["name"]
        == "海豚冲刺一队"
    )
    assert set(performances_response.get_json()["performances"][0]["tags"]) == {"出发好", "月测"}


def test_admin_api_rejects_unknown_team_assignment(admin_client):
    response = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Dana Xu",
            "nickname": "小飞鱼",
            "publicNameMode": "nickname",
            "isPublic": True,
            "teamId": "missing-team",
        },
    )

    assert response.status_code == 400
    assert response.get_json()["error"] == "team not found"


def test_admin_api_rejects_inactive_team_assignment(admin_client):
    team_response = admin_client.post(
        "/api/admin/teams",
        json={
            "name": "暂停招生队伍",
            "sortOrder": 99,
            "isActive": False,
        },
    )
    assert team_response.status_code == 201
    team = team_response.get_json()

    response = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Erin Luo",
            "nickname": "小浪花",
            "publicNameMode": "nickname",
            "isPublic": True,
            "teamId": team["id"],
        },
    )

    assert response.status_code == 400
    assert response.get_json()["error"] == "team is inactive"
