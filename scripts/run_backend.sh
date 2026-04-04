#!/usr/bin/env bash

set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="${BACKEND_RUNTIME_DIR:-$APP_ROOT/runtime}"
PID_FILE="${BACKEND_PID_FILE:-$RUNTIME_DIR/backend.pid}"
LOG_FILE="${BACKEND_LOG_FILE:-$RUNTIME_DIR/backend.log}"
CONFIG_FILE="${SWIMMING_BEST_CONFIG:-$APP_ROOT/backend/config.toml}"

print_usage() {
  cat <<'EOF'
用法：
  ./scripts/run_backend.sh start [--nohup]
  ./scripts/run_backend.sh start-bg
  ./scripts/run_backend.sh stop
  ./scripts/run_backend.sh restart [--nohup]
  ./scripts/run_backend.sh status
  ./scripts/run_backend.sh logs [行数]

说明：
  start           前台启动，日志直接输出到当前终端
  start --nohup   后台启动，日志写入 runtime/backend.log
  start-bg        等价于 start --nohup
  stop            停止后台进程
  restart         先 stop 再 start
  status          查看当前运行状态
  logs            查看日志，默认尾部 50 行

默认启动方式：
  Linux 环境默认通过 Gunicorn 启动。
  Windows 环境默认回退到 Waitress。

环境变量：
  SWIMMING_BEST_CONFIG           指定配置文件，默认 ./backend/config.toml
  BACKEND_RUNTIME_DIR            指定 runtime 目录，默认 ./runtime
  BACKEND_PID_FILE               指定 pid 文件路径
  BACKEND_LOG_FILE               指定日志文件路径
  BACKEND_RUNNER                 自定义启动命令，例如：
                                 BACKEND_RUNNER='uv run python -m swimming_best'
  SWIMMING_BEST_USE_FLASK_DEV    设为 1 时，显式改用 Flask 自带开发服务器
  SWIMMING_BEST_GUNICORN_WORKERS Gunicorn worker 数，默认 2
  SWIMMING_BEST_GUNICORN_THREADS Gunicorn 线程数，默认 4
EOF
}

ensure_runtime_layout() {
  mkdir -p "$RUNTIME_DIR"
  mkdir -p "$(dirname "$PID_FILE")"
  mkdir -p "$(dirname "$LOG_FILE")"
}

read_pid() {
  if [[ ! -f "$PID_FILE" ]]; then
    return 1
  fi

  local pid
  pid="$(tr -d '[:space:]' < "$PID_FILE")"
  if [[ -z "$pid" ]]; then
    rm -f "$PID_FILE"
    return 1
  fi

  printf '%s\n' "$pid"
}

is_running() {
  local pid
  if ! pid="$(read_pid)"; then
    return 1
  fi

  if kill -0 "$pid" 2>/dev/null; then
    return 0
  fi

  rm -f "$PID_FILE"
  return 1
}

resolve_runner() {
  if [[ -n "${BACKEND_RUNNER:-}" ]]; then
    printf '%s\n' "$BACKEND_RUNNER"
    return 0
  fi

  if command -v uv >/dev/null 2>&1; then
    printf 'uv run python -m swimming_best\n'
    return 0
  fi

  if command -v poetry >/dev/null 2>&1; then
    printf 'poetry run python -m swimming_best\n'
    return 0
  fi

  if command -v python3 >/dev/null 2>&1; then
    printf 'python3 -m swimming_best\n'
    return 0
  fi

  cat >&2 <<'EOF'
[backend] 未找到可用的 Python 启动器。
[backend] 请先在项目中安装依赖，例如：
[backend]   cd backend && uv sync
[backend] 或
[backend]   cd backend && poetry sync --with dev
EOF
  return 1
}

ensure_deps() {
  cd "$APP_ROOT/backend"

  if command -v uv >/dev/null 2>&1; then
    if [[ ! -d ".venv" ]]; then
      echo "[backend] 未检测到 .venv，正在初始化 uv 环境..."
      uv venv
    fi

    if [[ -f "uv.lock" ]]; then
      echo "[backend] 正在同步依赖 (uv sync --no-dev)..."
      uv sync --no-dev
    else
      echo "[backend] 未找到 uv.lock，正在安装依赖 (uv pip install -e .)..."
      uv pip install -e .
    fi
    echo "[backend] 依赖就绪"
    return 0
  fi

  if command -v poetry >/dev/null 2>&1; then
    if ! poetry env info --path >/dev/null 2>&1; then
      echo "[backend] 未检测到 poetry 环境，正在安装依赖..."
      poetry install --only main
      echo "[backend] 依赖就绪"
    fi
    return 0
  fi

  return 0
}

require_config() {
  if [[ ! -f "$CONFIG_FILE" ]]; then
    cat >&2 <<EOF
[backend] 未找到运行配置：$CONFIG_FILE
[backend] 首次部署可复制 config.example.toml：
[backend]   cp backend/config.example.toml backend/config.toml
EOF
    return 1
  fi
}

announce_server_mode() {
  if [[ "${SWIMMING_BEST_USE_FLASK_DEV:-0}" == "1" ]]; then
    echo "[backend] 当前显式使用 Flask 开发服务器"
  elif [[ "$(uname -s)" == "Linux" ]]; then
    echo "[backend] 当前使用 Gunicorn"
  else
    echo "[backend] 当前使用 Waitress"
  fi
}

start_foreground() {
  local runner

  if is_running; then
    echo "[backend] 已在运行，PID=$(read_pid)"
    return 1
  fi

  ensure_runtime_layout
  require_config
  ensure_deps
  runner="$(resolve_runner)"

  announce_server_mode
  echo "[backend] 前台启动：$runner"
  cd "$APP_ROOT/backend"
  exec env SWIMMING_BEST_CONFIG="$CONFIG_FILE" bash -lc "$runner"
}

start_background() {
  local runner pid

  if is_running; then
    echo "[backend] 已在运行，PID=$(read_pid)"
    return 1
  fi

  ensure_runtime_layout
  require_config
  ensure_deps
  runner="$(resolve_runner)"

  announce_server_mode
  echo "[backend] 后台启动中，日志输出到 $LOG_FILE"
  (
    cd "$APP_ROOT/backend"
    exec nohup env SWIMMING_BEST_CONFIG="$CONFIG_FILE" bash -lc "$runner" >>"$LOG_FILE" 2>&1
  ) &
  pid=$!
  printf '%s\n' "$pid" >"$PID_FILE"

  sleep 1
  if kill -0 "$pid" 2>/dev/null; then
    echo "[backend] 启动成功，PID=$pid"
    echo "[backend] 查看状态：./scripts/run_backend.sh status"
    echo "[backend] 查看日志：./scripts/run_backend.sh logs"
    return 0
  fi

  rm -f "$PID_FILE"
  echo "[backend] 启动失败，请检查日志：$LOG_FILE" >&2
  return 1
}

stop_backend() {
  local pid waited

  if ! is_running; then
    echo "[backend] 当前未运行"
    return 0
  fi

  pid="$(read_pid)"
  echo "[backend] 正在停止，PID=$pid"
  kill "$pid"

  for waited in $(seq 1 20); do
    if ! kill -0 "$pid" 2>/dev/null; then
      rm -f "$PID_FILE"
      echo "[backend] 已停止"
      return 0
    fi
    sleep 0.5
  done

  echo "[backend] 停止超时，请手动检查进程：$pid" >&2
  return 1
}

show_status() {
  if is_running; then
    echo "[backend] running, PID=$(read_pid), log=$LOG_FILE"
    return 0
  fi

  echo "[backend] not running"
  return 1
}

show_logs() {
  local lines="${1:-50}"

  ensure_runtime_layout
  if [[ ! -f "$LOG_FILE" ]]; then
    echo "[backend] 日志文件不存在：$LOG_FILE"
    return 1
  fi

  tail -n "$lines" "$LOG_FILE"
}

main() {
  local command="${1:-help}"
  shift || true

  case "$command" in
    start)
      if [[ "${1:-}" == "--nohup" ]]; then
        shift
        start_background "$@"
      else
        start_foreground "$@"
      fi
      ;;
    start-bg|nohup)
      start_background "$@"
      ;;
    stop)
      stop_backend "$@"
      ;;
    restart)
      stop_backend
      if [[ "${1:-}" == "--nohup" ]]; then
        shift
        start_background "$@"
      else
        start_foreground "$@"
      fi
      ;;
    status)
      show_status
      ;;
    logs)
      show_logs "${1:-50}"
      ;;
    help|-h|--help)
      print_usage
      ;;
    *)
      echo "[backend] 未知命令：$command" >&2
      print_usage >&2
      return 1
      ;;
  esac
}

main "$@"
