const API_BASE = "http://localhost:8000";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function getStatus() {
  const res = await fetch(`${API_BASE}/api/status`);
  return handle(res);
}

export async function runIngestion() {
  const res = await fetch(`${API_BASE}/api/ingest`, { method: "POST" });
  return handle(res);
}

export async function askQuestion(question) {
  const res = await fetch(`${API_BASE}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return handle(res);
}
