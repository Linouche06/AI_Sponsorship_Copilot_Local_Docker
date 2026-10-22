# Local Docker diagnostic report — October 22, 2026

## Fixed

- Restored the existing persistent-volume encryption key in private `.env` to resolve n8n startup crashes.
- Aligned the PostgreSQL role password with n8n configuration after backing up database role settings.
- Corrected the Ollama port mapping to `127.0.0.1:11435:11434`.
- Imported all four supplied workflows as inactive. Connected their analysis and error-workflow references and the local Ollama credential.
- Fixed an email approval check that allowed `[Sender Name]` placeholders to pass.
- Added repeatable health checks (`bash check.sh`) and workflow logic tests (`bash test.sh`).

## Verified

- n8n database readiness returns HTTP 200 at `http://localhost:5678/healthz/readiness`.
- PostgreSQL is healthy; JavaScript and Python task runners registered successfully.
- Ollama is reachable from n8n at `http://ollama:11434`, and from the Mac at `http://localhost:11435`.
- `qwen2.5:3b` is downloaded and returned `OK` in a harmless inference test from inside n8n.
- All 10 isolated regression tests pass: graph integrity and code syntax, Telegram parsing, CRM command values, draft formatting, analysis formatting, email approval validation, and follow-up selection.
- All four imported workflows match the corrected JSON exports and remain inactive.

## Still required for end-to-end operation

The local database initially contained no workflows or integration credentials. Google Sheets, Gmail, and Telegram credentials still need to be configured in local n8n. Inbound Telegram events also require a working public HTTPS webhook. Verify the Google Sheet selections, the Organization approver Telegram ID, and company contact details before enabling the workflow. None of the tests sent emails, sent Telegram messages, or modified Google Sheets.

These checks establish Docker and local model health plus isolated workflow logic. They do not establish a successful end-to-end Telegram /analyze, /pitch or /approve execution through Google integrations.

Private configuration/database backups are in the ignored `backups/` directory. The encryption key and passwords were not printed or placed in version control. Changes remain local pending a request to commit and push.

## Credential and spreadsheet mapping update

Recovered the previous local Google Sheets and Gmail OAuth credentials and imported them into this n8n instance. Bound all 21 Google Sheets nodes and the Gmail node to their matching credential types. Verified the live workbook in signed-in Chrome and all six referenced tab IDs: Companies 886497081; Analyses 1797842587; Drafts 243984214; ErrorLogs 767686323; Organization 1094237790; Pipeline 700152727. Existing workbook data is preserved. `Read Pipeline` intentionally reads Analyses; `Read Pipeline CRM` reads Pipeline, and the formatter merges both datasets.

Both recovered Google tokens fail renewal and need sign-in again. Signing in as the spreadsheet owner b00820945@essec.edu is currently blocked by Google with 403 access_denied because that account is not on the existing n8n test OAuth app's approved test-user list. User approval is requested before adding it. No working Google connection is claimed until renewed access is tested.

The old local instance contained no Telegram credential. The existing bot token must be supplied through local n8n before the three Telegram nodes can be bound. Workflows remain inactive. No messages were sent and no Google Sheets data was changed.

## Google authorization blocker

The user approved adding b00820945@essec.edu as an OAuth test user. The OAuth app owner is oumhand.lina@gmail.com. Google Cloud currently blocks that owner's Console access until two-step verification is enabled. No test-user change has been made yet. The user must complete MFA setup personally; after that, add the approved school account and renew both Google connections before validating Sheets access. The Google Cloud requirement was observed directly in Chrome; no account-security setting was changed.

## Latest verification

Google Cloud access is restored. Added the approved school account to the existing OAuth app test-user list and verified the saved table. Google Sheets now returns HTTP 200 for the sponsorship workbook. Read the header rows on Companies, Analyses, Drafts, ErrorLogs, Organization and Pipeline and verified the Sheets nodes' document IDs, tab IDs and matching columns. All 21 Sheets nodes are attached. The Organization sender email is oumhand.lina@gmail.com.

The user added a Telegram credential; getMe succeeds, and all three Telegram nodes are now attached. Preserved the user's published Error Logger; the other workflows remain inactive.

Gmail remains HTTP 401 until authorization renewal completes. Its sign-in is paused at Google's unverified-app warning. Automatic approval review rejected the Continue action as a security-warning bypass; requested user handoff. No workaround or retry was attempted. No emails or Telegram messages were sent during these checks.

## Gmail renewal completed

The user completed the Google authorization warning and sign-in. Read-only Gmail profile verification now returns HTTP 200 for oumhand.lina@gmail.com, matching the configured sender. Final live-node audit found 21 Google Sheets nodes, three Telegram nodes, two Ollama model nodes, and one Gmail node; all reference existing credentials of the correct type. There are no missing integration credential bindings. Error Logger remains published; the other workflows remain inactive. No outbound messages were sent.
