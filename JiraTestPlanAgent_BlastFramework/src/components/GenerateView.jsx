import { useState } from 'react';
import axios from 'axios';
import TestPlanDisplay from './TestPlanDisplay';

function HeroBanner() {
  return (
    <div className="hero-banner">
      <svg className="hero-svg" viewBox="0 0 480 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* ── JIRA Ticket ── */}
        <rect x="30" y="14" width="110" height="90" rx="8"
          fill="var(--surface-2)" stroke="var(--border)" strokeWidth="1.5"/>
        <rect x="30" y="14" width="110" height="27" rx="8"
          fill="var(--accent-muted)"/>
        <rect x="30" y="33" width="110" height="8"
          fill="var(--accent-muted)"/>
        <text x="85" y="32" textAnchor="middle" fontSize="11"
          fill="var(--accent-hover)" fontWeight="700" fontFamily="monospace">KAN-1</text>
        <rect x="44" y="52" width="82" height="5" rx="2.5" fill="var(--border-light)"/>
        <rect x="44" y="62" width="64" height="5" rx="2.5" fill="var(--border-light)"/>
        <rect x="44" y="72" width="50" height="5" rx="2.5" fill="var(--border-light)"/>
        <rect x="44" y="82" width="70" height="5" rx="2.5" fill="var(--border)"/>
        <text x="85" y="118" textAnchor="middle" fontSize="10"
          fill="var(--text-dim)" fontFamily="-apple-system,sans-serif">JIRA Ticket</text>

        {/* ── Arrow 1 ── */}
        <path d="M148 59 L178 59" stroke="var(--border-light)" strokeWidth="1.5" strokeDasharray="4 3"/>
        <polygon points="178,54 187,59 178,64" fill="var(--border-light)"/>

        {/* ── Groq AI Circle ── */}
        <circle cx="220" cy="59" r="30"
          fill="var(--accent-muted)" stroke="var(--accent)" strokeWidth="1.5"/>
        <path d="M211 59 L215 49 L220 59 L225 49 L229 59"
          stroke="var(--accent-hover)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="213" y1="66" x2="227" y2="66"
          stroke="var(--accent-hover)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="216" y1="71" x2="224" y2="71"
          stroke="var(--accent-hover)" strokeWidth="1.2" strokeLinecap="round"/>
        <text x="220" y="103" textAnchor="middle" fontSize="10"
          fill="var(--text-dim)" fontFamily="-apple-system,sans-serif">Groq AI</text>

        {/* ── Arrow 2 ── */}
        <path d="M253 59 L283 59" stroke="var(--border-light)" strokeWidth="1.5" strokeDasharray="4 3"/>
        <polygon points="283,54 292,59 283,64" fill="var(--border-light)"/>

        {/* ── Test Plan Document ── */}
        <rect x="300" y="14" width="110" height="90" rx="8"
          fill="var(--surface-2)" stroke="var(--border)" strokeWidth="1.5"/>
        <rect x="300" y="14" width="110" height="27" rx="8"
          fill="rgba(16,185,129,0.12)"/>
        <rect x="300" y="33" width="110" height="8"
          fill="rgba(16,185,129,0.12)"/>
        <text x="355" y="32" textAnchor="middle" fontSize="10"
          fill="var(--green)" fontWeight="700" fontFamily="monospace">TEST PLAN</text>

        {/* Checkmark rows */}
        <polyline points="313,54 317,58 323,50"
          stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="328" y="52" width="60" height="5" rx="2.5" fill="var(--border-light)"/>

        <polyline points="313,67 317,71 323,63"
          stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="328" y="65" width="48" height="5" rx="2.5" fill="var(--border-light)"/>

        <polyline points="313,80 317,84 323,76"
          stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="328" y="78" width="55" height="5" rx="2.5" fill="var(--border-light)"/>

        <text x="355" y="118" textAnchor="middle" fontSize="10"
          fill="var(--text-dim)" fontFamily="-apple-system,sans-serif">IEEE 829 Test Plan</text>
      </svg>
      <p className="hero-label">Enter a JIRA issue ID below to generate a structured test plan with Groq AI</p>
    </div>
  );
}

export default function GenerateView({ config, hasCredentials, onOpenSettings }) {
  const [issueId, setIssueId] = useState('KAN-1');
  const [status, setStatus] = useState('idle');
  const [jiraIssue, setJiraIssue] = useState(null);
  const [testPlan, setTestPlan] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setStatus('fetching');
    setError(null);
    setJiraIssue(null);
    setTestPlan(null);

    try {
      const jiraRes = await axios.post('/api/jira', {
        jira_email:    config.jira_email,
        jira_token:    config.jira_token,
        jira_base_url: config.jira_base_url,
        issue_id:      issueId,
      });
      setJiraIssue(jiraRes.data);
      setStatus('generating');

      const genRes = await axios.post('/api/generate', {
        groq_api_key: config.groq_api_key,
        issue: jiraRes.data,
      });
      setTestPlan(genRes.data);
      setStatus('done');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStatus('error');
    }
  };

  const isLoading = status === 'fetching' || status === 'generating';
  const showHero = status === 'idle' && !jiraIssue && !testPlan;

  return (
    <div className="card">
      <h2 className="card-title">Generate Test Plan</h2>

      {showHero && <HeroBanner />}

      {!hasCredentials && (
        <div className="warning-banner">
          Missing credentials.{' '}
          <button className="link-btn" onClick={onOpenSettings}>Open Settings</button>
          {' '}or fill the server <code>.env</code>.
        </div>
      )}

      <div className="generate-row">
        <input
          className="issue-input"
          type="text"
          value={issueId}
          onChange={e => setIssueId(e.target.value)}
          placeholder="KAN-1"
          disabled={isLoading}
          onKeyDown={e => e.key === 'Enter' && !isLoading && hasCredentials && handleGenerate()}
        />
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={isLoading || !hasCredentials}
        >
          {status === 'fetching'   && <><span className="spinner" /> Fetching...</>}
          {status === 'generating' && <><span className="spinner" /> Generating...</>}
          {!isLoading && 'Generate'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {(jiraIssue || testPlan) && (
        <TestPlanDisplay issue={jiraIssue} result={testPlan} />
      )}
    </div>
  );
}
