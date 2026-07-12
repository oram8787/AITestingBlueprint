# RICE-POT Prompt — JIRA Test Plan Generator

---

### Objective
Build a lightweight React application that accepts JIRA and Groq API credentials,
automatically fetches ticket KAN-1, and generates a structured Test Plan using the
Groq LLM — following the B.L.A.S.T. framework architecture.

---

### R — Role
You are a senior full-stack React developer with deep experience in API integrations
and AI-powered tooling, and a seasoned QA architect with 10+ years of experience
designing Test Plan documents to industry standards (IEEE 829, ISTQB). You follow
the B.L.A.S.T. protocol (Blueprint → Link → Architect → Stylize → Trigger) and the
A.N.T. 3-layer architecture. You prioritize reliability and deterministic output over
speed, and ensure all generated test plans conform to professional QA documentation
standards including scope, objectives, test strategy, entry/exit criteria, and
traceability to requirements.

---

### I — Instructions
1. Read `B.L.A.S.T.md` and `Objective.md` before writing any code.
2. Follow Phase 0 of B.L.A.S.T.: define the data schema (input/output shapes) before
   writing any component or tool script.
3. Build a lightweight React application with a configuration form that collects:
   - JIRA Email
   - JIRA API Token
   - JIRA Base URL
   - Groq API Key
4. On submit, call the JIRA REST API to fetch ticket **KAN-1** using the provided credentials.
5. Pass the fetched ticket data (summary, description, acceptance criteria) to the
   **Groq API** using model `openai/gpt-oss-120b` with a structured test-plan prompt.
6. Render the generated Test Plan in the UI as a fully structured IEEE 829 document
   in Markdown format.
7. Store credentials in component state only — do not persist to localStorage or any
   external store.

Do NOT:
- Build a backend server — keep this purely client-side (or a minimal Vite/CRA proxy
  for CORS if required).
- Hallucinate JIRA field names, Groq endpoint paths, or API response shapes — verify
  against the actual API docs.
- Add features beyond what is described (no auth flows, no multi-ticket support, no
  dashboards) unless asked.
- Hardcode credentials anywhere in source files.
- Invent test cases that cannot be traced to the fetched JIRA ticket fields.

---

### C — Context
- Framework: B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger) defined in
  `B.L.A.S.T.md`.
- Architecture: A.N.T. 3-layer (Architecture SOPs → Navigation/LLM → Deterministic Tools).
- JIRA ticket format: `KAN-1` — fetched via JIRA Cloud REST API v3.
- LLM provider: Groq Cloud — model `openai/gpt-oss-120b` (free tier).
- Test Plan standard: IEEE 829 (Software Test Documentation) with ISTQB terminology.
- Target audience: QA engineers who will copy the generated test plan into a test
  management tool.
- The app is a lightweight internal tool — polish over functionality is NOT the priority.

---

### E — Example
**Input (from KAN-1 JIRA ticket):**
```
Summary: User login with email and password
Description: As a user I want to log in so I can access my dashboard.
Acceptance Criteria: Valid credentials redirect to dashboard. Invalid credentials
show error. Account lockout after 5 failed attempts.
```

**Expected Test Plan output (IEEE 829 structure):**

---

#### 1. Test Plan Identifier
- **ID:** TP-KAN-1-v1.0
- **Created:** 2026-06-14
- **Source Ticket:** KAN-1

---

#### 2. Introduction
This test plan covers the verification and validation of the User Login feature
as described in JIRA ticket KAN-1. It defines the scope, strategy, and test cases
required to confirm the feature meets its acceptance criteria.

---

#### 4. Test Scope
| In Scope                              | Out of Scope                        |
|---------------------------------------|-------------------------------------|
| Login with valid credentials          | Password reset flow                 |
| Login with invalid credentials        | OAuth / SSO login                   |
| Account lockout after 5 failed attempts | Session timeout behaviour          |

---

#### 6. Entry Criteria
- Login page is deployed to the test environment.
- Test user accounts (valid and invalid) are provisioned.
- JIRA ticket KAN-1 acceptance criteria are signed off.

---

#### 7. Exit Criteria
- All High priority test cases pass with no open Critical/High defects.
- Traceability matrix confirms 100% coverage of acceptance criteria.

---

#### 8. Test Cases

| Test Case ID | Title                          | Precondition         | Steps                                                         | Expected Result                        | Priority |
|--------------|-------------------------------|----------------------|---------------------------------------------------------------|----------------------------------------|----------|
| TC-001       | Login with valid credentials  | User account exists  | 1. Open login page 2. Enter valid email + password 3. Click Login | Redirected to dashboard            | High     |
| TC-002       | Login with invalid password   | User account exists  | 1. Open login page 2. Enter valid email + wrong password 3. Click Login | Error message displayed           | High     |
| TC-003       | Account lockout after 5 fails | User account exists  | 1. Enter wrong password 5 consecutive times                   | Account locked, lockout message shown  | High     |

---

#### 9. Traceability Matrix

| Test Case ID | Traced To (JIRA Field)   | Requirement                                      |
|--------------|--------------------------|--------------------------------------------------|
| TC-001       | Acceptance Criteria      | Valid credentials redirect to dashboard          |
| TC-002       | Acceptance Criteria      | Invalid credentials show error                  |
| TC-003       | Acceptance Criteria      | Account lockout after 5 failed attempts          |

---

#### 10. Assumptions & Risks
- **Inference (low confidence):** TC-002 assumes "invalid credentials" means wrong
  password only. If invalid email is also in scope, additional test cases are needed.
- **Risk:** Account lockout reset mechanism is not described in KAN-1 — out of scope
  for this test plan.

---

### P — Parameters
- Output must be deterministic: same JIRA ticket input → same test plan structure.
- Every test case must be traceable to a field in the fetched JIRA ticket (summary,
  description, or acceptance criteria).
- If a JIRA field is missing or empty, respond exactly: `"Insufficient information to determine."`
- If a test case is inferred beyond what the ticket states, label it: `"Inference (low confidence)"`
- Do not invent API field names, endpoint paths, or component behaviors not described here.
- Do not assume default JIRA or Groq behavior — only use what is confirmed by the API response.
- App must remain lightweight: no unnecessary dependencies beyond React, a fetch/axios
  client, and a Markdown renderer.
- Generated test plan must include all 10 IEEE 829 sections — do not omit any section
  even if the ticket provides minimal information.

---

### O — Output
- **Artifact:** A working React application (component tree + entry point).
- **Format:**
  - `App.jsx` — root component with credential form and fetch trigger
  - `TestPlanViewer.jsx` — renders the Groq-generated test plan
  - `api/jira.js` — JIRA fetch utility
  - `api/groq.js` — Groq API call utility
- **Test Plan structure (IEEE 829 compliant), rendered in-browser as Markdown:**
  1. **Test Plan Identifier** — unique ID and version
  2. **Introduction** — purpose and scope of testing
  3. **Test Objectives** — what the test plan aims to validate
  4. **Test Scope** — features in scope and explicitly out of scope
  5. **Test Strategy** — types of testing to be performed (functional, regression, boundary, negative)
  6. **Entry Criteria** — conditions that must be met before testing begins
  7. **Exit Criteria** — conditions that define when testing is complete
  8. **Test Cases Table** — ID, Title, Precondition, Steps, Expected Result, Priority
  9. **Traceability Matrix** — maps each test case back to the JIRA ticket field it covers (summary, description, or acceptance criteria)
  10. **Assumptions & Risks** — any inferred gaps or low-confidence areas flagged explicitly
- **Credential form fields** (in order): JIRA Base URL, JIRA Email, JIRA API Token, Groq API Key.

---

### T — Tone
Technical and output-focused. No explanatory commentary in the code beyond single-line
clarifying comments where non-obvious. Deliver working code, not descriptions of what
the code will do. The generated test plan must use formal QA documentation language
consistent with IEEE 829 and ISTQB standards.
