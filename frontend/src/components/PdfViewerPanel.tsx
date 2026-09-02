import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfViewerPanelProps {
  documentUrl: string;
  onClose: () => void;
  initialPage?: number;
}

export function PdfViewerPanel({ documentUrl, onClose, initialPage = 1 }: PdfViewerPanelProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(initialPage);
  }

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);
  const zoomIn = () => setScale(s => s + 0.2);
  const zoomOut = () => setScale(s => Math.max(0.4, s - 0.2));

  return (
    <div className="flex flex-col h-full bg-gray-100 border-l border-gray-300">
      {/* Header / Controls */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-300 shadow-sm">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold text-gray-800">Document Viewer</h3>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded">
            <button
              disabled={pageNumber <= 1}
              onClick={previousPage}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="text-xs font-semibold px-2">
              Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
            </span>
            <button
              disabled={pageNumber >= (numPages || 1)}
              onClick={nextPage}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded">
            <button onClick={zoomOut} className="p-1 rounded hover:bg-gray-200">
              <span className="material-symbols-outlined text-[16px]">zoom_out</span>
            </button>
            <span className="text-xs font-mono px-1">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-1 rounded hover:bg-gray-200">
              <span className="material-symbols-outlined text-[16px]">zoom_in</span>
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors ml-2">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* PDF Document Container */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-200">
        <Document
          file={documentUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <span className="material-symbols-outlined animate-spin text-3xl mb-2">refresh</span>
              <p className="text-sm font-semibold">Loading document...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-64 text-red-500 bg-white p-6 rounded shadow-sm">
              <span className="material-symbols-outlined text-4xl mb-2">error</span>
              <p className="text-sm font-bold">Failed to load PDF.</p>
              <p className="text-xs text-gray-500 mt-1">Please ensure the document URL is valid.</p>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            className="shadow-xl"
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
}
