const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL    = 'openai/gpt-oss-120b'

const SYSTEM_PROMPT = `You are a QA architect with 10+ years of experience designing Test Plan \
documents to IEEE 829 standard using ISTQB terminology.

Generate a complete, IEEE 829 compliant Test Plan in Markdown format from the JIRA ticket data \
provided by the user. Output the document ONLY — no preamble, no commentary, no code fences around \
the whole document.

Structure the document with exactly these 10 sections in order:

# Test Plan — [TICKET_KEY]: [SUMMARY]

## 1. Test Plan Identifier
- **Plan ID:** TP-[TICKET_KEY]-v1.0
- **Date:** today's date
- **Version:** 1.0
- **Source Ticket:** [TICKET_KEY]

## 2. Introduction
One short paragraph describing what this test plan covers and why.

## 3. Test Objectives
Bullet list of what will be validated and verified.

## 4. Test Scope
Two-column Markdown table: | In Scope | Out of Scope |

## 5. Test Strategy
Brief description of testing types: functional, boundary, negative, regression. One paragraph.

## 6. Entry Criteria
Bullet list of conditions that must be met before testing begins.

## 7. Exit Criteria
Bullet list of conditions that define when testing is complete.

## 8. Test Cases
Markdown table with columns: | Test Case ID | Title | Precondition | Steps | Expected Result | Priority |
Steps should be numbered inline, e.g.: 1. Open page 2. Enter value 3. Click Submit

## 9. Traceability Matrix
Markdown table with columns: | Test Case ID | Traced To (JIRA Field) | Requirement |

## 10. Assumptions & Risks
Bullet list. Label inferred items as "Inference (low confidence)". Label gaps as "Risk:".

---

Rules (MUST follow):
- Every test case MUST trace to a field in the JIRA ticket (summary, description, or acceptance criteria).
- If information is missing or unclear, write exactly: Insufficient information to determine.
- If a test case is inferred beyond the ticket, label it: Inference (low confidence)
- Use formal IEEE 829 / ISTQB language throughout.
- Set Test Case IDs as TC-001, TC-002, etc.
- Set Priority as High, Medium, or Low based on ticket priority and test criticality.`

export async function generateTestPlan({ groqApiKey, ticket }) {
  const userContent = `JIRA Ticket:
Key:         ${ticket.key}
Summary:     ${ticket.summary}
Description: ${ticket.description}
Status:      ${ticket.status}
Priority:    ${ticket.priority}
Assignee:    ${ticket.assignee}
Reporter:    ${ticket.reporter}
Created:     ${ticket.created}

Generate the full IEEE 829 Test Plan for this ticket now.`

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model:      MODEL,
      messages:   [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userContent }
      ],
      temperature: 0.1,
      max_tokens:  4096
    })
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(
      body.error?.message || `Groq API error ${response.status}: ${response.statusText}`
    )
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Groq returned an empty response.')
  return content
}
