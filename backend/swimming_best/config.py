from __future__ import annotations

import os
import tomllib
from pathlib import Path
from typing import Any


def default_runtime_config() -> dict[str, Any]:
    return {
        "SECRET_KEY": "swimming-best-dev-secret",
        "SESSION_COOKIE_NAME": "swimming_best_admin",
        "DATABASE_PATH": str(Path("data") / "swimming-best.db"),
        "SERVER_HOST": "127.0.0.1",
        "SERVER_PORT": 8080,
        "ADMINS": [],
        "TIMEZONE": "Asia/Shanghai",
        "PUBLIC_BASE_URL": "http://localhost:3000",
    }


def load_runtime_config(path: str | os.PathLike[str] | None = None) -> dict[str, Any]:
    config_path = Path(path or os.environ.get("SWIMMING_BEST_CONFIG", "config.toml"))
    if not config_path.exists():
        example_path = config_path.with_name("config.example.toml")
        raise FileNotFoundError(
            f"Config file not found: {config_path}. "
            f"Copy {example_path} to {config_path} and edit it for your environment."
        )
    raw = tomllib.loads(config_path.read_text(encoding="utf-8"))

    database_path = Path(raw["database"]["path"])
    if not database_path.is_absolute():
        database_path = (config_path.parent / database_path).resolve()

    server = raw.get("server", {})
    auth = raw.get("auth", {})
    app = raw.get("app", {})

    config = default_runtime_config()
    config.update(
        {
            "SECRET_KEY": auth["session_secret"],
            "SESSION_COOKIE_NAME": auth.get("cookie_name", config["SESSION_COOKIE_NAME"]),
            "DATABASE_PATH": str(database_path),
            "SERVER_HOST": server.get("host", config["SERVER_HOST"]),
            "SERVER_PORT": server.get("port", config["SERVER_PORT"]),
            "ADMINS": auth.get("admins", []),
            "TIMEZONE": app.get("timezone", config["TIMEZONE"]),
            "PUBLIC_BASE_URL": app.get("public_base_url", config["PUBLIC_BASE_URL"]),
        }
    )
    return config
