import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useConfig } from './hooks/useConfig';
import ConfigPanel from './components/ConfigPanel';
import HeroBanner from './components/HeroBanner';
import StrategyOutput from './components/StrategyOutput';
import { generateStrategy, type GenerateResult } from './utils/api';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { config, saveConfig } = useConfig();
  const [jiraId, setJiraId] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [configOpen, setConfigOpen] = useState(false);

  const handleGenerate = async () => {
    const id = jiraId.trim();
    if (!id) return;

    setStatus('loading');
    setResult(null);
    setErrorMsg('');

    try {
      const data = await generateStrategy(id, config);
      setResult(data);
      setStatus('success');
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStatus('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleGenerate();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon" aria-hidden="true">⚙</span>
            <h1>Test Strategy Generator</h1>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <><span aria-hidden="true">☀</span> Light Mode</>
            ) : (
              <><span aria-hidden="true">☾</span> Dark Mode</>
            )}
          </button>
        </div>
      </header>

      <main className="main">
        <div className="container">

          {/* Hero Banner */}
          <HeroBanner />

          {/* Config Section */}
          <section className="card config-card">
            <button
              className="collapsible-trigger"
              onClick={() => setConfigOpen(o => !o)}
              aria-expanded={configOpen}
            >
              <span>
                <span aria-hidden="true">⚙ </span>
                Configuration
              </span>
              <span className="chevron" aria-hidden="true">{configOpen ? '▲' : '▼'}</span>
            </button>
            {configOpen && <ConfigPanel config={config} onSave={saveConfig} />}
          </section>

          {/* Generator Section */}
          <section className="card generate-card">
            <h2 className="section-title">Generate Test Strategy</h2>
            <div className="generate-row">
              <div className="field">
                <label htmlFor="jira-id-input">JIRA ID</label>
                <input
                  id="jira-id-input"
                  type="text"
                  value={jiraId}
                  onChange={e => setJiraId(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. KAN-1"
                  disabled={status === 'loading'}
                />
              </div>
              <button
                className="btn btn-primary btn-generate"
                onClick={handleGenerate}
                disabled={status === 'loading' || !jiraId.trim()}
              >
                {status === 'loading' ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Generating…
                  </>
                ) : (
                  'Generate Strategy'
                )}
              </button>
            </div>

            {status === 'loading' && (
              <p className="loading-hint">
                Fetching Jira story and generating strategy via Groq — this may take up to 30 seconds.
              </p>
            )}

            {status === 'error' && (
              <div className="alert alert-error" role="alert">
                <strong>Error: </strong>{errorMsg}
              </div>
            )}
          </section>

          {/* Output Section */}
          {status === 'success' && result && (
            <StrategyOutput result={result} />
          )}

        </div>
      </main>

      <footer className="footer">
        <p>Jira REST API + Groq LLM (llama-3.3-70b-versatile) · RICE-POT Test Strategy Generator</p>
      </footer>
    </div>
  );
}
