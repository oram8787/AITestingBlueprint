import { useState, useEffect } from 'react';
import type { Config } from '../hooks/useConfig';
import { fetchServerConfig } from '../utils/api';

interface Props {
  config: Config;
  onSave: (config: Config) => void;
}

export default function ConfigPanel({ config, onSave }: Props) {
  const [form, setForm] = useState<Config>(config);
  const [showToken, setShowToken] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(config);
  }, [config]);

  const handleChange = (field: keyof Config) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLoadFromServer = async () => {
    setLoadMsg('Loading…');
    try {
      const serverConfig = await fetchServerConfig();
      setForm(prev => ({
        ...prev,
        jiraBaseUrl: serverConfig.jiraBaseUrl || prev.jiraBaseUrl,
        jiraEmail: serverConfig.jiraEmail || prev.jiraEmail,
      }));
      setLoadMsg('✓ Base URL and email loaded from server .env');
    } catch {
      setLoadMsg('✗ Could not reach server config endpoint');
    }
    setTimeout(() => setLoadMsg(''), 3000);
  };

  return (
    <div className="config-panel">
      <p className="config-note">
        Fields left blank will fall back to the server-side <code>.env</code> values. API tokens are never sent from the server to the browser.
      </p>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="cfg-base-url">Jira Base URL</label>
          <input
            id="cfg-base-url"
            type="url"
            value={form.jiraBaseUrl}
            onChange={handleChange('jiraBaseUrl')}
            placeholder="https://your-org.atlassian.net (leave blank to use .env)"
          />
        </div>

        <div className="field">
          <label htmlFor="cfg-email">Jira Email</label>
          <input
            id="cfg-email"
            type="email"
            value={form.jiraEmail}
            onChange={handleChange('jiraEmail')}
            placeholder="you@example.com (leave blank to use .env)"
          />
        </div>

        <div className="field">
          <label htmlFor="cfg-token">Jira API Token</label>
          <div className="input-with-toggle">
            <input
              id="cfg-token"
              type={showToken ? 'text' : 'password'}
              value={form.jiraApiToken}
              onChange={handleChange('jiraApiToken')}
              placeholder="Leave blank to use server .env token"
              autoComplete="off"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowToken(v => !v)}
              aria-label={showToken ? 'Hide token' : 'Show token'}
            >
              {showToken ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="cfg-groq">Groq API Key</label>
          <div className="input-with-toggle">
            <input
              id="cfg-groq"
              type={showGroqKey ? 'text' : 'password'}
              value={form.groqApiKey}
              onChange={handleChange('groqApiKey')}
              placeholder="Leave blank to use server .env key"
              autoComplete="off"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowGroqKey(v => !v)}
              aria-label={showGroqKey ? 'Hide key' : 'Show key'}
            >
              {showGroqKey ? '🙈' : '👁'}
            </button>
          </div>
        </div>
      </div>

      <div className="config-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? '✓ Saved' : 'Save Config'}
        </button>
        <button className="btn btn-secondary" onClick={handleLoadFromServer}>
          Load Base URL & Email from .env
        </button>
      </div>

      {loadMsg && <p className="config-load-msg">{loadMsg}</p>}
    </div>
  );
}
