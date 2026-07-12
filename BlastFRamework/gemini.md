# 🏛️ GEMINI — Project Constitution
**Project:** JIRA Test Plan Generator
**Version:** 1.0.0 | **Date:** 2026-06-14
**Status:** Active

---

## Data Schemas

### Input Schema (ConfigForm — user-entered)
```json
{
  "email":      "string — Atlassian account email",
  "token":      "string — Atlassian API token",
  "groqApiKey": "string — Groq Cloud API key (gsk_...)",
  "ticketId":   "string — JIRA ticket key, default: KAN-1"
}
```

### JIRA API Response Schema (relevant fields extracted)
```json
{
  "key": "string",
  "fields": {
    "summary":     "string",
    "description": "ADF object | null",
    "status":      { "name": "string" },
    "priority":    { "name": "string" },
    "assignee":    { "displayName": "string" } | null,
    "reporter":    { "displayName": "string" },
    "created":     "ISO 8601 datetime string"
  }
}
```

### Normalised Ticket Schema (post-ADF parse)
```json
{
  "key":         "string",
  "summary":     "string",
  "description": "string (plain text, ADF extracted)",
  "status":      "string",
  "priority":    "string",
  "assignee":    "string",
  "reporter":    "string",
  "created":     "string (localeDateString)"
}
```

### Groq Request Schema
```json
{
  "model":       "openai/gpt-oss-120b",
  "messages":    [
    { "role": "system", "content": "IEEE 829 system prompt" },
    { "role": "user",   "content": "Structured ticket text" }
  ],
  "temperature": 0.1,
  "max_tokens":  4096
}
```

### Output Schema — IEEE 829 Test Plan (Markdown string)
Sections in order:
1. Test Plan Identifier
2. Introduction
3. Test Objectives
4. Test Scope (table: In Scope / Out of Scope)
5. Test Strategy
6. Entry Criteria
7. Exit Criteria
8. Test Cases (table: ID | Title | Precondition | Steps | Expected Result | Priority)
9. Traceability Matrix (table: TC ID | JIRA Field | Requirement)
10. Assumptions & Risks

---

## Behavioral Rules
- Credentials stored in React component state only — never persisted to localStorage or any store.
- JIRA description (Atlassian Document Format / ADF) must be converted to plain text before sending to Groq.
- Groq temperature = 0.1 for near-deterministic output.
- Missing/null JIRA fields → emit exactly: `"Insufficient information to determine."`
- Inferred test cases → label exactly: `"Inference (low confidence)"`
- All test cases must be traceable to summary, description, or acceptance criteria.

## Architectural Invariants
- Client-side only application. No backend server.
- CORS for JIRA API handled by Vite dev proxy (configured from parent `.env` JIRA_BASE_URL).
- Groq API supports browser CORS — direct fetch, no proxy needed.
- Stack: React 18 + Vite + Tailwind CSS + react-markdown + remark-gfm.
- JIRA instance: ramesh-ogipuram.atlassian.net (proxy target from .env).

## Schema Change Log
| Date       | Change                          | Reason           |
|------------|---------------------------------|------------------|
| 2026-06-14 | Initial schema defined          | Phase 0 setup    |
