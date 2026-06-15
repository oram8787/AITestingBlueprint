# LLM.md — Project Constitution

> This file is law. Update only when schema changes, rules are added, or architecture is modified.
> Last updated: 2026-06-14

---

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Vite 5 + React 18 + TypeScript | Served from `dist/` |
| Local Backend | Express.js (`server.js`) | Port 3001, reads `.env` |
| Cloud Backend | Vercel Serverless Functions (`api/*.js`) | ESM, reads `process.env` |
| LLM | Groq API | Model: `llama-3.3-70b-versatile` |
| Export | `docx`, `jspdf`, `html2canvas`, native Blob | Browser-side only |
| Theming | CSS custom properties | `localStorage` key: `tsg-theme` |
| Config storage | `localStorage` | Key: `tsg-config` |

---

## Data Schema

### Input (Frontend → Backend `POST /api/generate`)
```json
{
  "jiraId": "KAN-1",
  "jiraBaseUrl": "https://ramesh-ogipuram.atlassian.net",
  "jiraEmail": "oram8787@gmail.com",
  "jiraApiToken": "ATATT...",
  "groqApiKey": "gsk_..."
}
```
> All fields except `jiraId` are optional — backend falls back to `.env` / `process.env` if empty.
> Tokens are never sent FROM the server TO the browser.

### Jira Story Payload (Jira REST API v3 → Backend)
```json
{
  "id": "10001",
  "key": "KAN-1",
  "fields": {
    "summary": "string",
    "description": { "type": "doc", "content": [...] },
    "components": [{ "name": "string" }],
    "labels": ["string"],
    "issuelinks": [{ "type": { "name": "string" }, "inwardIssue": { "key": "string" } }],
    "status": { "name": "string" },
    "priority": { "name": "string" },
    "issuetype": { "name": "string" },
    "customfield_10016": "string | ADF object",
    "customfield_10014": "string | ADF object",
    "customfield_10020": "string | ADF object"
  }
}
```
> `description` is Atlassian Document Format (ADF) — converted to plain text by `adfToText()`
> Acceptance criteria is checked across 3 custom fields; first non-empty value wins

### Groq Request (Backend → Groq API)
```json
{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    { "role": "system", "content": "<SYSTEM_PROMPT — see below>" },
    { "role": "user", "content": "<serialized Jira story fields as plain text>" }
  ],
  "temperature": 0,
  "max_tokens": 4096
}
```
> `temperature: 0` enforces deterministic output (same Jira story → same Test Strategy)

### Success Response (Backend → Frontend)
```json
{
  "success": true,
  "jiraKey": "KAN-1",
  "summary": "Story summary text",
  "testStrategy": "# Test Strategy: KAN-1\n\n## 1. Objective\n..."
}
```

### Error Response Shape
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

**Error codes:**

| Code | HTTP | Cause |
|------|------|-------|
| `MISSING_JIRA_ID` | 400 | No JIRA ID in request body |
| `MISSING_JIRA_CREDS` | 400 | Base URL, email, or token missing from both request and `.env` |
| `MISSING_GROQ_KEY` | 400 | Groq key missing from both request and `.env` |
| `AUTH_FAILED` | 401 | Jira returned 401 or 403 |
| `GROQ_AUTH_FAILED` | 401 | Groq returned 401 |
| `JIRA_NOT_FOUND` | 404 | Jira returned 404 |
| `JIRA_TIMEOUT` | 408 | Jira connection timed out (15s) |
| `GROQ_TIMEOUT` | 408 | Groq connection timed out (45s) |
| `RATE_LIMIT` | 429 | Groq rate limit hit |
| `JIRA_ERROR` | 502 | Other Jira API failure |
| `GROQ_EMPTY` | 502 | Groq returned empty content |
| `GROQ_ERROR` | 502 | Other Groq API failure |

---

## Behavioral Rules

1. **No secret exposure** — API keys and tokens never appear in the frontend bundle. Only the backend (`server.js` or Vercel function) reads them from the environment.
2. **No invented content** — The Groq system prompt instructs the model to write `"Insufficient information to determine."` for any field with no data from the Jira story.
3. **No inferred behavior labeled as fact** — Any inference must be labeled `"Inference (low confidence)"`.
4. **Deterministic output** — `temperature: 0` on every Groq call.
5. **8-section template only** — Output must contain exactly: Objective → Scope → Focus Areas → Approach → Deliverables → Team & Schedule → Entry & Exit Criteria → Risks.
6. **Scope section format** — Must always include `**In scope:**` and `**Out of scope:**` bulleted subsections.
7. **Config persistence** — Defaults from `.env` (backend, never sent to client); overrides from `localStorage` (frontend, client-side only).
8. **Export fidelity** — `.md` = raw markdown string; `.docx` = parsed sections via `docx` library; `.pdf` = `html2canvas` capture with forced white background.
9. **Theme persistence** — `localStorage` key `tsg-theme`; respects OS `prefers-color-scheme` on first load.

---

## Architectural Invariants

### Local Development
- Express server: port 3001
- Vite dev server: port 5173 (falls back to 5174 if taken)
- Vite proxies `/api/*` to `http://localhost:3001`
- `.env` loaded by `import 'dotenv/config'` in `server.js`

### Vercel Production
- Serverless functions: `api/config.js` (GET), `api/generate.js` (POST)
- Static frontend served from `dist/` (Vite build output)
- SPA rewrite: all non-`/api/` routes → `/index.html`
- Environment variables injected by Vercel (`process.env`) — no `.env` file in production
- Project: `ramesh-o-projects6/test-strategy-generator`
- Team ID: `team_NC13Faze9vSn2PKQmkchToaC`
- Project ID: `prj_wMemLPSLFDOrwYwnyOt3lUaGpa3k`
- Production alias: `https://test-strategy-generator-jet.vercel.app`

### Shared
- `.env` is always in `.gitignore` and `.vercelignore`
- `localStorage` keys: `tsg-theme`, `tsg-config`

---

## Groq System Prompt (Canonical)

```
You are a Senior Software Test Engineer with 15+ years of experience in QA strategy and test design.

Given the Jira story fields below, produce a Test Strategy document with EXACTLY these 8 sections, in this order, using ## headings:

## 1. Objective
## 2. Scope
## 3. Focus Areas
## 4. Approach
## 5. Deliverables
## 6. Team & Schedule
## 7. Entry & Exit Criteria
## 8. Risks

MANDATORY RULES:
- Base ALL content ONLY on the provided Jira story fields. Do NOT invent features, APIs, UI elements, error codes, or behavior not stated in the story.
- If information for a section is missing or unclear, write exactly: "Insufficient information to determine."
- If you infer something not explicitly stated, label it exactly: "Inference (low confidence)"
- Section 2 (Scope) MUST contain "**In scope:**" and "**Out of scope:**" subsections, each as a bulleted list.
- Do NOT add sections beyond the 8 listed. Do NOT drop any section.
- Start the document with: "# Test Strategy: [JIRA-KEY]" where [JIRA-KEY] is the actual issue key.
- Output format: Markdown only. No preamble, no explanation — just the document.
```

---

## Vercel Environment Variables

| Variable | Purpose | Source |
|----------|---------|--------|
| `GROQ_KEY` | Groq API authentication | `.env` / Vercel env |
| `JIRA_EMAIL` | Jira Basic Auth username | `.env` / Vercel env |
| `JIRA_API_TOKEN` | Jira Basic Auth password | `.env` / Vercel env |
| `JIRA_BASE_URL` | Jira board URL (API base extracted programmatically) | `.env` / Vercel env |
