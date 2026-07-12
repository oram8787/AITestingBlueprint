import { useEffect, useState } from "react";
import "./App.css";
import PipelineStepper from "./components/PipelineStepper";
import PipelinePanel from "./components/PipelinePanel";
import QueryPanel from "./components/QueryPanel";
import { getStatus, runIngestion, resetIngestion, askQuestion } from "./api";

const THEME_KEY = "rag-explorer-theme";

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [ingested, setIngested] = useState(false);
  const [sourceName, setSourceName] = useState(null);
  const [stages, setStages] = useState(null);
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState(null);
  const [resetting, setResetting] = useState(false);

  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState(null);
  const [queryError, setQueryError] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    getStatus()
      .then((s) => {
        setIngested(s.ingested);
        setSourceName(s.source_name);
      })
      .catch(() => {});
  }, []);

  const handleIngest = async (file) => {
    setIngesting(true);
    setIngestError(null);
    setResult(null);
    try {
      const res = await runIngestion(file);
      setStages(res.stages);
      setSourceName(res.source_name);
      setIngested(true);
    } catch (e) {
      setIngestError(e.message);
    } finally {
      setIngesting(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    setIngestError(null);
    try {
      await resetIngestion();
      setStages(null);
      setIngested(false);
      setSourceName(null);
      setResult(null);
      setQueryError(null);
    } catch (e) {
      setIngestError(e.message);
    } finally {
      setResetting(false);
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
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <h1>RAG Explorer</h1>
        <p>End-to-end retrieval-augmented generation over your own document</p>
        <p className="app__stack">
          Nomic Embed &middot; ChromaDB &middot; Groq (openai/gpt-oss-120b)
        </p>
      </header>

      <PipelineStepper ingested={ingested} queried={Boolean(result)} />

      <PipelinePanel
        stages={stages}
        ingesting={ingesting}
        ingested={ingested}
        sourceName={sourceName}
        onIngest={handleIngest}
        onReset={handleReset}
        resetting={resetting}
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
