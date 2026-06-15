# Progress Log — JIRA Test Case Generator

## Current State
- Backend running on: http://localhost:3002
- Frontend running on: http://localhost:5173
- `.env` shared from sibling `JiraTestPlanAgent_BlastFramework/` (or local `.env` override)

---

## Phase 0 — Initialization ✅
**Goal**: Bootstrap project memory and confirm north star.

- [x] Created `findings.md` — discovery & constraint log
- [x] Created `progress.md` — session log (this file)
- [x] Created `task_plan.md` — phase checklist and goals
- [x] Defined output schema: 12-field test case JSON
- [x] Confirmed tech stack: React 18, Express, Groq, JIRA REST v3, Vite 5

---

## Phase 1 — Blueprint ✅
**Goal**: Lock the data schema and north star before any code.

- [x] North Star confirmed: *Given a JIRA issue ID, auto-generate 8–12 detailed test cases in a React UI*
- [x] Output schema locked (see `findings.md` → Data Schema)
- [x] Test case types defined: Smoke, Functional, Negative, Edge Case, Integration, Regression
- [x] Extra fields confirmed by user: Module, Priority, Description, Test Data, Actual Result (blank), Status (blank)
- [x] `Objective.md` written

---

## Phase 2 — Link ✅
**Goal**: Verify all external API connections work.

- [x] JIRA REST API v3 strategy confirmed: Basic Auth (email:token base64), ADF parser implemented
- [x] Groq API confirmed: OpenAI-compatible, Bearer auth, `openai/gpt-oss-120b` free tier
- [x] CORS constraint resolved: Vite proxy → Express → external APIs (no direct browser calls)
- [x] URL extraction confirmed: `new URL(rawUrl).origin` handles board URLs vs API base
- [x] `.env` sharing strategy: `server.js` resolves `../JiraTestPlanAgent_BlastFramework/.env`

---

## Phase 3 — Architect ✅
**Goal**: Build all 3 layers (SOPs / Navigation / Tools).

**Layer 1 — SOPs**
- [x] `JIRA_TestCase_Generator_Prompt.md` — RICE-POT system prompt with schema, rules, examples
- [x] `B.L.A.S.T.md` — protocol definition
- [x] `architecture/` directory created

**Layer 2 — Navigation**
- [x] `src/App.jsx` — tab routing (Generate | Settings), localStorage + server config merge
- [x] `src/components/GenerateView.jsx` — issue ID input, 2-step API calls, loading states
- [x] `src/components/SettingsView.jsx` — credential form, server .env status panel
- [x] `src/components/TestCaseDisplay.jsx` — IssueCard, StatsBar, accordion TestCaseCards

**Layer 3 — Tools**
- [x] `server.js` — Express on port 3002
  - `GET /api/config` — reads .env, returns to UI
  - `POST /api/jira` — fetches JIRA issue (v3, Basic Auth, ADF parsing)
  - `POST /api/generate` — calls Groq, returns 8-12 test cases as JSON
- [x] JSON fallback chain: direct parse → regex extract → raw display

---

## Phase 4 — Stylize ✅
**Goal**: Polish UI to production quality.

- [x] Dark navy theme `#0B0D17` — consistent with sibling Test Plan project
- [x] Teal/indigo brand gradient `#0F9B8E → #6366F1` — distinct identity for Test Case tool
- [x] Type badge colors: Functional=indigo, Negative=red, Edge Case=amber, Integration=green, Smoke=blue, Regression=purple
- [x] Priority chips: High=red, Medium=amber, Low=green
- [x] Accordion layout: header always visible, body expands on click, first card open by default
- [x] Stats bar: total count + per-type + per-priority breakdown
- [x] Execution row: Actual Result + Status shown with dashed separator (blank by design)
- [x] Max-width 860px (wider than sibling to accommodate more fields)
- [x] Responsive breakpoint at 640px

---

## Phase 5 — Trigger ⏳
**Goal**: Deploy and validate end-to-end flow.

- [x] `npm install` — 178 packages installed successfully
- [ ] `npm run dev` — start both servers
- [ ] End-to-end test: Enter `KAN-1` → verify JIRA fetch → verify Groq response → verify accordion renders
- [ ] Verify all 12 test case fields populate correctly
- [ ] Verify fallback to raw JSON display works when LLM returns malformed output

---

## Errors & Resolutions

| # | Error | Resolution | Phase |
|---|-------|-----------|-------|
| — | None logged yet | — | — |

---

## Self-Annealing Log
*(Issues discovered and fixed during build)*

| Date | Issue | Fix |
|------|-------|-----|
| 2026-06-15 | N/A — clean build | — |
