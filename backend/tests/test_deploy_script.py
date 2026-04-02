from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


def load_deploy_module():
    script_path = Path(__file__).resolve().parents[2] / "scripts" / "deploy.py"
    spec = importlib.util.spec_from_file_location("deploy_script", script_path)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def create_frontend_source(source_root: Path) -> Path:
    frontend = source_root / "frontend"
    standalone_next = frontend / ".next" / "standalone" / ".next"
    static_dir = frontend / ".next" / "static"
    public_dir = frontend / "public"

    standalone_next.mkdir(parents=True)
    static_dir.mkdir(parents=True)
    public_dir.mkdir(parents=True)

    (frontend / ".next" / "standalone" / "server.js").write_text("console.log('server')\n")
    (standalone_next / "BUILD_ID").write_text("build-123\n")
    (static_dir / "main.js").write_text("static asset\n")
    (public_dir / "favicon.ico").write_text("icon\n")
    return frontend


def create_backend_source(source_root: Path) -> Path:
    backend = source_root / "backend"
    package_dir = backend / "swimming_best"
    package_dir.mkdir(parents=True)

    (package_dir / "__main__.py").write_text("print('backend')\n")
    (backend / "pyproject.toml").write_text("[project]\nname = 'demo'\n", encoding="utf-8")
    (backend / "poetry.lock").write_text("poetry-lock\n", encoding="utf-8")
    (backend / "uv.lock").write_text("uv-lock\n", encoding="utf-8")
    (backend / "config.example.toml").write_text("public_base_url = 'https://demo.test'\n")
    return backend


def test_deploy_frontend_bundle_replaces_old_files(tmp_path: Path):
    deploy = load_deploy_module()
    source_frontend = create_frontend_source(tmp_path / "repo")
    target_frontend = tmp_path / "product" / "frontend"
    (target_frontend / "stale").mkdir(parents=True)
    (target_frontend / "stale" / "old.txt").write_text("old\n")
    (target_frontend / ".next" / "static" / "chunks").mkdir(parents=True, exist_ok=True)
    (target_frontend / ".next" / "static" / "chunks" / "old-hash.js").write_text("stale\n")
    (target_frontend / "public").mkdir(parents=True, exist_ok=True)
    (target_frontend / "public" / "old-manifest.json").write_text("stale\n")

    deploy.deploy_frontend_bundle(source_frontend, target_frontend)

    assert (target_frontend / "server.js").read_text() == "console.log('server')\n"
    assert (target_frontend / ".next" / "BUILD_ID").read_text() == "build-123\n"
    assert (target_frontend / ".next" / "static" / "main.js").read_text() == "static asset\n"
    assert (target_frontend / "public" / "favicon.ico").read_text() == "icon\n"
    assert not (target_frontend / "stale").exists()
    assert not (target_frontend / ".next" / "static" / "chunks" / "old-hash.js").exists()
    assert not (target_frontend / "public" / "old-manifest.json").exists()


def test_parse_args_defaults_to_production_backend_origin(monkeypatch):
    deploy = load_deploy_module()
    monkeypatch.delenv("BACKEND_ORIGIN", raising=False)
    monkeypatch.delenv("DEPLOY_ROOT", raising=False)
    monkeypatch.setattr(sys, "argv", ["deploy.py"])

    args = deploy.parse_args()

    assert args.backend_origin == "http://1.12.247.149:8082/"


def test_build_frontend_normalizes_backend_origin(monkeypatch):
    deploy = load_deploy_module()
    captured: dict[str, object] = {}

    def fake_run_command(command, cwd, env=None):
        captured["command"] = command
        captured["cwd"] = cwd
        captured["env"] = env

    monkeypatch.setattr(deploy, "run_command", fake_run_command)

    deploy.build_frontend("http://1.12.247.149:8082/")

    assert captured["command"] == ["npm", "run", "build"]
    assert captured["cwd"] == deploy.FRONTEND_DIR
    assert captured["env"]["BACKEND_ORIGIN"] == "http://1.12.247.149:8082"


def test_deploy_backend_code_initializes_runtime_config_once(tmp_path: Path):
    deploy = load_deploy_module()
    source_backend = create_backend_source(tmp_path / "repo")
    target_backend = tmp_path / "product" / "backend"

    result = deploy.deploy_backend_code(source_backend, target_backend)

    assert result.config_initialized is True
    assert result.preserved_runtime_entries == (
        "config.toml",
        "data",
        "resources",
        "runtime",
    )
    assert (target_backend / "config.toml").read_text() == "public_base_url = 'https://demo.test'\n"
    assert (target_backend / "data").is_dir()
    assert (target_backend / "swimming_best" / "__main__.py").read_text() == "print('backend')\n"


def test_deploy_backend_code_preserves_existing_runtime_files(tmp_path: Path):
    deploy = load_deploy_module()
    source_backend = create_backend_source(tmp_path / "repo")
    target_backend = tmp_path / "product" / "backend"
    (target_backend / "swimming_best").mkdir(parents=True)
    (target_backend / "swimming_best" / "stale.py").write_text("stale\n")
    (target_backend / "config.toml").write_text("public_base_url = 'https://live.example.com'\n")
    (target_backend / "data").mkdir(parents=True)
    (target_backend / "data" / "live.db").write_text("database\n")
    (target_backend / "resources").mkdir(parents=True)
    (target_backend / "resources" / "live.json").write_text('{"mode":"live"}\n')
    (target_backend / "runtime").mkdir(parents=True)
    (target_backend / "runtime" / "cache.txt").write_text("warm-cache\n")

    result = deploy.deploy_backend_code(source_backend, target_backend)

    assert result.config_initialized is False
    assert result.preserved_runtime_entries == (
        "config.toml",
        "data",
        "resources",
        "runtime",
    )
    assert (target_backend / "config.toml").read_text() == "public_base_url = 'https://live.example.com'\n"
    assert (target_backend / "data" / "live.db").read_text() == "database\n"
    assert (target_backend / "resources" / "live.json").read_text() == '{"mode":"live"}\n'
    assert (target_backend / "runtime" / "cache.txt").read_text() == "warm-cache\n"
    assert (target_backend / "swimming_best" / "__main__.py").read_text() == "print('backend')\n"
    assert not (target_backend / "swimming_best" / "stale.py").exists()
