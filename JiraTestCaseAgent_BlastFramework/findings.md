# Findings & Discovery Log — JIRA Test Case Generator

## North Star
> Given a JIRA issue ID (e.g., KAN-1), automatically generate 8–12 structured, detailed test cases in a React UI using the Groq AI API.

**Status**: ✅ Confirmed

---

## Discovery Q&A

| Question | Answer |
|----------|--------|
| What output fields does the user need? | ID, Module, Title, Description, Type, Priority, Preconditions, Test Data, Steps, Expected Result, Actual Result (blank), Status (blank) |
| Where should the project live? | New directory: `JiraTestCaseAgent_BlastFramework/` alongside sibling Test Plan agent |
| Should it share the existing `.env`? | Yes — `server.js` reads `../JiraTestPlanAgent_BlastFramework/.env` via resolved path |
| Which AI model? | Groq `openai/gpt-oss-120b` (free tier) — same as Test Plan agent |
| Which test case types to generate? | Smoke, Functional, Negative, Edge Case, Integration, Regression |
| What port for the backend? | 3002 (3001 already used by sibling Test Plan agent) |
| How many test cases per issue? | 8–12, with balanced coverage across all 6 types |

---

## JIRA API Discoveries

| Discovery | Detail |
|-----------|--------|
| API Version | REST v3 (`/rest/api/3/issue/{id}`) — not v2 |
| Authentication | Basic Auth: `base64(email:token)` — NOT OAuth |
| Description Format | ADF (Atlassian Document Format) — nested JSON, NOT plain text |
| ADF Parsing | Recursive `parseAdf()` function required to extract text nodes |
| Board URL vs API URL | User pastes board URL (`.../boards/35`); must extract origin with `new URL(url).origin` |
| CORS Constraint | JIRA blocks direct browser requests — Express acts as mandatory proxy |
| Error Format | Errors in `response.data.errorMessages[0]` (array), not `response.data.message` |

---

## Groq API Discoveries

| Discovery | Detail |
|-----------|--------|
| Compatibility | OpenAI-compatible endpoint: `https://api.groq.com/openai/v1/chat/completions` |
| Auth | Bearer token: `Authorization: Bearer ${groq_api_key}` |
| Model | `openai/gpt-oss-120b` — free tier, high capability |
| Temperature | 0.3 — deterministic, reproducible test case output |
| Max Tokens | 4000 — required for 8-12 detailed test cases (Test Plan only needed 2000) |
| Response Parsing | LLM sometimes wraps JSON in markdown fences — need fallback regex extract |
| Fallback Chain | `JSON.parse(raw)` → `raw.match(/\{[\s\S]*\}/)` + parse → `{ raw }` display |

---

## Architecture Discoveries

| Discovery | Detail |
|-----------|--------|
| Port separation | Backend 3002 avoids conflict with sibling Test Plan agent on 3001 |
| .env sharing | `dotenv.config({ path: '../JiraTestPlanAgent_BlastFramework/.env' })` |
| localStorage key | `jira_tcg_config` (vs `jira_tpg_config` in Test Plan) to avoid collision |
| Credential priority | localStorage overrides server .env; blank localStorage fields fall back to .env |
| Component split | `TestCaseDisplay` is entirely new vs `TestPlanDisplay` — different layout + schema |
| Accordion default | First test case card open by default (`defaultOpen={i === 0}`) |
| Max width | 860px (vs 720px in Test Plan) — wider to accommodate more field columns |

---

## Stylize Discoveries

| Discovery | Detail |
|-----------|--------|
| Brand differentiation | Teal/indigo gradient `#0F9B8E → #6366F1` vs pure indigo in Test Plan |
| New badge colors needed | blue (Smoke), purple (Regression) — not in sibling CSS |
| Priority chips | Needed separate `.priority-high/medium/low` classes with border + background |
| Stats bar layout | Flexbox row with per-item borders, not grid — adapts to variable type counts |
| Execution fields | Dashed border separator, italic placeholder text for Actual Result + Status |
| Code-style test data | `.tca-field-value.code` — monospace, accent color, subtle background |
| Responsive hide | `.tca-module` hidden on mobile (< 640px) to prevent header overflow |

---

## Data Schema

### Input (from JIRA API)
```json
{
  "id": "KAN-1",
  "summary": "string",
  "description": "string (ADF parsed to plain text)",
  "issuetype": "Story | Bug | Task | ...",
  "priority": "High | Medium | Low",
  "status": "To Do | In Progress | Done | ...",
  "reporter": "string",
  "assignee": "string",
  "labels": ["string"],
  "components": ["string"]
}
```

### Output (from Groq API)
```json
{
  "issue_id": "KAN-1",
  "summary": "string",
  "test_cases": [
    {
      "id": "TC-001",
      "module": "string",
      "title": "string",
      "description": "string",
      "type": "Functional | Negative | Edge Case | Integration | Smoke | Regression",
      "priority": "High | Medium | Low",
      "preconditions": "string",
      "test_data": "string",
      "steps": ["string"],
      "expected_result": "string",
      "actual_result": "",
      "status": ""
    }
  ]
}
```

---

## Known Constraints

| Constraint | Detail | Mitigation |
|------------|--------|------------|
| ADF format | JIRA v3 returns description as nested JSON | `parseAdf()` recursive parser |
| Markdown wrapping | Groq LLM sometimes wraps JSON in ```json fences | Regex fallback extracts bare JSON |
| CORS | Browser cannot call JIRA/Groq directly | Express proxy is mandatory |
| Board URL mismatch | User pastes `.../boards/35` URL, not API base | `new URL(url).origin` extraction |
| Port conflict | Sibling app uses 3001 | This app uses 3002 |
| Token budget | 2000 tokens insufficient for 10+ detailed test cases | Set max_tokens to 4000 |
| `.env` location | User may create local `.env` instead of using sibling | `dotenv.config` resolves sibling path; local `.env` in project root also works |

---

## Self-Annealing Log

| Date | Issue | Root Cause | Fix |
|------|-------|-----------|-----|
| 2026-06-15 | Clean build — no issues encountered | — | — |
