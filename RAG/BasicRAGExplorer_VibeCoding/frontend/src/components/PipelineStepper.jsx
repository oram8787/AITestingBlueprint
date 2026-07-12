const STEPS = [
  { n: 1, label: "PDF", sub: "load document", color: "#22c55e" },
  { n: 2, label: "Chunk", sub: "split text", color: "#14b8a6" },
  { n: 3, label: "Embed", sub: "Nomic vectors", color: "#3b82f6" },
  { n: 4, label: "Store", sub: "ChromaDB", color: "#6366f1" },
  { n: 5, label: "Retrieve", sub: "top-4", color: "#a855f7" },
  { n: 6, label: "Answer", sub: "Groq LLM", color: "#ec4899" },
];

export default function PipelineStepper({ ingested, queried }) {
  const doneUpTo = queried ? 6 : ingested ? 4 : 0;

  return (
    <div className="stepper">
      {STEPS.map((step, i) => {
        const done = step.n <= doneUpTo;
        return (
          <div className="stepper__item" key={step.n}>
            <div
              className={`stepper__node ${done ? "stepper__node--done" : ""}`}
              style={{ "--accent": step.color }}
            >
              <span className="stepper__badge">{step.n}</span>
              <div className="stepper__text">
                <span className="stepper__label">{step.label}</span>
                <span className="stepper__sub">{step.sub}</span>
              </div>
            </div>
            {i < STEPS.length - 1 && <span className="stepper__arrow">→</span>}
          </div>
        );
      })}
    </div>
  );
}
