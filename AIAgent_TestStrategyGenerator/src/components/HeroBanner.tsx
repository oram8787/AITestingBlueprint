export default function HeroBanner() {
  return (
    <section className="hero-banner" aria-label="Application overview">
      <div className="hero-body">

        {/* Left — text */}
        <div className="hero-text">
          <p className="hero-eyebrow">RICE-POT Framework · BLAST Protocol · Groq LLM</p>
          <h2 className="hero-headline">Jira Story → Test Strategy</h2>
          <p className="hero-desc">
            Enter any JIRA ID. The AI fetches your story, analyses every field, and
            generates a structured, fully traceable 8-section Test Strategy document.
          </p>
          <div className="hero-pills">
            <span className="hero-pill">Objective</span>
            <span className="hero-pill">Scope</span>
            <span className="hero-pill">Focus Areas</span>
            <span className="hero-pill">Approach</span>
            <span className="hero-pill hero-pill--muted">+ 4 more sections</span>
          </div>
          <div className="hero-exports">
            <span className="export-tag">.md</span>
            <span className="export-tag">.docx</span>
            <span className="export-tag">.pdf</span>
          </div>
        </div>

        {/* Right — SVG illustration */}
        <div className="hero-visual" aria-hidden="true">
          <svg
            className="hero-svg"
            viewBox="0 0 440 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.10" />
              </filter>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" className="svg-arrow-fill" />
              </marker>
            </defs>

            {/* ── JIRA CARD ── */}
            <rect x="4" y="20" width="116" height="150" rx="10" className="svg-card" filter="url(#card-shadow)" />
            {/* Blue Jira header */}
            <rect x="4" y="20" width="116" height="42" rx="10" fill="#0052CC" />
            <rect x="4" y="45" width="116" height="17" fill="#0052CC" />
            <text x="62" y="38" textAnchor="middle" fill="white" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="700" letterSpacing="0.05em">JIRA STORY</text>
            {/* Big J */}
            <text x="62" y="56" textAnchor="middle" fill="white" fontSize="22" fontFamily="system-ui,sans-serif" fontWeight="900">J</text>
            {/* Story ID badge */}
            <rect x="14" y="72" width="36" height="14" rx="4" fill="#EFF6FF" />
            <text x="32" y="83" textAnchor="middle" fill="#0052CC" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="700">KAN-1</text>
            {/* Content lines */}
            <rect x="14" y="94" width="90" height="6" rx="3" className="svg-line" />
            <rect x="14" y="106" width="74" height="6" rx="3" className="svg-line" />
            <rect x="14" y="118" width="84" height="6" rx="3" className="svg-line" />
            <rect x="14" y="130" width="62" height="6" rx="3" className="svg-line" />
            <rect x="14" y="142" width="78" height="6" rx="3" className="svg-line" />
            <text x="62" y="174" textAnchor="middle" fontSize="8" fontFamily="system-ui,sans-serif" className="svg-label">Story Fields</text>

            {/* ── ARROW 1 ── */}
            <line x1="124" y1="96" x2="156" y2="96" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#arrowhead)" />

            {/* ── GROQ AI NODE ── */}
            {/* Outer glow */}
            <circle cx="196" cy="96" r="46" fill="var(--accent)" opacity="0.06" />
            {/* Main circle */}
            <circle cx="196" cy="96" r="37" className="svg-card" stroke="var(--accent)" strokeWidth="2" />
            {/* Inner ring */}
            <circle cx="196" cy="96" r="29" fill="none" stroke="var(--accent)" strokeWidth="0.8" opacity="0.25" />
            {/* Lightning bolt */}
            <path d="M202 68 L185 96 L196 96 L190 124 L212 89 L201 89 Z" fill="var(--accent)" />
            {/* Groq label */}
            <text x="196" y="152" textAnchor="middle" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="700" fill="var(--accent)">Groq LLM</text>
            <text x="196" y="164" textAnchor="middle" fontSize="7.5" fontFamily="system-ui,sans-serif" className="svg-label">llama-3.3-70b-versatile</text>

            {/* ── ARROW 2 ── */}
            <line x1="236" y1="96" x2="268" y2="96" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#arrowhead)" />

            {/* ── TEST STRATEGY DOCUMENT ── */}
            <rect x="272" y="10" width="158" height="175" rx="10" className="svg-card" filter="url(#card-shadow)" />
            {/* Folded corner */}
            <polygon points="402,10 430,10 430,38" className="svg-fold" />
            <polygon points="402,10 430,38 402,38" className="svg-fold-crease" />
            {/* Blue header */}
            <rect x="272" y="10" width="130" height="38" rx="10" fill="var(--accent)" />
            <rect x="272" y="32" width="130" height="16" fill="var(--accent)" />
            <text x="337" y="25" textAnchor="middle" fill="white" fontSize="7.5" fontFamily="system-ui,sans-serif" fontWeight="700" letterSpacing="0.05em">TEST STRATEGY</text>
            <text x="337" y="38" textAnchor="middle" fill="white" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="900">KAN-1</text>

            {/* 8 Section rows */}
            {[
              { label: 'Objective',          w: 82, color: 'var(--accent)' },
              { label: 'Scope',              w: 55, color: 'var(--accent)' },
              { label: 'Focus Areas',        w: 70, color: 'var(--accent)' },
              { label: 'Approach',           w: 62, color: 'var(--accent)' },
              { label: 'Deliverables',       w: 74, color: '#16a34a' },
              { label: 'Team & Schedule',    w: 88, color: '#16a34a' },
              { label: 'Entry & Exit',       w: 66, color: '#16a34a' },
              { label: 'Risks',              w: 44, color: '#f59e0b' },
            ].map((s, i) => (
              <g key={s.label}>
                <rect x="284" y={56 + i * 14} width="7" height="7" rx="2" fill={s.color} />
                <text x="295" y={64 + i * 14} fontSize="7" fontFamily="system-ui,sans-serif" className="svg-section-label">{s.label}</text>
                <rect x="354" y={58 + i * 14} width={s.w - 30} height="5" rx="2" className="svg-line" opacity="0.6" />
              </g>
            ))}

            {/* Export badges */}
            <rect x="282" y="173" width="26" height="11" rx="3" fill="var(--accent)" opacity="0.12" stroke="var(--accent)" strokeWidth="0.8" />
            <text x="295" y="181.5" textAnchor="middle" fontSize="7" fontFamily="system-ui,monospace" fontWeight="700" fill="var(--accent)">.md</text>
            <rect x="312" y="173" width="34" height="11" rx="3" fill="var(--accent)" opacity="0.12" stroke="var(--accent)" strokeWidth="0.8" />
            <text x="329" y="181.5" textAnchor="middle" fontSize="7" fontFamily="system-ui,monospace" fontWeight="700" fill="var(--accent)">.docx</text>
            <rect x="350" y="173" width="28" height="11" rx="3" fill="var(--accent)" opacity="0.12" stroke="var(--accent)" strokeWidth="0.8" />
            <text x="364" y="181.5" textAnchor="middle" fontSize="7" fontFamily="system-ui,monospace" fontWeight="700" fill="var(--accent)">.pdf</text>

            <text x="351" y="197" textAnchor="middle" fontSize="8" fontFamily="system-ui,sans-serif" className="svg-label">Test Strategy Doc</text>
          </svg>
        </div>
      </div>
    </section>
  );
}
