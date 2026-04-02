from __future__ import annotations

from pathlib import Path

import pytest

from swimming_best.config import load_runtime_config


def test_load_runtime_config_resolves_relative_database_path_and_public_base_url(
    tmp_path: Path,
):
    config_path = tmp_path / "config.toml"
    config_path.write_text(
        """
[server]
host = "0.0.0.0"
port = 9090

[database]
path = "./runtime/swimming-best.db"

[auth]
session_secret = "secret-value"
cookie_name = "custom_cookie"

[[auth.admins]]
username = "coach"
password_hash = "hash-value"

[app]
timezone = "UTC"
public_base_url = "https://swimming.example.com"
""".strip(),
        encoding="utf-8",
    )

    config = load_runtime_config(config_path)

    assert config["SERVER_HOST"] == "0.0.0.0"
    assert config["SERVER_PORT"] == 9090
    assert config["SESSION_COOKIE_NAME"] == "custom_cookie"
    assert config["DATABASE_PATH"] == str((tmp_path / "runtime" / "swimming-best.db").resolve())
    assert config["TIMEZONE"] == "UTC"
    assert config["PUBLIC_BASE_URL"] == "https://swimming.example.com"


def test_load_runtime_config_missing_file_has_actionable_message(tmp_path: Path):
    missing_path = tmp_path / "missing-config.toml"

    with pytest.raises(FileNotFoundError) as exc_info:
        load_runtime_config(missing_path)

    message = str(exc_info.value)
    assert "config.example.toml" in message
    assert str(missing_path) in message
