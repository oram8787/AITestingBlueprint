import axios from 'axios';

function extractJiraBase(rawUrl) {
  try { return new URL(rawUrl).origin; }
  catch { return rawUrl; }
}

function parseAdf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(parseAdf).join(node.type === 'paragraph' ? '\n' : '');
  }
  return '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jira_email, jira_token, jira_base_url, issue_id } = req.body;

  if (!jira_email || !jira_token || !jira_base_url || !issue_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const base = extractJiraBase(jira_base_url);
  const auth = Buffer.from(`${jira_email}:${jira_token}`).toString('base64');
  const url  = `${base}/rest/api/3/issue/${issue_id}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' }
    });

    const issue = response.data;
    const description = issue.fields.description
      ? parseAdf(issue.fields.description)
      : 'No description provided';

    res.json({
      id:         issue.key,
      summary:    issue.fields.summary,
      description,
      issuetype:  issue.fields.issuetype?.name  || 'Unknown',
      priority:   issue.fields.priority?.name   || 'Medium',
      status:     issue.fields.status?.name     || 'Unknown',
      reporter:   issue.fields.reporter?.displayName || 'Unknown',
      assignee:   issue.fields.assignee?.displayName || 'Unassigned',
      labels:     issue.fields.labels           || [],
      components: issue.fields.components?.map(c => c.name) || []
    });
  } catch (err) {
    const status  = err.response?.status || 500;
    const message = err.response?.data?.errorMessages?.[0] || err.message;
    res.status(status).json({ error: message });
  }
}
