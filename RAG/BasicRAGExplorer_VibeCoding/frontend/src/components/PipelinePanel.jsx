const STAGE_META = [
  { key: "load", label: "Load PDF", icon: "📄" },
  { key: "chunk", label: "Chunk", icon: "✂️" },
  { key: "embed", label: "Embed (Nomic)", icon: "🧬" },
  { key: "store", label: "Store (ChromaDB)", icon: "🗄️" },
];

function StageCard({ meta, data }) {
  const active = Boolean(data);
  return (
    <div className={`stage-card ${active ? "stage-card--active" : ""}`}>
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

export default function PipelinePanel({ stages, ingesting, ingested, onIngest, error }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <h2>1. Ingestion Pipeline</h2>
        <button onClick={onIngest} disabled={ingesting} className="btn">
          {ingesting ? "Running..." : ingested ? "Re-run Ingestion" : "Run Ingestion"}
        </button>
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
