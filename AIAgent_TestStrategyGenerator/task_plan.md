# Task Plan — Jira-Driven Test Strategy Generator

## Project Goal
Build a lightweight React + Vite web application that:
1. Accepts Jira credentials and a JIRA ID as input
2. Fetches the Jira story via the Jira REST API (v3)
3. Sends the story to Groq LLM to generate a structured 8-section Test Strategy document
4. Renders the output in-app with dark/light mode toggle
5. Allows export to `.md`, `.docx`, and `.pdf`
6. Loads config defaults from `.env`; allows editing/saving config in the UI via `localStorage`
7. Deployed to Vercel as a serverless application

## Stack Decision
- **Frontend**: Vite + React + TypeScript
- **Backend (local)**: Express.js (Node) — proxies Jira/Groq API calls, hides secrets from browser
- **Backend (Vercel)**: Vercel Serverless Functions (`api/config.js`, `api/generate.js`)
- **Export**: `docx` (Word), `jsPDF` + `html2canvas` (PDF), native Blob download (Markdown)
- **Theming**: CSS custom properties on `[data-theme]` attribute, persisted to `localStorage`
- **LLM**: Groq API → `llama-3.3-70b-versatile`, `temperature: 0` (deterministic)

---

## Phase Checklist

### Phase 0 — Initialization ✅
- [x] Create `task_plan.md`
- [x] Create `findings.md`
- [x] Create `progress.md`
- [x] Create `LLM.md` (Project Constitution)

### Phase 1 — Blueprint ✅
- [x] Discovery questions answered (Groq model, config storage, test JIRA ID)
- [x] Data schema confirmed in `LLM.md`
- [x] Blueprint approved

### Phase 2 — Link ✅
- [x] Jira API connection verified (`/rest/api/3/issue/{id}`, Basic Auth)
- [x] Groq API connection verified (`/openai/v1/chat/completions`, Bearer)
- [x] `/api/config` endpoint tested — returns `{ jiraBaseUrl, jiraEmail }` (no tokens)

### Phase 3 — Architect ✅
- [x] Express backend (`server.js`) — `/api/config` + `/api/generate`, ADF→text parser
- [x] Vercel serverless functions (`api/config.js`, `api/generate.js`)
- [x] React frontend scaffold (`src/main.tsx`, `src/App.tsx`)
- [x] Jira story fetch + ADF description extraction
- [x] Groq test strategy generation (8-section RICE-POT template)
- [x] Dark/light mode toggle (`useTheme` hook, `localStorage` persistence)
- [x] Config panel with save/load to `localStorage` (`useConfig` hook, `ConfigPanel.tsx`)
- [x] Markdown-to-HTML output renderer (`StrategyOutput.tsx`, `marked`)
- [x] Export: `.md` (Blob), `.docx` (`docx` library), `.pdf` (`jsPDF` + `html2canvas`)
- [x] Error handling: 8 distinct error codes with human-readable messages

### Phase 4 — Stylize ✅
- [x] CSS custom properties for both light and dark themes
- [x] WCAG AA contrast (≥ 4.5:1) in both modes
- [x] Responsive layout (single-column mobile, grid desktop)
- [x] Scrollbars styled in both themes
- [x] Theme toggle button updated with text label ("☾ Dark Mode" / "☀ Light Mode")
- [x] Spinner animation for loading state
- [x] Hero banner with inline SVG illustration (2026-06-15)
  - Three-node workflow diagram: Jira card → Groq AI circle → Test Strategy doc
  - SVG fully theme-aware via CSS class overrides for dark mode
  - Left text block: eyebrow, headline, description, section pills, export tags
  - Responsive: stacks vertically on screens < 768px

### Phase 5 — Trigger ✅
- [x] `npm run dev` — Express (port 3001) + Vite (port 5173) via `concurrently`
- [x] `npm run build` + `npm start` — production single-server (Express serves `dist/`)
- [x] `vercel.json` — Vite build config + SPA rewrite rules
- [x] `.vercelignore` — excludes `.env`, `server.js`, `node_modules`
- [x] Vercel deployment v1 — initial build, project linked, env vars set
- [x] Vercel deployment v2 — env vars activated, theme toggle text added
- [x] Vercel deployment v3 — hero banner + SVG illustration (2026-06-15)
- [x] Production URL verified live: https://test-strategy-generator-jet.vercel.app
- [x] Build verified: 0 TypeScript errors, 0 build errors (all 3 deployments)

### Documentation ✅
- [x] `task_plan.md` — project goal, stack, full phase checklist, deployment details
- [x] `findings.md` — env/config, CORS, Groq API, ADF, export, UI/theming, Vercel deployment history, hero SVG notes
- [x] `progress.md` — chronological log of every change across both days
- [x] `LLM.md` — Project Constitution: schema, behavioural rules, architectural invariants, Groq system prompt, env var table
- [x] `prompt.md` — full log of all user prompts, discovery Q&A, and AI actions

---

## File Manifest (Current)

### Root
| File | Purpose |
|------|---------|
| `package.json` | Dependencies + npm scripts |
| `vite.config.ts` | Vite build + dev proxy |
| `tsconfig.json` / `tsconfig.node.json` | TypeScript config |
| `index.html` | HTML entry point |
| `server.js` | Local Express backend |
| `vercel.json` | Vercel build + SPA rewrite config |
| `.gitignore` / `.vercelignore` | Exclusion rules |
| `.env` | Local secrets (never committed) |

### `api/` — Vercel Serverless Functions
| File | Route | Method |
|------|-------|--------|
| `api/config.js` | `/api/config` | GET |
| `api/generate.js` | `/api/generate` | POST |

### `src/`
| File | Purpose |
|------|---------|
| `main.tsx` | React entry |
| `App.tsx` | Root layout + state |
| `components/HeroBanner.tsx` | Hero section with SVG workflow illustration |
| `components/ConfigPanel.tsx` | Editable config form + localStorage |
| `components/StrategyOutput.tsx` | Markdown renderer + export buttons |
| `hooks/useTheme.ts` | Dark/light toggle + persistence |
| `hooks/useConfig.ts` | Config state + localStorage |
| `utils/api.ts` | Fetch wrappers for `/api/*` |
| `utils/export.ts` | .md / .docx / .pdf export logic |
| `styles/index.css` | Full theme system + all component styles |

### BLAST Memory Files
| File | Purpose |
|------|---------|
| `task_plan.md` | Phase checklist + deployment details |
| `findings.md` | Technical discoveries + Vercel deployment history |
| `progress.md` | Chronological activity log |
| `LLM.md` | Project Constitution (schema, rules, invariants) |
| `prompt.md` | Complete prompt/instruction history |

---

## Deployment Details

| Property | Value |
|----------|-------|
| Vercel Project | `test-strategy-generator` |
| Vercel Team | `ramesh-o-projects6` |
| Project ID | `prj_wMemLPSLFDOrwYwnyOt3lUaGpa3k` |
| Team ID | `team_NC13Faze9vSn2PKQmkchToaC` |
| Production URL | https://test-strategy-generator-jet.vercel.app |
| Latest Deployment | `dpl_HkMAh8c2f7cj5M7K4B9v78dtD4Bs` (v3 — 2026-06-15) |
| Local dev URL | http://localhost:5174 (Vite) + http://localhost:3001 (Express) |
