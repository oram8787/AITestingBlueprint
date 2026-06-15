# Task Plan — JIRA Test Case Generator

## North Star
> **Given a JIRA issue ID (e.g., KAN-1), automatically generate 8–12 detailed, structured test cases in a React UI using the Groq AI API.**

Each test case includes: ID · Module · Title · Description · Type · Priority · Preconditions · Test Data · Steps · Expected Result · Actual Result (blank) · Status (blank)

---

## Phase Checklist

| Phase | Name | Status | Goal |
|-------|------|--------|------|
| 0 | Initialization | ✅ Complete | Bootstrap memory files, confirm tech stack |
| 1 | Blueprint | ✅ Complete | Lock data schema and north star |
| 2 | Link | ✅ Complete | Verify JIRA + Groq API connections |
| 3 | Architect | ✅ Complete | Build all components and endpoints |
| 4 | Stylize | ✅ Complete | Polish UI, dark theme, accordion cards |
| 5 | Trigger | ⏳ Pending | Run end-to-end and validate output |

**Overall Progress**: ████████████░░ Phase 5 remaining

---

## Phase 0 — Initialization ✅

- [x] Confirm project location: `JiraTestCaseAgent_BlastFramework/`
- [x] Confirm shared `.env` strategy (sibling directory)
- [x] Define output schema (12-field test case)
- [x] Confirm test case types with user
- [x] Create `findings.md`, `progress.md`, `task_plan.md`

---

## Phase 1 — Blueprint ✅

- [x] Lock north star statement
- [x] Define JSON output schema verbatim
- [x] List test case types: Smoke / Functional / Negative / Edge Case / Integration / Regression
- [x] Confirm extra fields: Module, Priority, Description, Test Data, Actual Result, Status
- [x] Write `Objective.md`

---

## Phase 2 — Link ✅

- [x] JIRA REST API v3 — Basic Auth, ADF parsing strategy
- [x] Groq API — OpenAI-compatible, Bearer auth, model confirmed
- [x] CORS proxy strategy — Vite proxy → Express → external APIs
- [x] URL extraction — `new URL().origin` from board URLs
- [x] Backend port — 3002 (avoids conflict with sibling on 3001)

---

## Phase 3 — Architect ✅

### Backend (`server.js`)
- [x] `GET /api/config` — expose .env to UI
- [x] `POST /api/jira` — fetch issue with ADF parsing
- [x] `POST /api/generate` — Groq prompt (9 rules, 4000 tokens, temp 0.3)
- [x] JSON fallback chain (parse → regex → raw)

### Frontend Components
- [x] `App.jsx` — tab nav, localStorage/server config merge
- [x] `GenerateView.jsx` — input, 2-step fetch, loading states, error handling
- [x] `SettingsView.jsx` — credential form + server status panel
- [x] `TestCaseDisplay.jsx` — IssueCard + StatsBar + accordion TestCaseCards

### Documentation
- [x] `JIRA_TestCase_Generator_Prompt.md` — RICE-POT prompt
- [x] `B.L.A.S.T.md` — protocol phases
- [x] `README.md` — project overview, quick start, field table

---

## Phase 4 — Stylize ✅

- [x] Dark navy base (`#0B0D17`) — matches sibling project
- [x] Teal/indigo brand (`#0F9B8E → #6366F1`) — distinct identity
- [x] 6 type badge colors (indigo, red, amber, green, blue, purple)
- [x] 3 priority chip styles (red, amber, green)
- [x] Accordion cards with chevron toggle
- [x] Stats bar with type + priority counts
- [x] Execution row with dashed separator for blank fields
- [x] 860px max-width, 640px responsive breakpoint

---

## Phase 5 — Trigger ⏳

### To Do
- [ ] Run `npm run dev` and confirm both servers start
- [ ] End-to-end test with `KAN-1`:
  - [ ] JIRA issue fetched and rendered in IssueCard
  - [ ] Groq returns valid JSON with `test_cases` array
  - [ ] All 12 fields populate in accordion cards
  - [ ] Stats bar counts match number of returned cases
  - [ ] Expand/collapse works on all cards
  - [ ] Settings tab saves to localStorage
  - [ ] Warning banner appears when credentials missing
- [ ] Test fallback: provide malformed Groq response → verify raw JSON display
- [ ] Verify no port conflict with sibling Test Plan agent (3001 vs 3002)

---

## Discovery Questions Answered

| Question | Answer |
|----------|--------|
| New dir or modify existing? | New directory `JiraTestCaseAgent_BlastFramework/` |
| Extra fields needed? | Priority, Module, Description, Test Data, Actual Result, Status |
| Shared .env? | Yes — `server.js` resolves sibling `.env` path |
| Port? | 3002 (sibling uses 3001) |
| Token budget? | 4000 (doubled from Test Plan's 2000) |
| Test case count? | 8–12 per issue |
| Test case types? | 6 types: Smoke, Functional, Negative, Edge Case, Integration, Regression |

---

## File Manifest

```
JiraTestCaseAgent_BlastFramework/
├── server.js                          ✅ Express backend, port 3002
├── package.json                       ✅ Dependencies + scripts
├── vite.config.js                     ✅ Proxy /api → :3002
├── index.html                         ✅ React mount point
├── src/
│   ├── App.jsx                        ✅ Root + nav tabs
│   ├── main.jsx                       ✅ React entry
│   ├── index.css                      ✅ Full dark theme + TC styles
│   └── components/
│       ├── GenerateView.jsx           ✅ Input + trigger
│       ├── SettingsView.jsx           ✅ Credential management
│       └── TestCaseDisplay.jsx        ✅ Accordion TC cards
├── findings.md                        ✅ This session's discoveries
├── progress.md                        ✅ Phase-by-phase log
├── task_plan.md                       ✅ This file
├── B.L.A.S.T.md                       ✅ Protocol definition
├── Objective.md                       ✅ North star statement
├── JIRA_TestCase_Generator_Prompt.md  ✅ RICE-POT system prompt
└── README.md                          ✅ Project overview
```

**Total files**: 14 · **npm install**: ✅ 178 packages · **Phase 5**: ⏳ pending `npm run dev`
