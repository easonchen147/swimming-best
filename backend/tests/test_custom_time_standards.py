from __future__ import annotations


def test_admin_api_manages_custom_standards_and_entries(admin_client):
    event = admin_client.post(
        "/api/admin/events",
        json={
            "poolLengthM": 25,
            "distanceM": 50,
            "stroke": "freestyle",
            "effortType": "race",
            "displayName": "50m 自由泳 短池",
        },
    ).get_json()

    create_standard_response = admin_client.post(
        "/api/admin/standards",
        json={
            "tierGroup": "暑期集训线",
            "name": "A组达标",
            "tierOrder": 2,
            "colorHex": "#3b82f6",
        },
    )
    assert create_standard_response.status_code == 201
    standard = create_standard_response.get_json()
    assert standard["name"] == "A组达标"

    create_entry_response = admin_client.post(
        f"/api/admin/standards/{standard['id']}/entries",
        json={
            "eventId": event["id"],
            "gender": "male",
            "qualifyingTimeMs": 28000,
        },
    )
    assert create_entry_response.status_code == 201
    entry = create_entry_response.get_json()
    assert entry["gender"] == "male"

    standards_response = admin_client.get("/api/admin/standards")
    assert standards_response.status_code == 200
    assert standards_response.get_json()["standards"][0]["tierGroup"] == "暑期集训线"

    entries_response = admin_client.get(f"/api/admin/standards/{standard['id']}/entries")
    assert entries_response.status_code == 200
    assert entries_response.get_json()["entries"][0]["qualifyingTimeMs"] == 28000

    update_standard_response = admin_client.patch(
        f"/api/admin/standards/{standard['id']}",
        json={
            "name": "A组冲线",
            "tierOrder": 3,
            "colorHex": "#1d4ed8",
        },
    )
    assert update_standard_response.status_code == 200
    assert update_standard_response.get_json()["name"] == "A组冲线"

    update_entry_response = admin_client.patch(
        f"/api/admin/standards/entries/{entry['id']}",
        json={
            "gender": "all",
            "qualifyingTimeMs": 27500,
        },
    )
    assert update_entry_response.status_code == 200
    assert update_entry_response.get_json()["gender"] == "all"
    assert update_entry_response.get_json()["qualifyingTimeMs"] == 27500

    delete_entry_response = admin_client.delete(
        f"/api/admin/standards/entries/{entry['id']}"
    )
    assert delete_entry_response.status_code == 204

    delete_standard_response = admin_client.delete(f"/api/admin/standards/{standard['id']}")
    assert delete_standard_response.status_code == 204


def test_public_analytics_includes_custom_benchmark_fields(admin_client):
    team = admin_client.post(
        "/api/admin/teams",
        json={"name": "标准测试队", "sortOrder": 1, "isActive": True},
    ).get_json()
    swimmer = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Alice Wang",
            "nickname": "小海豚",
            "publicNameMode": "nickname",
            "isPublic": True,
            "gender": "male",
            "teamId": team["id"],
        },
    ).get_json()
    event = admin_client.post(
        "/api/admin/events",
        json={
            "poolLengthM": 25,
            "distanceM": 50,
            "stroke": "freestyle",
            "effortType": "race",
            "displayName": "50m 自由泳 短池",
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

    standard_a = admin_client.post(
        "/api/admin/standards",
        json={
            "tierGroup": "暑期集训线",
            "name": "启蒙达标",
            "tierOrder": 1,
            "colorHex": "#94a3b8",
        },
    ).get_json()
    admin_client.post(
        f"/api/admin/standards/{standard_a['id']}/entries",
        json={
            "eventId": event["id"],
            "gender": "all",
            "qualifyingTimeMs": 30000,
        },
    )

    standard_b = admin_client.post(
        "/api/admin/standards",
        json={
            "tierGroup": "暑期集训线",
            "name": "A组达标",
            "tierOrder": 2,
            "colorHex": "#3b82f6",
        },
    ).get_json()
    admin_client.post(
        f"/api/admin/standards/{standard_b['id']}/entries",
        json={
            "eventId": event["id"],
            "gender": "male",
            "qualifyingTimeMs": 25000,
        },
    )

    analytics_response = admin_client.get(
        f"/api/public/swimmers/{swimmer['slug']}/events/{event['id']}/analytics"
    )
    assert analytics_response.status_code == 200
    analytics = analytics_response.get_json()

    assert len(analytics["customStandards"]) == 2
    assert analytics["customStandards"][0]["achieved"] is True
    assert analytics["customStandards"][1]["achieved"] is False
    assert analytics["nextCustomStandard"]["name"] == "A组达标"
    assert analytics["nextCustomStandard"]["gapMs"] == 900
    assert len(analytics["benchmarkLines"]) == 2
