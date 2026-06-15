export default function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-left">
        <div className="hero-framework">
          RICE-POT FRAMEWORK &nbsp;·&nbsp; BLAST PROTOCOL &nbsp;·&nbsp; GROQ LLM
        </div>
        <h2 className="hero-heading">
          JIRA Story &nbsp;<span className="hero-arrow">→</span>&nbsp; Test Cases
        </h2>
        <p className="hero-desc">
          Enter any JIRA ID. The AI fetches your story, analyses every field, and generates
          structured, fully traceable test cases covering 6 test types.
        </p>
        <div className="hero-tags">
          <span className="hero-tag ht-smoke">Smoke</span>
          <span className="hero-tag ht-functional">Functional</span>
          <span className="hero-tag ht-negative">Negative</span>
          <span className="hero-tag ht-edge">Edge Case</span>
          <span className="hero-tag-more">+ Integration · Regression</span>
        </div>
        <div className="hero-formats">
          <span className="hero-format-pill">.md</span>
          <span className="hero-format-pill">.docx</span>
          <span className="hero-format-pill">.csv</span>
        </div>
      </div>

      <div className="hero-right">
        <div className="flow-diagram">

          {/* JIRA Story card */}
          <div className="flow-card flow-jira">
            <div className="flow-card-label">JIRA STORY</div>
            <div className="flow-jira-icon">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="6" fill="#0052CC"/>
                <path d="M16 7L7 16l4 4 5-5 5 5 4-4-9-9z" fill="white" opacity="0.9"/>
                <path d="M16 25l9-9-4-4-5 5-5-5-4 4 9 9z" fill="white"/>
              </svg>
            </div>
            <span className="flow-badge">KAN-1</span>
            <div className="flow-lines">
              <div className="flow-line fl-full" />
              <div className="flow-line fl-3q" />
              <div className="flow-line fl-half" />
              <div className="flow-line fl-3q" />
            </div>
            <div className="flow-card-sub">Story Fields</div>
          </div>

          {/* Connector */}
          <div className="flow-connector">
            <div className="flow-dots">
              <span /><span /><span />
            </div>
            <div className="flow-groq-node">⚡</div>
            <div className="flow-dots">
              <span /><span /><span />
            </div>
            <div className="flow-groq-label">Groq LLM</div>
          </div>

          {/* Test Cases card */}
          <div className="flow-card flow-tc">
            <div className="flow-card-label">TEST CASES</div>
            <span className="flow-badge">KAN-1</span>
            <div className="flow-tc-items">
              <div className="flow-tc-row"><span className="ftc-dot ftc-smoke" />Smoke</div>
              <div className="flow-tc-row"><span className="ftc-dot ftc-functional" />Functional</div>
              <div className="flow-tc-row"><span className="ftc-dot ftc-negative" />Negative</div>
              <div className="flow-tc-row"><span className="ftc-dot ftc-edge" />Edge Case</div>
              <div className="flow-tc-row"><span className="ftc-dot ftc-integration" />Integration</div>
            </div>
            <div className="flow-tc-formats">
              <span>.md</span><span>.docx</span><span>.csv</span>
            </div>
            <div className="flow-card-sub">Test Case Doc</div>
          </div>

        </div>
      </div>
    </div>
  );
}
