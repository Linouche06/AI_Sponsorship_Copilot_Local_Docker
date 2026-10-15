#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
docker compose ps
docker compose exec postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
