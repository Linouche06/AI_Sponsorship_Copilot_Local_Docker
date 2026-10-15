# Local AI: Ollama (replaces OpenAI Cloud)

This package includes a local **Ollama** container and replaces the two OpenAI Chat Model nodes with **Ollama Chat Model** nodes, using `qwen2.5:3b`. No OpenAI API credits are needed.

**After import:** Open the two Ollama Model nodes and create/select an **Ollama** credential with Base URL `http://ollama:11434` and no API key. Verify that the selected model is `qwen2.5:3b`. The first `bash start.sh` downloads that model (roughly a few GB). The model is stored in the `ollama_data` Docker volume, not downloaded on each start.

**Security:** Ollama is bound to local loopback on port 11434. Keep your n8n credentials private. Telegram still requires an HTTPS webhook tunnel for real incoming updates. Stop n8n Cloud Telegram trigger before enabling the local trigger. Gmail, Google Sheets and Telegram credentials must be reconnected in local n8n; and `Call Company Analysis` must be pointed to the newly imported local workflow. Import exports as inactive and activate after validation.

**Mac performance:** If Ollama is too slow or Docker runs out of RAM, increase Docker Desktop memory allocation or choose a smaller Ollama model; update the model in both the startup script and the two model nodes.

---

# AI Sponsorship Copilot — n8n Local Docker Migration

This is a **portable copy of your four uploaded n8n Cloud workflows**, not a replacement implementation. Their node logic, links, Google Sheet document/tab selections and scheduling are preserved. Cloud-specific credential references and old workflow references were stripped so you can rebind them on the local instance.

## Quick start (Mac, Docker Desktop running)

```bash
cd /path/to/AI_Sponsorship_Copilot_Local_Docker
bash start.sh
```

Open http://localhost:5678 and create your n8n local owner account. Check containers via `bash check.sh`. The Docker Compose setup includes **n8n, a task runner and PostgreSQL**, with fixed image tags and persistent named volumes. Google Sheets remains on Google Drive.

## Import four workflows

Import each file via n8n **New workflow → menu (...) → Import from File**:

1. `workflows/02_Company_Analysis.json`
2. `workflows/03_Error_Logger.json`
3. `workflows/01_Telegram_Main.json`
4. `workflows/04_Daily_Followups.json`

They are deliberately imported **inactive** so no automatic email or reminder is sent inadvertently.

## Reconnect external credentials

In the imported nodes, create/select credentials for:
- **Google Sheets** (all 4 workflows) — OAuth2. Existing `AI_Sponsorship_Database_Template` document and existing tabs remain the data source. If sheet dropdown errors appear, re-select the document and tab in every Sheets node.
- **Ollama** (AI analysis and email draft models) — create/select an Ollama credential with Base URL `http://ollama:11434`, no API key, and model `qwen2.5:3b`.
- **Gmail** (Main → Gmail Send Approved) — OAuth2; self-hosted redirect URI differs from Cloud. For Google OAuth, register the exact callback URL shown by n8n in Google Cloud OAuth settings. Use a suitable HTTPS public URL when applicable.
- **Telegram** (Main Trigger / Send Message and Followups → Send Reminder) — token from BotFather. Your local n8n needs a public HTTPS address to **receive Telegram events**.

## Critical: relink workflow references

- **Main → Call Company Analysis:** select the imported **02 Company Analysis** as the target in the node; verify the `company` and `chat_id` inputs are passed. This node intentionally has NO target until you choose it.
- **Main → Settings → Error Workflow:** select the imported **03 Error Logger**. Also configure the logger on other workflows if desired.
- Check that the 02 Company Analysis trigger accepts all input data (or declare `company` and `chat_id` inputs) so both command flows work.

## Telegram public webhook is required

Local `http://localhost:5678` is NOT reachable by Telegram. Set up an HTTPS tunnel or VPS reverse proxy with a stable public URL. When you obtain a public URL, add this line to `.env`:

```dotenv
WEBHOOK_URL=https://YOUR-PUBLIC-HOST/
```

Then run `docker compose up -d --force-recreate n8n`. The Compose configuration passes `WEBHOOK_URL` through when defined. Use a secure, access-controlled tunnel; never expose a plaintext or unauthenticated n8n editor to the public internet. The Telegram webhook requires a stable HTTPS endpoint, and local n8n editor may need proper external host / cookie settings for OAuth and webhooks.

**Only one active Telegram Trigger for a bot:** deactivate the Cloud instance before publishing the Docker main workflow. Otherwise they will compete for Telegram's single webhook.

## Recommended activation / test order

1. Connect Google Sheets in Company Analysis; run a **non-sending** test.
2. Connect Ollama; verify `/analyze` outputs expected score and explanation.
3. Reconnect Gmail but **use only your personal email in all company rows**. Validate `/pitch`, its saved draft, and approval authorization before using `/approve`.
4. Connect Telegram after HTTPS tunnel works, disable the Cloud Telegram Trigger, then publish the Docker main workflow.
5. Test your error workflow. Publish the 09:00 Followups workflow only after ensuring owner chat IDs and due dates are correct.

## Scoping and evaluation caveat

**The PostgreSQL container currently backs n8n's own persistent database; it does not yet store application sponsor records.** The professor's separate database criterion explicitly excludes Google Sheets alone. You must add a PostgreSQL node/queries persisting actual sponsorship-related data to satisfy that criterion. See `postgres/README.md` for an illustrative migration path, not an already-wired node.

## What cannot transfer automatically

Credential secrets, hosted OpenAI gateway credits, Google OAuth callback settings, current running executions, webhook registration, Cloud IDs and workflow permission settings. The exported workflow graphs still require end-to-end testing in your local n8n instance. Validate all four before presenting.

## Basic commands

```bash
bash start.sh                  # first-time start / generated .env
bash check.sh                  # containers
 docker compose logs -f n8n    # follow logs
bash stop.sh                   # stop without deleting volumes
```

Never run `docker compose down -v` unless you intend to erase local Postgres/n8n volumes. Never commit `.env` or API tokens. Compare your live demo to the final exported JSON committed to your Git repository.
