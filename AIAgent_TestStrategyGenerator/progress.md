# Progress Log

---

## 2026-06-14

### Phase 0 — Initialization ✅
- Created `task_plan.md`, `findings.md`, `progress.md`, `LLM.md`
- Analyzed `.env`: 4 keys present (`GROQ_KEY`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_BASE_URL`)
- Identified CORS issue: backend proxy required (Jira API blocks browser calls)
- Identified `JIRA_BASE_URL` is a board URL — extracted API base: `https://ramesh-ogipuram.atlassian.net`

### Phase 1 — Blueprint ✅
- User confirmed: Groq model = `llama-3.3-70b-versatile`
- User confirmed: config persistence = `localStorage` only (no `.env` write-back)
- User confirmed: test JIRA ID to be provided at runtime (skip verify for now)
- Data schema defined in `LLM.md`

### Phase 2 — Link ✅
- Jira REST API v3 endpoint identified: `/rest/api/3/issue/{JIRA_ID}` with Basic Auth
- Groq API endpoint confirmed: `https://api.groq.com/openai/v1/chat/completions`
- `/api/config` endpoint tested locally (port 3002): returned correct base URL + email, no tokens

### Phase 3 — Architect ✅

**Config files created:**
- `package.json` — all deps (Express, Vite, React, docx, jspdf, html2canvas, marked, axios, dotenv, concurrently)
- `vite.config.ts` — Vite + React plugin, dev proxy `/api/*` → `localhost:3001`
- `tsconfig.json`, `tsconfig.node.json` — TypeScript strict mode
- `index.html` — HTML entry point
- `.gitignore` — excludes `.env`, `dist/`, `node_modules/`, `.tmp/`, `.vercel`

**Backend (`server.js` — local Express):**
- `GET /api/config` — returns `jiraBaseUrl` (extracted) and `jiraEmail` only (no tokens)
- `POST /api/generate` — fetches Jira story, extracts ADF text, calls Groq, returns Test Strategy
- ADF-to-text parser (`adfToText()`) handles nested Atlassian Document Format
- 8 distinct error codes with human-readable messages
- Falls back to `.env` values if request body fields are empty
- Serves `dist/` as static in production

**Frontend:**
- `src/main.tsx` — React entry
- `src/App.tsx` — main layout, state management, generate form
- `src/components/ConfigPanel.tsx` — editable config, localStorage save, show/hide token fields
- `src/components/StrategyOutput.tsx` — markdown renderer (`marked`), export buttons
- `src/hooks/useTheme.ts` — dark/light toggle, `localStorage` persistence, respects `prefers-color-scheme`
- `src/hooks/useConfig.ts` — config state with localStorage persistence
- `src/utils/api.ts` — `fetchServerConfig()` + `generateStrategy()` fetch wrappers
- `src/utils/export.ts` — `downloadMarkdown()`, `downloadDocx()`, `downloadPdf()` (dynamic imports for PDF)
- `src/styles/index.css` — CSS custom properties, WCAG AA contrast, responsive grid, scrollbar styling

**Build verification:**
- `npm install` — 221 packages, 0 errors
- `npx tsc --noEmit` — 0 TypeScript errors
- `vite build` — 0 build errors, 400 modules transformed

### Phase 4 — Stylize ✅
- Dark/light CSS custom properties applied to all UI elements (inputs, buttons, cards, scrollbars, badges)
- WCAG AA contrast maintained in both themes
- Responsive: form grid collapses on screens < 600px
- Theme toggle button updated (post-initial build) to show text:
  - In light mode → `☾ Dark Mode`
  - In dark mode → `☀ Light Mode`
- Vite hot-reloaded the change instantly — no restart needed

### Phase 5 — Trigger ✅ (Local)
- Port 3001 was occupied by `BLAST_Framework_JIRA_AIAgent1` (PID 36936) — stopped it
- Vite fell back to port 5174 (5173 was in use by another process)
- Both servers verified running:
  - Express API: `http://localhost:3001` — `/api/config` returns `200`
  - React UI: `http://localhost:5174` — returns `200`

### Phase 5 — Trigger ✅ (Vercel Deployment)

**Vercel serverless functions created:**
- `api/config.js` — ESM handler, `GET /api/config`, reads `process.env`
- `api/generate.js` — ESM handler, `POST /api/generate`, full Jira + Groq logic (no Express dep)
- `vercel.json` — build config: `npm run build`, output: `dist/`, framework: `vite`, SPA rewrite rule
- `.vercelignore` — excludes `.env`, `server.js`, `node_modules`, `.tmp`

**Deployment steps:**
1. Vercel CLI v54.14.0 installed globally (`npm install -g vercel`)
2. First deploy attempt failed — team scope required (`--scope ramesh-o-projects6`)
3. Second deploy attempt failed — directory name contains underscores (Vercel project name constraint)
4. Third deploy succeeded with `--name test-strategy-generator` (deprecated flag, but functional)
5. Project linked: `ramesh-o-projects6/test-strategy-generator`
6. Build ran on Vercel (Washington DC, iad1): Vite build succeeded, 400 modules
7. All 4 environment variables added via Vercel REST API (`POST /v10/projects/{id}/env`):
   - `GROQ_KEY` (encrypted)
   - `JIRA_EMAIL` (encrypted)
   - `JIRA_API_TOKEN` (encrypted)
   - `JIRA_BASE_URL` (encrypted)
   - Targets: `production`, `preview`, `development`
8. Redeployed with `vercel --prod` to activate env vars
9. Live endpoint verified: `GET https://test-strategy-generator-jet.vercel.app/api/config`
   → returns `{ jiraBaseUrl, jiraEmail }` ✅

**Production URL**: https://test-strategy-generator-jet.vercel.app

### Remaining (as of 2026-06-14)
- [ ] End-to-end test with real JIRA ID (user to provide when ready)
- [ ] Rotate Vercel API key (was shared in conversation)

---

## 2026-06-15

### UI Enhancement — Hero Banner ✅

**New component:** `src/components/HeroBanner.tsx`
- Added a full-width hero section as the first element inside the main container (above the Config card)
- Left side (text block):
  - Eyebrow: "RICE-POT Framework · BLAST Protocol · Groq LLM"
  - Headline: "Jira Story → Test Strategy"
  - Description paragraph explaining the app's purpose
  - Section pills: Objective, Scope, Focus Areas, Approach, + 4 more
  - Export format tags: `.md`, `.docx`, `.pdf`
- Right side (SVG illustration, `viewBox="0 0 440 200"`):
  - **Node 1** — Jira story card (blue #0052CC header, "J" logo, KAN-1 badge, 5 content lines)
  - **Arrow 1** — dashed blue arrow with arrowhead marker
  - **Node 2** — Groq AI circle (lightning bolt icon, "Groq LLM" + model name label below)
  - **Arrow 2** — dashed blue arrow with arrowhead marker
  - **Node 3** — Test Strategy document (blue header with "TEST STRATEGY / KAN-1", 8 colour-coded section rows with dot + label + line, 3 export badges: `.md` `.docx` `.pdf`, fold corner effect)
- SVG uses CSS class-based theming so all card fills, content lines, labels, and fold colors flip correctly in dark mode via `[data-theme="dark"]` overrides

**CSS additions to `src/styles/index.css`:**
- `.hero-banner` — card with left accent border (`border-left: 4px solid var(--accent)`), subtle diagonal gradient overlay via `::after`
- `.hero-body` — flex row (stacks on mobile < 768px)
- `.hero-text`, `.hero-eyebrow`, `.hero-headline`, `.hero-desc`, `.hero-pills`, `.hero-pill`, `.hero-exports`, `.export-tag`
- `.hero-visual` — 440px wide SVG container
- `.hero-svg` — SVG CSS class rules for light/dark theming:
  - `.svg-card`, `.svg-line`, `.svg-label`, `.svg-section-label`, `.svg-fold`, `.svg-fold-crease`, `.svg-arrow-fill`
  - `[data-theme="dark"]` overrides for all above classes

**`src/App.tsx` changes:**
- Added `import HeroBanner from './components/HeroBanner'`
- Added `<HeroBanner />` as the first child inside `.container` (before the config card)

**Verification:**
- `npx tsc --noEmit` — 0 TypeScript errors ✅
- Vite hot-reloaded instantly (dev server at http://localhost:5174)
- Dev server confirmed running: HTTP 200 ✅

### Vercel Deployment — v3 (Hero Banner) ✅

- Triggered: `vercel --token ... --prod --yes --scope ramesh-o-projects6`
- Build cache restored from previous deployment (`8TcR6VKCLC2owePh2DnUyBUw3DDm`)
- Vite: 401 modules transformed (400 + 1 new HeroBanner)
- CSS chunk: 8.89 kB → 11.29 kB (hero styles added)
- JS main chunk: 505.15 kB → 511.71 kB (HeroBanner component)
- Deployment ID: `dpl_HkMAh8c2f7cj5M7K4B9v78dtD4Bs`
- Live verified: `https://test-strategy-generator-jet.vercel.app` → HTTP 200 ✅

### Documentation ✅
- `prompt.md` created — full log of all prompts, decisions, and AI actions across the entire session
- `progress.md`, `task_plan.md`, `findings.md`, `LLM.md` all updated to reflect complete project state

### Remaining
- [ ] End-to-end test with real JIRA ID (user to provide when ready)
- [ ] Rotate Vercel API key (was shared in conversation)
- [ ] Consider lazy-loading `docx` library to reduce main JS bundle below 500 kB warning threshold
