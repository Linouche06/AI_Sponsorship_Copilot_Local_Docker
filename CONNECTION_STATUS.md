# Verified connection status

- Google Sheets: sponsorship workbook access succeeds (HTTP 200). All 21 nodes use the correct document, tab and Google credential. Header rows on all six referenced tabs and matching columns were checked.
- Gmail: renewed authorization succeeds (read-only profile HTTP 200). Connected sender is oumhand.lina@gmail.com, matching Organization.sender_email. The Gmail node references this credential.
- Telegram: bot identity check succeeds. All three Telegram nodes reference the valid local credential.
- Ollama: both model nodes reference the local Docker credential; qwen2.5:3b previously passed an inference test.
- No integration nodes have missing credential references.

The Error Logger is published. Main, Analysis and Followups remain inactive. Existing activation choices were preserved. Incoming Telegram events still require a working public HTTPS webhook and migration away from the cloud bot webhook before enabling the local trigger.

These checks confirm authentication, node bindings, sheet selection and isolated workflow logic. No emails or Telegram messages were sent, no sheet cells were changed, and a full live outreach execution has not been performed. Credential secrets and runtime backups are excluded from version control.
