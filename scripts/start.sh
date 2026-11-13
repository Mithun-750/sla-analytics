#!/usr/bin/env bash

set -e

pnpm db:up
pnpm db:schema
pnpm db:outbox

backend_pid=
worker_pid=
frontend_pid=

cleanup() {
    kill "$backend_pid" "$worker_pid" "$frontend_pid" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

pnpm be:run &
backend_pid=$!

uv run --project etl sla-outbox-worker &
worker_pid=$!

pnpm fe:dev &
frontend_pid=$!

wait -n "$backend_pid" "$worker_pid" "$frontend_pid"
