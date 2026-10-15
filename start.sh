#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Install and launch Docker Desktop first." >&2
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop engine is not running. Start Docker Desktop first." >&2
  exit 1
fi
if [[ ! -f .env ]]; then
  if ! command -v openssl >/dev/null 2>&1; then
    echo "OpenSSL is required to generate the local secrets." >&2
    exit 1
  fi
  umask 077
  cat > .env <<EOF
POSTGRES_USER=n8n
POSTGRES_DB=n8n
POSTGRES_PASSWORD=$(openssl rand -hex 24)
N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
RUNNERS_AUTH_TOKEN=$(openssl rand -hex 32)
EOF
  chmod 600 .env
  echo "Generated your private .env (do not upload or commit it)."
fi
docker compose config --quiet
docker compose up -d
echo "Downloading local Ollama model qwen2.5:3b (first run may take a while)..."
docker compose exec -T ollama ollama pull qwen2.5:3b
echo
echo "n8n starting at http://localhost:5678"
echo "Check services: docker compose ps"
echo "Logs: docker compose logs -f n8n"
