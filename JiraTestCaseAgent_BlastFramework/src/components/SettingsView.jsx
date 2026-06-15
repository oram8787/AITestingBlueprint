import { useState } from 'react';

function parseEnvContent(text) {
  const map = {};
  text.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    map[key] = val;
  });
  return map;
}

export default function SettingsView({ localConfig, serverConfig, onSave }) {
  const [form, setForm] = useState({
    jira_base_url: localConfig.jira_base_url || '',
    jira_email:    localConfig.jira_email    || '',
    jira_token:    localConfig.jira_token    || '',
    groq_api_key:  localConfig.groq_api_key  || '',
  });
  const [saved,      setSaved]      = useState(false);
  const [envText,    setEnvText]    = useState('');
  const [parseState, setParseState] = useState('idle'); // idle | ok | error

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  function handleLoadEnv() {
    if (!envText.trim()) { setParseState('error'); return; }
    const parsed = parseEnvContent(envText);
    const updates = {
      jira_email:    parsed.JIRA_EMAIL     || form.jira_email,
      jira_token:    parsed.JIRA_API_TOKEN || form.jira_token,
      jira_base_url: parsed.JIRA_BASE_URL  || form.jira_base_url,
      groq_api_key:  parsed.GROQ_KEY       || form.groq_api_key,
    };
    const anyLoaded = Object.values(parsed).length > 0;
    if (!anyLoaded) { setParseState('error'); return; }
    setForm(updates);
    setEnvText('');
    setParseState('ok');
    setTimeout(() => setParseState('idle'), 3000);
  }

  function handleSave() {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleSaveAndReload() {
    onSave(form);
    setTimeout(() => window.location.reload(), 300);
  }

  const StatusItem = ({ label, value }) => (
    <li>
      {label}:{' '}
      {value
        ? <span className="status-set">set</span>
        : <em className="status-not-set">not set</em>
      }
    </li>
  );

  return (
    <div className="card">
      <h2 className="card-title">Settings</h2>
      <p className="card-subtitle">
        Stored locally in your browser. Blank fields fall back to the server <code>.env</code>.
      </p>

      {/* ── .env Import ── */}
      <div className="env-import-section">
        <div className="env-import-header">
          <span className="env-import-icon">📄</span>
          <div>
            <div className="env-import-title">Import from .env file</div>
            <div className="env-import-sub">Paste your .env file contents below — keys will be extracted automatically</div>
          </div>
        </div>

        <textarea
          className="env-textarea"
          value={envText}
          onChange={e => { setEnvText(e.target.value); setParseState('idle'); }}
          placeholder={`GROQ_KEY="gsk_..."\nJIRA_EMAIL="you@example.com"\nJIRA_API_TOKEN="ATATT..."\nJIRA_BASE_URL="https://your-domain.atlassian.net/..."`}
          rows={5}
          spellCheck={false}
          autoComplete="off"
        />

        <div className="env-import-actions">
          <button className="btn-secondary" onClick={handleLoadEnv}>
            ⚡ Parse & Load fields
          </button>
          {parseState === 'ok' && (
            <span className="parse-feedback parse-ok">✓ Fields loaded — review below and save</span>
          )}
          {parseState === 'error' && (
            <span className="parse-feedback parse-error">✗ No valid KEY=VALUE lines found</span>
          )}
        </div>
      </div>

      <div className="section-divider">
        <span>or enter fields manually</span>
      </div>

      {/* ── Manual Fields ── */}
      <div className="form">
        <div className="field">
          <label>Jira Base URL</label>
          <input
            type="text"
            autoComplete="off"
            value={form.jira_base_url}
            onChange={set('jira_base_url')}
            placeholder="https://your-domain.atlassian.net"
          />
        </div>

        <div className="field">
          <label>Jira Email</label>
          <input
            type="text"
            autoComplete="off"
            value={form.jira_email}
            onChange={set('jira_email')}
            placeholder="you@example.com"
          />
        </div>

        <div className="field">
          <label>Jira API Token</label>
          <input
            type="password"
            autoComplete="new-password"
            value={form.jira_token}
            onChange={set('jira_token')}
            placeholder="ATATT..."
          />
        </div>

        <div className="field">
          <label>GROQ API Key</label>
          <input
            type="password"
            autoComplete="new-password"
            value={form.groq_api_key}
            onChange={set('groq_api_key')}
            placeholder="gsk_..."
          />
        </div>

        <div className="save-actions">
          <button
            className={`btn-primary${saved ? ' saved' : ''}`}
            onClick={handleSave}
          >
            {saved ? '✓ Saved!' : 'Save settings'}
          </button>
          <button className="btn-secondary" onClick={handleSaveAndReload}>
            Save & Reload app
          </button>
        </div>
      </div>

      <div className="server-status">
        <h3>Server <code>.env</code> status</h3>
        <ul>
          <StatusItem label="Jira URL"   value={serverConfig?.jira_base_url} />
          <StatusItem label="Jira Email" value={serverConfig?.jira_email} />
          <StatusItem label="Jira Token" value={serverConfig?.jira_token} />
          <StatusItem label="GROQ Key"   value={serverConfig?.groq_api_key} />
        </ul>
      </div>
    </div>
  );
}
