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
            "effortType": "race",
            "displayName": "50m 自由泳 短池",
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
                        f"{swimmer['slug']},50m 自由泳 短池,2026-04-01,"
                        "25.90,competition,达标赛;春季\n"
                        "missing-swimmer,50m 自由泳 短池,2026-04-01,26.20,test,\n"
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
