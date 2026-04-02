#!/usr/bin/env python3

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = REPO_ROOT / "scripts"
FRONTEND_DIR = REPO_ROOT / "frontend"
BACKEND_DIR = REPO_ROOT / "backend"
DEFAULT_TARGET_ROOT = Path("/data/product/swimming-best")
DEFAULT_BACKEND_ORIGIN = "http://127.0.0.1:8000/"
PRESERVED_BACKEND_RUNTIME_ENTRIES = (
    "config.toml",
    "data",
    "resources",
    "runtime",
)


@dataclass(slots=True)
class BackendDeployResult:
    config_initialized: bool
    preserved_runtime_entries: tuple[str, ...]


def normalize_backend_origin(origin: str) -> str:
    normalized = origin.strip().rstrip("/")
    if not normalized:
        raise ValueError("BACKEND_ORIGIN must not be empty")
    return normalized


def prepare_empty_directory(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def replace_directory(staging_dir: Path, target_dir: Path) -> None:
    if target_dir.exists():
        shutil.rmtree(target_dir)
    staging_dir.rename(target_dir)


def deploy_frontend_bundle(source_frontend: Path, target_frontend: Path) -> None:
    standalone_dir = source_frontend / ".next" / "standalone"
    static_dir = source_frontend / ".next" / "static"
    public_dir = source_frontend / "public"

    if not standalone_dir.exists():
        raise FileNotFoundError(
            f"Missing frontend standalone output: {standalone_dir}. "
            "Run the frontend production build first."
        )
    if not static_dir.exists():
        raise FileNotFoundError(
            f"Missing frontend static assets: {static_dir}. "
            "Run the frontend production build first."
        )

    target_frontend.parent.mkdir(parents=True, exist_ok=True)
    staging_dir = target_frontend.parent / f".{target_frontend.name}.staging"
    prepare_empty_directory(staging_dir)

    shutil.copytree(standalone_dir, staging_dir, dirs_exist_ok=True)
    shutil.copytree(static_dir, staging_dir / ".next" / "static", dirs_exist_ok=True)

    if public_dir.exists():
        shutil.copytree(public_dir, staging_dir / "public", dirs_exist_ok=True)

    replace_directory(staging_dir, target_frontend)


def deploy_backend_code(source_backend: Path, target_backend: Path) -> BackendDeployResult:
    target_backend.mkdir(parents=True, exist_ok=True)

    shutil.copy2(source_backend / "pyproject.toml", target_backend / "pyproject.toml")
    for optional_file in ("poetry.lock", "uv.lock", "config.example.toml"):
        source_file = source_backend / optional_file
        if source_file.exists():
            shutil.copy2(source_file, target_backend / optional_file)

    package_source = source_backend / "swimming_best"
    package_target = target_backend / "swimming_best"
    staging_package = target_backend / ".swimming_best.staging"

    prepare_empty_directory(staging_package)
    shutil.copytree(
        package_source,
        staging_package,
        dirs_exist_ok=True,
        ignore=shutil.ignore_patterns("__pycache__", "*.pyc", "*.pyo"),
    )
    replace_directory(staging_package, package_target)

    (target_backend / "data").mkdir(parents=True, exist_ok=True)

    runtime_config = target_backend / "config.toml"
    example_config = target_backend / "config.example.toml"
    config_initialized = False
    if not runtime_config.exists() and example_config.exists():
        shutil.copy2(example_config, runtime_config)
        config_initialized = True

    return BackendDeployResult(
        config_initialized=config_initialized,
        preserved_runtime_entries=PRESERVED_BACKEND_RUNTIME_ENTRIES,
    )


def deploy_run_scripts(
    source_scripts: Path,
    target_frontend: Path,
    target_backend: Path,
) -> None:
    frontend_script = source_scripts / "run_frontend.sh"
    backend_script = source_scripts / "run_backend.sh"

    if frontend_script.exists():
        dest = target_frontend / "run_frontend.sh"
        shutil.copy2(frontend_script, dest)
        dest.chmod(dest.stat().st_mode | 0o755)

    if backend_script.exists():
        dest = target_backend / "run_backend.sh"
        shutil.copy2(backend_script, dest)
        dest.chmod(dest.stat().st_mode | 0o755)


def run_command(command: list[str], cwd: Path, env: dict[str, str] | None = None) -> None:
    subprocess.run(command, cwd=cwd, env=env, check=True)


def build_frontend(backend_origin: str) -> None:
    normalized_backend_origin = normalize_backend_origin(backend_origin)
    env = os.environ.copy()
    env["BACKEND_ORIGIN"] = normalized_backend_origin
    print(
        "[deploy] building frontend with BACKEND_ORIGIN="
        f"{normalized_backend_origin}"
    )
    run_command(["npm", "run", "build"], cwd=FRONTEND_DIR, env=env)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build and deploy Swimming Best frontend/backend artifacts.",
    )
    parser.add_argument(
        "--target-root",
        type=Path,
        default=Path(os.environ.get("DEPLOY_ROOT", DEFAULT_TARGET_ROOT)),
        help="Deployment root. Defaults to /data/product/swimming-best.",
    )
    parser.add_argument(
        "--backend-origin",
        default=os.environ.get("BACKEND_ORIGIN", DEFAULT_BACKEND_ORIGIN),
        help=(
            "Backend origin used by the Next.js standalone server rewrite. "
            "Browser-side requests still stay on /api/*."
        ),
    )
    parser.add_argument(
        "--skip-frontend-build",
        action="store_true",
        help="Reuse the current frontend build output instead of running npm run build.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    target_root = args.target_root.resolve()
    frontend_target = target_root / "frontend"
    backend_target = target_root / "backend"

    if not args.skip_frontend_build:
        build_frontend(args.backend_origin)

    deploy_frontend_bundle(FRONTEND_DIR, frontend_target)
    backend_result = deploy_backend_code(BACKEND_DIR, backend_target)
    deploy_run_scripts(SCRIPTS_DIR, frontend_target, backend_target)

    print(f"[deploy] frontend deployed to {frontend_target}")
    print(f"[deploy] backend deployed to {backend_target}")
    print(
        f"[deploy] run scripts deployed: "
        f"{frontend_target / 'run_frontend.sh'}, "
        f"{backend_target / 'run_backend.sh'}"
    )
    if backend_result.config_initialized:
        print(
            f"[deploy] initialized {backend_target / 'config.toml'} from config.example.toml"
        )
    else:
        print(f"[deploy] preserved existing {backend_target / 'config.toml'}")
    print(
        "[deploy] preserved backend runtime entries: "
        + ", ".join(backend_result.preserved_runtime_entries)
    )
    print(
        "[deploy] frontend pages still call /api/*; production standalone rewrites "
        f"/api/* to {normalize_backend_origin(args.backend_origin)}/api/*"
    )
    print(
        "[deploy] if your reverse proxy terminates traffic first, keep browser-facing "
        "/api routes unchanged and route /api to Flask"
    )
    print(
        "[deploy] if the Next.js standalone server must proxy by itself, set "
        "--backend-origin or BACKEND_ORIGIN before building"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
