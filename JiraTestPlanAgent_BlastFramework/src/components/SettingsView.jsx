import { useState } from 'react';

export default function SettingsView({ localConfig, serverConfig, onSave }) {
  const [form, setForm] = useState({
    jira_base_url: localConfig.jira_base_url || '',
    jira_email:    localConfig.jira_email    || '',
    jira_token:    localConfig.jira_token    || '',
    groq_api_key:  localConfig.groq_api_key  || '',
  });
  const [saved, setSaved] = useState(false);

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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

      <div className="form">
        <div className="field">
          <label>Jira Base URL</label>
          <input
            type="text"
            value={form.jira_base_url}
            onChange={set('jira_base_url')}
            placeholder="https://your-domain.atlassian.net"
          />
        </div>

        <div className="field">
          <label>Jira Email</label>
          <input
            type="email"
            value={form.jira_email}
            onChange={set('jira_email')}
            placeholder="you@example.com"
          />
        </div>

        <div className="field">
          <label>Jira API Token</label>
          <input
            type="password"
            value={form.jira_token}
            onChange={set('jira_token')}
            placeholder="ATATT..."
          />
        </div>

        <div className="field">
          <label>GROQ API Key</label>
          <input
            type="password"
            value={form.groq_api_key}
            onChange={set('groq_api_key')}
            placeholder="gsk_..."
          />
        </div>

        <div>
          <button
            className={`btn-primary${saved ? ' saved' : ''}`}
            onClick={handleSave}
          >
            {saved ? '✓ Saved!' : 'Save settings'}
          </button>
        </div>
      </div>

      <div className="server-status">
        <h3>Server <code>.env</code> status</h3>
        <ul>
          <StatusItem label="Jira URL"    value={serverConfig?.jira_base_url} />
          <StatusItem label="Jira Email"  value={serverConfig?.jira_email} />
          <StatusItem label="Jira Token"  value={serverConfig?.jira_token} />
          <StatusItem label="GROQ Key"    value={serverConfig?.groq_api_key} />
        </ul>
      </div>
    </div>
  );
}
