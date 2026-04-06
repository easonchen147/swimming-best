from __future__ import annotations


def test_admin_swimmer_summary_export_exposes_highlights_and_goal_summary(
    admin_client,
    seeded_data,
):
    response = admin_client.get(
        f"/api/admin/export/swimmers/{seeded_data['swimmer_a_id']}/summary"
    )
    assert response.status_code == 200
    payload = response.get_json()

    assert payload["swimmer"]["id"] == seeded_data["swimmer_a_id"]
    assert payload["swimmer"]["displayName"] == "小海豚"
    assert payload["summary"]["strongestEventCount"] >= 1
    assert payload["summary"]["activeGoalCount"] >= 1
    assert len(payload["highlights"]) >= 1
    assert payload["highlights"][0]["eventDisplayName"] == "25米 自由泳（短池）"
    assert "officialGradeLabel" in payload["highlights"][0]
    assert "progress30dMs" in payload["highlights"][0]
    assert len(payload["goals"]) >= 1
