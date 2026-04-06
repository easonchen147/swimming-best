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
            "birthYear": 2016,
            "notes": "主项偏自由泳",
            "teamId": team["id"],
        },
    )
    assert swimmer_response.status_code == 201
    swimmer = swimmer_response.get_json()
    assert swimmer["teamId"] == team["id"]
    assert swimmer["team"]["name"] == "海星提升队"
    assert swimmer["birthYear"] == 2016
    assert swimmer["notes"] == "主项偏自由泳"

    update_response = admin_client.patch(
        f"/api/admin/swimmers/{swimmer['id']}",
        json={
            "realName": "Alice Wang",
            "nickname": "小海豚",
            "publicNameMode": "nickname",
            "isPublic": True,
            "birthYear": 2015,
            "notes": "改练 50 自冲刺",
            "teamId": second_team["id"],
        },
    )
    assert update_response.status_code == 200
    assert update_response.get_json()["teamId"] == second_team["id"]
    assert update_response.get_json()["team"]["name"] == "海豚冲刺队"
    assert update_response.get_json()["birthYear"] == 2015
    assert update_response.get_json()["notes"] == "改练 50 自冲刺"

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
            "publicNote": "出发不错",
            "adminNote": "后程仍可提速",
            "tags": ["周赛", "晚训"],
        },
    )
    assert quick_response.status_code == 201
    assert quick_response.get_json()["performance"]["publicNote"] == "出发不错"
    assert quick_response.get_json()["performance"]["adminNote"] == "后程仍可提速"

    goal_response = admin_client.post(
        "/api/admin/goals",
        json={
            "swimmerId": swimmer["id"],
            "eventId": event["id"],
            "horizon": "mid",
            "title": "暑假前游进 31 秒",
            "targetTimeMs": 31000,
            "targetDate": "2026-08-01",
            "isPublic": False,
            "publicNote": "暑假里程碑",
            "adminNote": "暑假前必须达成",
        },
    )
    assert goal_response.status_code == 201
    goal = goal_response.get_json()
    assert goal["isPublic"] is False
    assert goal["publicNote"] == "暑假里程碑"
    assert goal["adminNote"] == "暑假前必须达成"

    context_response = admin_client.post(
        "/api/admin/contexts",
        json={
            "sourceType": "training",
            "title": "周三训练",
            "performedOn": "2026-04-03",
            "location": "东区 25 米池",
            "publicNote": "周中晚训",
            "adminNote": "观察转身技术",
            "tags": ["月测"],
        },
    )
    assert context_response.status_code == 201
    context = context_response.get_json()
    assert context["location"] == "东区 25 米池"
    assert context["publicNote"] == "周中晚训"
    assert context["adminNote"] == "观察转身技术"

    add_performance_response = admin_client.post(
        f"/api/admin/contexts/{context['id']}/performances",
        json={
            "performances": [
                {
                    "swimmerId": swimmer["id"],
                    "eventId": event["id"],
                    "timeMs": 31500,
                    "resultStatus": "valid",
                    "publicNote": "转身更顺",
                    "adminNote": "出发节奏还要收紧",
                    "tags": ["出发好"],
                }
            ]
        },
    )
    assert add_performance_response.status_code == 201
    created_performance = add_performance_response.get_json()["performances"][0]
    assert created_performance["publicNote"] == "转身更顺"
    assert created_performance["adminNote"] == "出发节奏还要收紧"

    teams_response = admin_client.get("/api/admin/teams")
    assert teams_response.status_code == 200
    teams = teams_response.get_json()["teams"]
    assert [item["name"] for item in teams] == ["海星提升队", "海豚冲刺一队"]

    searched_teams_response = admin_client.get("/api/admin/teams?search=%E5%86%B2%E5%88%BA")
    assert searched_teams_response.status_code == 200
    searched_teams = searched_teams_response.get_json()["teams"]
    assert len(searched_teams) == 1
    assert searched_teams[0]["name"] == "海豚冲刺一队"

    swimmers_response = admin_client.get(f"/api/admin/swimmers?teamId={second_team['id']}")
    assert swimmers_response.status_code == 200
    swimmers = swimmers_response.get_json()["swimmers"]
    assert len(swimmers) == 1
    assert swimmers[0]["team"]["name"] == "海豚冲刺一队"

    searched_swimmers_response = admin_client.get(
        f"/api/admin/swimmers?teamId={second_team['id']}&search=%E5%B0%8F%E6%B5%B7%E8%B1%9A"
    )
    assert searched_swimmers_response.status_code == 200
    searched_swimmers = searched_swimmers_response.get_json()["swimmers"]
    assert len(searched_swimmers) == 1
    assert searched_swimmers[0]["nickname"] == "小海豚"

    searched_events_response = admin_client.get("/api/admin/events?search=%E8%87%AA%E7%94%B1%E6%B3%B3")
    assert searched_events_response.status_code == 200
    searched_events = searched_events_response.get_json()["events"]
    assert len(searched_events) >= 1
    assert event["displayName"] in [item["displayName"] for item in searched_events]

    goals_response = admin_client.get("/api/admin/goals")
    assert goals_response.status_code == 200
    assert goals_response.get_json()["goals"][0]["title"] == "暑假前游进 31 秒"
    assert goals_response.get_json()["goals"][0]["swimmer"]["team"]["name"] == "海豚冲刺一队"
    assert goals_response.get_json()["goals"][0]["isPublic"] is False

    performances_response = admin_client.get("/api/admin/performances")
    assert performances_response.status_code == 200
    assert (
        performances_response.get_json()["performances"][0]["swimmer"]["team"]["name"]
        == "海豚冲刺一队"
    )
    assert set(performances_response.get_json()["performances"][0]["tags"]) == {"出发好", "月测"}
    assert performances_response.get_json()["performances"][0]["publicNote"] == "转身更顺"
    assert performances_response.get_json()["performances"][0]["adminNote"] == "出发节奏还要收紧"


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
