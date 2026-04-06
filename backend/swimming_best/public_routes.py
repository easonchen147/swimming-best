from __future__ import annotations

from collections.abc import Callable
from http import HTTPStatus

from flask import Blueprint, jsonify, request

from swimming_best.repository import NotFoundError
from swimming_best.services import PublicService


def create_public_blueprint(
    get_public_service: Callable[[], PublicService],
) -> Blueprint:
    public = Blueprint("public", __name__, url_prefix="/api/public")

    @public.get("/swimmers")
    def list_swimmers():
        public_service = get_public_service()
        swimmers = public_service.list_swimmers(team_id=request.args.get("teamId"))
        return jsonify({"swimmers": swimmers})

    @public.get("/swimmers/<slug>")
    def swimmer_detail(slug: str):
        public_service = get_public_service()
        return jsonify(public_service.swimmer_detail(slug))

    @public.get("/swimmers/<slug>/events")
    def swimmer_events(slug: str):
        public_service = get_public_service()
        return jsonify({"events": public_service.swimmer_events(slug)})

    @public.get("/swimmers/<slug>/events/<event_id>/analytics")
    def swimmer_event_analytics(slug: str, event_id: str):
        public_service = get_public_service()
        return jsonify(public_service.event_analytics(slug, event_id))

    @public.get("/compare")
    def compare():
        public_service = get_public_service()
        payload = public_service.compare(
            request.args.get("eventId", ""),
            request.args.getlist("swimmerId"),
        )
        return jsonify(payload)

    @public.get("/arena")
    def arena():
        public_service = get_public_service()
        pool_length_param = request.args.get("poolLengthM")
        payload = public_service.arena_board(
            gender=request.args.get("gender") or None,
            pool_length_m=int(pool_length_param) if pool_length_param else None,
            team_id=request.args.get("teamId") or None,
        )
        return jsonify(payload)

    @public.errorhandler(NotFoundError)
    def handle_not_found(_: NotFoundError):
        return jsonify({"error": "not_found"}), HTTPStatus.NOT_FOUND

    @public.errorhandler(ValueError)
    def handle_value_error(error: ValueError):
        return jsonify({"error": str(error)}), HTTPStatus.BAD_REQUEST

    return public
