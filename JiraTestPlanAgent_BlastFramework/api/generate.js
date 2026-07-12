const axios = require('axios');

function extractDescription(description) {
  if (!description) return 'No description provided.';
  if (typeof description === 'string') return description;
  if (description.type === 'doc' && description.content) {
    return parseAdf(description).trim() || 'No description provided.';
  }
  return 'No description provided.';
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

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

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
};
