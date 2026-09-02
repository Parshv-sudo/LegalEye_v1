import { useState, useRef, useEffect } from 'react';

interface OcrReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (correctedText: string) => void;
}

export function OcrReviewModal({ isOpen, onClose, onResolve }: OcrReviewModalProps) {
  const [transcription, setTranscription] = useState(
    'Meeting notes dated 14/10/2021: Discussed clause 4.2 restrictions with internal R&D lead. Schematics shared internally under NDA umbrella only.'
  );
  const [isProcessingVision, setIsProcessingVision] = useState(false);
  const visionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (visionTimerRef.current) clearTimeout(visionTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleAutoTranscribe = () => {
    setIsProcessingVision(true);
    if (visionTimerRef.current) clearTimeout(visionTimerRef.current);
    visionTimerRef.current = setTimeout(() => {
      setTranscription(
        'Forensic Hand-Transcription: Meeting notes dated Oct 14, 2021. Present: Lead Counsel & Chief Architect. Agreed that Clause 4.2 restrictions apply strictly to third-party vendor transfers without prior board sign-off.'
      );
      setIsProcessingVision(false);
    }, 750);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0A192F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400" aria-hidden="true">warning</span>
            <div>
              <h3 className="font-heading font-bold text-base">Review OCR Parsing Error</h3>
              <p className="text-xs text-gray-300">File: Handwritten_Notes_Scan.pdf (Pages 4–7)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white cursor-pointer" aria-label="Close modal">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0" aria-hidden="true">info</span>
            <span>
              The standard OCR engine encountered low-contrast cursive writing on pages 4-7. You can use Vision-LLM transcription or manually supply the verified text below to index this document.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Simulated Scanned Page Image */}
            <div className="border border-gray-300 rounded bg-[#F8F9FA] p-4 flex flex-col items-center justify-center text-center relative min-h-[180px]">
              <div className="w-full h-32 bg-amber-50/50 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center p-3 relative overflow-hidden">
                <span className="material-symbols-outlined text-gray-400 text-3xl mb-1" aria-hidden="true">draw</span>
                <p className="text-[11px] font-mono text-gray-600 italic">
                  [Simulated Scan: Cursive handwriting from deposition notebook]
                </p>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-100 h-8"></div>
              </div>
              <div className="mt-2 flex items-center justify-between w-full text-[11px] text-gray-500">
                <span>Page 4 of 12</span>
                <span className="text-red-600 font-semibold">Low Resolution (150 DPI)</span>
              </div>
            </div>

            {/* Transcription Editor */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">Verified Transcription</label>
                <button
                  type="button"
                  onClick={handleAutoTranscribe}
                  disabled={isProcessingVision}
                  className="text-[11px] font-semibold text-[#115fd4] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">auto_fix_high</span>
                  {isProcessingVision ? 'Enhancing...' : 'Auto-Transcribe with Vision'}
                </button>
              </div>
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                rows={6}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#0A192F] focus:border-[#0A192F] font-mono text-gray-800 leading-relaxed"
                placeholder="Enter transcribed text..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onResolve(transcription)}
            className="px-4 py-1.5 bg-[#2D5A27] text-white rounded text-xs font-semibold hover:bg-[#2D5A27]/90 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">check</span>
            Approve &amp; Re-index Document
          </button>
        </div>
      </div>
    </div>
  );
}
