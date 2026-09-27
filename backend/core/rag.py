"""
LegalEye — RAG (Retrieval-Augmented Generation) Engine

This module handles:
1. PDF text extraction and page-level chunking (PyPDF2)
2. TF-IDF based vector retrieval (scikit-learn — zero external services)
3. Grounded AI responses using Gemini API free tier
"""

import os
import re
import json
import logging
from typing import Optional
from io import BytesIO

from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)

GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')

# ─── Persistent Chunk Storage (JSON-based, per matter) ───────────────────────

CHUNKS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'chunks_data')
os.makedirs(CHUNKS_DIR, exist_ok=True)


def _chunks_path(matter_id: int) -> str:
    return os.path.join(CHUNKS_DIR, f'matter_{matter_id}.json')


def _load_chunks(matter_id: int) -> list[dict]:
    path = _chunks_path(matter_id)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def _save_chunks(matter_id: int, chunks: list[dict]):
    path = _chunks_path(matter_id)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)


def delete_matter_chunks(matter_id: int):
    path = _chunks_path(matter_id)
    if os.path.exists(path):
        os.remove(path)


# ─── PDF Text Extraction ─────────────────────────────────────────────────────

def extract_text_from_pdf(file_bytes: bytes) -> list[dict]:
    """
    Extract text from a PDF file, returning a list of page-level chunks.
    Each chunk is { 'page': int, 'text': str }.
    """
    reader = PdfReader(BytesIO(file_bytes))
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        text = text.strip()
        if text:
            pages.append({
                'page': i + 1,
                'text': text,
            })
    return pages


# ─── Indexing (Ingest a document into the chunk store) ────────────────────────

def ingest_document(matter_id: int, document_id: int, file_name: str, file_bytes: bytes) -> int:
    """
    Extract text from a PDF, chunk it by page, and store in the JSON chunk store.
    Returns the number of chunks indexed.
    """
    pages = extract_text_from_pdf(file_bytes)
    if not pages:
        logger.warning(f"No text extracted from {file_name}")
        return 0

    existing_chunks = _load_chunks(matter_id)

    # Remove any existing chunks for this document (re-index scenario)
    existing_chunks = [c for c in existing_chunks if c.get('document_id') != document_id]

    # Add new chunks
    for page_data in pages:
        existing_chunks.append({
            'document_id': document_id,
            'file_name': file_name,
            'page': page_data['page'],
            'text': page_data['text'],
        })

    _save_chunks(matter_id, existing_chunks)

    logger.info(f"Indexed {len(pages)} chunks from '{file_name}' into matter {matter_id}")
    return len(pages)


# ─── Retrieval (TF-IDF based similarity search) ──────────────────────────────

def retrieve_chunks(matter_id: int, query: str, top_k: int = 5) -> list[dict]:
    """
    Query the chunk store for the top-k most relevant chunks using TF-IDF cosine similarity.
    Returns list of { 'text', 'file_name', 'page', 'document_id', 'score' }.
    """
    all_chunks = _load_chunks(matter_id)
    
    if not all_chunks:
        return []

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        # Build the TF-IDF matrix from all chunk texts + the query
        texts = [c['text'] for c in all_chunks]
        texts.append(query)

        vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        tfidf_matrix = vectorizer.fit_transform(texts)

        # Compute cosine similarity between the query (last row) and all chunks
        query_vector = tfidf_matrix[-1]
        chunk_vectors = tfidf_matrix[:-1]
        similarities = cosine_similarity(query_vector, chunk_vectors).flatten()

        # Get top-k indices
        top_indices = similarities.argsort()[::-1][:top_k]

        results = []
        for idx in top_indices:
            if similarities[idx] > 0.0:  # Only include chunks with some relevance
                chunk = all_chunks[idx]
                results.append({
                    'text': chunk['text'],
                    'file_name': chunk['file_name'],
                    'page': chunk['page'],
                    'document_id': chunk['document_id'],
                    'score': float(similarities[idx]),
                })

        return results

    except ImportError:
        # Fallback: simple keyword matching if sklearn is not available
        logger.warning("scikit-learn not available, using simple keyword matching")
        query_words = set(query.lower().split())
        scored = []
        for chunk in all_chunks:
            chunk_words = set(chunk['text'].lower().split())
            overlap = len(query_words & chunk_words)
            if overlap > 0:
                scored.append((overlap, chunk))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [
            {
                'text': c['text'],
                'file_name': c['file_name'],
                'page': c['page'],
                'document_id': c['document_id'],
                'score': s,
            }
            for s, c in scored[:top_k]
        ]


# ─── Gemini AI Generation ────────────────────────────────────────────────────

def _get_gemini_api_key() -> Optional[str]:
    return os.environ.get('GEMINI_API_KEY') or os.environ.get('VITE_GEMINI_API_KEY')


def generate_grounded_response(query: str, chunks: list[dict], matter_title: str = "") -> dict:
    """
    Build a grounded prompt from retrieved chunks and call Gemini API.
    Returns { 'text': str, 'citations': list, 'confidence': str }.
    
    Falls back to a context-only summary if no API key is configured.
    """
    api_key = _get_gemini_api_key()

    # Build the context block from retrieved chunks
    context_parts = []
    for chunk in chunks:
        context_parts.append(
            f"[{chunk['file_name']}, Page {chunk['page']}]:\n{chunk['text']}"
        )
    context_block = "\n\n---\n\n".join(context_parts) if context_parts else "No documents have been indexed for this matter yet."

    system_prompt = f"""You are a senior legal research AI assistant for "LegalEye", a litigation intelligence platform.
You are answering questions about the matter: "{matter_title}".

STRICT RULES:
1. ONLY use information from the provided document excerpts below. Never fabricate facts.
2. For every factual claim, cite the source using the format [DocName, p.PageNumber].
3. If the documents do not contain enough information, clearly state: "Insufficient evidence in the indexed corpus to answer this question."
4. Be precise, concise, and use formal legal language.
5. At the end of your response, add a confidence assessment: "High Confidence", "Partially Supported", or "Conflict Detected".
6. If you cannot find ANY relevant information, respond with: "Insufficient evidence — the indexed documents do not contain information relevant to this query."

DOCUMENT EXCERPTS:
{context_block}
"""

    if not api_key:
        # No API key — return a structured summary of what was found
        if not chunks:
            return {
                'text': 'No documents have been indexed for this matter yet. Please upload legal documents through the Processing Pipeline to enable AI-powered analysis.',
                'citations': [],
                'confidence': 'Insufficient Evidence',
            }
        
        # Build a basic response from the chunks themselves
        summary_lines = []
        citations = []
        for chunk in chunks[:3]:
            preview = chunk['text'][:200].replace('\n', ' ')
            ref_label = f"[{chunk['file_name']}, p.{chunk['page']}]"
            summary_lines.append(f"From {ref_label}: \"{preview}...\"")
            citations.append({
                'label': ref_label,
                'docNum': chunk['document_id'],
                'page': chunk['page'],
                'docName': chunk['file_name'],
            })
        
        return {
            'text': f"Based on the indexed documents, the following excerpts are most relevant to your query:\n\n" + "\n\n".join(summary_lines) + "\n\n⚠️ Note: Configure a Gemini API key (GEMINI_API_KEY env var) for full AI-synthesized responses.",
            'citations': citations,
            'confidence': 'Partially Supported',
        }

    # ─── Call Gemini API ──────────────────────────────────────────────────
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        response = model.generate_content([
            {"role": "user", "parts": [system_prompt]},
            {"role": "user", "parts": [f"Question: {query}"]},
        ])
        
        response_text = response.text

        # Parse citations from the response
        citations = _parse_citations_from_text(response_text, chunks)
        
        # Detect confidence
        confidence = 'High Confidence'
        lower_text = response_text.lower()
        if 'insufficient evidence' in lower_text or 'could not find' in lower_text:
            confidence = 'Insufficient Evidence'
        elif 'conflict detected' in lower_text or 'contradict' in lower_text:
            confidence = 'Conflict Detected'
        elif 'partially supported' in lower_text or 'missing' in lower_text or 'unclear' in lower_text:
            confidence = 'Partially Supported'

        return {
            'text': response_text,
            'citations': citations,
            'confidence': confidence,
        }
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return {
            'text': f'⚠️ AI generation error: {str(e)}. The retrieved document excerpts are still available above.',
            'citations': [],
            'confidence': 'Partially Supported',
        }


def _parse_citations_from_text(text: str, chunks: list[dict]) -> list[dict]:
    """Extract citation references from AI-generated text."""
    citations = []
    seen = set()
    
    # Match patterns like [FileName, p.12] or [Doc 1, p.12]
    pattern = r'\[([^,\]]+),\s*p\.?\s*(\d+)\]'
    for match in re.finditer(pattern, text):
        doc_name = match.group(1).strip()
        page_num = int(match.group(2))
        key = f"{doc_name}_{page_num}"
        
        if key not in seen:
            seen.add(key)
            # Try to match to an actual chunk
            doc_id = 0
            for chunk in chunks:
                if chunk['file_name'] in doc_name or doc_name in chunk['file_name']:
                    doc_id = chunk['document_id']
                    break
            
            citations.append({
                'label': f'[{doc_name}, p.{page_num}]',
                'docNum': doc_id,
                'page': page_num,
                'docName': doc_name,
            })
    
    return citations

def generate_draft_text(matter_title: str, document_type: str, tone: str, include_citations: bool, chunks: list[dict]) -> str:
    """
    Generate a legal draft using Gemini based on retrieved chunks.
    """
    api_key = _get_gemini_api_key()
    if not api_key:
        return f"[Draft Generation requires GEMINI_API_KEY] Please configure your API key to generate a {document_type}."
    
    context_parts = []
    for chunk in chunks:
        context_parts.append(f"[{chunk['file_name']}, Page {chunk['page']}]:\n{chunk['text']}")
    context_block = "\n\n---\n\n".join(context_parts) if context_parts else "No documents have been indexed."

    prompt = f"""You are drafting a legal document for the matter: "{matter_title}".
Document Type: {document_type}
Tone/Strategy: {tone}
Inline Citations: {"REQUIRED format [DocName, p.PageNumber]" if include_citations else "NOT required"}

Using ONLY the provided factual context from the indexed documents below, generate a professional, formatted {document_type}.
Do not invent facts. If information is missing, use placeholders like [Missing Information].

CONTEXT:
{context_block}
"""
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content([{"role": "user", "parts": [prompt]}])
        return response.text
    except Exception as e:
        return f"Error generating draft: {str(e)}"

def analyze_contradictions(matter_title: str, chunks: list[dict]) -> list[dict]:
    """
    Analyzes chunks to find contradictions or gaps. Returns a list of structured findings.
    """
    api_key = _get_gemini_api_key()
    if not api_key:
        return []
    
    context_parts = []
    for chunk in chunks:
        context_parts.append(f"[{chunk['file_name']}, Page {chunk['page']}]:\n{chunk['text']}")
    context_block = "\n\n---\n\n".join(context_parts) if context_parts else ""

    prompt = f"""You are a legal auditor reviewing the matter "{matter_title}".
Analyze the following documents and identify any factual contradictions, timeline inconsistencies, or critical missing gaps between different documents.

Return your response EXCLUSIVELY as a valid JSON array of objects. Do not include markdown code blocks (like ```json), just the raw JSON.
Each object must have exactly these keys:
- "severity": "High Severity", "Medium Severity", or "Low Severity"
- "title": A short 3-6 word title of the contradiction
- "statementA": object with "source" (e.g. "[Doc 1, p.2]"), "text" (the claim), and "highlight" (exact quote)
- "statementB": object with "source", "text", and "highlight"

CONTEXT:
{context_block}
"""
    try:
        import google.generativeai as genai
        import json
        import time
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content([{"role": "user", "parts": [prompt]}])
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        parsed = json.loads(text)
        
        for i, item in enumerate(parsed):
            item["id"] = f"contradiction-{int(time.time())}-{i}"
            item["status"] = "unresolved"
            
        return parsed
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to analyze contradictions: {e}")
        return []
