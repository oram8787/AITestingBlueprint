const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Extract API base URL from any JIRA URL (strips board/project paths)
function extractJiraBase(url) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

// Parse JIRA Atlassian Document Format (ADF) to plain text
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

// GET /api/config — Return .env config for pre-populating the UI form
app.get('/api/config', (req, res) => {
  res.json({
    jira_email: process.env.JIRA_EMAIL || '',
    jira_token: process.env.JIRA_API_TOKEN || '',
    jira_base_url: process.env.JIRA_BASE_URL || '',
    groq_api_key: process.env.GROQ_KEY || '',
    issue_id: 'KAN-1'
  });
});

// POST /api/jira — Fetch a JIRA issue by ID
app.post('/api/jira', async (req, res) => {
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
});

// POST /api/generate — Generate a test plan via Groq
app.post('/api/generate', async (req, res) => {
  const { groq_api_key, issue } = req.body;

  if (!groq_api_key || !issue) {
    return res.status(400).json({ error: 'Missing groq_api_key or issue data' });
  }

  const issueKey = issue.key;
  const summary = issue.fields?.summary || 'No summary';
  const description = extractDescription(issue.fields?.description);
  const issueType = issue.fields?.issuetype?.name || 'Issue';
  const priority = issue.fields?.priority?.name || 'Medium';
  const status = issue.fields?.status?.name || 'Unknown';

  const prompt = `You are a senior QA engineer. Generate a comprehensive Test Plan for the following JIRA ${issueType}.

JIRA Issue: ${issueKey}
Summary: ${summary}
Priority: ${priority}
Status: ${status}
Description:
${description}

Return ONLY a valid JSON object in this exact format (no markdown, no explanation):
{
  "objective": "One sentence stating what is being tested",
  "scope": "What functionality is in scope",
  "out_of_scope": "What is explicitly excluded",
  "test_cases": [
    {
      "id": "TC-001",
      "title": "Descriptive test case title",
      "type": "Functional",
      "preconditions": "What must be true before running this test",
      "steps": ["Step 1 action", "Step 2 action", "Step 3 action"],
      "expected_result": "What should happen when steps are followed correctly"
    }
  ],
  "risks": "Known risks, dependencies, or blockers",
  "environment": "Required test environment and tools"
}

Generate 3 to 6 test cases covering: happy path, negative cases, and edge cases. Types allowed: Functional, Negative, Edge Case, Integration.`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          Authorization: `Bearer ${groq_api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0]?.message?.content || '';

    let testPlan;
    try {
      testPlan = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      testPlan = match ? JSON.parse(match[0]) : { raw: content };
    }

    res.json({ issue_id: issueKey, summary, test_plan: testPlan });
  } catch (err) {
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message;
    res.status(status).json({ error: `Groq API error: ${message}` });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 B.L.A.S.T. Backend running on http://localhost:${PORT}`);
  console.log(`   JIRA Email : ${process.env.JIRA_EMAIL || '(not set)'}`);
  console.log(`   JIRA URL   : ${extractJiraBase(process.env.JIRA_BASE_URL || '')}`);
  console.log(`   Groq Key   : ${process.env.GROQ_KEY ? '✓ loaded' : '✗ not set'}\n`);
});
