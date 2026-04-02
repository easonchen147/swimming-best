#!/usr/bin/env bash

set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="${FRONTEND_RUNTIME_DIR:-$APP_ROOT/runtime}"
PID_FILE="${FRONTEND_PID_FILE:-$RUNTIME_DIR/frontend.pid}"
LOG_FILE="${FRONTEND_LOG_FILE:-$RUNTIME_DIR/frontend.log}"
ENV_FILE="${FRONTEND_ENV_FILE:-$RUNTIME_DIR/frontend.env}"
SERVER_FILE="${FRONTEND_SERVER_FILE:-$APP_ROOT/server.js}"
NODE_BIN="${FRONTEND_NODE_BIN:-node}"
HOST_VALUE="0.0.0.0"
PORT_VALUE="${PORT:-3000}"
NODE_ENV_VALUE="${NODE_ENV:-production}"

print_usage() {
  cat <<'EOF'
用法：
  ./run_frontend.sh start [--nohup]
  ./run_frontend.sh start-bg
  ./run_frontend.sh stop
  ./run_frontend.sh restart [--nohup]
  ./run_frontend.sh status
  ./run_frontend.sh logs [行数]

说明：
  start           前台启动 Next standalone，日志直接输出到当前终端
  start --nohup   后台启动，日志写入 runtime/frontend.log
  start-bg        等价于 start --nohup
  stop            停止后台进程
  restart         先 stop 再 start
  status          查看当前运行状态
  logs            查看日志，默认尾部 50 行

环境变量：
  HOSTNAME              监听地址，默认 0.0.0.0
  PORT                  监听端口，默认 3000
  NODE_ENV              默认 production
  FRONTEND_RUNTIME_DIR  运行时目录，默认 ./runtime
  FRONTEND_PID_FILE     pid 文件路径
  FRONTEND_LOG_FILE     日志文件路径
  FRONTEND_ENV_FILE     运行参数记录文件路径
  FRONTEND_SERVER_FILE  server.js 路径，默认 ./server.js
  FRONTEND_NODE_BIN     node 可执行文件路径，默认 node
EOF
}

ensure_runtime_layout() {
  mkdir -p "$RUNTIME_DIR"
  mkdir -p "$(dirname "$PID_FILE")"
  mkdir -p "$(dirname "$LOG_FILE")"
  mkdir -p "$(dirname "$ENV_FILE")"
}

write_runtime_env() {
  cat >"$ENV_FILE" <<EOF
HOSTNAME=$HOST_VALUE
PORT=$PORT_VALUE
NODE_ENV=$NODE_ENV_VALUE
SERVER_FILE=$SERVER_FILE
NODE_BIN=$NODE_BIN
EOF
}

read_runtime_value() {
  local key="$1"

  if [[ ! -f "$ENV_FILE" ]]; then
    return 1
  fi

  awk -F= -v key="$key" '$1 == key { print substr($0, index($0, "=") + 1); exit }' "$ENV_FILE"
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

require_server_file() {
  if [[ ! -f "$SERVER_FILE" ]]; then
    cat >&2 <<EOF
[frontend] 未找到 Next standalone 入口：$SERVER_FILE
[frontend] 请先完成前端构建并确认部署目录包含 server.js
EOF
    return 1
  fi
}

resolve_node_bin() {
  if command -v "$NODE_BIN" >/dev/null 2>&1; then
    printf '%s\n' "$NODE_BIN"
    return 0
  fi

  cat >&2 <<EOF
[frontend] 未找到 Node.js 可执行文件：$NODE_BIN
[frontend] 请先安装 Node.js，或通过 FRONTEND_NODE_BIN 指定 node 路径
EOF
  return 1
}

start_foreground() {
  local node_bin

  if is_running; then
    echo "[frontend] 已在运行，PID=$(read_pid)"
    return 1
  fi

  ensure_runtime_layout
  require_server_file
  node_bin="$(resolve_node_bin)"
  write_runtime_env

  echo "[frontend] 前台启动：$node_bin $SERVER_FILE"
  echo "[frontend] HOSTNAME=$HOST_VALUE PORT=$PORT_VALUE NODE_ENV=$NODE_ENV_VALUE"
  cd "$APP_ROOT"
  exec env \
    HOSTNAME="$HOST_VALUE" \
    PORT="$PORT_VALUE" \
    NODE_ENV="$NODE_ENV_VALUE" \
    "$node_bin" "$SERVER_FILE"
}

start_background() {
  local node_bin pid

  if is_running; then
    echo "[frontend] 已在运行，PID=$(read_pid)"
    return 1
  fi

  ensure_runtime_layout
  require_server_file
  node_bin="$(resolve_node_bin)"
  write_runtime_env
  touch "$LOG_FILE"

  echo "[frontend] 后台启动中，日志输出到 $LOG_FILE"
  (
    cd "$APP_ROOT"
    exec nohup env \
      HOSTNAME="$HOST_VALUE" \
      PORT="$PORT_VALUE" \
      NODE_ENV="$NODE_ENV_VALUE" \
      "$node_bin" "$SERVER_FILE" >>"$LOG_FILE" 2>&1
  ) &
  pid=$!
  printf '%s\n' "$pid" >"$PID_FILE"

  sleep 1
  if kill -0 "$pid" 2>/dev/null; then
    echo "[frontend] 启动成功，PID=$pid"
    echo "[frontend] 查看状态：./run_frontend.sh status"
    echo "[frontend] 日志文件：$LOG_FILE"
    return 0
  fi

  rm -f "$PID_FILE"
  echo "[frontend] 启动失败，请检查日志：$LOG_FILE" >&2
  return 1
}

stop_frontend() {
  local pid waited

  if ! is_running; then
    echo "[frontend] 当前未运行"
    return 0
  fi

  pid="$(read_pid)"
  echo "[frontend] 正在停止，PID=$pid"
  kill "$pid"

  for waited in $(seq 1 20); do
    if ! kill -0 "$pid" 2>/dev/null; then
      rm -f "$PID_FILE"
      echo "[frontend] 已停止"
      return 0
    fi
    sleep 0.5
  done

  echo "[frontend] 停止超时，请手动检查进程：$pid" >&2
  return 1
}

show_status() {
  local host port node_env

  host="$(read_runtime_value HOSTNAME 2>/dev/null || printf '%s' "$HOST_VALUE")"
  port="$(read_runtime_value PORT 2>/dev/null || printf '%s' "$PORT_VALUE")"
  node_env="$(read_runtime_value NODE_ENV 2>/dev/null || printf '%s' "$NODE_ENV_VALUE")"

  if is_running; then
    echo "[frontend] running, PID=$(read_pid), host=$host, port=$port, node_env=$node_env, log=$LOG_FILE"
    return 0
  fi

  echo "[frontend] not running"
  return 1
}

show_logs() {
  local lines="${1:-50}"

  ensure_runtime_layout
  if [[ ! -f "$LOG_FILE" ]]; then
    echo "[frontend] 日志文件不存在：$LOG_FILE"
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
      stop_frontend "$@"
      ;;
    restart)
      stop_frontend
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
      echo "[frontend] 未知命令：$command" >&2
      print_usage >&2
      return 1
      ;;
  esac
}

main "$@"
