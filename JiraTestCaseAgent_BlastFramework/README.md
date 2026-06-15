# JIRA Test Case Generator — B.L.A.S.T. Framework

An AI-powered React + Express application that automatically generates detailed, structured test cases from JIRA issues using the Groq AI API. Built with the B.L.A.S.T. protocol and A.N.T. 3-layer architecture.

## What It Does

Enter a JIRA issue ID → the agent fetches the issue, sends it to Groq's LLM, and returns 8–12 detailed test cases covering Smoke, Functional, Negative, Edge Case, Integration, and Regression scenarios — each with Module, Priority, Test Data, Steps, Expected Result, Actual Result, and Status fields.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start (backend on :3002, frontend on :5173)
npm run dev
```

The app reads credentials from the `.env` in the sibling `JiraTestPlanAgent_BlastFramework/` directory automatically. No separate `.env` needed.

## Shared .env

This project reuses the credentials from `../JiraTestPlanAgent_BlastFramework/.env`:

```
GROQ_KEY="gsk_..."
JIRA_EMAIL="you@example.com"
JIRA_API_TOKEN="ATATT..."
JIRA_BASE_URL="https://your-domain.atlassian.net/..."
```

You can also override credentials per-session in the **Settings** tab (stored in localStorage).

## Generated Test Case Fields

| Field           | Description                                      |
|-----------------|--------------------------------------------------|
| ID              | TC-001, TC-002 … sequential identifier           |
| Module          | Feature/component area (e.g., "User Auth")       |
| Title           | One-line test case name                          |
| Description     | What is validated and why it matters             |
| Type            | Functional / Negative / Edge Case / Integration / Smoke / Regression |
| Priority        | High / Medium / Low                              |
| Preconditions   | System state required before execution           |
| Test Data       | Concrete input values (e.g., email, passwords)   |
| Steps           | Numbered, actionable step-by-step instructions   |
| Expected Result | Specific, verifiable outcome                     |
| Actual Result   | Blank — filled during test execution             |
| Status          | Not Run — updated after execution                |

## API Endpoints

| Method | Path           | Description                          |
|--------|----------------|--------------------------------------|
| GET    | /api/config    | Returns .env values for form pre-fill |
| POST   | /api/jira      | Fetches JIRA issue by ID             |
| POST   | /api/generate  | Sends issue to Groq, returns test cases |

## Architecture

```
UI (React + Vite :5173)
    ↓ /api/*
Express Server (:3002)
    ├── GET /api/config   → reads .env
    ├── POST /api/jira    → JIRA REST API v3 (Basic Auth)
    └── POST /api/generate → Groq API (openai/gpt-oss-120b)
```

## Tech Stack

- **Frontend**: React 18, Vite 5, dark theme CSS
- **Backend**: Node.js, Express
- **AI**: Groq API — `openai/gpt-oss-120b` (free tier), temperature 0.3
- **JIRA**: REST API v3, Basic Auth, ADF → plain text parsing

## Project Structure

```
JiraTestCaseAgent_BlastFramework/
├── server.js                         # Express backend
├── src/
│   ├── App.jsx                       # Root + nav
│   ├── main.jsx                      # React entry
│   ├── index.css                     # Dark theme styles
│   └── components/
│       ├── GenerateView.jsx          # Issue ID input + trigger
│       ├── SettingsView.jsx          # Credential management
│       └── TestCaseDisplay.jsx       # Accordion test case cards
├── JIRA_TestCase_Generator_Prompt.md # RICE-POT system prompt
├── B.L.A.S.T.md                      # Protocol definition
└── architecture/
    └── sop_test_case_generator.md    # SOP document
```
