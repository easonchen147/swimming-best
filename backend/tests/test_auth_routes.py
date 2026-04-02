from __future__ import annotations


def test_admin_routes_reject_anonymous_requests(client):
    response = client.get("/api/admin/me")

    assert response.status_code == 401
    assert response.get_json() == {"error": "unauthorized"}


def test_login_creates_admin_session(client):
    login_response = client.post(
        "/api/admin/login",
        json={"username": "coach", "password": "secret-pass"},
    )

    assert login_response.status_code == 200
    assert login_response.get_json() == {"username": "coach"}

    me_response = client.get("/api/admin/me")

    assert me_response.status_code == 200
    assert me_response.get_json() == {"username": "coach"}
