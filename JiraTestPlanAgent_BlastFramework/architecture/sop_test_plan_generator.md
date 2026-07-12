# SOP: JIRA Test Plan Generator

**Layer 1 — Architecture SOP**
**Last Updated:** 2026-06-13

---

## Goal

Given a JIRA issue ID, fetch the issue via REST API and generate a structured Test Plan using Groq AI. Deliver the result in a React web UI.

---

## Inputs

| Field          | Source        | Notes                                              |
|----------------|---------------|----------------------------------------------------|
| jira_email     | .env / UI     | Atlassian account email                            |
| jira_token     | .env / UI     | API token from id.atlassian.com/manage/api-tokens  |
| jira_base_url  | .env / UI     | Full URL accepted; origin extracted automatically  |
| groq_api_key   | .env / UI     | From console.groq.com                              |
| issue_id       | UI input      | Default: KAN-1                                     |

---

## Flow

```
[UI: Generate button clicked]
        │
        ▼
[POST /api/jira]
  - Extract origin from jira_base_url
  - Build Basic Auth: base64(email:token)
  - GET /rest/api/3/issue/{issue_id}
  - Parse ADF description to plain text
        │
        ▼
[POST /api/generate]
  - Build structured prompt with issue data
  - POST to api.groq.com/openai/v1/chat/completions
  - Model: openai/gpt-oss-120b, temp: 0.3
  - Parse JSON response (with markdown fallback)
        │
        ▼
[UI: Display TestPlanDisplay]
  - Issue card (key, summary, type, priority, status)
  - Test Plan sections (objective, scope, out_of_scope, environment, risks)
  - Test Cases grid (id, type, preconditions, steps, expected result)
```

---

## JIRA API Notes

- **Endpoint:** `GET /rest/api/3/issue/{issueIdOrKey}`
- **Auth:** `Authorization: Basic base64(email:token)`
- **Description format:** Atlassian Document Format (ADF) — must be parsed with `parseAdf()`, not used as-is
- **URL extraction:** Always call `new URL(rawUrl).origin` before appending API path

---

## Groq API Notes

- **Base URL:** `https://api.groq.com/openai/v1`
- **Auth:** `Authorization: Bearer {groq_api_key}`
- **Model:** `openai/gpt-oss-120b`
- **Prompt strategy:** Structured JSON prompt with explicit schema; temperature 0.3 for determinism
- **Response parsing:** Direct `JSON.parse()`, fallback to regex extract `/{...}/s`, fallback to raw text display

---

## Edge Cases

| Scenario                          | Handling                                      |
|-----------------------------------|-----------------------------------------------|
| JIRA issue not found (404)        | Error banner with JIRA error message          |
| Invalid JIRA credentials (401)    | Error banner: "JIRA API error: ..."           |
| Groq returns non-JSON             | Regex extract → if fails, show raw text       |
| No description on JIRA issue      | Fallback string: "No description provided."   |
| Board URL pasted as base URL      | `new URL(url).origin` extracts correctly      |
| Missing .env credentials          | UI shows "Credentials Incomplete" badge       |

---

## Self-Annealing Log

> Record new learnings here when errors occur and are resolved.

| Date       | Error                  | Fix Applied                        |
|------------|------------------------|------------------------------------|
| —          | —                      | —                                  |
