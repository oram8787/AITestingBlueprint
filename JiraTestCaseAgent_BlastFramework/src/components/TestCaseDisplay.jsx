import { useState } from 'react';
import {
  Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow,
  HeadingLevel, WidthType, ShadingType
} from 'docx';

const TYPE_COLORS = {
  'Functional':  'badge-indigo',
  'Negative':    'badge-red',
  'Edge Case':   'badge-amber',
  'Integration': 'badge-green',
  'Smoke':       'badge-blue',
  'Regression':  'badge-purple',
};

const PRIORITY_CLASS = {
  'High':   'priority-high',
  'Medium': 'priority-medium',
  'Low':    'priority-low',
};

/* ── Download helpers ──────────────────────────────────── */

function triggerDownload(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildMarkdown(issue, testCases) {
  const lines = [
    `# Test Cases — ${issue.id}`,
    ``,
    `**Summary:** ${issue.summary}`,
    `**Type:** ${issue.issuetype} | **Priority:** ${issue.priority} | **Status:** ${issue.status}`,
    `**Reporter:** ${issue.reporter} | **Assignee:** ${issue.assignee}`,
    ``,
    `---`,
    ``,
    `## Summary Table`,
    ``,
    `| ID | Module | Title | Type | Priority | Status |`,
    `|---|---|---|---|---|---|`,
    ...testCases.map(tc =>
      `| ${tc.id} | ${tc.module} | ${tc.title} | ${tc.type} | ${tc.priority} | ${tc.status || 'Not Run'} |`
    ),
    ``,
    `---`,
    ``,
  ];

  testCases.forEach(tc => {
    lines.push(`## ${tc.id} — ${tc.title}`);
    lines.push(``);
    lines.push(`| Field | Value |`);
    lines.push(`|---|---|`);
    lines.push(`| **Module** | ${tc.module} |`);
    lines.push(`| **Type** | ${tc.type} |`);
    lines.push(`| **Priority** | ${tc.priority} |`);
    lines.push(`| **Preconditions** | ${tc.preconditions} |`);
    lines.push(`| **Test Data** | \`${tc.test_data || 'N/A'}\` |`);
    lines.push(``);
    lines.push(`**Description:** ${tc.description}`);
    lines.push(``);
    lines.push(`**Steps:**`);
    (tc.steps || []).forEach((s, i) => lines.push(`${i + 1}. ${s}`));
    lines.push(``);
    lines.push(`**Expected Result:** ${tc.expected_result}`);
    lines.push(``);
    lines.push(`**Actual Result:** ${tc.actual_result || '_(to be filled during execution)_'}`);
    lines.push(``);
    lines.push(`**Status:** ${tc.status || 'Not Run'}`);
    lines.push(``, `---`, ``);
  });

  return lines.join('\n');
}

function buildCsv(issue, testCases) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const headers = [
    'ID', 'Module', 'Title', 'Description', 'Type', 'Priority',
    'Preconditions', 'Test Data', 'Steps', 'Expected Result', 'Actual Result', 'Status'
  ];
  const rows = testCases.map(tc => [
    tc.id, tc.module, tc.title, tc.description, tc.type, tc.priority,
    tc.preconditions, tc.test_data || 'N/A',
    (tc.steps || []).join(' | '),
    tc.expected_result,
    tc.actual_result || '',
    tc.status || 'Not Run',
  ].map(esc).join(','));

  return [headers.map(esc).join(','), ...rows].join('\n');
}

async function buildDocx(issue, testCases) {
  const HDR_COLOR = '0F9B8E';

  const hdrCell = (text, span = 1) => new TableCell({
    columnSpan: span,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18 })],
      spacing: { before: 60, after: 60 },
    })],
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    shading: { type: ShadingType.SOLID, color: HDR_COLOR },
  });

  const dataCell = (text, bold = false) => new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: String(text ?? ''), bold, size: 18 })],
      spacing: { before: 60, after: 60 },
    })],
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
  });

  const summaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [hdrCell('Field'), hdrCell('Value')] }),
      new TableRow({ children: [dataCell('Issue ID', true),  dataCell(issue.id)] }),
      new TableRow({ children: [dataCell('Summary', true),   dataCell(issue.summary)] }),
      new TableRow({ children: [dataCell('Type', true),      dataCell(issue.issuetype)] }),
      new TableRow({ children: [dataCell('Priority', true),  dataCell(issue.priority)] }),
      new TableRow({ children: [dataCell('Status', true),    dataCell(issue.status)] }),
      new TableRow({ children: [dataCell('Reporter', true),  dataCell(issue.reporter)] }),
      new TableRow({ children: [dataCell('Assignee', true),  dataCell(issue.assignee)] }),
    ],
  });

  const tcTables = testCases.flatMap((tc, idx) => {
    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [hdrCell(`${tc.id}  ·  ${tc.title}`, 2)] }),
        new TableRow({ children: [dataCell('Module', true),       dataCell(tc.module)] }),
        new TableRow({ children: [dataCell('Type', true),         dataCell(tc.type)] }),
        new TableRow({ children: [dataCell('Priority', true),     dataCell(tc.priority)] }),
        new TableRow({ children: [dataCell('Description', true),  dataCell(tc.description)] }),
        new TableRow({ children: [dataCell('Preconditions', true),dataCell(tc.preconditions)] }),
        new TableRow({ children: [dataCell('Test Data', true),    dataCell(tc.test_data || 'N/A')] }),
        new TableRow({
          children: [
            dataCell('Steps', true),
            new TableCell({
              children: (tc.steps || []).map((s, i) => new Paragraph({
                children: [new TextRun({ text: `${i + 1}. ${s}`, size: 18 })],
                spacing: { before: 40, after: 40 },
              })),
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
            }),
          ],
        }),
        new TableRow({ children: [dataCell('Expected Result', true), dataCell(tc.expected_result)] }),
        new TableRow({ children: [dataCell('Actual Result', true),   dataCell(tc.actual_result || '')] }),
        new TableRow({ children: [dataCell('Status', true),          dataCell(tc.status || 'Not Run')] }),
      ],
    });
    return [
      ...(idx > 0 ? [new Paragraph({ text: '', spacing: { before: 300 } })] : []),
      table,
    ];
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: `Test Cases — ${issue.id}`, heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
        new Paragraph({ text: issue.summary, heading: HeadingLevel.HEADING_2, spacing: { after: 300 } }),
        summaryTable,
        new Paragraph({ text: '', spacing: { before: 400 } }),
        new Paragraph({ text: 'Test Cases', heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        ...tcTables,
      ],
    }],
  });

  return Packer.toBlob(doc);
}

/* ── Download Bar ──────────────────────────────────────── */

function DownloadBar({ issue, testCases }) {
  const [loading, setLoading] = useState(null);

  async function handleDownload(fmt) {
    setLoading(fmt);
    try {
      if (fmt === 'md') {
        triggerDownload(`test-cases-${issue.id}.md`, buildMarkdown(issue, testCases), 'text/markdown');
      } else if (fmt === 'csv') {
        triggerDownload(`test-cases-${issue.id}.csv`, buildCsv(issue, testCases), 'text/csv');
      } else if (fmt === 'docx') {
        const blob = await buildDocx(issue, testCases);
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = `test-cases-${issue.id}.docx`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="download-bar">
      <span className="download-label">📥 Download {testCases.length} test cases:</span>
      <div className="download-btns">
        {['md', 'docx', 'csv'].map(fmt => (
          <button
            key={fmt}
            className={`download-btn${loading === fmt ? ' dl-loading' : ''}`}
            onClick={() => handleDownload(fmt)}
            disabled={!!loading}
          >
            {loading === fmt ? <span className="spinner" style={{ width: 11, height: 11 }} /> : null}
            .{fmt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────── */

function IssueCard({ issue }) {
  return (
    <div className="issue-card">
      <div className="issue-meta-row">
        <span className="issue-key">{issue.id}</span>
        <span className="badge badge-gray">{issue.issuetype}</span>
        <span className={PRIORITY_CLASS[issue.priority] || 'badge-gray'}>{issue.priority}</span>
        <span className="badge badge-green">{issue.status}</span>
      </div>
      <h2 className="issue-summary">{issue.summary}</h2>
      <div className="issue-footer">
        <span>Reporter: {issue.reporter}</span>
        <span>Assignee: {issue.assignee}</span>
        {issue.labels?.length > 0 && <span>Labels: {issue.labels.join(', ')}</span>}
      </div>
    </div>
  );
}

function StatsBar({ testCases }) {
  const typeCounts = testCases.reduce((acc, tc) => {
    acc[tc.type] = (acc[tc.type] || 0) + 1; return acc;
  }, {});
  const priorityCounts = testCases.reduce((acc, tc) => {
    acc[tc.priority] = (acc[tc.priority] || 0) + 1; return acc;
  }, {});

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-num">{testCases.length}</span>
        <span className="stat-label">Total</span>
      </div>
      {Object.entries(typeCounts).map(([type, count]) => (
        <div key={type} className="stat-item">
          <span className="stat-num">{count}</span>
          <span className="stat-label">{type}</span>
        </div>
      ))}
      {Object.entries(priorityCounts).map(([p, count]) => (
        <div key={p} className="stat-item">
          <span className={`stat-num ${PRIORITY_CLASS[p] || ''}`} style={{ fontSize: 18, padding: '2px 8px' }}>{count}</span>
          <span className="stat-label">{p}</span>
        </div>
      ))}
    </div>
  );
}

function TestCaseCard({ tc, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="tca-card">
      <button className="tca-header" onClick={() => setOpen(o => !o)}>
        <div className="tca-header-left">
          <span className="tca-id">{tc.id}</span>
          <span className={`badge ${TYPE_COLORS[tc.type] || 'badge-gray'}`}>{tc.type}</span>
          <span className={PRIORITY_CLASS[tc.priority] || 'badge-gray'}>{tc.priority}</span>
        </div>
        <div className="tca-header-right">
          <span className="tca-module">📦 {tc.module}</span>
          <span className="tca-title">{tc.title}</span>
          <span className="tca-chevron">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="tca-body">
          <div className="tca-body-grid">
            <div>
              <div className="tca-field-label">Description</div>
              <div className="tca-field-value">{tc.description}</div>
            </div>
            <div>
              <div className="tca-field-label">Preconditions</div>
              <div className="tca-field-value">{tc.preconditions}</div>
            </div>
            <div>
              <div className="tca-field-label">Test Data</div>
              <div className={`tca-field-value${tc.test_data && tc.test_data !== 'N/A' ? ' code' : ''}`}>
                {tc.test_data || 'N/A'}
              </div>
            </div>
          </div>

          <div>
            <div className="tca-field-label">Test Steps</div>
            <ol className="tca-steps-list">
              {(tc.steps || []).map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>

          <div className="tca-expected">
            <div className="tca-field-label">Expected Result</div>
            <div className="tca-field-value">{tc.expected_result}</div>
          </div>

          <div className="tca-execution-row">
            <div className="tca-execution-field">
              <div className="tca-field-label">Actual Result</div>
              <div className="tca-blank">{tc.actual_result || '— to be filled during execution —'}</div>
            </div>
            <div className="tca-execution-field">
              <div className="tca-field-label">Status</div>
              <span className="tca-status-chip">{tc.status || 'Not Run'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────── */

export default function TestCaseDisplay({ issue, data }) {
  if (!data || !data.test_cases) {
    return <div className="card"><pre className="raw-output">{JSON.stringify(data, null, 2)}</pre></div>;
  }
  const { test_cases } = data;
  return (
    <div className="results">
      <IssueCard issue={issue} />
      <StatsBar testCases={test_cases} />
      <DownloadBar issue={issue} testCases={test_cases} />
      <div className="tc-list">
        {test_cases.map((tc, i) => (
          <TestCaseCard key={tc.id || i} tc={tc} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}
