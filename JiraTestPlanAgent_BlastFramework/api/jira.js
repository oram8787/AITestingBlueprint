const axios = require('axios');

function extractJiraBase(url) {
  try { return new URL(url).origin; } catch { return url; }
}

function parseAdf(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'text') return node.text || '';
  if (node.type === 'hardBreak') return '\n';
  if (Array.isArray(node.content)) {
    const text = node.content.map(parseAdf).join('');
    if (node.type === 'paragraph') return text + '\n';
    if (node.type === 'listItem') return '- ' + text;
    return text;
  }
  return '';
}

function extractDescription(description) {
  if (!description) return 'No description provided.';
  if (typeof description === 'string') return description;
  if (description.type === 'doc' && description.content) {
    return parseAdf(description).trim() || 'No description provided.';
  }
  return 'No description provided.';
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { jira_email, jira_token, jira_base_url, issue_id } = req.body;

  if (!jira_email || !jira_token || !jira_base_url || !issue_id) {
    return res.status(400).json({ error: 'Missing required fields: jira_email, jira_token, jira_base_url, issue_id' });
  }

  const base = extractJiraBase(jira_base_url);
  const authToken = Buffer.from(`${jira_email}:${jira_token}`).toString('base64');

  try {
    const response = await axios.get(`${base}/rest/api/3/issue/${issue_id}`, {
      headers: {
        Authorization: `Basic ${authToken}`,
        Accept: 'application/json'
      }
    });
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.errorMessages?.[0] ||
      err.response?.data?.message ||
      err.message;
    res.status(status).json({ error: `JIRA API error: ${message}` });
  }
};
