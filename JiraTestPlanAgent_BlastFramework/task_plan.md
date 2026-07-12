# task_plan.md — Phases, Goals & Checklists
# JIRA AI Agent: Test Plan Generator

> This is the project memory. Updated after each phase. See `gemini.md` for schema and rules.

---

## North Star

> Given a JIRA issue ID (KAN-1), auto-generate a structured, AI-powered Test Plan delivered in a React web UI.

---

## Phase 0: Initialization ✅ COMPLETE

**Goal:** Bootstrap project memory and halt all execution until Blueprint is approved.

- [x] Create `task_plan.md` — Phases, goals, checklists
- [x] Create `findings.md` — Research, discoveries, constraints
- [x] Create `progress.md` — What was done, errors, results
- [x] Initialize `gemini.md` as Project Constitution (data schemas, rules, invariants)
- [x] Execution halted until Discovery Questions answered

---

## Phase 1: B — Blueprint ✅ COMPLETE

**Goal:** Define the vision, integrations, data schema, and get Blueprint approved.

**Discovery Questions — Answered:**

| Question         | Answer                                                              |
|------------------|---------------------------------------------------------------------|
| North Star       | Fetch KAN-1 from JIRA → generate Test Plan via Groq AI             |
| Integrations     | JIRA REST API v3 + Groq API (`openai/gpt-oss-120b`) — keys in .env |
| Source of Truth  | JIRA project KAN, Board 35, issue KAN-1                             |
| Delivery Payload | React web app at `localhost:5173`                                   |
| Behavioral Rules | JSON output, 3–6 test cases, temp 0.3, never crash on bad LLM JSON |

**Checklist:**
- [x] All 5 Discovery Questions answered
- [x] JSON Data Schema defined in `gemini.md` (Input / JIRA Raw / Output shapes)
- [x] Payload shape confirmed
- [x] Blueprint approved → execution unblocked

---

## Phase 2: L — Link ✅ COMPLETE

**Goal:** Verify all API connections. Do not proceed if any Link is broken.

- [x] JIRA API v3 connectivity verified (Basic Auth: email + token)
- [x] Groq API connectivity verified (Bearer token)
- [x] CORS constraint identified → Express proxy solution applied
- [x] JIRA URL mismatch identified (board URL ≠ API base) → `new URL().origin` fix applied
- [x] ADF description format discovered → `parseAdf()` recursive parser implemented
- [x] `/api/config` handshake endpoint built — returns `.env` values to UI

> **Link status:** All connections wired through `server.js`. Validated at request time with descriptive error messages returned to UI.

---

## Phase 3: A — Architect ✅ COMPLETE

**Goal:** Build the 3-layer A.N.T. architecture.

**Layer 1 — Architecture (SOPs):**
- [x] `architecture/sop_test_plan_generator.md` — Full SOP with flow, edge cases, API notes

**Layer 2 — Navigation (Decision Making):**
- [x] `server.js` routes: `/api/config` → `/api/jira` → `/api/generate`
- [x] React `App.jsx` orchestrates tab state + merged config from localStorage and .env

**Layer 3 — Tools (Deterministic Scripts):**
- [x] `server.js` — Express backend (JIRA fetch + Groq generation)
- [x] `src/` — React frontend (SettingsView + GenerateView + TestPlanDisplay)
- [x] `vite.config.js` — Vite proxy `/api` → `localhost:3001`
- [x] `package.json` — `npm run dev` starts both servers via `concurrently`
- [x] `npm install` — 178 packages installed

---

## Phase 4: S — Stylize ✅ COMPLETE

**Goal:** Format output for professional delivery; present to user for feedback.

**Round 1 — Initial Light Theme:**
- [x] JIRA-branded UI (blue #0052CC, card layout, JIRA background)
- [x] Issue card with key, type, priority, status badges
- [x] Test cases grid with color-coded types
- [x] Loading states with spinner
- [x] Error banner with descriptive messages
- [x] Collapsible config panel pre-filled from `.env`

**Round 2 — Dark Theme Redesign (from user design reference):**
- [x] Full dark theme (`--bg: #0B0D17`, CSS token system)
- [x] Header: purple gradient rocket icon, `openai/gpt-oss-120b` model badge
- [x] Tab navigation: Generate / Settings (active = filled accent, inactive = ghost)
- [x] Settings tab: localStorage form with "Save settings" button
- [x] Server `.env` status panel: live set/not set per credential
- [x] Generate tab: issue ID input + Generate button + inline results
- [x] Warning banner: amber alert when credentials missing, "Open Settings" link
- [x] New components: `SettingsView.jsx`, `GenerateView.jsx`
- [x] Updated `TestPlanDisplay.jsx` for dark-mode badge colors
- [x] Credential Priority Rule: localStorage overrides `.env`
- [x] App opened in browser — `http://localhost:5173` ✅

---

## Phase 5: T — Trigger ⏳ PENDING

**Goal:** Move to production, set up automation triggers, finalize docs.

- [ ] Cloud transfer (deploy React app + Express server)
- [ ] Set up execution triggers (Cron, Webhook, or CI listener)
- [ ] Finalize Maintenance Log in `gemini.md`
- [ ] Write final deployment docs

---

## Current Status

```
Phase 0  ████████████████████  ✅ COMPLETE
Phase 1  ████████████████████  ✅ COMPLETE
Phase 2  ████████████████████  ✅ COMPLETE
Phase 3  ████████████████████  ✅ COMPLETE
Phase 4  ████████████████████  ✅ COMPLETE
Phase 5  ░░░░░░░░░░░░░░░░░░░░  ⏳ PENDING
```

**App URL:** `http://localhost:5173`
**Backend URL:** `http://localhost:3001`
**To run:** `npm run dev` inside `BLAST_Framework_JIRA_AIAgent1/`
