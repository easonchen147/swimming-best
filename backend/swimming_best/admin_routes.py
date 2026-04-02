from __future__ import annotations

from collections.abc import Callable
from http import HTTPStatus

from flask import Blueprint, jsonify, request

from swimming_best.auth import admin_required
from swimming_best.repository import ConflictError, NotFoundError, ValidationError
from swimming_best.services import AdminService


def create_admin_blueprint(
    get_admin_service: Callable[[], AdminService],
) -> Blueprint:
    admin = Blueprint("admin", __name__, url_prefix="/api/admin")

    @admin.get("/me")
    @admin_required
    def me():
        from swimming_best.auth import current_admin

        return jsonify({"username": current_admin()})

    @admin.get("/teams")
    @admin_required
    def list_teams():
        admin_service = get_admin_service()
        return jsonify({"teams": admin_service.list_teams()})

    @admin.post("/teams")
    @admin_required
    def create_team():
        admin_service = get_admin_service()
        team = admin_service.create_team(request.get_json(force=True))
        return jsonify(team), HTTPStatus.CREATED

    @admin.patch("/teams/<team_id>")
    @admin_required
    def update_team(team_id: str):
        admin_service = get_admin_service()
        team = admin_service.update_team(team_id, request.get_json(force=True))
        return jsonify(team)

    @admin.get("/swimmers")
    @admin_required
    def list_swimmers():
        admin_service = get_admin_service()
        swimmers = admin_service.list_swimmers(team_id=request.args.get("teamId"))
        return jsonify({"swimmers": swimmers})

    @admin.post("/swimmers")
    @admin_required
    def create_swimmer():
        admin_service = get_admin_service()
        swimmer = admin_service.create_swimmer(request.get_json(force=True))
        return jsonify(swimmer), HTTPStatus.CREATED

    @admin.patch("/swimmers/<swimmer_id>")
    @admin_required
    def update_swimmer(swimmer_id: str):
        admin_service = get_admin_service()
        swimmer = admin_service.update_swimmer(swimmer_id, request.get_json(force=True))
        return jsonify(swimmer)

    @admin.get("/events")
    @admin_required
    def list_events():
        admin_service = get_admin_service()
        return jsonify({"events": admin_service.list_events()})

    @admin.post("/events")
    @admin_required
    def create_event():
        admin_service = get_admin_service()
        event = admin_service.create_event(request.get_json(force=True))
        return jsonify(event), HTTPStatus.CREATED

    @admin.post("/performances/quick")
    @admin_required
    def quick_record():
        admin_service = get_admin_service()
        result = admin_service.quick_record_performance(request.get_json(force=True))
        return jsonify(result), HTTPStatus.CREATED

    @admin.get("/performances")
    @admin_required
    def list_performances():
        admin_service = get_admin_service()
        return jsonify({"performances": admin_service.list_recent_performances()})

    @admin.post("/contexts")
    @admin_required
    def create_context():
        admin_service = get_admin_service()
        record_context = admin_service.create_context(request.get_json(force=True))
        return jsonify(record_context), HTTPStatus.CREATED

    @admin.post("/contexts/<context_id>/performances")
    @admin_required
    def add_context_performances(context_id: str):
        admin_service = get_admin_service()
        payload = request.get_json(force=True)
        performances = admin_service.add_context_performances(
            context_id,
            payload.get("performances", []),
        )
        return jsonify({"performances": performances}), HTTPStatus.CREATED

    @admin.get("/goals")
    @admin_required
    def list_goals():
        admin_service = get_admin_service()
        return jsonify({"goals": admin_service.list_goals()})

    @admin.post("/goals")
    @admin_required
    def create_goal():
        admin_service = get_admin_service()
        goal = admin_service.create_goal(request.get_json(force=True))
        return jsonify(goal), HTTPStatus.CREATED

    @admin.errorhandler(ConflictError)
    def handle_conflict(_: ConflictError):
        return jsonify({"error": "conflict"}), HTTPStatus.CONFLICT

    @admin.errorhandler(NotFoundError)
    def handle_not_found(_: NotFoundError):
        return jsonify({"error": "not_found"}), HTTPStatus.NOT_FOUND

    @admin.errorhandler(ValidationError)
    def handle_validation(error: ValidationError):
        return jsonify({"error": str(error)}), HTTPStatus.BAD_REQUEST

    return admin
