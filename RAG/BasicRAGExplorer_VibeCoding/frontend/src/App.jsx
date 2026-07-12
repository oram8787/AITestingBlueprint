import { useEffect, useState } from "react";
import "./App.css";
import PipelinePanel from "./components/PipelinePanel";
import QueryPanel from "./components/QueryPanel";
import { getStatus, runIngestion, askQuestion } from "./api";

export default function App() {
  const [ingested, setIngested] = useState(false);
  const [stages, setStages] = useState(null);
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState(null);

  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState(null);
  const [queryError, setQueryError] = useState(null);

  useEffect(() => {
    getStatus()
      .then((s) => setIngested(s.ingested))
      .catch(() => {});
  }, []);

  const handleIngest = async () => {
    setIngesting(true);
    setIngestError(null);
    try {
      const res = await runIngestion();
      setStages(res.stages);
      setIngested(true);
    } catch (e) {
      setIngestError(e.message);
    } finally {
      setIngesting(false);
    }
  };

  const handleAsk = async (question) => {
    setAsking(true);
    setQueryError(null);
    setResult(null);
    try {
      const res = await askQuestion(question);
      setResult(res);
    } catch (e) {
      setQueryError(e.message);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>RAG Explorer</h1>
        <p>End-to-end retrieval-augmented generation over the VWO PRD document</p>
        <p className="app__stack">
          Nomic Embed &middot; ChromaDB &middot; Groq (openai/gpt-oss-120b)
        </p>
      </header>

      <PipelinePanel
        stages={stages}
        ingesting={ingesting}
        ingested={ingested}
        onIngest={handleIngest}
        error={ingestError}
      />

      <QueryPanel
        ingested={ingested}
        onAsk={handleAsk}
        asking={asking}
        result={result}
        error={queryError}
      />
    </div>
  );
}
