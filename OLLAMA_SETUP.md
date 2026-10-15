# Ollama checklist

1. `bash start.sh` (starts containers and pulls `qwen2.5:3b`).
2. Check: `docker compose exec ollama ollama list`.
3. Open http://localhost:5678, import four workflow JSON files.
4. For both `Ollama Model (Draft)` and `Ollama Model (Analysis)` create Ollama credentials pointing to `http://ollama:11434`; select model `qwen2.5:3b`.
5. Reconnect Google Sheets, Gmail, Telegram credentials, select local Company Analysis sub-workflow, and select local Error Logger in workflow Settings.
6. Keep Cloud bot inactive when enabling the local Telegram trigger. For inbound Telegram events, configure public HTTPS tunnel/Webhook URL.
7. Test /analyze and /pitch before approving any draft; use only your own email in company contact fields for testing.
8. Recheck generated text carefully; local model output can be less accurate than OpenAI Cloud.
