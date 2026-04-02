from __future__ import annotations

from functools import wraps
from typing import Any, Callable

from flask import current_app, jsonify, session
from werkzeug.security import check_password_hash


def authenticate(username: str, password: str) -> bool:
    for admin in current_app.config["ADMINS"]:
        if admin["username"] == username and check_password_hash(
            admin["password_hash"], password
        ):
            return True
    return False


def login_admin(username: str) -> None:
    session.permanent = True
    session["admin_username"] = username


def logout_admin() -> None:
    session.clear()


def current_admin() -> str | None:
    return session.get("admin_username")


def admin_required(view: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(view)
    def wrapped(*args: Any, **kwargs: Any):
        if not current_admin():
            return jsonify({"error": "unauthorized"}), 401
        return view(*args, **kwargs)

    return wrapped
