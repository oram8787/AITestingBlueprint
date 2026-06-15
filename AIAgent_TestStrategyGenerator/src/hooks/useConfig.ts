import { useState } from 'react';

export interface Config {
  jiraBaseUrl: string;
  jiraEmail: string;
  jiraApiToken: string;
  groqApiKey: string;
}

const STORAGE_KEY = 'tsg-config';

const EMPTY_CONFIG: Config = {
  jiraBaseUrl: '',
  jiraEmail: '',
  jiraApiToken: '',
  groqApiKey: '',
};

export function useConfig() {
  const [config, setConfigState] = useState<Config>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...EMPTY_CONFIG, ...JSON.parse(saved) } : EMPTY_CONFIG;
    } catch {
      return EMPTY_CONFIG;
    }
  });

  const saveConfig = (next: Config) => {
    setConfigState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const clearConfig = () => {
    setConfigState(EMPTY_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { config, saveConfig, clearConfig };
}
