/**
 * LegalEye — Gemini AI Service
 * 
 * Connects to Google Gemini 2.5 Pro/Flash for:
 * - Grounded legal Q&A over uploaded document corpus
 * - Pleading draft generation with citation enforcement
 * - Contradiction discovery across multi-document evidence
 * - Streaming responses with real-time citation extraction
 */

import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DocumentChunk {
  docId: string;
  docName: string;
  docNumber: number;
  pageNumber: number;
  text: string;
}

export interface ParsedCitation {
  label: string;
  docNum: number;
  page: number;
  docName: string;
}

export interface GeminiResponse {
  text: string;
  citations: ParsedCitation[];
  confidence: 'High Confidence' | 'Partially Supported' | 'Conflict Detected';
}

export interface ContradictionResult {
  id: string;
  severity: 'High Severity' | 'Medium Severity' | 'Low Severity';
  title: string;
  statementA: { source: string; page: number; text: string; highlight: string };
  statementB: { source: string; page: number; text: string; highlight: string };
}

// ─── API Key Management ──────────────────────────────────────────────────────

export function getApiKey(): string | null {
  // Read from Vite environment variables
  return (import.meta as any).env?.VITE_GEMINI_API_KEY || null;
}

export function isApiKeyConfigured(): boolean {
  const key = getApiKey();
  return !!key && key.trim().length > 10;
}

// ─── Client Factory ──────────────────────────────────────────────────────────

function getClient(): GoogleGenAI {
  const key = getApiKey();
  if (!key) {
    throw new Error('Gemini API key not configured. Please add your API key in Settings.');
  }
  return new GoogleGenAI({ apiKey: key });
}

// ─── System Prompts ──────────────────────────────────────────────────────────

const LEGAL_QA_SYSTEM_PROMPT = `You are LegalEye AI, a senior litigation paralegal assistant for Indian courts. You answer questions EXCLUSIVELY using the document corpus provided below. You must follow these rules strictly:

1. GROUNDING: Every factual claim MUST cite the source using the format [Doc X, p.Y] where X is the document number and Y is the page number. If you cannot find supporting evidence in the provided documents, say "I could not find evidence for this in the indexed corpus."

2. ACCURACY: Never fabricate case names, dates, clause numbers, or monetary figures. If a document mentions something ambiguously, flag it as "Partially Supported."

3. LEGAL CONTEXT: You operate within the Indian legal system (CPC, Indian Contract Act, Arbitration & Conciliation Act, BNS/BNSS where applicable). Use Indian legal terminology (e.g., "Written Statement" not "Answer," "Vakalatnama" not "Power of Attorney for litigation").

4. FORMAT: Structure your response with clear paragraphs. Embed citations inline as [Doc X, p.Y]. End with a confidence assessment.

5. REFUSAL: If the user asks about documents not in the corpus, or asks you to speculate beyond the evidence, politely refuse and explain why.`;

const CONTRADICTION_SYSTEM_PROMPT = `You are LegalEye's Cross-Examination Engine. Your task is to analyze multiple legal documents and find contradictions, factual inconsistencies, timeline discrepancies, or evidentiary gaps.

For each contradiction found, output a JSON array with objects containing:
- "severity": "High Severity" | "Medium Severity" | "Low Severity"
- "title": Brief description of the contradiction
- "statementA": { "source": document name, "page": page number, "text": the exact quoted text, "highlight": the key conflicting phrase }
- "statementB": { "source": document name, "page": page number, "text": the exact quoted text, "highlight": the key conflicting phrase }

Focus on:
1. Date conflicts (e.g., execution dates that don't match across documents)
2. Monetary figure discrepancies
3. Clause interpretation conflicts between agreements and pleadings
4. Missing evidence (claims made in pleadings without supporting exhibit)
5. Timeline impossibilities

Return ONLY the JSON array, no other text.`;

const DRAFT_SYSTEM_PROMPT = `You are LegalEye's Legal Drafting Engine for Indian courts. Generate court-ready pleadings using ONLY verified facts and citations from the provided document corpus.

Rules:
1. Every factual assertion must cite its source as [Doc X, p.Y].
2. Use proper Indian legal drafting format (prayer clauses, verification, syndication).
3. Include relevant statutory provisions (CPC, Indian Contract Act, Arbitration Act, etc.).
4. Structure with numbered paragraphs, clear headings, and a formal prayer clause.
5. End with a standard verification clause.`;

// ─── Core Query Functions ────────────────────────────────────────────────────

/**
 * Build context string from document chunks for grounding
 */
function buildDocumentContext(chunks: DocumentChunk[]): string {
  if (chunks.length === 0) {
    return 'NO DOCUMENTS INDEXED. The matter corpus is empty.';
  }

  const grouped = new Map<string, DocumentChunk[]>();
  for (const chunk of chunks) {
    const key = `Doc ${chunk.docNumber}: ${chunk.docName}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(chunk);
  }

  let context = '=== INDEXED DOCUMENT CORPUS ===\n\n';
  for (const [docHeader, docChunks] of grouped) {
    context += `--- ${docHeader} ---\n`;
    for (const chunk of docChunks) {
      context += `[Page ${chunk.pageNumber}]: ${chunk.text}\n\n`;
    }
    context += '\n';
  }

  return context;
}

/**
 * Extract citation references from AI response text
 */
function extractCitations(text: string, chunks: DocumentChunk[]): ParsedCitation[] {
  const citationPattern = /\[Doc\s+(\d+),\s*p\.(\d+)\]/g;
  const citations: ParsedCitation[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = citationPattern.exec(text)) !== null) {
    const docNum = parseInt(match[1], 10);
    const page = parseInt(match[2], 10);
    const key = `${docNum}-${page}`;

    if (!seen.has(key)) {
      seen.add(key);
      // Try to find the document name from chunks
      const matchingChunk = chunks.find(c => c.docNumber === docNum);
      citations.push({
        label: match[0],
        docNum,
        page,
        docName: matchingChunk?.docName || `Document ${docNum}`
      });
    }
  }

  return citations;
}

/**
 * Determine confidence level from response content
 */
function assessConfidence(text: string): GeminiResponse['confidence'] {
  const lower = text.toLowerCase();
  if (lower.includes('conflict') || lower.includes('contradict') || lower.includes('inconsisten')) {
    return 'Conflict Detected';
  }
  if (lower.includes('could not find') || lower.includes('partially') || lower.includes('missing') || lower.includes('unclear') || lower.includes('ambiguous')) {
    return 'Partially Supported';
  }
  return 'High Confidence';
}

/**
 * Send a grounded legal Q&A query to Gemini
 */
export async function queryMatter(
  question: string,
  documentChunks: DocumentChunk[],
  matterTitle?: string
): Promise<GeminiResponse> {
  const client = getClient();
  const context = buildDocumentContext(documentChunks);

  const matterHeader = matterTitle
    ? `You are analyzing the matter: "${matterTitle}"\n\n`
    : '';

  const response: GenerateContentResponse = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: `${LEGAL_QA_SYSTEM_PROMPT}\n\n${matterHeader}${context}\n\n--- USER QUERY ---\n${question}` }]
      }
    ],
    config: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    }
  });

  const text = response.text ?? '';
  const citations = extractCitations(text, documentChunks);
  const confidence = assessConfidence(text);

  return { text, citations, confidence };
}

/**
 * Stream a grounded legal Q&A query to Gemini (for real-time UI updates)
 */
export async function queryMatterStreaming(
  question: string,
  documentChunks: DocumentChunk[],
  onChunk: (partialText: string) => void,
  matterTitle?: string
): Promise<GeminiResponse> {
  const client = getClient();
  const context = buildDocumentContext(documentChunks);

  const matterHeader = matterTitle
    ? `You are analyzing the matter: "${matterTitle}"\n\n`
    : '';

  const response = await client.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: `${LEGAL_QA_SYSTEM_PROMPT}\n\n${matterHeader}${context}\n\n--- USER QUERY ---\n${question}` }]
      }
    ],
    config: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    }
  });

  let fullText = '';
  for await (const chunk of response) {
    const chunkText = chunk.text ?? '';
    fullText += chunkText;
    onChunk(fullText);
  }

  const citations = extractCitations(fullText, documentChunks);
  const confidence = assessConfidence(fullText);

  return { text: fullText, citations, confidence };
}

/**
 * Discover contradictions across multiple documents
 */
export async function discoverContradictions(
  documentChunks: DocumentChunk[],
  matterTitle?: string
): Promise<ContradictionResult[]> {
  const client = getClient();
  const context = buildDocumentContext(documentChunks);

  const matterHeader = matterTitle
    ? `Matter under analysis: "${matterTitle}"\n\n`
    : '';

  const response: GenerateContentResponse = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: `${CONTRADICTION_SYSTEM_PROMPT}\n\n${matterHeader}${context}\n\nAnalyze all documents above and return contradictions as a JSON array.` }]
      }
    ],
    config: {
      temperature: 0.1,
      maxOutputTokens: 4096,
    }
  });

  const text = response.text ?? '';

  // Extract JSON array from response
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ContradictionResult[];
      return parsed.map((item, idx) => ({
        ...item,
        id: `contradiction-${Date.now()}-${idx}`
      }));
    }
  } catch {
    // If parsing fails, return empty
  }

  return [];
}

/**
 * Generate a legal pleading draft grounded in matter documents
 */
export async function generateDraft(
  draftType: string,
  tone: string,
  documentChunks: DocumentChunk[],
  matterTitle: string,
  jurisdiction: string,
  includeCitations: boolean
): Promise<string> {
  const client = getClient();
  const context = buildDocumentContext(documentChunks);

  const citationInstruction = includeCitations
    ? 'Embed inline source citations in the format [Doc X, p.Y] for every factual assertion.'
    : 'Do not include inline citations, but ensure all facts are accurate to the indexed corpus.';

  const prompt = `${DRAFT_SYSTEM_PROMPT}

Matter: "${matterTitle}"
Jurisdiction: ${jurisdiction}
Pleading Type: ${draftType}
Tone & Strategy: ${tone}
Citation Mode: ${citationInstruction}

${context}

Generate the complete ${draftType} for the above matter. Use proper Indian court formatting with numbered paragraphs, prayer clause, and verification.`;

  const response: GenerateContentResponse = await client.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    config: {
      temperature: 0.3,
      maxOutputTokens: 8192,
    }
  });

  return response.text ?? 'Draft generation failed. Please try again.';
}

/**
 * Validate API key by making a minimal test request
 */
export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const client = new GoogleGenAI({ apiKey: key });
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Respond with exactly: OK' }] }],
      config: { maxOutputTokens: 10 }
    });
    return !!(response.text);
  } catch {
    return false;
  }
}
