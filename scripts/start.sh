#!/usr/bin/env bash

set -e

pnpm db:up
pnpm db:schema
pnpm db:outbox

backend_pid=
worker_pid=

cleanup() {
    kill "$backend_pid" "$worker_pid" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

pnpm app:run &
backend_pid=$!

uv run --project etl sla-outbox-worker &
worker_pid=$!

wait -n "$backend_pid" "$worker_pid"
