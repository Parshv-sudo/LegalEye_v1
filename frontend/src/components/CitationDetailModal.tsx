import { useState, useEffect } from 'react';
import { CitationDetail } from '../types';

interface CitationDetailModalProps {
  citation: CitationDetail | null;
  onClose: () => void;
}

export function CitationDetailModal({ citation, onClose }: CitationDetailModalProps) {
  const [currentPage, setCurrentPage] = useState(citation?.pageNumber || 1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Synchronize currentPage when citation prop updates
  useEffect(() => {
    if (citation) {
      setCurrentPage(citation.pageNumber || 1);
    }
  }, [citation]);

  if (!citation) return null;

  const totalPages = citation.totalPages || 302;

  const handlePrev = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportNotice(`Exported ${citation.docTitle} (p. ${currentPage}) with verified watermark.`);
      setTimeout(() => setExportNotice(null), 3000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="flex-1 hidden md:block" onClick={onClose} />

      {/* Slide-in Panel */}
      <aside 
        id="citation-detail-drawer"
        className="w-full md:w-[540px] lg:w-[580px] bg-white shadow-2xl h-full flex flex-col border-l border-gray-200 transform transition-transform duration-300 select-text relative"
      >
        {/* Export Toast Notice */}
        {exportNotice && (
          <div className="absolute top-16 right-6 z-50 bg-[#0A192F] text-white px-3.5 py-2 rounded shadow-lg text-xs font-semibold flex items-center gap-2 border border-gray-700 animate-fadeIn">
            <span className="material-symbols-outlined text-[16px] text-green-400" aria-hidden="true">check_circle</span>
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3 text-[#0A192F]">
            <span className="material-symbols-outlined text-[22px] text-[#115fd4]" aria-hidden="true">description</span>
            <h2 className="text-[#0A192F] text-[19px] font-bold leading-tight font-heading">
              Source Citation Detail
            </h2>
          </div>
          <button 
            id="close-citation-detail"
            onClick={onClose}
            className="flex items-center justify-center rounded-full h-8 w-8 hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
            aria-label="Close citation detail"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
          </button>
        </header>

        {/* Metadata / Source Tags */}
        <div className="flex gap-2 px-6 py-3 flex-wrap border-b border-gray-100 shrink-0 bg-[#F0F2F5]/70 items-center">
          {citation.isPrimarySource && (
            <div className="flex h-6 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-[#0A192F] px-3 shadow-xs">
              <span className="material-symbols-outlined text-white text-[13px]" aria-hidden="true">verified</span>
              <p className="text-white text-xs font-semibold leading-normal tracking-wide">Primary Source</p>
            </div>
          )}
          <div className="flex h-6 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-white border border-gray-300 px-3 shadow-xs">
            <p className="text-[#1A1A1A] text-xs font-medium leading-normal">{citation.sourceCategory}</p>
          </div>
          <div className="flex h-6 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-white border border-gray-300 px-3 shadow-xs ml-auto">
            <span className="material-symbols-outlined text-[#2D5A27] text-[14px]" aria-hidden="true">check_circle</span>
            <p className="text-[#1A1A1A] text-xs font-medium leading-normal">{citation.matchPercentage}% Match</p>
          </div>
        </div>

        {/* Document Viewer Canvas */}
        <div className="flex flex-col w-full grow bg-[#F0F2F5] overflow-y-auto relative p-5">
          {/* Simulated High-Fidelity PDF Document Sheet */}
          <div className="w-full bg-white shadow-md border border-gray-300 rounded relative mb-4 p-8 flex flex-col mx-auto max-w-[850px] min-h-[580px] font-serif text-[#1A1A1A]">
            
            {/* Header of Court Document */}
            <div className="text-center border-b border-gray-200 pb-4 mb-5">
              <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-gray-500">
                IN THE HIGH COURT OF DELHI AT NEW DELHI
              </p>
              <p className="text-[10px] font-sans text-gray-400 mt-0.5">
                (EXTRAORDINARY ORIGINAL CIVIL JURISDICTION)
              </p>
              <p className="text-xs font-bold font-sans text-gray-800 mt-2">
                O.M.P. (COMM) NO. 412 OF 2023
              </p>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6">
              <h3 className="font-bold text-sm uppercase tracking-wide text-[#0A192F]">
                MEMORANDUM OF LAW &amp; SUBMISSIONS ON RECORD
              </h3>
              <p className="text-[11px] italic text-gray-600 font-sans mt-0.5">
                In the matter of: {citation.docTitle}
              </p>
            </div>

            {/* Paragraph Text with realistic legal text */}
            <div className="space-y-4 text-[13px] leading-relaxed text-gray-800">
              <p className="text-justify indent-6">
                14. The respondent erroneously asserts that the proprietary commercial schematics and technical architecture blueprints transferred under the Non-Disclosure Agreement dated October 12, 2021 were general knowledge within the industry sector.
              </p>

              {/* Highlighted Cited Span */}
              <div className="relative bg-[#FEF08A]/60 border-2 border-[#EAB308] p-3.5 rounded shadow-xs my-3 transition-all hover:bg-[#FEF08A]/80">
                <div className="absolute -top-3 right-3 bg-[#B45309] text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]" aria-hidden="true">format_quote</span>
                  Cited Span
                </div>
                <p className="font-medium text-[#1A1A1A] text-[13px] leading-relaxed">
                  "{citation.citedSnippet}"
                </p>
              </div>

              <p className="text-justify indent-6">
                15. Furthermore, as settled by the Constitution Bench in authoritative judicial pronouncements, the statutory covenants governing fiduciary commercial transactions restrict subsequent unauthorized vendor engagements without express written waiver.
              </p>

              <p className="text-justify indent-6">
                16. The defendant's secondary submission regarding public domain disclosures fails the standard of prior art publication, as verified by the forensic timestamp examination report.
              </p>
            </div>

            {/* Signature & Verification Block */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-end text-xs font-sans text-gray-500">
              <div>
                <p className="font-semibold text-gray-700">Drawn by: Chambers of Senior Counsel</p>
                <p>New Delhi • Dated: 18.10.2023</p>
              </div>
              <div className="text-right">
                <div className="inline-block border-b border-gray-400 w-28 h-6 mb-1"></div>
                <p className="text-[11px]">Advocate for Petitioner</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Pagination & Export Controls */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white shrink-0 shadow-xs">
          <div className="text-xs font-medium text-gray-500">
            Doc {citation.docNum} of {citation.totalDocs}
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePrev}
              disabled={currentPage <= 1}
              className="flex size-8 items-center justify-center rounded hover:bg-gray-100 text-gray-700 disabled:opacity-40 transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
              aria-label="Previous Page"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_left</span>
            </button>
            <span className="text-xs font-medium leading-normal flex h-8 items-center justify-center text-gray-800 px-3 rounded bg-gray-50 border border-gray-200 shadow-inner">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="flex size-8 items-center justify-center rounded hover:bg-gray-100 text-gray-700 disabled:opacity-40 transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
              aria-label="Next Page"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_right</span>
            </button>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="text-xs font-semibold text-[#2D5A27] hover:text-[#115fd4] transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-gray-50 border border-gray-200 cursor-pointer"
            aria-label="Export page as PDF"
          >
            <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
              {isExporting ? 'hourglass_top' : 'download'}
            </span>
            {isExporting ? 'Exporting...' : 'PDF'}
          </button>
        </div>
      </aside>
    </div>
  );
}
