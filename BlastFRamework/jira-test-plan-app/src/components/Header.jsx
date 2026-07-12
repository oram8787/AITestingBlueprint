export default function Header() {
  return (
    <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.35)' }}
            className="backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
            🧪
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight"
                style={{ background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              JIRA Test Plan Generator
            </h1>
            <p className="text-xs text-gray-500 leading-tight">IEEE 829 · ISTQB · Powered by Groq AI</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>
            B.L.A.S.T. Framework
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
        </div>
      </div>
    </header>
  )
}
