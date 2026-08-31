import { useState } from 'react';
import { PipelineDoc } from '../types';
import { initialPipelineDocs } from '../data/mockData';
import { OcrReviewModal } from './OcrReviewModal';

interface DocumentPipelineProps {
  onBack: () => void;
  onOpenMatter: () => void;
}

export function DocumentPipeline({ onBack }: DocumentPipelineProps) {
  const [pipelineDocs, setPipelineDocs] = useState<PipelineDoc[]>(initialPipelineDocs);
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [reviewingDoc, setReviewingDoc] = useState<PipelineDoc | null>(null);

  const completedCount = pipelineDocs.filter((d) => d.indexed === 'completed').length;
  const inProgressCount = pipelineDocs.filter(
    (d) => d.ocr === 'active' || d.classifying === 'active' || d.queued === 'active'
  ).length;
  const failedCount = pipelineDocs.filter(
    (d) => d.ocr === 'error' || d.classifying === 'error' || d.indexed === 'error'
  ).length;

  const handleResolveOcr = (transcription: string) => {
    setPipelineDocs((prev) =>
      prev.map((doc) => {
        if (doc.id === 'p-4') {
          return {
            ...doc,
            ocr: 'completed',
            classifying: 'completed',
            indexed: 'completed',
            errorMessage: undefined,
            errorSubtitle: undefined,
            progressLabel: 'Indexed with Manual Transcription'
          };
        }
        return doc;
      })
    );
    setReviewingDoc(null);
    alert(`OCR Error Resolved for Handwritten_Notes_Scan.pdf. Added transcription to index.`);
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
  };

  const renderStatusPill = (status: 'completed' | 'active' | 'queued' | 'error') => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-[#2D5A27] border border-emerald-200">
            <span className="material-symbols-outlined text-[16px]">check</span>
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
            <span className="material-symbols-outlined text-[16px]">priority_high</span>
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

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F0F2F5] overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <button onClick={onBack} className="hover:text-[#0A192F] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Matters
              </button>
              <span>/</span>
              <span className="text-gray-700">G&amp;S-2023-14</span>
              <span>/</span>
              <span className="text-[#0A192F] font-bold">Processing Pipeline</span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-xl md:text-2xl font-heading font-bold text-[#0A192F]">
                Document Processing Pipeline
              </h1>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-[#2D5A27] border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse"></span>
                <span>{isQueuePaused ? 'Queue Paused' : 'Processing Active'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsQueuePaused(!isQueuePaused)}
              className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isQueuePaused ? 'play_arrow' : 'pause'}
              </span>
              {isQueuePaused ? 'Resume Queue' : 'Pause Queue'}
            </button>

            <button
              onClick={() => handleUploadNewFile(`Supplementary_Pleading_${Date.now().toString().slice(-4)}.pdf`)}
              className="px-4 py-2 bg-[#2D5A27] hover:bg-[#2D5A27]/90 text-white text-xs font-bold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              Upload Briefs
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl w-full mx-auto space-y-5">
        {/* Batch Status Banner */}
        <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#0A192F] font-heading">
                Batch Ingestion Progress
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {pipelineDocs.length} files in active batch • {completedCount} completed, {inProgressCount} in progress, {failedCount} failed
              </p>
            </div>
            <span className="text-sm font-mono font-bold text-[#115fd4]">65% Completed</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#115fd4] h-full transition-all duration-500 rounded-full"
              style={{ width: '65%' }}
            ></div>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onClick={() => handleUploadNewFile(`Exhibit_E_Deposition_${Date.now().toString().slice(-3)}.pdf`)}
          className="border-2 border-dashed border-gray-300 hover:border-[#115fd4] bg-white rounded-lg p-6 text-center cursor-pointer transition-colors group shadow-xs"
        >
          <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-[#115fd4] transition-colors mb-2">
            cloud_upload
          </span>
          <p className="text-sm font-semibold text-gray-800">
            Drag &amp; drop PDF, DOCX, or TXT briefs to queue for processing
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: Native PDF, Scanned Images (OCR 300+ DPI), Word Documents up to 100MB
          </p>
        </div>

        {/* Pipeline Matrix Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Pipeline Stage Matrix
            </h3>
            <span className="text-xs text-gray-400">Auto-refreshing live</span>
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
                {pipelineDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-600 text-[20px]">
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
                          className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded font-semibold text-[11px] transition-colors"
                        >
                          Review Error
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[11px]">{doc.progressLabel || 'Ready'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Highlighted Error Card (Handwritten Notes Error State from Image 3) */}
        {pipelineDocs.some((d) => d.id === 'p-4' && d.ocr === 'error') && (
          <div className="bg-red-50/80 border border-red-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">error</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-900">
                  Parse Error: Illegible scan on p.4-7 (Handwritten_Notes_Scan.pdf)
                </h4>
                <p className="text-xs text-red-700 mt-0.5 max-w-2xl leading-relaxed">
                  The OCR engine failed to extract meaningful text from these pages, likely due to low resolution or heavy handwritten cursive content.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setReviewingDoc(pipelineDocs.find((d) => d.id === 'p-4') || null)}
                className="px-3 py-1.5 bg-white border border-red-300 text-red-800 text-xs font-semibold rounded hover:bg-red-50 transition-colors cursor-pointer"
              >
                Review Pages
              </button>
              <button
                onClick={() => handleResolveOcr('')}
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
