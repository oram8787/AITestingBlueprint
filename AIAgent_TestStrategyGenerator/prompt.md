# Prompt Log — Jira-Driven Test Strategy Generator

> This file records every instruction, prompt, and decision exchanged during the design and build of this project.
> Session dates: 2026-06-14 · 2026-06-15
> Last updated: 2026-06-15

---

## Prompt 1 — Project Brief (User)

> Follow the `BLAST.md` and `test-strategy-generator-ricepot-prompt.md` files to generate a Test Strategy document and create a lightweight React application which has an option for dark and light mode with user having an option to save the Jira and other config details and an option to download the generated strategy in different formats like `.doc`, `.md` and `.pdf`. Use the `.env` file to get the required config details. Ask me if any other details are required.

**Referenced files:**
- `AIAgent_TestStrategyGenerator/test-strategy-generator-ricepot-prompt.md`
- `AIAgent_TestStrategyGenerator/BLAST.md`
- `AIAgent_TestStrategyGenerator/.env`

---

## Discovery Questions — Phase 1 Blueprint (AI → User)

Three clarifying questions were asked before any code was written:

**Q1: Which Groq model should I use for generating the Test Strategy?**
> **Answer:** `llama-3.3-70b-versatile` (Recommended — best reasoning quality for structured document generation)

**Q2: Do you have a test JIRA ID I can use to verify the integration works end-to-end?**
> **Answer:** I'll provide it later (skip verification for now — build first, test manually)

**Q3: For saved config in the UI — where should edits be persisted?**
> **Answer:** Browser `localStorage` only (Recommended — `.env` stays as server-side fallback)

---

## Prompt 2 — Run the App (User)

> Run the app

**AI actions taken:**
1. Detected port conflict: port 3001 was occupied by PID 36936 (another Node process — `BLAST_Framework_JIRA_AIAgent1`)
2. Asked user: "Stop the other server (use 3001) OR run on port 3002?"
3. **User chose:** Stop the other server, use port 3001
4. Killed PID 36936
5. Ran `npm run dev` — Express started on 3001, Vite fell back to 5174 (5173 was in use)
6. Verified both servers:
   - `http://localhost:3001/api/config` → `{ jiraBaseUrl, jiraEmail }` ✅
   - `http://localhost:5174` → HTTP 200 ✅

**App available at:** http://localhost:5174

---

## Prompt 3 — Update Theme Toggle (User)

> Update the UI of the app at the Light and Dark mode button with text indicating which mode to switch and re-run the app

**Changes made:**

In `src/App.tsx` — replaced icon-only button:
```tsx
// Before
{theme === 'dark' ? '☀' : '☾'}

// After
{theme === 'dark' ? (
  <><span aria-hidden="true">☀</span> Light Mode</>
) : (
  <><span aria-hidden="true">☾</span> Dark Mode</>
)}
```

In `src/styles/index.css` — updated `.theme-toggle` to accommodate text:
```css
/* Added: */
font-size: 0.8125rem;
font-weight: 600;
font-family: var(--font);
padding: 0.4rem 0.875rem;
display: flex;
align-items: center;
gap: 0.4rem;
white-space: nowrap;
```

**Result:** Vite hot-reloaded instantly. No restart needed.
- Light mode → button shows `☾ Dark Mode`
- Dark mode → button shows `☀ Light Mode`

---

## Prompt 4 — Deploy to Vercel (User)

> Push the above app to Vercel with API key as: `vcp_****REDACTED****` ⚠️ key was provided inline — rotate at vercel.com/account/tokens

> ⚠️ **Security Note:** API keys shared in chat should be rotated immediately after use. Rotate at https://vercel.com/account/tokens

**Architecture change — Express → Vercel Serverless Functions:**

The existing Express `server.js` cannot run on Vercel directly. Two serverless functions were created:

| File | Route | Method | Purpose |
|------|-------|--------|---------|
| `api/config.js` | `/api/config` | GET | Returns `jiraBaseUrl` + `jiraEmail` from `process.env` |
| `api/generate.js` | `/api/generate` | POST | Full Jira fetch + Groq generation logic |

**Additional files created for Vercel:**
- `vercel.json` — build command, output directory, SPA rewrite rule
- `.vercelignore` — excludes `.env`, `server.js`, `node_modules`, `.tmp`

**Deployment steps executed:**
```bash
# 1. Install Vercel CLI
npm install -g vercel  # → v54.14.0

# 2. First deploy attempt — failed (no team scope)
vercel --token vcp_... --yes
# Error: "Provide --team or --scope explicitly"
# Discovery: team = ramesh-o-projects6

# 3. Second deploy attempt — failed (project name invalid)
vercel --token vcp_... --yes --scope ramesh-o-projects6
# Error: "Project names must be lowercase and can't contain underscores"
# Cause: directory name "AIAgent_TestStrategyGenerator"

# 4. Third deploy — succeeded
vercel --token vcp_... --yes --scope ramesh-o-projects6 --name test-strategy-generator
# → Build succeeded on Vercel (iad1, Washington DC)
# → Preview URL created

# 5. Add environment variables via Vercel REST API
# POST https://api.vercel.com/v10/projects/{projectId}/env
# Variables added: GROQ_KEY, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_BASE_URL
# Type: encrypted, Target: production + preview + development

# 6. Redeploy to production (env vars needed a fresh build)
vercel --token vcp_... --prod --yes --scope ramesh-o-projects6

# 7. Verify live API
curl https://test-strategy-generator-jet.vercel.app/api/config
# → {"jiraBaseUrl":"https://ramesh-ogipuram.atlassian.net","jiraEmail":"oram8787@gmail.com"} ✅
```

**Deployment details:**

| Property | Value |
|----------|-------|
| Vercel Team | `ramesh-o-projects6` |
| Project Name | `test-strategy-generator` |
| Project ID | `prj_wMemLPSLFDOrwYwnyOt3lUaGpa3k` |
| Team ID | `team_NC13Faze9vSn2PKQmkchToaC` |
| Production URL | https://test-strategy-generator-jet.vercel.app |
| Inspect URL | https://vercel.com/ramesh-o-projects6/test-strategy-generator |

---

## Prompt 5 — Update Documentation (User)

> Update `progress.md`, `task_plan.md`, `findings.md`, `LLM.md` files as well and also create a `prompt.md` file and update all the prompts or instructions happened here into it.

**AI actions taken:**
- `task_plan.md` — fully updated with completed phase checklist and deployment details
- `findings.md` — expanded with Vercel deployment findings, export implementation details, UI/theming notes
- `progress.md` — fully rewritten as a detailed chronological log of all work done
- `LLM.md` — updated stack table, error code table, Vercel invariants, environment variable table
- `prompt.md` — created (this file) — records all prompts, decisions, and AI actions

---

## RICE-POT Prompt (Reference — from `test-strategy-generator-ricepot-prompt.md`)

The original engineering brief that defined the application requirements:

### R — Role
Senior Software Test Engineer with 15+ years of QA strategy and test design experience, with deep expertise in building React applications. Thinks like both a test architect and a frontend engineer.

### I — Instructions
1. Build a lightweight web app to generate a Test Strategy document from a Jira story
2. Accept config as user inputs (no hardcoded secrets): Jira email, Jira API token, Jira base URL, Groq API key, target JIRA ID
3. Fetch the Jira story (summary, description, acceptance criteria, components, labels, linked issues)
4. Send to Groq API and produce a Test Strategy following the 8-section template
5. Render the generated Test Strategy in the UI
6. Export to `.md` and `.docx` (extended to `.pdf` per user request)
7. Dark mode / light mode toggle with persistence
8. Lightweight, minimal dependencies, single deployable artifact
9. Graceful error handling for all failure modes

**Do NOT:**
- Hardcode, log, or commit credentials
- Invent requirements not in the Jira story
- Add template sections beyond the 8 defined
- Bury secrets in client-side code

### C — Context
Senior Test Engineer automating first-draft Test Strategy creation from Jira stories using a Groq-hosted LLM and a small UI.

**8-section template (required, in order):**
1. Objective
2. Scope (In scope / Out of scope)
3. Focus Areas
4. Approach
5. Deliverables
6. Team & Schedule
7. Entry & Exit Criteria
8. Risks

### E — Example
```markdown
### Scope
**In scope:**
- <workflow/feature explicitly described in JIRA-1234>

**Out of scope:**
- <anything the story explicitly excludes, or "Insufficient information to determine.">
```

### P — Parameters
- Output must be deterministic (same input → same output)
- Every assertion must be traceable to a Jira story field
- Missing info → write: "Insufficient information to determine."
- Inferred info → label: "Inference (low confidence)"
- Do not invent features, IDs, APIs, error codes, UI elements, or behavior

### O — Output
- Single application with working dark/light toggle
- Test Strategy rendered in-app and exportable to `.md`, `.docx`, `.pdf`
- 8 sections in the specified order

### T — Tone
Technical and precise. Documentation style for Test Strategy content. Plain and concise for engineering notes.

---

## BLAST Framework Applied (from `BLAST.md`)

### Phase 0 — Initialization
Created: `task_plan.md`, `findings.md`, `progress.md`, `LLM.md`

### Phase 1 — Blueprint (5 Discovery Questions)
| Question | Answer |
|----------|--------|
| North Star | Generate a complete 8-section Test Strategy from any Jira story ID |
| Integrations | Jira REST API v3 + Groq API — keys in `.env` |
| Source of Truth | Jira issue fields (summary, description, AC, components, labels, links) |
| Delivery Payload | Rendered markdown in-app; downloadable as `.md`, `.docx`, `.pdf` |
| Behavioral Rules | temperature=0, no invention, missing→"Insufficient information to determine.", inferred→"Inference (low confidence)" |

### Phase 2 — Link
- Jira connection verified (Basic Auth, REST API v3)
- Groq connection verified (Bearer token, `/openai/v1/chat/completions`)
- Local `/api/config` endpoint tested and returning correct non-sensitive data

### Phase 3 — Architect
3-layer build:
- **Layer 1 (Architecture)**: `LLM.md` — data schemas, behavioral rules, invariants
- **Layer 2 (Navigation)**: `App.tsx`, `api.ts` — routing decisions, state management
- **Layer 3 (Tools)**: `server.js`, `api/*.js`, `export.ts`, `ConfigPanel.tsx`, `StrategyOutput.tsx`

### Phase 4 — Stylize
- WCAG AA contrast, CSS custom properties, responsive layout, scrollbar styling
- Theme toggle with descriptive text labels

### Phase 5 — Trigger
- Local: `npm run dev` (Express + Vite via `concurrently`)
- Production: Vercel serverless deployment at https://test-strategy-generator-jet.vercel.app

---

---
## ─── SESSION 2 — 2026-06-15 ───
---

---

## Prompt 6 — Add Hero Image to UI (User)

> Update the UI of the screen to include the apt image related test strategy and rerun the app.

**Context:** App was already running locally at http://localhost:5174. User wanted a visual illustration relevant to test strategy added to the UI.

**Decision:** Created a new `HeroBanner` component with a custom inline SVG illustration showing the app's end-to-end workflow. Placed it as the first card in the main container above the Config section.

**New file created:** `src/components/HeroBanner.tsx`

**SVG Illustration design (`viewBox="0 0 440 200"`):**

Three horizontally connected nodes representing the data flow:

| Node | Element | Design Details |
|------|---------|---------------|
| Left | Jira Story card | Blue `#0052CC` header, large "J" logo, "KAN-1" badge, 5 grey content lines representing story fields |
| Middle | Groq AI circle | Outer glow ring (`var(--accent)` at 6% opacity), main circle with `var(--accent)` stroke, lightning bolt fill, "Groq LLM" + model name labels below |
| Right | Test Strategy document | Blue `var(--accent)` header ("TEST STRATEGY / KAN-1"), 8 colour-coded section rows (blue dots → Objective/Scope/Focus/Approach, green → Deliverables/Team/Entry-Exit, amber → Risks), fold-corner polygon, 3 export badges (.md / .docx / .pdf) |

Nodes connected by dashed blue arrows using SVG `<marker id="arrowhead">` with `markerEnd`.
Drop shadow applied to Jira card and Strategy doc via `<feDropShadow>` filter.

**Dark mode strategy for the SVG:**
CSS class names assigned to SVG elements (`svg-card`, `svg-line`, `svg-label`, `svg-section-label`, `svg-fold`, `svg-fold-crease`, `svg-arrow-fill`). Dark mode overrides applied via:
```css
[data-theme="dark"] .hero-svg .svg-card  { fill: #0f172a; stroke: #334155; }
[data-theme="dark"] .hero-svg .svg-line  { fill: #334155; }
/* etc. */
```
No JavaScript needed — SVG adapts to theme purely through CSS.

**Text side of the hero banner (left column):**
- Eyebrow: `RICE-POT Framework · BLAST Protocol · Groq LLM`
- Headline: `Jira Story → Test Strategy` (1.5rem, weight 800)
- Description paragraph
- Section pills: Objective · Scope · Focus Areas · Approach · + 4 more sections
- Export format tags: `.md` `.docx` `.pdf` (monospace, muted)

**CSS additions to `src/styles/index.css`:**
```
.hero-banner       — card with left accent border + subtle ::after gradient overlay
.hero-body         — flex row (column on mobile < 768px)
.hero-eyebrow      — uppercase, accent colour, 0.7rem
.hero-headline     — 1.5rem, weight 800, letter-spacing -0.03em
.hero-desc         — muted, 0.875rem, max-width 420px
.hero-pills        — flex wrap, gap 0.375rem
.hero-pill         — blue-tinted rounded pill
.hero-pill--muted  — grey variant
.hero-exports      — flex row
.export-tag        — monospace, border, muted
.hero-visual       — 440px wide SVG container
.hero-svg          — SVG light + dark CSS rules (8 class targets)
```

**`src/App.tsx` changes:**
```tsx
// Added import:
import HeroBanner from './components/HeroBanner';

// Added inside <div className="container">:
<HeroBanner />   {/* above Config Section */}
```

**Verification:**
- `npx tsc --noEmit` — 0 TypeScript errors ✅
- Vite hot-reloaded the change (no restart needed) ✅
- Dev server at http://localhost:5174 confirmed running ✅

---

## Prompt 7 — Redeploy to Vercel (User)

> Deploy this app to Vercel using the earlier API key which is shared earlier, if you did not find let me know.

**Context:** AI confirmed it retained the Vercel API key (`vcp_****REDACTED****`) from earlier in the same session. No re-entry needed.

**Deploy command executed:**
```bash
vercel \
  --token vcp_****REDACTED**** \
  --prod --yes \
  --scope ramesh-o-projects6
```

**Build output (Vercel — iad1, Washington DC):**
- Build cache restored from deployment `8TcR6VKCLC2owePh2DnUyBUw3DDm`
- Vite: **401 modules** transformed (↑ 1 from v2 — the new `HeroBanner.tsx`)
- CSS chunk: 8.89 kB → **11.29 kB** (+2.4 kB — hero banner styles)
- JS main chunk: 505.15 kB → **511.71 kB** (+6.6 kB — HeroBanner component + SVG)
- Build completed in 4.64s

**Deployment result:**

| Property | Value |
|----------|-------|
| Deployment ID | `dpl_HkMAh8c2f7cj5M7K4B9v78dtD4Bs` |
| Status | `READY` |
| Production alias | https://test-strategy-generator-jet.vercel.app |
| Inspect URL | https://vercel.com/ramesh-o-projects6/test-strategy-generator/HkMAh8c2f7cj5M7K4B9v78dtD4Bs |

**Live verification:**
```bash
curl -s -o /dev/null -w "%{http_code}" https://test-strategy-generator-jet.vercel.app
# → 200 ✅
```

---

## Prompt 8 — Update Documentation Files (User)

> Update the `Progress.md`, `findings.md`, `task_plan.md`

**AI actions taken:**

**`progress.md`** — Appended `2026-06-15` section covering:
- HeroBanner component creation (full SVG design breakdown)
- All new CSS class names added
- App.tsx changes (import + placement)
- TypeScript verification result
- Vercel v3 deployment (ID, module count, bundle size delta, live check)
- Documentation update log
- Updated Remaining items

**`findings.md`** — Added two new sections:
- *Hero Banner — SVG Illustration*: SVG architecture decisions — dark mode CSS class approach, `<marker>` for arrowheads, `<feDropShadow>` filter, colour strategy (hardcoded Jira blue vs CSS variable accent)
- *Vercel Deployments — History*: Table of all 3 deployment IDs, dates, regions, and what changed in each
- Updated Open Questions with 2 new items (key rotation, lazy-load `docx`)

**`task_plan.md`** — Updated:
- Phase 4 checklist: added hero banner + SVG theme-awareness items
- Phase 5 checklist: split into v1/v2/v3 Vercel deploys
- Added Documentation phase block
- Added **File Manifest** table covering every source file, API function, hook, utility, and BLAST memory file
- Updated deployment table with v3 deployment ID and date

---

## Prompt 9 — Update prompt.md (User) ← current

> Update the `prompt.md` file with all the interactions happened with you submitted during this session, in chronological order.

**AI actions taken:**
- Read current `prompt.md` (264 lines — Prompts 1–5 from 2026-06-14 + full RICE-POT and BLAST reference sections)
- Updated header to reflect both session dates (2026-06-14 · 2026-06-15)
- Appended Session 2 divider and Prompts 6, 7, 8, 9 in full chronological order
- Each entry documents: the exact user instruction, all AI decisions made, files changed, commands run, and outcomes

---

## Complete Interaction Timeline

| # | Date | User Prompt | Outcome |
|---|------|-------------|---------|
| 1 | 2026-06-14 | Build a React app from BLAST.md + RICE-POT prompt | Full app built (Express + Vite + React + TypeScript) |
| Discovery Q&A | 2026-06-14 | 3 clarifying questions answered | Model, config storage, JIRA ID decisions confirmed |
| 2 | 2026-06-14 | Run the app | Port conflict resolved; dev server at http://localhost:5174 |
| 3 | 2026-06-14 | Update theme toggle with text labels | `☾ Dark Mode` / `☀ Light Mode` labels added; hot-reloaded |
| 4 | 2026-06-14 | Push to Vercel (API key provided) | Vercel v1 deployed; env vars set; `/api/config` verified live |
| 5 | 2026-06-14 | Update all BLAST docs + create prompt.md | All 5 BLAST files created/updated; prompt.md created |
| 6 | 2026-06-15 | Add apt image for test strategy to UI | `HeroBanner.tsx` created with 3-node SVG workflow illustration |
| 7 | 2026-06-15 | Deploy to Vercel using earlier API key | Vercel v3 deployed (dpl_HkMAh8c2f7cj5M7K4B9v78dtD4Bs); live ✅ |
| 8 | 2026-06-15 | Update progress.md, findings.md, task_plan.md | All 3 files updated with 2026-06-15 changes |
| 9 | 2026-06-15 | Update prompt.md with all session interactions | This file — complete chronological log updated |
