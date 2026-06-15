import axios from 'axios';

const SYSTEM_PROMPT = `You are a Senior QA Engineer with expertise in writing comprehensive, actionable test cases. Given a JIRA issue, generate detailed test cases following industry best practices.

Output ONLY valid JSON matching this exact schema (no markdown, no explanation, no code blocks):
{
  "issue_id": "string",
  "summary": "string",
  "test_cases": [
    {
      "id": "TC-001",
      "module": "string",
      "title": "string",
      "description": "string",
      "type": "Functional | Negative | Edge Case | Integration | Smoke | Regression",
      "priority": "High | Medium | Low",
      "preconditions": "string",
      "test_data": "string",
      "steps": ["Step 1: specific action with detail", "Step 2: specific action with detail"],
      "expected_result": "string",
      "actual_result": "",
      "status": ""
    }
  ]
}

Rules:
1. Generate 8-12 test cases. Coverage must include: at least 1 Smoke, 3-4 Functional (happy path), 2-3 Negative, 1-2 Edge Cases, 1 Integration, 1 Regression.
2. Priority assignment: High = core functionality / critical path, Medium = secondary flows / alternate paths, Low = edge cases / UI cosmetics.
3. Steps must be specific and actionable — include exact UI element names, navigation paths, and input values where possible. Do NOT write generic steps like "Enter valid data".
4. test_data must list concrete sample values needed (e.g., "email: test@example.com, password: Test@123"). Write "N/A" only when genuinely no data is required.
5. expected_result must be specific and verifiable — state what the user sees, what data changes, what system state results.
6. module should identify the feature/component area (e.g., "User Authentication", "Shopping Cart", "Payment Gateway").
7. description explains WHAT the test validates and WHY it matters to the business.
8. actual_result and status MUST always be empty strings "".
9. preconditions must state the system state required before executing (e.g., "User must be logged in with Admin role").`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { groq_api_key, issue } = req.body;

  if (!groq_api_key || !issue) {
    return res.status(400).json({ error: 'Missing groq_api_key or issue data' });
  }

  const userMessage = `JIRA Issue: ${issue.id}
Summary: ${issue.summary}
Type: ${issue.issuetype}
Priority: ${issue.priority}
Status: ${issue.status}
Labels: ${issue.labels?.join(', ') || 'None'}
Components: ${issue.components?.join(', ') || 'None'}

Description:
${issue.description}

Generate comprehensive test cases for this JIRA issue following the schema exactly.`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userMessage   }
        ],
        temperature: 0.3,
        max_tokens:  4000
      },
      {
        headers: {
          Authorization:  `Bearer ${groq_api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const raw = response.data.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); }
        catch { parsed = { raw }; }
      } else {
        parsed = { raw };
      }
    }

    res.json(parsed);
  } catch (err) {
    const status  = err.response?.status || 500;
    const message = err.response?.data?.error?.message || err.message;
    res.status(status).json({ error: message });
  }
}
