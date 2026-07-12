# findings.md — Research, Discoveries & Constraints
# JIRA AI Agent: Test Plan Generator

> Updated after each meaningful task per the B.L.A.S.T. Data-First Rule.

---

## Phase 1: Blueprint Discoveries

### North Star (Confirmed)
Given a JIRA issue ID (KAN-1), the system fetches the issue and generates a structured, AI-powered Test Plan delivered in a React web UI.

### Discovery Q&A Summary

| Question         | Answer                                                                  |
|------------------|-------------------------------------------------------------------------|
| North Star       | Auto-generate a Test Plan from a JIRA issue ID                          |
| Integrations     | JIRA REST API v3 + Groq AI API — both keys confirmed in `.env`          |
| Source of Truth  | JIRA project: KAN, Board ID: 35, issue: KAN-1                           |
| Delivery Payload | React web app (localhost:5173) displaying structured test plan          |
| Behavioral Rules | JSON output, 3–6 test cases, Functional/Negative/Edge/Integration types |

---

## Phase 2: Link Discoveries

### JIRA API (REST v3)

- **Base URL pattern:** `https://{org}.atlassian.net/rest/api/3/issue/{issueKey}`
- **Auth method:** HTTP Basic Auth — `base64(email:apiToken)` in `Authorization` header
- **CRITICAL:** The user's `JIRA_BASE_URL` in `.env` is a board URL, not the API base.
  - Raw: `https://ramesh-ogipuram.atlassian.net/jira/software/projects/KAN/boards/35`
  - Extracted origin: `https://ramesh-ogipuram.atlassian.net`
  - Fix applied: `new URL(rawUrl).origin` strips path automatically in `server.js`
- **Description format:** JIRA API v3 returns description as **Atlassian Document Format (ADF)** — a nested JSON object, NOT a plain string. Must be traversed recursively via `parseAdf()` before passing to LLM.

### Groq API

- **Base URL:** `https://api.groq.com/openai/v1` (OpenAI-compatible)
- **Auth:** `Authorization: Bearer {GROQ_KEY}`
- **Model used:** `openai/gpt-oss-120b` (FREE tier)
- **Endpoint:** `POST /chat/completions`
- **Prompt strategy:** Structured JSON schema prompt with `temperature: 0.3` for deterministic output
- **Response parsing:** Direct `JSON.parse()` → regex fallback `/{...}/s` → raw text display

### CORS Constraint

- JIRA API does **not** allow direct browser-to-API calls (CORS blocked).
- Fix applied: Express.js backend (`server.js`) acts as a local proxy on port 3001.
- Vite dev server proxies `/api/*` → `http://localhost:3001` via `vite.config.js`.

---

## Phase 3: Architect Discoveries

### File Structure Implemented

```
BLAST_Framework_JIRA_AIAgent1/
├── gemini.md                    # Project Constitution (LAW)
├── .env                         # API Keys — JIRA + Groq
├── architecture/
│   └── sop_test_plan_generator.md
├── server.js                    # Express backend (Layer 3 proxy)
├── vite.config.js               # Vite proxy /api → localhost:3001
├── package.json                 # npm scripts + dependencies
├── src/                         # React frontend (Layer 3 UI)
│   ├── App.jsx                  # Tab navigation + localStorage config
│   ├── main.jsx
│   ├── index.css                # Dark theme CSS token system
│   └── components/
│       ├── SettingsView.jsx     # Settings tab (localStorage + server status)
│       ├── GenerateView.jsx     # Generate tab (issue ID input + results)
│       └── TestPlanDisplay.jsx  # Issue card + test plan + test cases grid
└── .tmp/                        # Ephemeral intermediates
```

### Key Implementation Decisions

| Decision                            | Reason                                                        |
|-------------------------------------|---------------------------------------------------------------|
| Express proxy (not serverless)      | Avoids CORS; keeps credentials server-side as fallback        |
| `localStorage` for credentials      | User can save settings in browser without editing `.env`      |
| `.env` as server fallback           | Zero-config startup if `.env` is pre-filled                   |
| `/api/config` endpoint              | Exposes `.env` status to UI without user re-entering values   |
| ADF parser (recursive)              | JIRA v3 API returns nested ADF, not plain text                |
| Temperature 0.3                     | Deterministic test case generation; reproducible output       |
| JSON fallback to raw text           | Self-healing: never crashes if LLM ignores JSON instruction   |

---

## Phase 4: Stylize Discoveries

### UI Redesign (Dark Theme)

- **Credential storage strategy:** `localStorage` takes priority, falls back to server `.env`. This means users can override `.env` values per-browser without touching files.
- **Tab navigation pattern:** Single-page app with two views (Generate / Settings) — avoids routing complexity for a lightweight tool.
- **Warning banner trigger:** Checked on every render via `hasCredentials` boolean — computed from merged config.
- **Server `.env` status panel:** Calls `/api/config` on app mount; shows live set/not set status for each field. Helps diagnose missing `.env` entries without exposing actual values.
- **CSS token system:** All colors defined as CSS custom properties (`--bg`, `--surface`, `--accent`, etc.) for easy future theming.
- **Test case type badge colors (dark mode):**
  - Functional → Indigo (#818CF8)
  - Negative → Red (#F87171)
  - Edge Case → Amber (#FBBF24)
  - Integration → Green (#34D399)

---

## Known Constraints

| Constraint                              | Impact                                           |
|-----------------------------------------|--------------------------------------------------|
| JIRA API v3 ADF description format      | Must parse before LLM prompt                     |
| Groq model returns markdown sometimes   | Regex fallback + raw text display in place       |
| Board URL ≠ API base URL in .env        | `new URL().origin` extraction required           |
| CORS on JIRA API                        | Express proxy required (not a pure React app)    |
| Groq free tier rate limits              | ~30 req/min; fine for single-user local tool     |
| Port conflicts on restart               | Use `npx kill-port 3001 5173` before `npm run dev` |

---

## GitHub Resources Referenced

- [atlassian/jira-python](https://github.com/pycontribs/jira) — Python JIRA client (reference for API structure)
- [Groq OpenAI-compatible docs](https://console.groq.com/docs/openai) — Groq API compatibility reference
- [vitejs/vite](https://github.com/vitejs/vite) — Vite proxy config for local dev

---

## Self-Annealing Log

| Date       | Error                               | Resolution                                    |
|------------|-------------------------------------|-----------------------------------------------|
| 2026-06-13 | Port 3001 EADDRINUSE on restart     | Kill existing process via `npx kill-port`     |
| 2026-06-13 | `.env` JIRA_EMAIL truncated         | Updated to `oram8787@gmail.com`               |
