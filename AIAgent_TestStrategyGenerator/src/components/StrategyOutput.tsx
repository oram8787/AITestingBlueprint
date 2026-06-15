import { useState } from 'react';
import { marked } from 'marked';
import type { GenerateResult } from '../utils/api';
import { downloadMarkdown, downloadDocx, downloadPdf } from '../utils/export';

interface Props {
  result: GenerateResult;
}

const OUTPUT_ID = 'strategy-content';

export default function StrategyOutput({ result }: Props) {
  const [exporting, setExporting] = useState<string | null>(null);

  const filename = `test-strategy-${result.jiraKey}`;

  const html = marked.parse(result.testStrategy, { async: false }) as string;

  const handleExport = async (type: 'md' | 'docx' | 'pdf') => {
    setExporting(type);
    try {
      if (type === 'md') {
        downloadMarkdown(result.testStrategy, filename);
      } else if (type === 'docx') {
        await downloadDocx(result.testStrategy, filename);
      } else {
        await downloadPdf(OUTPUT_ID, filename);
      }
    } catch (err) {
      console.error(`Export ${type} failed:`, err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <section className="card output-card">
      <div className="output-header">
        <div className="output-meta">
          <span className="jira-badge">{result.jiraKey}</span>
          <span className="output-summary">{result.summary}</span>
        </div>
        <div className="export-buttons">
          <span className="export-label">Export:</span>
          <button
            className="btn btn-export"
            onClick={() => handleExport('md')}
            disabled={exporting !== null}
          >
            {exporting === 'md' ? '…' : '.md'}
          </button>
          <button
            className="btn btn-export"
            onClick={() => handleExport('docx')}
            disabled={exporting !== null}
          >
            {exporting === 'docx' ? '…' : '.docx'}
          </button>
          <button
            className="btn btn-export"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
          >
            {exporting === 'pdf' ? '…' : '.pdf'}
          </button>
        </div>
      </div>

      <div
        id={OUTPUT_ID}
        className="strategy-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
