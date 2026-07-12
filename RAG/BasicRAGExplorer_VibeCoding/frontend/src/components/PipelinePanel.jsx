import { useRef, useState } from "react";

const STAGE_META = [
  { key: "load", label: "Load PDF", icon: "📄", color: "#22c55e" },
  { key: "chunk", label: "Chunk", icon: "✂️", color: "#14b8a6" },
  { key: "embed", label: "Embed (Nomic)", icon: "🧬", color: "#3b82f6" },
  { key: "store", label: "Store (ChromaDB)", icon: "🗄️", color: "#6366f1" },
];

function StageCard({ meta, data }) {
  const active = Boolean(data);
  return (
    <div
      className={`stage-card ${active ? "stage-card--active" : ""}`}
      style={{ "--accent": meta.color }}
    >
      <div className="stage-card__icon">{meta.icon}</div>
      <div className="stage-card__label">{meta.label}</div>
      {active ? (
        <div className="stage-card__stats">
          {meta.key === "load" && (
            <>
              <div>{data.num_pages} pages</div>
              <div>{data.num_chars.toLocaleString()} chars</div>
            </>
          )}
          {meta.key === "chunk" && (
            <>
              <div>{data.num_chunks} chunks</div>
              <div>avg {data.avg_chunk_len} chars</div>
            </>
          )}
          {meta.key === "embed" && (
            <>
              <div>dim {data.embedding_dim}</div>
              <div>{data.num_embedded} vectors</div>
            </>
          )}
          {meta.key === "store" && (
            <>
              <div>{data.count} stored</div>
              <div>{data.collection_name}</div>
            </>
          )}
          <div className="stage-card__ms">{data.duration_ms} ms</div>
        </div>
      ) : (
        <div className="stage-card__stats stage-card__stats--pending">pending</div>
      )}
    </div>
  );
}

const DEFAULT_DOC_LABEL = "VMO_PRD_Document.pdf (default)";

export default function PipelinePanel({
  stages,
  ingesting,
  ingested,
  sourceName,
  onIngest,
  onReset,
  resetting,
  error,
}) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const currentLabel = selectedFile
    ? selectedFile.name
    : sourceName || DEFAULT_DOC_LABEL;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = async () => {
    await onReset();
    clearFile();
  };

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>1. Ingestion Pipeline</h2>
        <div className="panel__actions">
          <button
            onClick={handleReset}
            disabled={ingesting || resetting || (!ingested && !stages && !selectedFile)}
            className="btn btn--ghost"
          >
            {resetting ? "Resetting..." : "Reset"}
          </button>
          <button onClick={() => onIngest(selectedFile)} disabled={ingesting || resetting} className="btn">
            {ingesting ? "Running..." : ingested ? "Re-run Ingestion" : "Run Ingestion"}
          </button>
        </div>
      </div>

      <div className="dropzone">
        <input
          ref={fileInputRef}
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={ingesting}
          className="dropzone__input"
        />
        <label htmlFor="pdf-upload" className="dropzone__label">
          <span className="dropzone__icon">📤</span>
          <span>Upload your own PDF</span>
        </label>
        <div className="dropzone__current">
          Using: <strong>{currentLabel}</strong>
          {!selectedFile && !sourceName && (
            <span className="dropzone__hint"> — no file uploaded yet</span>
          )}
          {selectedFile && (
            <button className="dropzone__clear" onClick={clearFile} title="Remove selected file">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="stage-row">
        {STAGE_META.map((meta, i) => (
          <div key={meta.key} className="stage-row__item">
            <StageCard meta={meta} data={stages?.[meta.key]} />
            {i < STAGE_META.length - 1 && <div className="stage-arrow">→</div>}
          </div>
        ))}
      </div>
      {error && <div className="error-banner">{error}</div>}
      {stages?.chunk?.sample_chunks && (
        <details className="sample-chunks">
          <summary>Preview first 3 chunks</summary>
          <ul>
            {stages.chunk.sample_chunks.map((c, i) => (
              <li key={i}>
                <span className="chunk-badge">#{i}</span>
                {c.slice(0, 220)}
                {c.length > 220 ? "…" : ""}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
