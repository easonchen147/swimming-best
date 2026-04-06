from __future__ import annotations

from collections.abc import Callable
from http import HTTPStatus

from flask import Blueprint, Response, jsonify, request

from swimming_best.auth import admin_required
from swimming_best.import_export import (
    execute_import,
    export_swimmer_csv,
    export_team_csv,
    generate_template,
    parse_csv,
    validate_import_rows,
)
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

    @admin.get("/standards")
    @admin_required
    def list_standards():
        admin_service = get_admin_service()
        return jsonify({"standards": admin_service.list_standards()})

    @admin.post("/standards")
    @admin_required
    def create_standard():
        admin_service = get_admin_service()
        standard = admin_service.create_standard(request.get_json(force=True))
        return jsonify(standard), HTTPStatus.CREATED

    @admin.patch("/standards/<standard_id>")
    @admin_required
    def update_standard(standard_id: str):
        admin_service = get_admin_service()
        standard = admin_service.update_standard(standard_id, request.get_json(force=True))
        return jsonify(standard)

    @admin.delete("/standards/<standard_id>")
    @admin_required
    def delete_standard(standard_id: str):
        admin_service = get_admin_service()
        admin_service.delete_standard(standard_id)
        return "", HTTPStatus.NO_CONTENT

    @admin.get("/standards/<standard_id>/entries")
    @admin_required
    def list_standard_entries(standard_id: str):
        admin_service = get_admin_service()
        return jsonify({"entries": admin_service.list_standard_entries(standard_id)})

    @admin.post("/standards/<standard_id>/entries")
    @admin_required
    def create_standard_entry(standard_id: str):
        admin_service = get_admin_service()
        entry = admin_service.create_standard_entry(standard_id, request.get_json(force=True))
        return jsonify(entry), HTTPStatus.CREATED

    @admin.patch("/standards/entries/<entry_id>")
    @admin_required
    def update_standard_entry(entry_id: str):
        admin_service = get_admin_service()
        entry = admin_service.update_standard_entry(entry_id, request.get_json(force=True))
        return jsonify(entry)

    @admin.delete("/standards/entries/<entry_id>")
    @admin_required
    def delete_standard_entry(entry_id: str):
        admin_service = get_admin_service()
        admin_service.delete_standard_entry(entry_id)
        return "", HTTPStatus.NO_CONTENT

    @admin.get("/import/template")
    @admin_required
    def import_template():
        return Response(
            generate_template(),
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=performances-template.csv"},
        )

    @admin.post("/import/preview")
    @admin_required
    def import_preview():
        upload = request.files.get("file")
        if upload is None:
            return jsonify({"error": "file is required"}), HTTPStatus.BAD_REQUEST
        admin_service = get_admin_service()
        rows = parse_csv(upload)
        return jsonify(validate_import_rows(rows, admin_service.repository))

    @admin.post("/import/confirm")
    @admin_required
    def import_confirm():
        admin_service = get_admin_service()
        rows = request.get_json(force=True).get("rows", [])
        return jsonify(execute_import(rows, admin_service.repository))

    @admin.get("/export/swimmers/<swimmer_id>/performances.csv")
    @admin_required
    def export_swimmer(swimmer_id: str):
        admin_service = get_admin_service()
        csv_text = export_swimmer_csv(swimmer_id, admin_service.repository)
        return Response(
            csv_text,
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=swimmer-performances.csv"},
        )

    @admin.get("/export/swimmers/<swimmer_id>/summary")
    @admin_required
    def export_swimmer_summary(swimmer_id: str):
        admin_service = get_admin_service()
        return jsonify(admin_service.swimmer_export_summary(swimmer_id))

    @admin.get("/export/teams/<team_id>/performances.csv")
    @admin_required
    def export_team(team_id: str):
        admin_service = get_admin_service()
        csv_text = export_team_csv(team_id, admin_service.repository)
        return Response(
            csv_text,
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=team-performances.csv"},
        )

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
