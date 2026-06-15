import axios from 'axios';

function extractApiBase(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url || '';
  }
}

function adfToText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  let text = '';
  if (node.text) text += node.text;
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      text += adfToText(child);
      if (['paragraph', 'heading', 'rule', 'blockquote'].includes(child.type)) text += '\n';
      if (child.type === 'listItem') text = '- ' + text.trim() + '\n';
    }
  }
  return text;
}

const SYSTEM_PROMPT = `You are a Senior Software Test Engineer with 15+ years of experience in QA strategy and test design.

Given the Jira story fields below, produce a Test Strategy document with EXACTLY these 8 sections, in this order, using ## headings:

## 1. Objective
## 2. Scope
## 3. Focus Areas
## 4. Approach
## 5. Deliverables
## 6. Team & Schedule
## 7. Entry & Exit Criteria
## 8. Risks

MANDATORY RULES:
- Base ALL content ONLY on the provided Jira story fields. Do NOT invent features, APIs, UI elements, error codes, or behavior not stated in the story.
- If information for a section is missing or unclear, write exactly: "Insufficient information to determine."
- If you infer something not explicitly stated, label it exactly: "Inference (low confidence)"
- Section 2 (Scope) MUST contain "**In scope:**" and "**Out of scope:**" subsections, each as a bulleted list.
- Do NOT add sections beyond the 8 listed. Do NOT drop any section.
- Start the document with: "# Test Strategy: [JIRA-KEY]" where [JIRA-KEY] is the actual issue key.
- Output format: Markdown only. No preamble, no explanation — just the document.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const {
    jiraId,
    jiraBaseUrl: rawBaseUrl,
    jiraEmail,
    jiraApiToken,
    groqApiKey,
  } = req.body;

  if (!jiraId || !jiraId.trim()) {
    return res.status(400).json({ success: false, error: 'MISSING_JIRA_ID', message: 'JIRA ID is required.' });
  }

  const jiraBaseUrl = rawBaseUrl || extractApiBase(process.env.JIRA_BASE_URL || '');
  const email = jiraEmail || process.env.JIRA_EMAIL || '';
  const token = jiraApiToken || process.env.JIRA_API_TOKEN || '';
  const groqKey = groqApiKey || process.env.GROQ_KEY || '';

  if (!jiraBaseUrl || !email || !token) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_JIRA_CREDS',
      message: 'Jira credentials are incomplete. Check your config panel or environment variables.',
    });
  }
  if (!groqKey) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_GROQ_KEY',
      message: 'Groq API key is missing. Check your config panel or environment variables.',
    });
  }

  // Fetch Jira story
  let jiraStory;
  try {
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    const response = await axios.get(
      `${jiraBaseUrl}/rest/api/3/issue/${jiraId.trim()}`,
      {
        headers: { Accept: 'application/json', Authorization: `Basic ${auth}` },
        timeout: 15000,
      }
    );
    jiraStory = response.data;
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 403) return res.status(401).json({ success: false, error: 'AUTH_FAILED', message: 'Jira authentication failed. Verify your email and API token.' });
    if (status === 404) return res.status(404).json({ success: false, error: 'JIRA_NOT_FOUND', message: `Jira issue "${jiraId}" was not found. Check the ID and base URL.` });
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') return res.status(408).json({ success: false, error: 'JIRA_TIMEOUT', message: 'Jira request timed out.' });
    return res.status(502).json({ success: false, error: 'JIRA_ERROR', message: `Jira API error: ${err.message}` });
  }

  const fields = jiraStory.fields || {};
  const summary = fields.summary || 'No summary provided.';
  const description = adfToText(fields.description).trim() || 'No description provided.';
  const acField = fields.customfield_10016 || fields.customfield_10014 || fields.customfield_10020 || null;
  const acceptanceCriteria = (typeof acField === 'string' ? acField : adfToText(acField)).trim() || 'No acceptance criteria provided.';
  const components = (fields.components || []).map(c => c.name).join(', ') || 'None';
  const labels = (fields.labels || []).join(', ') || 'None';
  const priority = fields.priority?.name || 'Not specified';
  const status = fields.status?.name || 'Unknown';
  const storyType = fields.issuetype?.name || 'Not specified';
  const linkedIssues = (fields.issuelinks || [])
    .map(l => { const linked = l.inwardIssue || l.outwardIssue; return linked ? `${l.type?.name || 'Link'}: ${linked.key}` : null; })
    .filter(Boolean).join('; ') || 'None';

  const storyText = `JIRA Issue: ${jiraStory.key}
Issue Type: ${storyType}
Summary: ${summary}
Status: ${status}
Priority: ${priority}
Components: ${components}
Labels: ${labels}
Linked Issues: ${linkedIssues}

--- DESCRIPTION ---
${description}

--- ACCEPTANCE CRITERIA ---
${acceptanceCriteria}`;

  // Call Groq
  let testStrategy;
  try {
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: storyText },
        ],
        temperature: 0,
        max_tokens: 4096,
      },
      {
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        timeout: 45000,
      }
    );

    testStrategy = groqResponse.data.choices?.[0]?.message?.content?.trim();
    if (!testStrategy) return res.status(502).json({ success: false, error: 'GROQ_EMPTY', message: 'Groq returned an empty response. Please try again.' });
  } catch (err) {
    const status = err.response?.status;
    if (status === 401) return res.status(401).json({ success: false, error: 'GROQ_AUTH_FAILED', message: 'Groq API key is invalid.' });
    if (status === 429) return res.status(429).json({ success: false, error: 'RATE_LIMIT', message: 'Groq rate limit reached. Please wait and try again.' });
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') return res.status(408).json({ success: false, error: 'GROQ_TIMEOUT', message: 'Groq request timed out.' });
    return res.status(502).json({ success: false, error: 'GROQ_ERROR', message: `Groq API error: ${err.message}` });
  }

  res.json({ success: true, jiraKey: jiraStory.key, summary, testStrategy });
}
