from __future__ import annotations


def test_public_api_exposes_visible_swimmers_analytics_compare_and_team_filters(
    client,
    seeded_data,
):
    list_response = client.get("/api/public/swimmers")
    assert list_response.status_code == 200
    swimmers = list_response.get_json()["swimmers"]
    assert len(swimmers) == 2
    assert swimmers[0]["team"]["name"] in {"海豚预备队", "浪花竞速队"}

    filtered_response = client.get(f"/api/public/swimmers?teamId={seeded_data['team_alpha_id']}")
    assert filtered_response.status_code == 200
    filtered_swimmers = filtered_response.get_json()["swimmers"]
    assert len(filtered_swimmers) == 1
    assert filtered_swimmers[0]["team"]["name"] == "海豚预备队"

    detail_response = client.get(f"/api/public/swimmers/{seeded_data['swimmer_a_slug']}")
    assert detail_response.status_code == 200
    assert detail_response.get_json()["team"]["name"] == "海豚预备队"

    events_response = client.get(
        f"/api/public/swimmers/{seeded_data['swimmer_a_slug']}/events"
    )
    assert events_response.status_code == 200
    assert len(events_response.get_json()["events"]) == 1

    analytics_response = client.get(
        "/api/public/swimmers/"
        f"{seeded_data['swimmer_a_slug']}/events/{seeded_data['event_id']}/analytics"
    )
    assert analytics_response.status_code == 200
    analytics_payload = analytics_response.get_json()
    assert analytics_payload["swimmer"]["team"]["name"] == "海豚预备队"
    assert analytics_payload["series"]["currentBestTimeMs"] == 14650
    assert analytics_payload["goals"][0]["progress"] > 0

    compare_response = client.get(
        "/api/public/compare"
        f"?eventId={seeded_data['event_id']}"
        f"&swimmerId={seeded_data['swimmer_a_id']}"
        f"&swimmerId={seeded_data['swimmer_b_id']}"
    )
    assert compare_response.status_code == 200
    compare_payload = compare_response.get_json()
    assert len(compare_payload["swimmers"]) == 2
    assert compare_payload["swimmers"][0]["team"]["name"] in {"海豚预备队", "浪花竞速队"}

    hidden_response = client.get(f"/api/public/swimmers/{seeded_data['hidden_swimmer_slug']}")
    assert hidden_response.status_code == 404
