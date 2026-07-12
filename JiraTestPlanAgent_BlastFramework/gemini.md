# gemini.md — Project Constitution
# JIRA AI Agent: Test Plan Generator

> **This file is LAW.**
> Only update when: (1) a schema changes, (2) a rule is added, or (3) architecture is modified.
> The planning files (`task_plan.md`, `findings.md`, `progress.md`) are *memory*. This file is *truth*.

---

## Confirmed Stack

| Layer        | Technology                        | Purpose                                      |
|--------------|-----------------------------------|----------------------------------------------|
| Frontend     | React 18 + Vite 5                 | UI — Settings tab + Generate tab             |
| Backend      | Express.js (Node)                 | Local proxy — avoids JIRA CORS               |
| LLM          | Groq API → `openai/gpt-oss-120b`  | Test plan generation (FREE tier)             |
| JIRA         | REST API v3 — Basic Auth          | Issue fetch by ID                            |
| Config store | `localStorage` + `.env` fallback  | Browser-local credentials, zero-config start |

---

## Data Schema

### Schema 1: User Input (Config)

```json
{
  "jira_email":    "oram8787@gmail.com",
  "jira_token":    "ATATT...",
  "jira_base_url": "https://ramesh-ogipuram.atlassian.net",
  "groq_api_key":  "gsk_...",
  "issue_id":      "KAN-1"
}
```

> **Storage priority:** `localStorage` → server `.env` → empty string.

### Schema 2: JIRA Raw Issue (API v3 Response)

```json
{
  "key": "KAN-1",
  "fields": {
    "summary":     "string",
    "description": "ADF object | string | null",
    "issuetype":   { "name": "Story | Bug | Task | Epic" },
    "priority":    { "name": "Critical | High | Medium | Low" },
    "status":      { "name": "To Do | In Progress | Done" },
    "assignee":    { "displayName": "string" },
    "reporter":    { "displayName": "string" }
  }
}
```

### Schema 3: Output Payload (Test Plan — Final Deliverable)

```json
{
  "issue_id": "KAN-1",
  "summary":  "string",
  "test_plan": {
    "objective":    "string",
    "scope":        "string",
    "out_of_scope": "string",
    "test_cases": [
      {
        "id":              "TC-001",
        "title":           "string",
        "type":            "Functional | Negative | Edge Case | Integration",
        "preconditions":   "string",
        "steps":           ["string", "string"],
        "expected_result": "string"
      }
    ],
    "risks":       "string",
    "environment": "string"
  }
}
```

---

## Behavioral Rules

> These rules govern how the system must behave. Never violate them.

1. **URL Extraction Rule:** Always call `new URL(rawUrl).origin` before appending any JIRA API path. The user may paste a full board URL; only the origin is valid for API calls.

2. **ADF Parse Rule:** JIRA API v3 returns `description` as Atlassian Document Format (ADF) — a nested JSON object. Must be parsed to plain text via `parseAdf()` before including in LLM prompts.

3. **JSON Output Rule:** The LLM prompt must instruct the model to return ONLY valid JSON. Parse with `JSON.parse()` first; fall back to regex extraction `/{[\s\S]*}/`; fall back to displaying raw text. Never crash on bad LLM output.

4. **Temperature Rule:** LLM calls must use `temperature: 0.3` for deterministic, reproducible test plan generation.

5. **Token Budget Rule:** `max_tokens: 2000` per Groq request (sufficient for 3–6 test cases).

6. **Test Case Count Rule:** Prompt must request 3–6 test cases covering: happy path, negative cases, and edge cases.

7. **Secrets Rule:** All API keys and tokens live in `.env` (server-side) or `localStorage` (client-side). Never hardcode credentials in source files.

8. **Intermediate Files Rule:** All scraped data, logs, and temp files go in `.tmp/`. These are ephemeral.

9. **Credential Priority Rule:** `localStorage` values override server `.env`. Blank `localStorage` fields fall back to server `.env`. This allows zero-config startup with `.env` while enabling browser-local overrides.

10. **Warning Rule:** UI must display a visible warning banner when any required credential is missing, with a direct link to the Settings tab. Never silently fail.

---

## Architectural Invariants

> These never change without a full architectural review.

- **LLMs are probabilistic; business logic must be deterministic.** The Express layer owns all routing and error handling — the LLM only generates content.
- **Backend proxy is required.** JIRA API blocks direct browser requests (CORS). Express on port 3001 is the mandatory intermediary.
- **The Golden Rule:** If logic changes, update `architecture/sop_test_plan_generator.md` BEFORE updating the code.
- **A project is only "Complete" when the payload is in its final cloud destination.** (Phase 5 Trigger is pending.)

---

## API Endpoints (server.js)

| Method | Path           | Purpose                                     |
|--------|----------------|---------------------------------------------|
| GET    | /api/config    | Returns `.env` values to pre-fill UI form   |
| POST   | /api/jira      | Fetches JIRA issue by ID via Basic Auth     |
| POST   | /api/generate  | Calls Groq LLM, returns structured plan     |

---

## Component Map (src/)

| File                          | Responsibility                                      |
|-------------------------------|-----------------------------------------------------|
| `App.jsx`                     | Tab state, localStorage read/write, merged config   |
| `components/SettingsView.jsx` | Settings form, Save button, Server .env status      |
| `components/GenerateView.jsx` | Issue ID input, Generate trigger, error display     |
| `components/TestPlanDisplay.jsx` | Issue card, test plan sections, test cases grid  |
| `index.css`                   | Dark theme CSS token system                         |

---

## Maintenance Log

> Only updated when schema changes, rules are added, or architecture is modified.

| Date       | Change                                                   | Trigger                        |
|------------|----------------------------------------------------------|--------------------------------|
| 2026-06-13 | Initial schema defined (Phase 1 Blueprint)               | Discovery Q&A                  |
| 2026-06-13 | Stack confirmed: React + Express + Groq                  | Phase 1 approved               |
| 2026-06-13 | ADF parse rule added (Rule #2)                           | JIRA API v3 discovery          |
| 2026-06-13 | URL extraction rule added (Rule #1)                      | .env URL mismatch              |
| 2026-06-13 | JSON fallback rule added (Rule #3)                       | LLM reliability requirement    |
| 2026-06-13 | JIRA_EMAIL corrected to oram8787@gmail.com in .env       | User correction                |
| 2026-06-13 | UI redesigned: dark theme, tab nav, localStorage config  | User design reference provided |
| 2026-06-13 | Credential Priority Rule added (Rule #9)                 | localStorage architecture      |
| 2026-06-13 | Warning Rule added (Rule #10)                            | Missing credentials UX pattern |
| 2026-06-13 | Component Map added to gemini.md                         | New component structure        |
