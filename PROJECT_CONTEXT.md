# Project context

AI Sponsorship Copilot automates sponsorship research and outreach through four n8n workflows:

1. Telegram Main: command handling, pitch drafts, approval and Gmail delivery.
2. Company Analysis: sponsorship analysis with a local Ollama model.
3. Error Logger: workflow error reporting.
4. Daily Followups: scheduled follow-up reminders.

The referenced ChatGPT chat requested a downloadable package, migration of four n8n Cloud workflows to local Docker, and replacement of OpenAI Cloud model nodes with Ollama. Its retrieved history contains only placeholders for generated assistant replies; this repository is based on the supplied local project files.

Docker Compose runs n8n, an external task runner, PostgreSQL and Ollama. PostgreSQL currently stores n8n infrastructure data; sponsorship records remain in Google Sheets. Telegram, Gmail and Google Sheets require local credential setup. Telegram events also require a public HTTPS webhook. The imported workflows are inactive and need credential and workflow references reconnected before activation.

Private configuration, credentials, runtime volumes and logs are excluded from version control. See README.md and OLLAMA_SETUP.md for setup and validation.
