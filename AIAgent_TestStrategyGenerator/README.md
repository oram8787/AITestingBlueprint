# Test Strategy Generator

A lightweight, AI-powered web application that generates a structured **8-section Test Strategy document** from any Jira story — built with the **RICE-POT** prompt framework and the **BLAST** (Blueprint → Link → Architect → Stylize → Trigger) protocol.

**Live app →** https://test-strategy-generator-jet.vercel.app

---

## What It Does

1. You enter a **JIRA ID** (e.g. `KAN-1`)
2. The app fetches the story from Jira via REST API v3
3. The full story content is sent to **Groq LLM** (`llama-3.3-70b-versatile`)
4. A complete Test Strategy document is generated and rendered in-app
5. You export it as **`.md`**, **`.docx`**, or **`.pdf`**

Every claim in the generated document is traceable to a field in your Jira story. Missing information is labelled `"Insufficient information to determine."` — nothing is invented.

---

## Generated Document Structure

The output always follows this exact 8-section template (RICE-POT framework):

| # | Section |
|---|---------|
| 1 | Objective |
| 2 | Scope *(In scope / Out of scope)* |
| 3 | Focus Areas |
| 4 | Approach |
| 5 | Deliverables |
| 6 | Team & Schedule |
| 7 | Entry & Exit Criteria |
| 8 | Risks |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite 5 + React 18 + TypeScript |
| Local backend | Express.js (port 3001) |
| Cloud backend | Vercel Serverless Functions (`api/`) |
| LLM | Groq API — `llama-3.3-70b-versatile`, `temperature: 0` |
| Markdown render | `marked` |
| Word export | `docx` |
| PDF export | `jsPDF` + `html2canvas` |
| Theming | CSS custom properties — light & dark, WCAG AA |

---

## Project Structure

```
AIAgent_TestStrategyGenerator/
├── api/                        # Vercel Serverless Functions
│   ├── config.js               # GET  /api/config  — returns non-sensitive env defaults
│   └── generate.js             # POST /api/generate — Jira fetch + Groq generation
├── src/
│   ├── components/
│   │   ├── HeroBanner.tsx      # SVG workflow illustration (Jira → AI → Strategy)
│   │   ├── ConfigPanel.tsx     # Editable credentials form + localStorage save
│   │   └── StrategyOutput.tsx  # Rendered markdown + export buttons
│   ├── hooks/
│   │   ├── useTheme.ts         # Dark/light toggle with localStorage persistence
│   │   └── useConfig.ts        # Config state with localStorage persistence
│   ├── utils/
│   │   ├── api.ts              # Fetch wrappers for /api/* endpoints
│   │   └── export.ts           # .md / .docx / .pdf download logic
│   ├── styles/index.css        # Full theme system, WCAG AA, responsive
│   ├── App.tsx                 # Root layout and state
│   └── main.tsx                # React entry point
├── server.js                   # Express backend for local development
├── vercel.json                 # Vercel build config + SPA rewrite rules
├── .vercelignore               # Excludes .env, server.js, node_modules
├── vite.config.ts              # Vite + dev proxy (/api/* → localhost:3001)
├── package.json
└── .env                        # Local secrets — never committed
```

---

## Prerequisites

- **Node.js** 18+
- **Jira account** with an API token ([create one here](https://id.atlassian.com/manage-profile/security/api-tokens))
- **Groq API key** ([get one here](https://console.groq.com/keys))

---

## Local Setup

### 1. Clone & install

```bash
git clone https://github.com/oram8787/AITestingBlueprint.git
cd AITestingBlueprint/AIAgent_TestStrategyGenerator
npm install
```

### 2. Configure `.env`

Create a `.env` file in `AIAgent_TestStrategyGenerator/`:

```env
GROQ_KEY="gsk_your_groq_api_key"
JIRA_EMAIL="you@example.com"
JIRA_API_TOKEN="your_jira_api_token"
JIRA_BASE_URL="https://your-org.atlassian.net"
```

> The `JIRA_BASE_URL` can be your full board URL — the app automatically extracts the API base (`https://your-org.atlassian.net`).

### 3. Run in development mode

```bash
npm run dev
```

This starts two servers concurrently:
- **Express API** → `http://localhost:3001`
- **Vite dev server** → `http://localhost:5173` (falls back to 5174 if taken)

Open **http://localhost:5173** in your browser.

### 4. Build for production (single server)

```bash
npm run build   # Compiles React → dist/
npm start       # Express serves dist/ + handles /api/* routes
```

---

## Usage

1. **Open the app** and expand the **Configuration** panel
2. Click **"Load Base URL & Email from .env"** to pre-fill from your server environment
3. Enter your **Jira API Token** and **Groq API Key** in the form (stored in `localStorage` only — never sent to a third party)
4. Enter a **JIRA ID** (e.g. `KAN-1`) in the generator field
5. Click **Generate Strategy** (or press Enter)
6. Review the rendered 8-section Test Strategy document
7. Export as **`.md`**, **`.docx`**, or **`.pdf`**

> **Tip:** Leave the credential fields blank to use the values from your `.env` file — the server falls back automatically.

---

## Security Model

| Concern | Resolution |
|---------|-----------|
| Jira tokens exposed to browser | Never — the browser only calls `/api/*` on your own backend |
| Groq key in client bundle | Never — only the server reads `process.env` |
| Credentials in `localStorage` | Stored locally in your own browser only; not transmitted to any third party |
| `.env` committed to git | Blocked by `.gitignore` and `.vercelignore` |

> ⚠️ This app makes API calls from the server side. Do **not** modify it to call Jira or Groq directly from the browser.

---

## Deploying to Vercel

```bash
npm install -g vercel
vercel --prod --scope your-team-slug
```

Set the following environment variables in your Vercel project (Settings → Environment Variables):

| Variable | Description |
|----------|-------------|
| `GROQ_KEY` | Groq API key |
| `JIRA_EMAIL` | Jira account email |
| `JIRA_API_TOKEN` | Jira API token |
| `JIRA_BASE_URL` | Jira base URL (board or API base) |

---

## Frameworks & Methodology

### RICE-POT Prompt Framework
Defines how the Groq LLM is instructed:
- **R**ole · **I**nstructions · **C**ontext · **E**xample · **P**arameters · **O**utput · **T**one
- Full prompt in [`test-strategy-generator-ricepot-prompt.md`](test-strategy-generator-ricepot-prompt.md)

### BLAST Protocol
Structured the build process in 5 phases:
- **B**lueprint → **L**ink → **A**rchitect → **S**tylize → **T**rigger
- Reference: [`BLAST.md`](BLAST.md)

### Project memory files
| File | Purpose |
|------|---------|
| [`LLM.md`](LLM.md) | Project Constitution — data schema, rules, Groq system prompt |
| [`task_plan.md`](task_plan.md) | Phase checklist + deployment details |
| [`findings.md`](findings.md) | Technical discoveries and Vercel deployment history |
| [`progress.md`](progress.md) | Chronological activity log |
| [`prompt.md`](prompt.md) | Full log of every user prompt and AI action |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Express (3001) + Vite (5173) concurrently |
| `npm run build` | Build React app to `dist/` |
| `npm start` | Serve production build via Express |
| `npm run preview` | Preview the Vite build locally |

---

## License

MIT
