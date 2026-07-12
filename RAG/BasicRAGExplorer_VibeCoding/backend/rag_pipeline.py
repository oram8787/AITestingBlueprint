"""Core RAG pipeline: PDF loading, chunking, embedding, ChromaDB storage and retrieval."""
import os
import re
import time
import shutil

os.environ.setdefault("ANONYMIZED_TELEMETRY", "False")

import chromadb
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_PATH = os.path.join(BASE_DIR, "..", "Data", "VMO_PRD_Document.pdf")
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_store")
COLLECTION_NAME = "vwo_prd"
EMBED_MODEL_NAME = "nomic-ai/nomic-embed-text-v1.5"
CHUNK_SIZE = 800
CHUNK_OVERLAP = 150

_embed_model = None
_chroma_client = None


def get_embed_model():
    global _embed_model
    if _embed_model is None:
        _embed_model = SentenceTransformer(EMBED_MODEL_NAME, trust_remote_code=True)
    return _embed_model


def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        os.makedirs(CHROMA_DIR, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(
            path=CHROMA_DIR,
            settings=chromadb.config.Settings(anonymized_telemetry=False),
        )
    return _chroma_client


def get_collection(create=False):
    client = get_chroma_client()
    if create:
        try:
            client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass
        return client.create_collection(
            name=COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
        )
    return client.get_or_create_collection(
        name=COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
    )


def load_pdf():
    reader = PdfReader(PDF_PATH)
    pages = [re.sub(r"\s+", " ", page.extract_text() or "").strip() for page in reader.pages]
    full_text = "\n\n".join(pages)
    return {
        "num_pages": len(reader.pages),
        "num_chars": len(full_text),
        "text": full_text,
        "pages": pages,
    }


def chunk_text(text: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return splitter.split_text(text)


def embed_documents(chunks):
    model = get_embed_model()
    prefixed = [f"search_document: {c}" for c in chunks]
    embeddings = model.encode(prefixed, show_progress_bar=False, normalize_embeddings=True)
    return embeddings


def embed_query(question: str):
    model = get_embed_model()
    embedding = model.encode(
        [f"search_query: {question}"], show_progress_bar=False, normalize_embeddings=True
    )
    return embedding[0]


def run_ingestion():
    stages = {}

    t0 = time.perf_counter()
    pdf_data = load_pdf()
    stages["load"] = {
        "duration_ms": round((time.perf_counter() - t0) * 1000, 1),
        "num_pages": pdf_data["num_pages"],
        "num_chars": pdf_data["num_chars"],
    }

    t0 = time.perf_counter()
    chunks = chunk_text(pdf_data["text"])
    avg_len = round(sum(len(c) for c in chunks) / len(chunks), 1) if chunks else 0
    stages["chunk"] = {
        "duration_ms": round((time.perf_counter() - t0) * 1000, 1),
        "num_chunks": len(chunks),
        "chunk_size": CHUNK_SIZE,
        "chunk_overlap": CHUNK_OVERLAP,
        "avg_chunk_len": avg_len,
        "sample_chunks": chunks[:3],
    }

    t0 = time.perf_counter()
    embeddings = embed_documents(chunks)
    stages["embed"] = {
        "duration_ms": round((time.perf_counter() - t0) * 1000, 1),
        "model": EMBED_MODEL_NAME,
        "embedding_dim": int(embeddings.shape[1]),
        "num_embedded": len(chunks),
    }

    t0 = time.perf_counter()
    collection = get_collection(create=True)
    ids = [f"chunk-{i}" for i in range(len(chunks))]
    metadatas = [{"chunk_index": i, "char_len": len(c)} for i, c in enumerate(chunks)]
    collection.add(
        ids=ids,
        embeddings=embeddings.tolist(),
        documents=chunks,
        metadatas=metadatas,
    )
    stages["store"] = {
        "duration_ms": round((time.perf_counter() - t0) * 1000, 1),
        "collection_name": COLLECTION_NAME,
        "count": collection.count(),
        "persist_dir": CHROMA_DIR,
    }

    return stages


def get_status():
    try:
        collection = get_collection(create=False)
        count = collection.count()
    except Exception:
        count = 0
    return {"ingested": count > 0, "count": count, "collection_name": COLLECTION_NAME}


def retrieve(question: str, top_k: int = 4):
    collection = get_collection(create=False)
    query_embedding = embed_query(question)
    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=top_k,
        include=["documents", "distances", "metadatas"],
    )
    retrieved = []
    docs = results["documents"][0]
    dists = results["distances"][0]
    metas = results["metadatas"][0]
    for rank, (doc, dist, meta) in enumerate(zip(docs, dists, metas), start=1):
        retrieved.append(
            {
                "rank": rank,
                "text": doc,
                "similarity": round(1 - dist, 4),
                "chunk_index": meta.get("chunk_index"),
            }
        )
    return retrieved


def reset_collection():
    if os.path.exists(CHROMA_DIR):
        shutil.rmtree(CHROMA_DIR)
    global _chroma_client
    _chroma_client = None
