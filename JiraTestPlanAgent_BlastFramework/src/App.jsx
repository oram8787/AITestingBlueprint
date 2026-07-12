import { useState, useEffect } from 'react';
import axios from 'axios';
import SettingsView from './components/SettingsView';
import GenerateView from './components/GenerateView';

const LS_KEY = 'jira_tpg_config';
const THEME_KEY = 'jira_tpg_theme';

function loadFromStorage() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}

function BrandIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="11" height="14" rx="2"
        fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
      <line x1="6" y1="8"  x2="11" y2="8"  stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="6" y1="11" x2="11" y2="11" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="6" y1="14" x2="9"  y2="14" stroke="rgba(255,255,255,0.4)"  strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="18" cy="7" r="5" fill="rgba(16,185,129,0.25)" stroke="#10B981" strokeWidth="1.5"/>
      <polyline points="15.5,7 17,8.5 20.5,5"
        stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="13" y1="12" x2="15.2" y2="10.2"
        stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2 1.5" strokeLinecap="round"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1"     x2="12" y2="3"/>
      <line x1="12" y1="21"    x2="12" y2="23"/>
      <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12"    x2="3"  y2="12"/>
      <line x1="21" y1="12"    x2="23" y2="12"/>
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState('generate');
  const [localConfig, setLocalConfig] = useState(loadFromStorage);
  const [serverConfig, setServerConfig] = useState(null);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const resolved = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', resolved);
    return resolved;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    axios.get('/api/config').then(res => setServerConfig(res.data)).catch(() => {});
  }, []);

  const config = {
    jira_base_url: localConfig.jira_base_url || serverConfig?.jira_base_url || '',
    jira_email:    localConfig.jira_email    || serverConfig?.jira_email    || '',
    jira_token:    localConfig.jira_token    || serverConfig?.jira_token    || '',
    groq_api_key:  localConfig.groq_api_key  || serverConfig?.groq_api_key  || '',
  };

  const hasCredentials =
    config.jira_base_url && config.jira_email && config.jira_token && config.groq_api_key;

  const saveSettings = (updated) => {
    setLocalConfig(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <BrandIcon />
            </div>
            <div className="brand-text">
              <h1>Jira → Test Plan Generator</h1>
              <div className="brand-sub">
                <span>B.L.A.S.T. · GROQ</span>
                <span className="model-badge">openai/gpt-oss-120b</span>
              </div>
            </div>
          </div>
          <nav className="nav">
            <button
              className={`nav-btn${view === 'generate' ? ' active' : ''}`}
              onClick={() => setView('generate')}
            >Generate</button>
            <button
              className={`nav-btn${view === 'settings' ? ' active' : ''}`}
              onClick={() => setView('settings')}
            >Settings</button>
            <button
              className="theme-toggle"
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {view === 'settings' ? (
          <SettingsView
            localConfig={localConfig}
            serverConfig={serverConfig}
            onSave={saveSettings}
          />
        ) : (
          <GenerateView
            config={config}
            hasCredentials={hasCredentials}
            onOpenSettings={() => setView('settings')}
          />
        )}
      </main>

      <footer className="footer">
        Lightweight React · Vercel serverless · credentials stay local
      </footer>
    </div>
  );
}
