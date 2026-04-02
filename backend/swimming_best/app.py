from __future__ import annotations

from datetime import timedelta
from http import HTTPStatus
from typing import Any

from flask import Flask, jsonify, request

from swimming_best.admin_routes import create_admin_blueprint
from swimming_best.auth import authenticate, login_admin, logout_admin
from swimming_best.config import load_runtime_config
from swimming_best.db import get_db, init_db
from swimming_best.db import init_app as init_db_app
from swimming_best.public_routes import create_public_blueprint
from swimming_best.repository import Repository
from swimming_best.services import AdminService, PublicService


def create_app(test_config: dict[str, Any] | None = None) -> Flask:
    app = Flask(__name__)
    config = load_runtime_config() if test_config is None else test_config
    app.config.update(config)
    app.config["SESSION_COOKIE_NAME"] = app.config["SESSION_COOKIE_NAME"]
    app.permanent_session_lifetime = timedelta(days=7)

    init_db_app(app)

    with app.app_context():
        init_db(get_db())

    @app.get("/healthz")
    def healthz():
        return jsonify({"service": "swimming-best-backend", "status": "ok"})

    @app.post("/api/admin/login")
    def admin_login():
        payload = request.get_json(force=True)
        username = payload.get("username", "")
        password = payload.get("password", "")
        if not authenticate(username, password):
            return jsonify({"error": "invalid_credentials"}), HTTPStatus.UNAUTHORIZED

        login_admin(username)
        return jsonify({"username": username})

    @app.post("/api/admin/logout")
    def admin_logout():
        logout_admin()
        return "", HTTPStatus.NO_CONTENT

    def build_repository() -> Repository:
        return Repository(get_db())

    def build_admin_service() -> AdminService:
        return AdminService(build_repository())

    def build_public_service() -> PublicService:
        return PublicService(build_repository())

    app.register_blueprint(create_admin_blueprint(build_admin_service))
    app.register_blueprint(create_public_blueprint(build_public_service))
    return app
