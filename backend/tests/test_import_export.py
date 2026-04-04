from __future__ import annotations

from io import BytesIO


def test_admin_import_export_endpoints_cover_template_preview_confirm_and_exports(admin_client):
    team = admin_client.post(
        "/api/admin/teams",
        json={"name": "导入测试队", "sortOrder": 1, "isActive": True},
    ).get_json()
    swimmer = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Alice Wang",
            "nickname": "小海豚",
            "publicNameMode": "nickname",
            "isPublic": True,
            "gender": "female",
            "teamId": team["id"],
        },
    ).get_json()
    event = admin_client.post(
        "/api/admin/events",
        json={
            "poolLengthM": 25,
            "distanceM": 50,
            "stroke": "freestyle",
        },
    ).get_json()

    template_response = admin_client.get("/api/admin/import/template")
    assert template_response.status_code == 200
    assert "swimmer_slug,event_display,performed_on,time_seconds,source_type,tags" in (
        template_response.get_data(as_text=True)
    )

    preview_response = admin_client.post(
        "/api/admin/import/preview",
        data={
            "file": (
                BytesIO(
                    (
                        "swimmer_slug,event_display,performed_on,time_seconds,source_type,tags\n"
                        f"{swimmer['slug']},{event['displayName']},2026-04-01,"
                        "25.90,competition,达标赛;春季\n"
                        f"missing-swimmer,{event['displayName']},2026-04-01,26.20,test,\n"
                    ).encode("utf-8")
                ),
                "performances.csv",
            )
        },
        content_type="multipart/form-data",
    )
    assert preview_response.status_code == 200
    preview = preview_response.get_json()
    assert preview["summary"]["valid"] == 1
    assert preview["summary"]["errors"] == 1
    assert preview["validRows"][0]["swimmerSlug"] == swimmer["slug"]
    assert preview["errorRows"][0]["errors"][0].startswith("选手不存在")

    confirm_response = admin_client.post(
        "/api/admin/import/confirm",
        json={"rows": preview["validRows"]},
    )
    assert confirm_response.status_code == 200
    confirm_payload = confirm_response.get_json()
    assert confirm_payload["imported"] == 1
    assert confirm_payload["contextsCreated"] == 1
    assert confirm_payload["performancesCreated"] == 1

    swimmer_export = admin_client.get(
        f"/api/admin/export/swimmers/{swimmer['id']}/performances.csv"
    )
    assert swimmer_export.status_code == 200
    swimmer_csv = swimmer_export.get_data(as_text=True)
    assert "项目,日期,成绩(秒),来源类型,状态,标签" in swimmer_csv
    assert event["displayName"] in swimmer_csv
    assert "25.900" in swimmer_csv

    team_export = admin_client.get(
        f"/api/admin/export/teams/{team['id']}/performances.csv"
    )
    assert team_export.status_code == 200
    team_csv = team_export.get_data(as_text=True)
    assert "选手slug,选手昵称,项目,日期,成绩(秒),来源类型,状态,是否PB" in team_csv
    assert swimmer["slug"] in team_csv
    assert "是" in team_csv


def test_team_export_marks_pb_using_valid_results_only(admin_client):
    team = admin_client.post(
        "/api/admin/teams",
        json={"name": "导出 PB 队", "sortOrder": 1, "isActive": True},
    ).get_json()
    swimmer = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Bella Chen",
            "nickname": "小浪花",
            "publicNameMode": "nickname",
            "isPublic": True,
            "gender": "female",
            "teamId": team["id"],
        },
    ).get_json()
    event = admin_client.post(
        "/api/admin/events",
        json={
            "poolLengthM": 25,
            "distanceM": 50,
            "stroke": "freestyle",
        },
    ).get_json()

    quick_response = admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer["id"],
            "eventId": event["id"],
            "timeMs": 33000,
            "sourceType": "training",
            "performedOn": "2026-04-01",
        },
    )
    assert quick_response.status_code == 201

    context = admin_client.post(
        "/api/admin/contexts",
        json={
            "sourceType": "competition",
            "title": "无效比赛",
            "performedOn": "2026-04-02",
        },
    ).get_json()
    add_response = admin_client.post(
        f"/api/admin/contexts/{context['id']}/performances",
        json={
            "performances": [
                {
                    "swimmerId": swimmer["id"],
                    "eventId": event["id"],
                    "timeMs": 30000,
                    "resultStatus": "invalid",
                }
            ]
        },
    )
    assert add_response.status_code == 201

    team_export = admin_client.get(
        f"/api/admin/export/teams/{team['id']}/performances.csv"
    )
    assert team_export.status_code == 200
    lines = team_export.get_data(as_text=True).strip().splitlines()
    assert lines[1].endswith(",是")
    assert lines[2].endswith(",")
