#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
docker compose ps
docker compose exec -T postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
docker compose exec -T n8n node <<'JS'
(async () => {
  const ready = await fetch('http://localhost:5678/healthz/readiness', { signal: AbortSignal.timeout(10000) });
  if (!ready.ok) throw new Error(`n8n readiness failed: HTTP ${ready.status}`);
  console.log('n8n database readiness: OK');
  const response = await fetch('http://ollama:11434/api/tags', { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Ollama failed: HTTP ${response.status}`);
  const data = await response.json();
  if (!(data.models || []).some(m => m.name === 'qwen2.5:3b')) throw new Error('Ollama model qwen2.5:3b is missing. Run bash start.sh.');
  console.log('n8n to Ollama connection and qwen2.5:3b: OK');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
JS
