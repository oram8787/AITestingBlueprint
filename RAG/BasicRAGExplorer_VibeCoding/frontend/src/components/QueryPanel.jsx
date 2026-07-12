import { useState } from "react";
import ChunkCard from "./ChunkCard";

export default function QueryPanel({ ingested, onAsk, asking, result, error }) {
  const [question, setQuestion] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (question.trim()) onAsk(question.trim());
  };

  return (
    <section className="panel">
      <h2>2. Ask a Question</h2>
      <form onSubmit={submit} className="query-form">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            ingested
              ? "e.g. What are the key goals of the VWO product?"
              : "Run ingestion first"
          }
          disabled={!ingested || asking}
          rows={3}
        />
        <button type="submit" className="btn" disabled={!ingested || asking || !question.trim()}>
          {asking ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {result && (
        <div className="results">
          <div className="results__stage-timings">
            <span>retrieve: {result.stages.retrieve.duration_ms} ms</span>
            <span>generate ({result.model}): {result.stages.generate.duration_ms} ms</span>
          </div>

          <h3>Top {result.retrieved.length} Retrieved Chunks</h3>
          <div className="chunk-list">
            {result.retrieved.map((c) => (
              <ChunkCard key={c.rank} chunk={c} />
            ))}
          </div>

          <h3>Generated Answer</h3>
          <div className="answer-card">{result.answer}</div>
        </div>
      )}
    </section>
  );
}
