import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

import rag_pipeline as rag

load_dotenv()

GROQ_MODEL = "openai/gpt-oss-120b"

app = FastAPI(title="RAG Explorer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str


def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not set. Add it to backend/.env",
        )
    return Groq(api_key=api_key)


@app.get("/api/status")
def status():
    return rag.get_status()


@app.post("/api/ingest")
async def ingest(file: UploadFile | None = File(None)):
    pdf_path = None
    source_name = None
    try:
        if file is not None and file.filename:
            if not file.filename.lower().endswith(".pdf"):
                raise HTTPException(status_code=400, detail="Only PDF files are supported")
            os.makedirs(rag.UPLOAD_DIR, exist_ok=True)
            source_name = os.path.basename(file.filename)
            pdf_path = os.path.join(rag.UPLOAD_DIR, source_name)
            content = await file.read()
            with open(pdf_path, "wb") as f:
                f.write(content)

        stages = rag.run_ingestion(pdf_path=pdf_path, source_name=source_name)
        return {"success": True, "stages": stages, "source_name": stages["source_name"]}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="PDF not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/reset")
def reset():
    rag.reset_collection()
    return {"success": True}


@app.post("/api/query")
def query(req: QueryRequest):
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    status_info = rag.get_status()
    if not status_info["ingested"]:
        raise HTTPException(
            status_code=400, detail="No documents ingested yet. Run ingestion first."
        )

    t0 = time.perf_counter()
    retrieved = rag.retrieve(req.question, top_k=4)
    retrieve_ms = round((time.perf_counter() - t0) * 1000, 1)

    context = "\n\n---\n\n".join(
        f"[Chunk {r['rank']}] {r['text']}" for r in retrieved
    )
    doc_name = status_info.get("source_name") or "the uploaded document"
    system_prompt = (
        f"You are a helpful assistant answering questions about the document "
        f"'{doc_name}'. Answer ONLY using the provided context chunks. "
        "If the answer is not contained in the context, say you don't know. "
        "Cite which chunk number(s) you used."
    )
    user_prompt = f"Context:\n{context}\n\nQuestion: {req.question}"

    client = get_groq_client()
    t0 = time.perf_counter()
    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
        )
        answer = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {e}")
    generate_ms = round((time.perf_counter() - t0) * 1000, 1)

    return {
        "answer": answer,
        "retrieved": retrieved,
        "model": GROQ_MODEL,
        "stages": {
            "retrieve": {"duration_ms": retrieve_ms, "top_k": 4},
            "generate": {"duration_ms": generate_ms, "model": GROQ_MODEL},
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
