# Jira Test Plan Generator — B.L.A.S.T. Framework

A lightweight React + Express application that fetches a JIRA ticket and automatically generates a structured IEEE 829 Test Plan using the Groq AI API. Built following the **B.L.A.S.T.** protocol and **A.N.T.** 3-layer architecture.

---

## What It Does

1. Accepts your JIRA and Groq credentials via a settings form
2. Fetches a JIRA ticket (default: `KAN-1`) using the JIRA Cloud REST API v3
3. Sends the ticket data (summary, description, type, priority) to the Groq LLM
4. Renders a structured Test Plan in the browser with:
   - Objective, Scope, Out-of-Scope
   - Test Cases (Happy Path, Negative, Edge Cases)
   - Risks & Environment notes

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Vite                          |
| Backend  | Node.js, Express (CORS proxy)           |
| AI Model | Groq Cloud — `openai/gpt-oss-120b`      |
| JIRA API | JIRA Cloud REST API v3                  |

---

## Project Structure

```
JiraTestPlanAgent_BlastFramework/
├── src/
│   ├── App.jsx                    # Root component — nav, config state
│   ├── main.jsx                   # React entry point
│   ├── index.css                  # Global styles
│   └── components/
│       ├── GenerateView.jsx       # Ticket fetch + generate flow
│       ├── SettingsView.jsx       # Credential configuration form
│       ├── ConfigPanel.jsx        # Config status display
│       └── TestPlanDisplay.jsx    # Renders the generated test plan
├── server.js                      # Express proxy (JIRA + Groq API calls)
├── architecture/
│   └── sop_test_plan_generator.md # Layer 1 SOP — flow, API notes, edge cases
├── B.L.A.S.T.md                   # B.L.A.S.T. protocol definition
├── Objective.md                   # Project objective
├── JIRA_TestPlan_Generator_Prompt.md  # RICE-POT prompt used to build this app
├── gemini.md                      # Project constitution — data schemas & rules
├── findings.md                    # Research & discoveries log
├── progress.md                    # Build progress & error log
├── task_plan.md                   # Phase checklist
├── .env                           # API credentials (never committed)
├── .tmp/                          # Temporary workbench files
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [JIRA Cloud](https://www.atlassian.com/software/jira) account with an API token
- A [Groq Cloud](https://console.groq.com) account with a free API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (or edit the existing one):

```env
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_BASE_URL=https://your-domain.atlassian.net
GROQ_KEY=your-groq-api-key
```

> Credentials from `.env` are pre-loaded into the UI form. You can also enter or override them directly in the Settings tab.

### 3. Run the App

```bash
npm run dev
```

This starts both the Express backend (port `3001`) and the Vite frontend concurrently.

Open your browser at: `http://localhost:5173`

---

## Usage

1. Open the app — if credentials are loaded from `.env`, you'll see a green **Credentials Ready** badge
2. If not, click **Settings** and enter your JIRA Base URL, Email, API Token, and Groq API Key
3. On the **Generate** tab, the Issue ID defaults to `KAN-1` — change it if needed
4. Click **Generate Test Plan**
5. The app fetches the JIRA ticket, calls Groq, and renders the Test Plan below

---

## API Endpoints (Express Backend)

| Method | Endpoint        | Description                                      |
|--------|-----------------|--------------------------------------------------|
| GET    | `/api/config`   | Returns `.env` credentials to pre-fill the UI   |
| POST   | `/api/jira`     | Fetches a JIRA issue by ID using Basic Auth      |
| POST   | `/api/generate` | Sends issue data to Groq and returns a test plan |

---

## Architecture — B.L.A.S.T. + A.N.T.

This project follows the **B.L.A.S.T.** protocol:

| Phase     | Description                                        |
|-----------|----------------------------------------------------|
| Blueprint | Data schema and project goals defined in `gemini.md` |
| Link      | JIRA and Groq API connections verified via Express proxy |
| Architect | 3-layer A.N.T. build: SOPs → Navigation → Tools   |
| Stylize   | React UI with clean layout and formatted test plan |
| Trigger   | Run locally via `npm run dev`                      |

**A.N.T. 3-Layer Architecture:**

- **Layer 1 — Architecture (`architecture/`):** Technical SOPs in Markdown. The source of truth for flow and edge cases.
- **Layer 2 — Navigation:** React components route data between the JIRA fetch and the Groq generation steps.
- **Layer 3 — Tools (`server.js`):** Deterministic Express handlers — atomic, testable, credentials via `.env`.

---

## Security Notes

- Credentials are stored in `.env` (server-side) and `localStorage` (client-side for convenience)
- The Express backend acts as a CORS proxy — credentials are never exposed in browser network calls to JIRA or Groq directly
- `.env` is excluded from version control via `.gitignore` — never commit it

---

## Framework Reference

- [B.L.A.S.T. Protocol](./B.L.A.S.T.md)
- [Architecture SOP](./architecture/sop_test_plan_generator.md)
- [RICE-POT Prompt](./JIRA_TestPlan_Generator_Prompt.md)
- [Project Constitution](./gemini.md)
