import { useState, useEffect } from 'react';
import GenerateView from './components/GenerateView';
import SettingsView from './components/SettingsView';

const STORAGE_KEY       = 'jira_tcg_config';
const THEME_STORAGE_KEY = 'jira_tcg_theme';

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function loadTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
}

export default function App() {
  const [view,         setView]         = useState('generate');
  const [localConfig,  setLocalConfig]  = useState(loadLocal);
  const [serverConfig, setServerConfig] = useState({});
  const [theme,        setTheme]        = useState(loadTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(setServerConfig)
      .catch(() => {});
  }, []);

  function handleSave(cfg) {
    setLocalConfig(cfg);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  }

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  const config = {
    jira_email:    localConfig.jira_email    || serverConfig.jira_email    || '',
    jira_token:    localConfig.jira_token    || serverConfig.jira_token    || '',
    jira_base_url: localConfig.jira_base_url || serverConfig.jira_base_url || '',
    groq_api_key:  localConfig.groq_api_key  || serverConfig.groq_api_key  || '',
  };

  const hasCredentials = !!(
    config.jira_email && config.jira_token &&
    config.jira_base_url && config.groq_api_key
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <div className="brand-text">
              <h1>JIRA Test Case Generator</h1>
              <div className="brand-sub">
                <span>AI-powered test cases from JIRA issues</span>
                <span className="model-badge">Groq · openai/gpt-oss-120b</span>
              </div>
            </div>
          </div>
          <nav className="nav">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              className={`nav-btn ${view === 'generate' ? 'active' : ''}`}
              onClick={() => setView('generate')}
            >
              Generate
            </button>
            <button
              className={`nav-btn ${view === 'settings' ? 'active' : ''}`}
              onClick={() => setView('settings')}
            >
              Settings
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {view === 'generate' ? (
          <GenerateView
            config={config}
            hasCredentials={hasCredentials}
            onOpenSettings={() => setView('settings')}
          />
        ) : (
          <SettingsView
            localConfig={localConfig}
            serverConfig={serverConfig}
            onSave={handleSave}
          />
        )}
      </main>
    </div>
  );
}
