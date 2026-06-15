import type { Config } from '../hooks/useConfig';

export interface GenerateResult {
  jiraKey: string;
  summary: string;
  testStrategy: string;
}

export async function fetchServerConfig(): Promise<{ jiraBaseUrl: string; jiraEmail: string }> {
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('Failed to fetch server config');
  return res.json() as Promise<{ jiraBaseUrl: string; jiraEmail: string }>;
}

export async function generateStrategy(jiraId: string, config: Config): Promise<GenerateResult> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jiraId,
      jiraBaseUrl: config.jiraBaseUrl || undefined,
      jiraEmail: config.jiraEmail || undefined,
      jiraApiToken: config.jiraApiToken || undefined,
      groqApiKey: config.groqApiKey || undefined,
    }),
  });

  const data = (await res.json()) as { success: boolean; message?: string } & Partial<GenerateResult>;

  if (!data.success) {
    throw new Error(data.message ?? 'An unexpected error occurred.');
  }

  return data as GenerateResult;
}
