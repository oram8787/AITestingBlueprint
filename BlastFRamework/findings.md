# 🔍 Findings — JIRA Test Plan Generator

**Updated:** 2026-06-14

---

## API Findings

### JIRA Cloud REST API v3
- **Base URL pattern:** `https://{domain}.atlassian.net`
- **Issue endpoint:** `GET /rest/api/3/issue/{issueKey}`
- **Auth:** Basic Auth — `Authorization: Basic base64(email:apiToken)`
- **Description format:** Atlassian Document Format (ADF) — a nested JSON object, NOT plain text. Must be recursively extracted before sending to LLM.
- **CORS:** JIRA Cloud does NOT allow cross-origin browser requests. Vite dev proxy required (`/jira-proxy` → `https://ramesh-ogipuram.atlassian.net`).
- **Proxy config:** Reads `JIRA_BASE_URL` from `../.env` (parent directory) using Vite's `loadEnv`. Origin extracted via `new URL(...).origin`.

### Groq API
- **Base URL:** `https://api.groq.com/openai/v1`
- **Endpoint:** `POST /chat/completions`
- **Auth:** `Authorization: Bearer {groqApiKey}`
- **Model specified:** `openai/gpt-oss-120b` (user-specified, verify availability at https://console.groq.com/docs/models)
- **CORS:** Groq supports browser CORS — direct fetch works without proxy.
- **Temperature:** Set to 0.1 for near-deterministic test plan output.
- **⚠️ Model verification needed:** `openai/gpt-oss-120b` may be a new/updated model. If it returns a 404 or model-not-found error, check Groq console for correct model ID.

---

## ADF (Atlassian Document Format) Parser Notes
- ADF is a tree structure with `type`, `content`, and `text` nodes.
- Recursive extraction needed: walk `content` arrays, collect `type: "text"` `.text` values.
- `type: "hardBreak"` → `\n`
- `type: "paragraph"` → join children + `\n`
- Other node types → join children without separator.
- Null/missing description → emit `''` (handled by Groq prompt as "not provided").

---

## JIRA Instance Details
- **Domain:** `ramesh-ogipuram.atlassian.net`
- **Project:** KAN
- **Default ticket:** KAN-1
- **Board URL (from .env):** `https://ramesh-ogipuram.atlassian.net/jira/software/projects/KAN/boards/35`
- **API base URL (extracted):** `https://ramesh-ogipuram.atlassian.net`

---

## Constraints
- App is client-side only — no Express/Node backend.
- Vite proxy is development-only. For production, a backend proxy would be needed.
- Credentials in component state only — cleared on page refresh.
- Tailwind CSS via PostCSS — requires `npm install` before `npm run dev`.
