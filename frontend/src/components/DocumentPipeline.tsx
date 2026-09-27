import React, { useState, useRef, useEffect } from 'react';
import { PipelineDoc, Matter } from '../types';
import { initialPipelineDocs } from '../data/mockData';
import { OcrReviewModal } from './OcrReviewModal';
import { parseAndStoreDocument } from '../services/documentStore';
import { ingestApi } from '../services/api';

interface DocumentPipelineProps {
  onBack: () => void;
  onOpenMatter: () => void;
  matter?: Matter;
  onOpenMobileSidebar?: () => void;
  pipelineDocs: PipelineDoc[];
  setPipelineDocs: React.Dispatch<React.SetStateAction<PipelineDoc[]>>;
}

export function DocumentPipeline({ onBack, matter, onOpenMobileSidebar, pipelineDocs, setPipelineDocs }: DocumentPipelineProps) {
  const [reviewingDoc, setReviewingDoc] = useState<PipelineDoc | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2500);
  };

  const completedCount = pipelineDocs.filter((d) => d.indexed === 'completed').length;
  const inProgressCount = pipelineDocs.filter(
    (d) => d.ocr === 'active' || d.classifying === 'active' || d.queued === 'active'
  ).length;
  const failedCount = pipelineDocs.filter(
    (d) => d.ocr === 'error' || d.classifying === 'error' || d.indexed === 'error'
  ).length;

  const handleResolveOcr = (_transcription: string) => {
    if (!reviewingDoc) return;
    const targetDocId = reviewingDoc.id;
    const targetFileName = reviewingDoc.fileName;

    setPipelineDocs((prev) =>
      prev.map((doc) => {
        if (doc.id === targetDocId) {
          return {
            ...doc,
            ocr: 'completed',
            classifying: 'completed',
            indexed: 'completed',
            errorMessage: undefined,
            errorSubtitle: undefined,
            progressLabel: 'Indexed with Verified Transcription'
          };
        }
        return doc;
      })
    );
    setReviewingDoc(null);
    showToast(`OCR error resolved for ${targetFileName}. Ingested into search index.`);
  };

  const handleUploadNewFile = (fileName: string) => {
    const newDoc: PipelineDoc = {
      id: `p-${Date.now()}`,
      fileName,
      fileSize: '4.1 MB',
      pages: 34,
      type: 'pdf',
      queued: 'completed',
      ocr: 'active',
      classifying: 'queued',
      indexed: 'queued',
      progressLabel: 'OCR Processing... (10%)'
    };
    setPipelineDocs((prev) => [newDoc, ...prev]);
    showToast(`Queued "${fileName}" for OCR processing.`);
  };

  // Real file upload handler
  const handleRealFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
      const fileType: 'pdf' | 'docx' | 'txt' = ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : 'txt';
      const docId = `p-${Date.now()}-${i}`;

      // Add to pipeline in 'active' state
      const newDoc: PipelineDoc = {
        id: docId,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: 0,
        type: fileType,
        queued: 'completed',
        ocr: 'active',
        classifying: 'queued',
        indexed: 'queued',
        progressLabel: 'Reading file...'
      };
      setPipelineDocs((prev) => [newDoc, ...prev]);

      // Parse asynchronously
      try {
        if (!matter?.id) throw new Error("No active matter");
        
        // Let the UI reflect it's processing
        setPipelineDocs((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, ocr: 'active', classifying: 'active', indexed: 'active' } : d))
        );

        const response = await ingestApi.upload(parseInt(matter.id), file);
        
        // Final update — backend returns flat: { id, file_name, pages, chunks_indexed, status }
        setPipelineDocs((prev) =>
          prev.map((d) => {
            if (d.id !== docId) return d;
            return {
              ...d,
              pages: response.data.pages || 0,
              ocr: 'completed',
              classifying: 'completed',
              indexed: 'completed',
              progressLabel: `Indexed ${response.data.chunks_indexed || 0} chunks via Backend API`
            };
          })
        );
        showToast(`"${file.name}" indexed successfully.`);
      } catch (err) {
        setPipelineDocs((prev) =>
          prev.map((d) => {
            if (d.id !== docId) return d;
            return {
              ...d,
              ocr: 'error',
              errorMessage: 'Extraction failed',
              errorSubtitle: 'File could not be parsed'
            };
          })
        );
        showToast(`Failed to process "${file.name}".`);
      }
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderStatusPill = (status: 'completed' | 'active' | 'queued' | 'error') => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-[#2D5A27] border border-emerald-200">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">check</span>
          </div>
        );
      case 'active':
        return (
          <div className="flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-50 text-[#115fd4] border border-blue-200 text-[10px] font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#115fd4] mr-1"></span>
            Active
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-600 border border-red-200">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">priority_high</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-400 border border-gray-200 text-[10px] font-semibold">
            —
          </div>
        );
    }
  };

  const matterCode = matter?.code || 'G&S-2023-14';

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F0F2F5] overflow-y-auto">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A192F] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-gray-700 animate-fadeIn">
          <span className="material-symbols-outlined text-[18px] text-[#115fd4]" aria-hidden="true">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>


            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-xl md:text-2xl font-heading font-bold text-[#0A192F]">
                Document Processing Pipeline
              </h1>
              {inProgressCount > 0 ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-[#2D5A27] border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse"></span>
                  <span>Processing Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-gray-50 text-gray-500 border border-gray-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  <span>Idle</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-5">
        {/* Batch Status Banner */}
        <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-5 space-y-3">
          {pipelineDocs.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-[#0A192F] font-heading">
                    Batch Ingestion Progress
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {pipelineDocs.length} files in active batch • {completedCount} completed, {inProgressCount} in progress, {failedCount} failed
                  </p>
                </div>
                <span className="text-sm font-mono font-bold text-[#115fd4]">
                  {Math.round((completedCount / pipelineDocs.length) * 100)}% Completed
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#115fd4] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.round((completedCount / pipelineDocs.length) * 100)}%` }}
                ></div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <h2 className="text-sm font-bold text-[#0A192F] font-heading">
                No active ingestion batch
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Click "Upload Briefs" to add files to the pipeline.
              </p>
            </div>
          )}
        </div>



        {/* Pipeline Matrix Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Pipeline Stage Matrix
            </h3>
            <span className="text-xs text-gray-400">{inProgressCount > 0 ? 'Processing in progress...' : `${completedCount} of ${pipelineDocs.length} completed`}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 min-w-[260px]">File Name</th>
                  <th className="py-3 px-4 text-center">Queued</th>
                  <th className="py-3 px-4 text-center">OCR Engine</th>
                  <th className="py-3 px-4 text-center">Classifying</th>
                  <th className="py-3 px-4 text-center">Indexed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {pipelineDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 animate-slide-up">
                        <span className="material-symbols-outlined text-3xl text-gray-300 mb-3" aria-hidden="true">inventory_2</span>
                        <p className="font-medium text-gray-900 text-sm">No documents in queue</p>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Upload documents using the area above to begin AI processing and semantic indexing.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pipelineDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-600 text-[20px]" aria-hidden="true">
                          picture_as_pdf
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{doc.fileName}</p>
                          <p className="text-[11px] text-gray-400">
                            {doc.fileSize} • {doc.pages} pages
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">{renderStatusPill(doc.queued)}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">{renderStatusPill(doc.ocr)}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">{renderStatusPill(doc.classifying)}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">{renderStatusPill(doc.indexed)}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {doc.errorMessage ? (
                        <button
                          onClick={() => setReviewingDoc(doc)}
                          className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Review Error
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[11px]">{doc.progressLabel || 'Ready'}</span>
                      )}
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Highlighted Error Card */}
        {pipelineDocs.some((d) => d.ocr === 'error') && (
          <div className="bg-red-50/80 border border-red-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">error</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-900">
                  Parse Error: Illegible scan on pages (Handwritten_Notes_Scan.pdf)
                </h4>
                <p className="text-xs text-red-700 mt-0.5 max-w-2xl leading-relaxed">
                  The OCR engine failed to extract meaningful text from these pages, likely due to low resolution or heavy handwritten cursive content.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setReviewingDoc(pipelineDocs.find((d) => d.ocr === 'error') || null)}
                className="px-3 py-1.5 bg-white border border-red-300 text-red-800 text-xs font-semibold rounded hover:bg-red-50 transition-colors cursor-pointer"
              >
                Review Pages
              </button>
              <button
                onClick={() => {
                  const errorDoc = pipelineDocs.find((d) => d.ocr === 'error');
                  if (errorDoc) {
                    setReviewingDoc(errorDoc);
                    handleResolveOcr('');
                  }
                }}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors cursor-pointer"
              >
                Manual Override
              </button>
            </div>
          </div>
        )}
      </main>

      {/* OCR Review Modal */}
      <OcrReviewModal
        isOpen={Boolean(reviewingDoc)}
        onClose={() => setReviewingDoc(null)}
        onResolve={handleResolveOcr}
      />
    </div>
  );
}
