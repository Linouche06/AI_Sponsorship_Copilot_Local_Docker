#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
docker compose exec -T n8n mkdir -p /tmp/copilot-validation/tests
docker compose cp tests/workflows.test.cjs n8n:/tmp/copilot-validation/tests/workflows.test.cjs
docker compose cp workflows/. n8n:/tmp/copilot-validation/workflows
docker compose exec -T n8n node --test /tmp/copilot-validation/tests/workflows.test.cjs
