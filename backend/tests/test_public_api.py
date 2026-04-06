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

    searched_response = client.get("/api/public/swimmers?search=%E5%B0%8F%E6%B5%B7%E8%B1%9A")
    assert searched_response.status_code == 200
    searched_swimmers = searched_response.get_json()["swimmers"]
    assert len(searched_swimmers) == 2

    combined_filtered_response = client.get(
        f"/api/public/swimmers?teamId={seeded_data['team_alpha_id']}&search=%E5%B0%8F%E6%B5%B7%E8%B1%9A"
    )
    assert combined_filtered_response.status_code == 200
    combined_filtered_swimmers = combined_filtered_response.get_json()["swimmers"]
    assert len(combined_filtered_swimmers) == 1
    assert combined_filtered_swimmers[0]["team"]["name"] == "海豚预备队"

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


def test_goals_default_is_public(admin_client):
    """Goals created without explicit isPublic should default to True."""
    team = admin_client.post(
        "/api/admin/teams",
        json={"name": "测试队伍", "sortOrder": 1, "isActive": True},
    ).get_json()
    swimmer = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Test Swimmer",
            "nickname": "测试",
            "publicNameMode": "nickname",
            "isPublic": True,
            "teamId": team["id"],
        },
    ).get_json()
    event = admin_client.post(
        "/api/admin/events",
        json={
            "poolLengthM": 25,
            "distanceM": 50,
            "stroke": "freestyle",
            "effortType": "sprint",
        },
    ).get_json()

    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer["id"],
            "eventId": event["id"],
            "timeMs": 40000,
            "sourceType": "training",
            "performedOn": "2026-04-01",
        },
    )

    goal_response = admin_client.post(
        "/api/admin/goals",
        json={
            "swimmerId": swimmer["id"],
            "eventId": event["id"],
            "horizon": "short",
            "title": "Break 38s",
            "targetTimeMs": 38000,
            "targetDate": "2026-06-01",
        },
    )
    assert goal_response.status_code == 201
    goal = goal_response.get_json()
    assert goal["isPublic"] is True

    private_goal_response = admin_client.post(
        "/api/admin/goals",
        json={
            "swimmerId": swimmer["id"],
            "eventId": event["id"],
            "horizon": "mid",
            "title": "Hidden 37s",
            "targetTimeMs": 37000,
            "targetDate": "2026-08-01",
            "isPublic": False,
        },
    )
    assert private_goal_response.status_code == 201

    client = admin_client
    analytics = client.get(
        f"/api/public/swimmers/{swimmer['slug']}/events/{event['id']}/analytics"
    ).get_json()
    assert len(analytics["goals"]) == 1
    assert analytics["goals"][0]["title"] == "Break 38s"
    assert analytics["goals"][0]["gapMs"] == 2000
    assert analytics["goals"][0]["isAchieved"] is False


def test_analytics_raw_points_include_source_type(client, seeded_data):
    """Each raw performance point in analytics should include sourceType."""
    analytics_response = client.get(
        "/api/public/swimmers/"
        f"{seeded_data['swimmer_a_slug']}/events/{seeded_data['event_id']}/analytics"
    )
    assert analytics_response.status_code == 200
    analytics = analytics_response.get_json()

    raw_points = analytics["series"]["raw"]
    assert len(raw_points) >= 1
    for point in raw_points:
        assert "sourceType" in point
        assert point["sourceType"] in {"training", "test", "competition", "single"}


def test_public_arena_groups_race_markets_by_event_and_gender(admin_client):
    team_alpha = admin_client.post(
        "/api/admin/teams",
        json={"name": "竞技一队", "sortOrder": 1, "isActive": True},
    ).get_json()
    team_beta = admin_client.post(
        "/api/admin/teams",
        json={"name": "竞技二队", "sortOrder": 2, "isActive": True},
    ).get_json()

    swimmer_male_a = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Male A",
            "nickname": "男A",
            "publicNameMode": "nickname",
            "isPublic": True,
            "gender": "male",
            "teamId": team_alpha["id"],
            "birthYear": 2014,
        },
    ).get_json()
    swimmer_male_b = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Male B",
            "nickname": "男B",
            "publicNameMode": "nickname",
            "isPublic": True,
            "gender": "male",
            "teamId": team_beta["id"],
            "birthYear": 2015,
        },
    ).get_json()
    swimmer_female = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Female A",
            "nickname": "女A",
            "publicNameMode": "nickname",
            "isPublic": True,
            "gender": "female",
            "teamId": team_alpha["id"],
            "birthYear": 2014,
        },
    ).get_json()
    swimmer_unknown = admin_client.post(
        "/api/admin/swimmers",
        json={
            "realName": "Unknown A",
            "nickname": "未知A",
            "publicNameMode": "nickname",
            "isPublic": True,
            "gender": "unknown",
            "teamId": team_alpha["id"],
        },
    ).get_json()

    short_event = admin_client.post(
        "/api/admin/events",
        json={"poolLengthM": 25, "distanceM": 50, "stroke": "freestyle"},
    ).get_json()
    long_event = admin_client.post(
        "/api/admin/events",
        json={"poolLengthM": 50, "distanceM": 50, "stroke": "freestyle"},
    ).get_json()

    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer_male_a["id"],
            "eventId": short_event["id"],
            "timeMs": 32000,
            "sourceType": "test",
            "performedOn": "2026-04-01",
        },
    )
    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer_male_b["id"],
            "eventId": short_event["id"],
            "timeMs": 32500,
            "sourceType": "test",
            "performedOn": "2026-04-01",
        },
    )
    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer_female["id"],
            "eventId": short_event["id"],
            "timeMs": 34000,
            "sourceType": "test",
            "performedOn": "2026-04-01",
        },
    )
    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer_unknown["id"],
            "eventId": short_event["id"],
            "timeMs": 33000,
            "sourceType": "test",
            "performedOn": "2026-04-01",
        },
    )
    admin_client.post(
        "/api/admin/performances/quick",
        json={
            "swimmerId": swimmer_male_a["id"],
            "eventId": long_event["id"],
            "timeMs": 35000,
            "sourceType": "test",
            "performedOn": "2026-04-02",
        },
    )

    client = admin_client
    arena_response = client.get("/api/public/arena")
    assert arena_response.status_code == 200
    payload = arena_response.get_json()
    assert payload["summary"]["groupCount"] == 2

    male_short = next(
        item
        for item in payload["groups"]
        if item["event"]["id"] == short_event["id"] and item["gender"] == "all"
    )
    assert male_short["competitorCount"] == 3
    assert male_short["ageBucket"] == "all"
    assert male_short["leader"]["displayName"] == "男A"
    assert male_short["leaderGapMs"] == 500
    assert [entry["displayName"] for entry in male_short["rankings"]] == ["男A", "男B", "女A"]

    female_short = next(
        item
        for item in payload["groups"]
        if item["event"]["id"] == long_event["id"] and item["gender"] == "all"
    )
    assert female_short["competitorCount"] == 1

    filtered_response = client.get("/api/public/arena?gender=male&poolLengthM=25")
    assert filtered_response.status_code == 200
    filtered_payload = filtered_response.get_json()
    assert len(filtered_payload["groups"]) == 1
    assert filtered_payload["groups"][0]["gender"] == "male"
    assert filtered_payload["groups"][0]["event"]["poolLengthM"] == 25
    assert filtered_payload["groups"][0]["competitorCount"] == 2

    grouped_age_response = client.get("/api/public/arena?gender=female&ageBucket=u12")
    assert grouped_age_response.status_code == 200
    grouped_age_payload = grouped_age_response.get_json()
    assert grouped_age_payload["filters"]["ageBucket"] == "u12"
    assert len(grouped_age_payload["groups"]) == 1
    assert grouped_age_payload["groups"][0]["gender"] == "female"
