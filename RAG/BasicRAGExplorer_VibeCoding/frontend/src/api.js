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

export async function runIngestion(file) {
  const options = { method: "POST" };
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    options.body = formData;
  }
  const res = await fetch(`${API_BASE}/api/ingest`, options);
  return handle(res);
}

export async function resetIngestion() {
  const res = await fetch(`${API_BASE}/api/reset`, { method: "POST" });
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
