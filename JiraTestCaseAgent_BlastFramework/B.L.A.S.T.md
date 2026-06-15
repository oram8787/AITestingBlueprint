# B.L.A.S.T. Protocol — JIRA Test Case Generator

**B.L.A.S.T.** = Blueprint · Link · Architect · Stylize · Trigger

System Pilot identity: Senior QA Engineer + Full-Stack Developer operating under the A.N.T. 3-layer architecture.

---

## Phase 0 — Initialization
- [x] Create memory files (findings.md, progress.md, task_plan.md)
- [x] Define output schema (test case with 12 fields)
- [x] Confirm tech stack: React 18, Express, Groq, JIRA REST v3

## Phase 1 — Blueprint (Discovery)
**North Star**: Given a JIRA issue ID, auto-generate 8–12 detailed test cases in a React UI.

**Data Schema (Output)**:
```json
{
  "issue_id": "KAN-1",
  "summary": "...",
  "test_cases": [{
    "id": "TC-001", "module": "...", "title": "...",
    "description": "...", "type": "Functional",
    "priority": "High", "preconditions": "...",
    "test_data": "...", "steps": ["..."],
    "expected_result": "...", "actual_result": "", "status": ""
  }]
}
```

## Phase 2 — Link (API Verification)
- [x] JIRA REST API v3: Basic Auth (email:token), ADF → plain text, board URL extraction
- [x] Groq API: OpenAI-compatible, Bearer auth, model `openai/gpt-oss-120b`, free tier
- [x] CORS: Browser → Vite proxy → Express → JIRA/Groq (no direct browser calls)

## Phase 3 — Architect (3-Layer Build)
**Layer 1 — SOPs**: `architecture/sop_test_case_generator.md`
**Layer 2 — Navigation**: React tabs (Generate | Settings), accordion test case cards
**Layer 3 — Tools**: Express endpoints `/api/config`, `/api/jira`, `/api/generate`

Component tree:
```
App
├── GenerateView → TestCaseDisplay
│   ├── IssueCard
│   ├── StatsBar (type + priority counts)
│   └── TestCaseCard × N (accordion, first open by default)
└── SettingsView
```

## Phase 4 — Stylize (UI)
- Dark navy theme (`#0B0D17`) matching sibling Test Plan project
- Teal/indigo brand gradient for Test Case identity (`#0F9B8E → #6366F1`)
- Type badge colors: Functional=indigo, Negative=red, Edge Case=amber, Integration=green, Smoke=blue, Regression=purple
- Priority chips: High=red, Medium=amber, Low=green
- Accordion layout: header always visible, body expands on click
- Stats bar: total count + per-type + per-priority breakdown
- Execution fields (Actual Result, Status) shown in dashed-border row

## Phase 5 — Trigger (Deployment)
- Run: `npm install && npm run dev`
- Backend: http://localhost:3002
- Frontend: http://localhost:5173
- Shares `.env` from sibling `JiraTestPlanAgent_BlastFramework/` directory

---

## Operating Principles
1. **Data-First**: Schema locked before any UI is built
2. **Self-Annealing**: Errors logged in findings.md with resolution
3. **Deliverables vs Intermediates**: Only the final React app ships; planning docs stay local
4. **Credential Safety**: API keys never hardcoded; env vars or localStorage only
5. **JSON Fallback**: LLM response → direct parse → regex extract → raw display
