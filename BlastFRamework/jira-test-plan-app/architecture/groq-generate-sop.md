# SOP — Groq Test Plan Generation
**Layer:** 1 — Architecture | **Tool:** `src/api/groq.js`

## Goal
Send a normalised JIRA ticket to Groq and receive an IEEE 829 compliant Test Plan in Markdown.

## Inputs
| Field      | Type   | Source              |
|------------|--------|---------------------|
| groqApiKey | string | ConfigForm          |
| ticket     | object | jira.js output      |

## Process
1. Build `userContent` string from ticket fields (key, summary, description, status, priority, assignee, reporter, created).
2. POST to `https://api.groq.com/openai/v1/chat/completions`:
   - `model`: `openai/gpt-oss-120b`
   - `messages`: system prompt (IEEE 829 instructions) + user content (ticket data)
   - `temperature`: 0.1 (near-deterministic)
   - `max_tokens`: 4096
3. On non-2xx → parse `error.message` from body, throw `Error`.
4. Extract `choices[0].message.content`.
5. If content is empty → throw `Error('Groq returned an empty response.')`.
6. Return raw Markdown string.

## System Prompt Rules (summary)
- Output ONLY the Markdown document — no preamble, no commentary.
- 10 IEEE 829 sections in fixed order.
- Every test case must trace to a JIRA field.
- Missing info → `Insufficient information to determine.`
- Inferred items → `Inference (low confidence)`
- ISTQB language throughout.

## Outputs
Markdown string — full IEEE 829 Test Plan with 10 sections.

## Error Handling
| Scenario              | Behaviour                                      |
|-----------------------|------------------------------------------------|
| 401 Invalid key       | Throws Groq error message                      |
| 404 Model not found   | Throws — verify model ID in findings.md        |
| 429 Rate limit        | Throws — user must wait and retry              |
| Empty response        | Throws "Groq returned an empty response."      |

## Known Constraints
- CORS: Groq API supports browser CORS — no proxy needed.
- Model `openai/gpt-oss-120b` must be verified at https://console.groq.com/docs/models.
- `max_tokens: 4096` may be insufficient for large tickets with many ACs — increase if truncation seen.
- Temperature 0.1 chosen for reproducibility; do not raise above 0.3 for test plans.
