const TYPE_COLORS = {
  functional:   { color: '#818CF8', bg: 'rgba(129,140,248,.12)', border: 'rgba(129,140,248,.3)' },
  negative:     { color: '#F87171', bg: 'rgba(248,113,113,.12)', border: 'rgba(248,113,113,.3)' },
  'edge case':  { color: '#FBBF24', bg: 'rgba(251,191,36,.10)', border: 'rgba(251,191,36,.28)' },
  integration:  { color: '#34D399', bg: 'rgba(52,211,153,.10)', border: 'rgba(52,211,153,.28)' },
};

function typeStyle(type = '') {
  return TYPE_COLORS[type.toLowerCase()] || { color: '#7880B0', bg: 'rgba(120,128,176,.1)', border: 'rgba(120,128,176,.25)' };
}

const PRIORITY_COLORS = {
  critical: { color: '#C084FC', bg: 'rgba(192,132,252,.12)', border: 'rgba(192,132,252,.3)' },
  high:     { color: '#F87171', bg: 'rgba(248,113,113,.12)', border: 'rgba(248,113,113,.3)' },
  medium:   { color: '#FBBF24', bg: 'rgba(251,191,36,.10)', border: 'rgba(251,191,36,.28)' },
  low:      { color: '#34D399', bg: 'rgba(52,211,153,.10)', border: 'rgba(52,211,153,.28)' },
};

function PriorityBadge({ priority }) {
  const p = PRIORITY_COLORS[priority?.toLowerCase()] || { color: '#7880B0', bg: 'rgba(120,128,176,.1)', border: 'rgba(120,128,176,.25)' };
  return (
    <span
      className="priority-badge"
      style={{ color: p.color, background: p.bg, border: `1px solid ${p.border}` }}
    >
      {priority}
    </span>
  );
}

function IssueCard({ issue }) {
  if (!issue) return null;
  const f = issue.fields || {};
  return (
    <div className="issue-card">
      <div className="issue-meta-row">
        <span className="issue-key">{issue.key}</span>
        {f.issuetype?.name && <span className="issue-type-badge">{f.issuetype.name}</span>}
        {f.priority?.name  && <PriorityBadge priority={f.priority.name} />}
        {f.status?.name    && <span className="status-badge">{f.status.name}</span>}
      </div>
      <h3 className="issue-summary">{f.summary}</h3>
      <div className="issue-footer">
        {f.reporter?.displayName && <span>Reporter: <strong>{f.reporter.displayName}</strong></span>}
        {f.assignee?.displayName && <span>Assignee: <strong>{f.assignee.displayName}</strong></span>}
      </div>
    </div>
  );
}

function TestCaseCard({ tc, index }) {
  const s = typeStyle(tc.type);
  return (
    <div className="tc-card">
      <div className="tc-header">
        <span className="tc-id">{tc.id || `TC-${String(index + 1).padStart(3, '0')}`}</span>
        <span
          className="tc-type"
          style={{ color: s.color, background: s.bg, borderColor: s.border }}
        >
          {tc.type}
        </span>
      </div>

      <h4 className="tc-title">{tc.title}</h4>

      {tc.preconditions && (
        <div className="tc-row">
          <span className="tc-label">Preconditions</span>
          <p>{tc.preconditions}</p>
        </div>
      )}

      {tc.steps?.length > 0 && (
        <div className="tc-row">
          <span className="tc-label">Steps</span>
          <ol className="tc-steps">
            {tc.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>
      )}

      <div className="tc-expected">
        <span className="tc-label">Expected Result</span>
        <p>{tc.expected_result}</p>
      </div>
    </div>
  );
}

export default function TestPlanDisplay({ issue, result }) {
  if (!result) return null;
  const { test_plan, summary } = result;

  return (
    <div className="results">
      <IssueCard issue={issue} />

      <div className="test-plan-card">
        <div className="tp-header">
          <h2>Generated Test Plan</h2>
          <span className="tp-subtitle">{result.issue_id} · {summary}</span>
        </div>

        <div className="tp-grid">
          {test_plan?.objective    && <div className="tp-section"><h3>Objective</h3><p>{test_plan.objective}</p></div>}
          {test_plan?.scope        && <div className="tp-section"><h3>Scope</h3><p>{test_plan.scope}</p></div>}
          {test_plan?.out_of_scope && <div className="tp-section"><h3>Out of Scope</h3><p>{test_plan.out_of_scope}</p></div>}
          {test_plan?.environment  && <div className="tp-section"><h3>Environment</h3><p>{test_plan.environment}</p></div>}
          {test_plan?.risks        && <div className="tp-section tp-section-full"><h3>Risks</h3><p>{test_plan.risks}</p></div>}
        </div>

        {test_plan?.test_cases?.length > 0 && (
          <div className="tc-section">
            <h3 className="tc-section-title">
              Test Cases <span className="tc-count">{test_plan.test_cases.length}</span>
            </h3>
            <div className="tc-grid">
              {test_plan.test_cases.map((tc, i) => (
                <TestCaseCard key={tc.id || i} tc={tc} index={i} />
              ))}
            </div>
          </div>
        )}

        {test_plan?.raw && (
          <div className="tp-section tp-section-full">
            <h3>Raw Output</h3>
            <pre className="raw-output">{test_plan.raw}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
