import { useState, useEffect } from 'react'

const STORAGE_KEY = 'jira-testplan-config'

const FIELDS = [
  { key: 'email',      label: 'JIRA Email',      placeholder: 'you@example.com', type: 'email',    icon: '📧' },
  { key: 'token',      label: 'JIRA API Token',   placeholder: 'ATATT3xFf...',   type: 'password', icon: '🔑' },
  { key: 'groqApiKey', label: 'Groq API Key',     placeholder: 'gsk_...',        type: 'password', icon: '🤖' },
  { key: 'ticketId',   label: 'JIRA Ticket ID',   placeholder: 'KAN-1',          type: 'text',     icon: '🎫' }
]

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') }
  catch { return null }
}

export default function ConfigForm({ onGenerate, loading, step, error }) {
  const [form, setForm]         = useState(() => loadSaved() || { ticketId: 'KAN-1' })
  const [shown, setShown]       = useState({})
  const [savedAt, setSavedAt]   = useState(() => loadSaved() ? localStorage.getItem(`${STORAGE_KEY}-ts`) : null)
  const [saveFlash, setSaveFlash] = useState(false)
  const [clearFlash, setClearFlash] = useState(false)

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const toggleShow = (key) => setShown(prev => ({ ...prev, [key]: !prev[key] }))

  const allFilled = FIELDS.every(f => (form[f.key] || '').trim())
  const hasSaved  = Boolean(loadSaved())

  const handleSubmit = (e) => {
    e.preventDefault()
    if (allFilled) onGenerate(form)
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    const ts = new Date().toLocaleTimeString()
    localStorage.setItem(`${STORAGE_KEY}-ts`, ts)
    setSavedAt(ts)
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 2000)
  }

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(`${STORAGE_KEY}-ts`)
    setSavedAt(null)
    setForm({ ticketId: 'KAN-1' })
    setClearFlash(true)
    setTimeout(() => setClearFlash(false), 2000)
  }

  const isSavedFormDirty = (() => {
    const saved = loadSaved()
    if (!saved) return false
    return FIELDS.some(f => (form[f.key] || '') !== (saved[f.key] || ''))
  })()

  return (
    <div className="glass-card p-6 sticky top-20">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
               style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
            ⚙️
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Configuration</h2>
            <p className="text-xs text-gray-500">Enter credentials to generate test plan</p>
          </div>
        </div>

        {/* Saved indicator */}
        {savedAt && !isSavedFormDirty && (
          <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
            ✅ Saved {savedAt}
          </span>
        )}
        {savedAt && isSavedFormDirty && (
          <span className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
            ✏️ Unsaved changes
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(field => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              {field.icon} {field.label}
            </label>
            <div className="relative">
              <input
                type={field.type === 'password' && shown[field.key] ? 'text' : field.type}
                placeholder={field.placeholder}
                value={form[field.key] || ''}
                onChange={e => set(field.key, e.target.value)}
                className="input-field"
                required
                autoComplete="off"
                spellCheck={false}
              />
              {field.type === 'password' && (
                <button
                  type="button"
                  onClick={() => toggleShow(field.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                  tabIndex={-1}
                >
                  {shown[field.key] ? '🙈' : '👁️'}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Error */}
        {error && (
          <div className="rounded-xl px-4 py-3 text-xs leading-relaxed"
               style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* Save / Clear row */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={!allFilled}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: saveFlash ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.15)',
              border: `1px solid ${saveFlash ? 'rgba(34,197,94,0.5)' : 'rgba(139,92,246,0.35)'}`,
              color: saveFlash ? '#4ade80' : '#a78bfa'
            }}
          >
            {saveFlash ? '✅ Saved!' : '💾 Save Config'}
          </button>

          {hasSaved && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: clearFlash ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${clearFlash ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: clearFlash ? '#f87171' : '#6b7280'
              }}
            >
              {clearFlash ? '🗑️ Cleared' : '🗑️ Clear'}
            </button>
          )}
        </div>

        {/* Generate */}
        <button
          type="submit"
          disabled={loading || !allFilled}
          className="btn-primary"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="truncate">{step || 'Processing...'}</span>
            </>
          ) : (
            <>🚀 Generate Test Plan</>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-5 pt-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <span className="flex-shrink-0">💾</span>
          <span>
            {hasSaved
              ? 'Config saved to browser storage — auto-loaded on next visit.'
              : 'Click Save Config to persist credentials across sessions.'}
          </span>
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <span className="flex-shrink-0">🌐</span>
          <span>JIRA: <span className="font-mono text-gray-500">ramesh-ogipuram.atlassian.net</span></span>
        </div>
      </div>
    </div>
  )
}
