# Findings & Discoveries

## Environment / Config
- `.env` contains: `GROQ_KEY`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_BASE_URL`
- `JIRA_BASE_URL` in `.env` is a Jira board URL:
  `https://ramesh-ogipuram.atlassian.net/jira/software/projects/KAN/boards/35`
  - **Extracted API base**: `https://ramesh-ogipuram.atlassian.net`
  - **Issue fetch endpoint**: `GET https://ramesh-ogipuram.atlassian.net/rest/api/3/issue/{JIRA_ID}`
  - **Project key**: `KAN` (inferred from board URL)
  - The `extractApiBase()` helper (in `server.js` and `api/generate.js`) parses the URL using `new URL()` and returns `protocol + host` only
- Jira auth: Basic Auth — `JIRA_EMAIL:JIRA_API_TOKEN` encoded as Base64

## CORS / Security Implications
- Jira REST API does NOT support direct browser calls (CORS blocked + token exposure risk)
- Groq API may allow browser calls but exposing API keys client-side is a security risk
- **Local resolution**: Express.js backend proxy — frontend calls `/api/config` and `/api/generate`, backend holds all secrets from `.env`
- **Production resolution**: Vercel Serverless Functions (`api/config.js`, `api/generate.js`) — same pattern, environment variables injected by Vercel at runtime
- **Tokens are never sent from server to browser** — `GET /api/config` only returns `jiraBaseUrl` and `jiraEmail`

## Groq API
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Auth: `Authorization: Bearer {GROQ_KEY}`
- Model confirmed: `llama-3.3-70b-versatile`
- `temperature: 0` — deterministic output (same Jira story → same Test Strategy)
- `max_tokens: 4096`
- Timeout: 45 seconds (Groq can be slow on large stories)

## Jira API — ADF (Atlassian Document Format)
- Jira story `description` field is returned as nested JSON (ADF), not plain text
- Custom `adfToText()` function recursively extracts plain text from ADF nodes
- Acceptance criteria field varies by Jira config:
  - Checked: `customfield_10016`, `customfield_10014`, `customfield_10020`
  - Falls back to "No acceptance criteria provided." if none found

## Template Structure (from RICE-POT prompt)
8 required sections in this exact order:
1. Objective
2. Scope (`**In scope:**` + `**Out of scope:**` subsections)
3. Focus Areas
4. Approach
5. Deliverables
6. Team & Schedule
7. Entry & Exit Criteria
8. Risks

## Export Implementations
- **`.md`**: Native `Blob` + `URL.createObjectURL()` download — no library needed
- **`.docx`**: `docx` npm package (browser-compatible). Custom `markdownToDocxParagraphs()` parser handles H1/H2/H3, bullets, and inline bold (`**text**`)
- **`.pdf`**: Dynamic import of `jspdf` + `html2canvas`; multi-page slicing; temporarily forces white background on the output element before capture to ensure readability regardless of current theme

## UI / Theming
- CSS custom properties on `:root` (light) and `[data-theme="dark"]` (dark)
- Theme toggle persisted to `localStorage` key `tsg-theme`
- Config persisted to `localStorage` key `tsg-config`
- Theme toggle button shows text label: "☾ Dark Mode" (in light mode) / "☀ Light Mode" (in dark mode)
- WCAG AA: all text/background pairs ≥ 4.5:1 contrast ratio in both themes
- Responsive: CSS grid collapses to single column below 600px

## Vercel Deployment
- Port conflict: port 3001 was occupied by a separate `BLAST_Framework_JIRA_AIAgent1` Node process (PID 36936) — stopped before running the new server
- Vite auto-selected port 5174 (5173 was in use)
- Vercel team slug: `ramesh-o-projects6` (required `--scope` flag in CLI)
- Project name `AIAgent_TestStrategyGenerator` rejected by Vercel (underscores + uppercase) → renamed to `test-strategy-generator`
- `--name` flag deprecated in Vercel CLI v54 — project named during first link
- Environment variables added post-deploy via Vercel REST API (`POST /v10/projects/{id}/env`)
- Required a second `vercel --prod` redeploy for env vars to take effect
- Production alias: `https://test-strategy-generator-jet.vercel.app`

## Hero Banner — SVG Illustration (2026-06-15)

- Added `src/components/HeroBanner.tsx` — new component rendered above the Config card
- **SVG design** (`viewBox="0 0 440 200"`): three-node horizontal workflow diagram
  - Node 1: Jira story card — uses hardcoded `#0052CC` (Jira blue) for brand accuracy; content lines and card background use CSS classes
  - Node 2: Groq AI circle — uses `var(--accent)` for the circle stroke and lightning bolt fill so it follows the theme accent colour
  - Node 3: Test Strategy document — 8 section rows with colour-coded dots (blue for first 4 sections, green for next 3, amber for Risks); fold-corner effect using two polygons
- **Dark mode SVG approach**: CSS classes (`.svg-card`, `.svg-line`, `.svg-label`, `.svg-fold`, etc.) are targeted via `[data-theme="dark"] .hero-svg .svg-*` rules — no JavaScript needed, SVG adapts to theme purely via CSS
- **SVG `<marker>` element**: `id="arrowhead"` used with `markerEnd` on the connecting `<line>` elements — points to accent colour via `.svg-arrow-fill` CSS class
- **Drop shadow filter**: `<feDropShadow>` applied to both Jira card and Test Strategy card for depth; Groq node uses an outer opacity circle instead

## Vercel Deployments — History

| Version | Date | Deployment ID | Key Change |
|---------|------|--------------|------------|
| v1 | 2026-06-14 | `dpl_FDJEYuzuyJGSv1bFCMyBWtt3pg2z` | Initial deploy — 400 modules, env vars added post-deploy |
| v2 | 2026-06-14 | `dpl_8TcR6VKCLC2owePh2DnUyBUw3DDm` | Redeployed to activate env vars; theme toggle text labels added |
| v3 | 2026-06-15 | `dpl_HkMAh8c2f7cj5M7K4B9v78dtD4Bs` | Hero banner + SVG illustration added; 401 modules |

- All deployments: Washington DC, iad1 region; build cache reused from v1 onward
- CSS chunk grew: 8.89 kB (v1) → 11.29 kB (v3) — hero styles added
- JS main chunk grew: 505.15 kB (v1) → 511.71 kB (v3) — HeroBanner component
- Production alias stable across all versions: `https://test-strategy-generator-jet.vercel.app`

## Open Questions / Future Work
- [ ] Acceptance criteria custom field ID — may differ across Jira instances; currently checks 3 known IDs
- [ ] Test with an actual JIRA ID (user to provide)
- [ ] Rotate Vercel API key shared in chat (security hygiene)
- [ ] Bundle size: `index.js` chunk is 511 kB — consider lazy-loading `docx` to reduce below 500 kB warning
- [ ] Consider adding a loading skeleton for the Hero SVG on slow connections
