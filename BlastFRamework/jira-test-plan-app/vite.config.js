import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Read .env from parent BlastFRamework directory so credentials live in one place
  const env = loadEnv(mode, path.resolve(process.cwd(), '..'), '')

  const jiraTarget = (() => {
    try { return new URL(env.JIRA_BASE_URL || '').origin }
    catch { return 'https://atlassian.net' }
  })()

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/jira-proxy': {
          target: jiraTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/jira-proxy/, '')
        }
      }
    }
  }
})
