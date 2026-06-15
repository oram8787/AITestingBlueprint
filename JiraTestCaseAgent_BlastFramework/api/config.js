export default function handler(req, res) {
  res.json({
    jira_email:    process.env.JIRA_EMAIL     || '',
    jira_token:    process.env.JIRA_API_TOKEN || '',
    jira_base_url: process.env.JIRA_BASE_URL  || '',
    groq_api_key:  process.env.GROQ_KEY       || '',
    issue_id:      process.env.ISSUE_ID       || ''
  });
}
