/**
 * LegalEye — Document Parser & Store
 * 
 * Client-side PDF text extraction with page-level chunking,
 * and an in-memory document store for RAG retrieval.
 * 
 * Uses the browser FileReader API to read uploaded files,
 * and a lightweight text extraction approach for PDFs.
 * For production, this would be replaced with pdfjs-dist or server-side extraction.
 */

import { DocumentChunk } from './geminiService';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ParsedDocument {
  id: string;
  fileName: string;
  fileSize: string;
  pageCount: number;
  type: 'pdf' | 'docx' | 'txt';
  chunks: DocumentChunk[];
  rawText: string;
  uploadedAt: Date;
}

export interface DocumentStoreState {
  documents: ParsedDocument[];
  totalChunks: number;
}

// ─── In-Memory Document Store ────────────────────────────────────────────────

class MatterDocumentStore {
  private documents: Map<string, ParsedDocument> = new Map();
  private nextDocNumber = 1;
  private listeners: Set<() => void> = new Set();

  /**
   * Subscribe to store changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  /**
   * Add a parsed document to the store
   */
  addDocument(doc: ParsedDocument): void {
    this.documents.set(doc.id, doc);
    this.notify();
  }

  /**
   * Remove a document from the store
   */
  removeDocument(docId: string): void {
    this.documents.delete(docId);
    this.notify();
  }

  /**
   * Get all document chunks for Gemini context
   */
  getAllChunks(): DocumentChunk[] {
    const allChunks: DocumentChunk[] = [];
    for (const doc of this.documents.values()) {
      allChunks.push(...doc.chunks);
    }
    return allChunks;
  }

  /**
   * Get all documents
   */
  getAllDocuments(): ParsedDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Get document count
   */
  getDocumentCount(): number {
    return this.documents.size;
  }

  /**
   * Get total chunk count
   */
  getTotalChunks(): number {
    return this.getAllChunks().length;
  }

  /**
   * Get the next document number (auto-incrementing)
   */
  getNextDocNumber(): number {
    return this.nextDocNumber++;
  }

  /**
   * Get store state snapshot
   */
  getState(): DocumentStoreState {
    return {
      documents: this.getAllDocuments(),
      totalChunks: this.getTotalChunks()
    };
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.documents.clear();
    this.nextDocNumber = 1;
    this.notify();
  }
}

// Singleton store instance per app session
export const documentStore = new MatterDocumentStore();

// ─── Text Extraction ─────────────────────────────────────────────────────────

/**
 * Read a File as text (for .txt files)
 */
async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Read a File as ArrayBuffer (for binary files like PDF)
 */
async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract text from a PDF file using basic binary text extraction.
 * This is a lightweight approach that works for native (non-scanned) PDFs.
 * For scanned PDFs, production would use Gemini multimodal or pdfjs-dist.
 */
async function extractTextFromPdf(file: File): Promise<{ text: string; pageTexts: string[] }> {
  const buffer = await readFileAsArrayBuffer(file);
  const bytes = new Uint8Array(buffer);
  
  // Decode as latin1 to get raw PDF text streams
  let rawText = '';
  for (let i = 0; i < bytes.length; i++) {
    rawText += String.fromCharCode(bytes[i]);
  }

  // Extract text between BT (Begin Text) and ET (End Text) operators
  const textBlocks: string[] = [];
  const btEtPattern = /BT\s*([\s\S]*?)\s*ET/g;
  let match;

  while ((match = btEtPattern.exec(rawText)) !== null) {
    const block = match[1];
    // Extract text from Tj and TJ operators
    const tjPattern = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjPattern.exec(block)) !== null) {
      const decoded = tjMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');
      if (decoded.trim()) {
        textBlocks.push(decoded.trim());
      }
    }

    // Also extract from TJ arrays
    const tjArrayPattern = /\[([\s\S]*?)\]\s*TJ/g;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayPattern.exec(block)) !== null) {
      const arrContent = tjArrMatch[1];
      const strPattern = /\(([^)]*)\)/g;
      let strMatch;
      let lineText = '';
      while ((strMatch = strPattern.exec(arrContent)) !== null) {
        lineText += strMatch[1];
      }
      if (lineText.trim()) {
        textBlocks.push(lineText.trim());
      }
    }
  }

  const fullText = textBlocks.join(' ').replace(/\s+/g, ' ').trim();

  // If native text extraction failed (scanned PDF), use the file name as placeholder
  // and flag that Gemini multimodal should be used instead
  if (fullText.length < 50) {
    return {
      text: `[This PDF appears to be scanned or contain minimal extractable text. File: ${file.name}, Size: ${formatFileSize(file.size)}. For full text extraction, use the Gemini Vision multimodal pipeline.]`,
      pageTexts: [`[Scanned document: ${file.name}]`]
    };
  }

  // Simple heuristic: split into ~500 word "pages" if we can't detect real page breaks
  const words = fullText.split(' ');
  const wordsPerPage = 500;
  const pageTexts: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerPage) {
    const pageText = words.slice(i, i + wordsPerPage).join(' ');
    if (pageText.trim()) {
      pageTexts.push(pageText);
    }
  }

  return { text: fullText, pageTexts: pageTexts.length > 0 ? pageTexts : [fullText] };
}

/**
 * Extract text from a .txt file
 */
async function extractTextFromTxt(file: File): Promise<{ text: string; pageTexts: string[] }> {
  const text = await readFileAsText(file);
  
  // Split into ~500 word "pages"
  const words = text.split(/\s+/);
  const wordsPerPage = 500;
  const pageTexts: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerPage) {
    const pageText = words.slice(i, i + wordsPerPage).join(' ');
    if (pageText.trim()) {
      pageTexts.push(pageText);
    }
  }

  return { text, pageTexts: pageTexts.length > 0 ? pageTexts : [text] };
}

/**
 * Extract text from a .docx file (basic XML extraction)
 */
async function extractTextFromDocx(file: File): Promise<{ text: string; pageTexts: string[] }> {
  // For a proper implementation, we'd use a library like mammoth.js
  // This is a basic XML text extraction from the docx zip
  const text = await readFileAsText(file);
  
  // Try to extract visible text content
  const cleanText = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanText.length < 50) {
    return {
      text: `[DOCX file: ${file.name}. For full extraction, a server-side parser is recommended.]`,
      pageTexts: [`[Document: ${file.name}]`]
    };
  }

  const words = cleanText.split(' ');
  const wordsPerPage = 500;
  const pageTexts: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerPage) {
    pageTexts.push(words.slice(i, i + wordsPerPage).join(' '));
  }

  return { text: cleanText, pageTexts };
}

// ─── File Size Formatting ────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Parse a file and add it to the document store.
 * Returns the parsed document with extracted text chunks.
 */
export async function parseAndStoreDocument(
  file: File,
  onProgress?: (stage: string, percent: number) => void
): Promise<ParsedDocument> {
  const docNumber = documentStore.getNextDocNumber();
  const docId = `doc-${Date.now()}-${docNumber}`;

  onProgress?.('Reading file...', 10);

  // Determine file type
  const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
  const fileType: 'pdf' | 'docx' | 'txt' = 
    ext === 'pdf' ? 'pdf' : 
    ext === 'docx' ? 'docx' : 'txt';

  onProgress?.('Extracting text...', 30);

  // Extract text based on file type
  let extracted: { text: string; pageTexts: string[] };
  switch (fileType) {
    case 'pdf':
      extracted = await extractTextFromPdf(file);
      break;
    case 'docx':
      extracted = await extractTextFromDocx(file);
      break;
    default:
      extracted = await extractTextFromTxt(file);
  }

  onProgress?.('Creating document chunks...', 60);

  // Create page-level chunks for RAG
  const chunks: DocumentChunk[] = extracted.pageTexts.map((pageText, idx) => ({
    docId,
    docName: file.name,
    docNumber,
    pageNumber: idx + 1,
    text: pageText
  }));

  onProgress?.('Indexing into matter corpus...', 85);

  const parsedDoc: ParsedDocument = {
    id: docId,
    fileName: file.name,
    fileSize: formatFileSize(file.size),
    pageCount: chunks.length,
    type: fileType,
    chunks,
    rawText: extracted.text,
    uploadedAt: new Date()
  };

  // Add to the global store
  documentStore.addDocument(parsedDoc);

  onProgress?.('Indexed successfully', 100);

  return parsedDoc;
}

/**
 * Parse and store a document from raw text content (for demo/testing)
 */
export function storeTextDocument(
  fileName: string,
  textContent: string,
  pageTexts?: string[]
): ParsedDocument {
  const docNumber = documentStore.getNextDocNumber();
  const docId = `doc-${Date.now()}-${docNumber}`;

  const pages = pageTexts || [textContent];
  const chunks: DocumentChunk[] = pages.map((pageText, idx) => ({
    docId,
    docName: fileName,
    docNumber,
    pageNumber: idx + 1,
    text: pageText
  }));

  const parsedDoc: ParsedDocument = {
    id: docId,
    fileName,
    fileSize: `${(textContent.length / 1024).toFixed(1)} KB`,
    pageCount: chunks.length,
    type: 'txt',
    chunks,
    rawText: textContent,
    uploadedAt: new Date()
  };

  documentStore.addDocument(parsedDoc);
  return parsedDoc;
}
