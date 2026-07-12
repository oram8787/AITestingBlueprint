# SOP — JIRA Ticket Fetch
**Layer:** 1 — Architecture | **Tool:** `src/api/jira.js`

## Goal
Fetch a single JIRA ticket by key and return a normalised plain-text object.

## Inputs
| Field    | Type   | Source        |
|----------|--------|---------------|
| email    | string | ConfigForm    |
| token    | string | ConfigForm    |
| ticketId | string | ConfigForm    |

## Process
1. Base64-encode `email:token` for Basic Auth header.
2. `GET /jira-proxy/rest/api/3/issue/{ticketId}` — routed via Vite proxy to `https://ramesh-ogipuram.atlassian.net`.
3. On non-2xx → parse `errorMessages[0]` or `message` from body, throw `Error`.
4. Extract fields: `key`, `summary`, `description (ADF)`, `status.name`, `priority.name`, `assignee.displayName`, `reporter.displayName`, `created`.
5. Convert `description` from ADF to plain text using recursive `adfToText()`.
6. Return normalised ticket object (all strings, no nulls).

## ADF Parser Logic
- `type: "text"` → return `.text`
- `type: "hardBreak"` → return `\n`
- `type: "paragraph"` / `type: "listItem"` → join children + append `\n`
- All other types → join children (no separator)
- Missing/null ADF → return `''`

## Outputs
```json
{
  "key":         "KAN-1",
  "summary":     "string",
  "description": "string (plain text)",
  "status":      "string",
  "priority":    "string",
  "assignee":    "string",
  "reporter":    "string",
  "created":     "string (localeDateString en-GB)"
}
```

## Error Handling
| Scenario            | Behaviour                                    |
|---------------------|----------------------------------------------|
| 401 Unauthorized    | Throws "Invalid email or API token"          |
| 404 Not Found       | Throws JIRA errorMessages[0]                 |
| Network failure     | Propagates fetch error to App error state    |
| ADF parse failure   | Returns empty string (never throws)          |

## Known Constraints
- CORS: JIRA Cloud blocks browser requests. Vite proxy (`/jira-proxy`) required — dev-only.
- ADF: `description` in API v3 is always ADF; never plain text. v2 API uses plain text but is deprecated.
