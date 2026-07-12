// Recursively extracts plain text from JIRA Atlassian Document Format (ADF)
function adfToText(node) {
  if (!node) return ''
  if (node.type === 'text') return node.text || ''
  if (node.type === 'hardBreak') return '\n'

  const sep = node.type === 'paragraph' || node.type === 'listItem' ? '\n' : ''
  const children = (node.content || []).map(adfToText).join('')
  return children + sep
}

export async function fetchJiraTicket({ email, token, ticketId }) {
  const auth = btoa(`${email}:${token}`)

  const response = await fetch(`/jira-proxy/rest/api/3/issue/${ticketId}`, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const msg = body.errorMessages?.[0]
      || body.message
      || `JIRA error ${response.status}: ${response.statusText}`
    throw new Error(msg)
  }

  const data = await response.json()
  const f = data.fields || {}

  return {
    key:         data.key,
    summary:     f.summary                     || 'No summary provided',
    description: adfToText(f.description).trim() || 'No description provided',
    status:      f.status?.name                || 'Unknown',
    priority:    f.priority?.name              || 'Unknown',
    assignee:    f.assignee?.displayName       || 'Unassigned',
    reporter:    f.reporter?.displayName       || 'Unknown',
    created:     f.created
      ? new Date(f.created).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Unknown'
  }
}
