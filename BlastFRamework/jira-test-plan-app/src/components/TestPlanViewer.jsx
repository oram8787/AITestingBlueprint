import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function TicketMeta({ ticket }) {
  const badges = [
    { label: ticket.key,      color: 'rgba(139,92,246,0.2)',  border: 'rgba(139,92,246,0.4)',  text: '#c4b5fd' },
    { label: ticket.status,   color: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', text: '#93c5fd' },
    { label: ticket.priority, color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', text: '#fcd34d' }
  ]
  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map(b => (
        <span key={b.label}
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{ background: b.color, border: `1px solid ${b.border}`, color: b.text }}>
          {b.label}
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1 truncate max-w-xs">{ticket.summary}</span>
    </div>
  )
}

function Spinner({ step }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-5">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full"
             style={{ border: '3px solid rgba(139,92,246,0.2)' }} />
        <div className="absolute inset-0 rounded-full animate-spin"
             style={{ border: '3px solid transparent', borderTopColor: '#7c3aed' }} />
        <div className="absolute inset-2 rounded-full animate-spin"
             style={{ border: '2px solid transparent', borderTopColor: '#3b82f6', animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-purple-300">{step}</p>
        <p className="text-xs text-gray-600 mt-1">This may take a few seconds…</p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
           style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
        📋
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Ready to Generate</h3>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
          Fill in your JIRA and Groq credentials on the left, then click{' '}
          <strong className="text-purple-400">Generate Test Plan</strong> to produce an
          IEEE 829 compliant document from your JIRA ticket.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {['IEEE 829', 'ISTQB', 'Traceability Matrix', 'Entry & Exit Criteria'].map(tag => (
          <span key={tag}
                className="text-xs px-2.5 py-1 rounded-full text-gray-500"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function TestPlanViewer({ testPlan, ticketData, loading, step }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(testPlan)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="glass-card overflow-hidden flex flex-col" style={{ minHeight: '70vh' }}>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-white flex-shrink-0">📋 Test Plan</span>
          {ticketData && <TicketMeta ticket={ticketData} />}
        </div>

        {testPlan && (
          <button
            onClick={copy}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ml-3"
            style={{
              background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: copied ? '#4ade80' : '#9ca3af'
            }}
          >
            {copied ? '✅ Copied!' : '📄 Copy Markdown'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading  && <Spinner step={step} />}
        {!loading && !testPlan && <EmptyState />}
        {!loading && testPlan && (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {testPlan}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
