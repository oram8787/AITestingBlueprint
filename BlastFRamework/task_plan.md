# 📋 Task Plan — JIRA Test Plan Generator

**Created:** 2026-06-14
**Framework:** B.L.A.S.T. (Blueprint → Link → Architect → Stylize → Trigger)

---

## Phase 0 — Initialization ✅
- [x] Create `gemini.md` (Project Constitution + Data Schemas)
- [x] Create `task_plan.md` (this file)
- [x] Create `findings.md`
- [x] Create `progress.md`
- [x] Discovery questions answered
- [x] Data schema defined and approved

**Discovery answers:**
| Question       | Answer |
|----------------|--------|
| North Star     | IEEE 829 Test Plan from KAN-1 via Groq LLM |
| Integrations   | JIRA Cloud REST API v3 + Groq (openai/gpt-oss-120b) |
| Source of Truth | JIRA ticket KAN-1, project KAN |
| Delivery       | Rendered in-browser as Markdown |
| Credentials    | Manual entry only — no auto-fill |
| Ticket ID      | User-editable, defaults to KAN-1 |
| UI Style       | Gradient / Modern SaaS (purple-blue) |

---

## Phase 1 — Blueprint ✅
- [x] RICE-POT prompt created (`JIRA_TestPlan_Generator_Prompt.md`)
- [x] Architecture SOP files planned
- [x] File structure defined

---

## Phase 2 — Link (Connectivity)
- [ ] Verify JIRA API connection via proxy (test with KAN-1)
- [ ] Verify Groq API key and model availability
- [ ] Confirm ADF description parse works on real ticket data

---

## Phase 3 — Architect (Build)
- [ ] `package.json` — dependencies
- [ ] `vite.config.js` — proxy configuration
- [ ] `tailwind.config.js` + `postcss.config.js`
- [ ] `index.html`
- [ ] `src/main.jsx`
- [ ] `src/App.jsx`
- [ ] `src/index.css`
- [ ] `src/api/jira.js` — JIRA fetch utility
- [ ] `src/api/groq.js` — Groq generation utility
- [ ] `src/components/Header.jsx`
- [ ] `src/components/ConfigForm.jsx`
- [ ] `src/components/TestPlanViewer.jsx`
- [ ] `architecture/jira-fetch-sop.md`
- [ ] `architecture/groq-generate-sop.md`

---

## Phase 4 — Stylize
- [ ] Gradient SaaS UI applied (purple-blue theme)
- [ ] Responsive layout verified
- [ ] Loading states and error states styled
- [ ] Copy-to-clipboard button tested

---

## Phase 5 — Trigger
- [ ] `npm install` completed
- [ ] `npm run dev` starts successfully on port 3000
- [ ] End-to-end flow tested: enter credentials → fetch KAN-1 → generate plan

---

## File Structure
```
BlastFRamework/
├── gemini.md
├── task_plan.md
├── findings.md
├── progress.md
├── BLAST.md
├── JIRA_TestPlan_Generator_Prompt.md
├── .env                          ← JIRA + Groq credentials
└── jira-test-plan-app/
    ├── package.json
    ├── vite.config.js            ← Proxy reads ../.env
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── architecture/
    │   ├── jira-fetch-sop.md
    │   └── groq-generate-sop.md
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/
        │   ├── jira.js
        │   └── groq.js
        └── components/
            ├── Header.jsx
            ├── ConfigForm.jsx
            └── TestPlanViewer.jsx
```
