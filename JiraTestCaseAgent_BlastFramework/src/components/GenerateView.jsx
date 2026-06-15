import { useState } from 'react';
import HeroBanner from './HeroBanner';
import TestCaseDisplay from './TestCaseDisplay';

export default function GenerateView({ config, hasCredentials, onOpenSettings }) {
  const [issueId,    setIssueId]    = useState('KAN-1');
  const [loading,    setLoading]    = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState(null);

  async function handleGenerate() {
    if (!hasCredentials) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setLoadingMsg('Fetching JIRA issue...');
      const jiraRes = await fetch('/api/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, issue_id: issueId })
      });
      if (!jiraRes.ok) {
        const err = await jiraRes.json();
        throw new Error(err.error || 'Failed to fetch JIRA issue');
      }
      const issue = await jiraRes.json();

      setLoadingMsg('Generating test cases with AI...');
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groq_api_key: config.groq_api_key, issue })
      });
      if (!genRes.ok) {
        const err = await genRes.json();
        throw new Error(err.error || 'Failed to generate test cases');
      }
      const data = await genRes.json();
      setResult({ issue, testData: data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  }

  return (
    <div>
      <HeroBanner />

      {!hasCredentials && (
        <div className="warning-banner">
          <span>⚠️ Credentials not configured.</span>
          <button className="link-btn" onClick={onOpenSettings}>Open Settings →</button>
        </div>
      )}

      <div className="card">
        <div className="generate-row">
          <input
            className="issue-input"
            value={issueId}
            onChange={e => setIssueId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && hasCredentials && handleGenerate()}
            placeholder="e.g. KAN-1"
          />
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={loading || !hasCredentials}
          >
            {loading ? (
              <><span className="spinner" />{loadingMsg}</>
            ) : (
              'Generate Test Cases'
            )}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">❌ {error}</div>}

      {result && <TestCaseDisplay issue={result.issue} data={result.testData} />}
    </div>
  );
}
