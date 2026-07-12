export default function ChunkCard({ chunk }) {
  const pct = Math.max(0, Math.min(100, chunk.similarity * 100));
  return (
    <div className="chunk-card">
      <div className="chunk-card__header">
        <span className="chunk-card__rank">Rank {chunk.rank}</span>
        <span className="chunk-card__index">chunk #{chunk.chunk_index}</span>
        <span className="chunk-card__score">{(chunk.similarity * 100).toFixed(1)}%</span>
      </div>
      <div className="chunk-card__bar">
        <div className="chunk-card__bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="chunk-card__text">{chunk.text}</p>
    </div>
  );
}
