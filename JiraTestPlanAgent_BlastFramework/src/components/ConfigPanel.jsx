import { useState } from 'react';

export default function ConfigPanel({ config, onChange, envLoaded }) {
  const [expanded, setExpanded] = useState(false);

  const set = (key) => (e) => onChange((prev) => ({ ...prev, [key]: e.target.value }));

  const hasCredentials =
    config.jira_email && config.jira_token && config.jira_base_url && config.groq_api_key;

  return (
    <div className="config-panel">
      <div className="config-header" onClick={() => setExpanded(!expanded)}>
        <div className="config-title">
          <h2>Configuration</h2>
          {envLoaded && hasCredentials && (
            <span className="badge badge-green">✓ Credentials Ready</span>
          )}
          {envLoaded && !hasCredentials && (
            <span className="badge badge-yellow">⚠ Credentials Incomplete</span>
          )}
        </div>
        <button className="toggle-btn" type="button">
          {expanded ? '▲ Collapse' : '▼ Edit'}
        </button>
      </div>

      {!expanded && (
        <div className="config-summary">
          <span className="chip">
            Issue: <strong>{config.issue_id || 'KAN-1'}</strong>
          </span>
          <span className="chip">
            JIRA: <strong>{config.jira_email || '—'}</strong>
          </span>
          <span className="chip">
            Base URL: <strong>{config.jira_base_url ? new URL(config.jira_base_url).hostname : '—'}</strong>
          </span>
          <span className="chip">
            Groq: <strong>{config.groq_api_key ? '✓ Set' : '✗ Not set'}</strong>
          </span>
        </div>
      )}

      {expanded && (
        <div className="config-fields">
          <div className="field-row">
            <div className="field">
              <label htmlFor="issue_id">JIRA Issue ID</label>
              <input
                id="issue_id"
                type="text"
                value={config.issue_id}
                onChange={set('issue_id')}
                placeholder="KAN-1"
              />
            </div>
            <div className="field">
              <label htmlFor="jira_email">JIRA Email</label>
              <input
                id="jira_email"
                type="email"
                value={config.jira_email}
                onChange={set('jira_email')}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field field-wide">
              <label htmlFor="jira_base_url">JIRA Base URL</label>
              <input
                id="jira_base_url"
                type="text"
                value={config.jira_base_url}
                onChange={set('jira_base_url')}
                placeholder="https://yourorg.atlassian.net/..."
              />
              <span className="field-hint">
                Paste your full board URL — the origin will be extracted automatically.
              </span>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="jira_token">JIRA API Token</label>
              <input
                id="jira_token"
                type="password"
                value={config.jira_token}
                onChange={set('jira_token')}
                placeholder="ATATT3xF..."
              />
            </div>
            <div className="field">
              <label htmlFor="groq_api_key">Groq API Key</label>
              <input
                id="groq_api_key"
                type="password"
                value={config.groq_api_key}
                onChange={set('groq_api_key')}
                placeholder="gsk_..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
