# RAG Explorer — RICE-POT Prompt

### R — Role
You are a senior full-stack AI engineer who specializes in building local-first Retrieval-Augmented Generation (RAG) demo applications with React frontends and lightweight Node/Python backends.

### I — Instructions
1. Read the PDF file located at `data/data` (a Product Requirements Document for `vwo.com`).
2. Extract the text and split it into overlapping chunks suitable for embedding (choose and state a sensible chunk size/overlap, e.g. ~500 tokens with ~50 token overlap).
3. Generate embeddings for each chunk using the **Nomic Embed** embedding model.
4. Automatically store the generated embeddings and their source chunks in a local **ChromaDB** instance (persisted to disk, not in-memory only), running the ingestion pipeline on app startup or via an explicit "Ingest" action.
5. Build a query interface in the React UI where the user can type a natural-language question about the PDF.
6. On every query, embed the question, retrieve the **top 4 most relevant chunks** from ChromaDB, and display them in the UI (with similarity score and source snippet).
7. Send the retrieved chunks plus the user's question to **Groq**, using the `openai/gpt-oss-120b` model, to generate the final answer grounded in those chunks.
8. Design the UI so the full RAG pipeline is visible step-by-step: PDF ingestion status → chunking → embedding → storage confirmation → retrieved chunks → generated answer.

Do NOT:
- Do not fabricate an answer that isn't grounded in the retrieved chunks — if the chunks don't contain the answer, say so explicitly in the UI.
- Do not hardcode API keys in source files; load the Groq API key from an environment variable.
- Do not silently swallow ingestion or retrieval errors — surface them in the UI.
- Do not skip displaying the top 4 retrieved chunks, even if the answer step fails.
- Do not use a hosted/paid vector database — ChromaDB must run locally.

### C — Context
- Input file: a single PDF (Product Requirements Document for `vwo.com`) located in `data/data`.
- This is a learning/demo project intended to visually showcase how a basic RAG pipeline works end-to-end, not a production system.
- Stack constraints: React frontend, local ChromaDB for vector storage, Nomic Embed for embeddings, Groq (`openai/gpt-oss-120b`) as the LLM provider for answer generation.

### E — Example
Given the query "What is the target audience for vwo.com?", the UI should show:
- **Retrieved Chunks (top 4):** each with source page/section, similarity score, and chunk text preview.
- **Generated Answer:** a concise answer synthesized only from those 4 chunks, e.g. "According to the PRD, the target audience includes... [cites chunk 2, chunk 4]."

### P — Parameters
- Every generated answer must be traceable to at least one of the 4 retrieved chunks shown in the UI.
- If the retrieved chunks don't contain enough information to answer, respond exactly: "Insufficient information to determine."
- Do not invent product features, metrics, or requirements not present in the PDF.
- Ingestion (chunking + embedding + storage) must be idempotent — re-running it should not duplicate entries in ChromaDB.
- Retrieval must always return exactly 4 chunks (or fewer only if the corpus has fewer than 4 chunks total).

### O — Output
- A working React application (with any minimal backend/API layer needed for PDF parsing, embedding, ChromaDB access, and the Groq call).
- UI screens/sections, in order: Ingestion status panel → Query input → Retrieved chunks list (top 4) → Generated answer panel.
- Include setup instructions (env vars needed, how to run ingestion, how to start the app).

### T — Tone
Technical and precise, with concise inline code comments only where the RAG flow logic is non-obvious (e.g., chunking strategy, retrieval scoring). No filler commentary in the UI copy — keep labels clear and functional (e.g., "Retrieved Chunks", "Answer").
