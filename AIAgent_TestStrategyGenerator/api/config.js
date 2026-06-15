export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawUrl = process.env.JIRA_BASE_URL || '';
  let jiraBaseUrl = '';
  try {
    const u = new URL(rawUrl);
    jiraBaseUrl = `${u.protocol}//${u.host}`;
  } catch {
    jiraBaseUrl = rawUrl;
  }

  res.json({
    jiraBaseUrl,
    jiraEmail: process.env.JIRA_EMAIL || '',
  });
}
