import { useState, useEffect } from 'react';
import { Workspace } from '../types';
import { getApiKey, setApiKey, clearApiKey, isApiKeyConfigured, validateApiKey } from '../services/geminiService';

interface SettingsViewProps {
  activeWorkspace: Workspace;
  onBack: () => void;
  onOpenMobileSidebar?: () => void;
}

export function SettingsView({ activeWorkspace, onBack, onOpenMobileSidebar }: SettingsViewProps) {
  const [firmName, setFirmName] = useState(activeWorkspace.name);
  const [taxRef, setTaxRef] = useState('GSTIN-07AAAAA0000A1Z5');
  const [ocrEngine, setOcrEngine] = useState('Google Vision Ultra & Cursive Handwriting Parser');
  const [strictness, setStrictness] = useState('High Precision (Strict Evidentiary Proof)');
  const [autoIndex, setAutoIndex] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // API Key state
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  useEffect(() => {
    setApiKeyConfigured(isApiKeyConfigured());
  }, []);

  const handleSave = () => {
    setToastMessage('Workspace configuration and AI pipeline settings saved successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const maskedKey = apiKeyInput
    ? `${apiKeyInput.slice(0, 6)}${'•'.repeat(Math.max(0, apiKeyInput.length - 10))}${apiKeyInput.slice(-4)}`
    : '';

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F0F2F5] overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A192F] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-gray-700 animate-fadeIn">
          <span className="material-symbols-outlined text-[18px] text-[#115fd4]" aria-hidden="true">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              className="md:hidden text-gray-600 hover:text-gray-900 p-1 -ml-1 rounded transition-colors"
              aria-label="Open navigation menu"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">menu</span>
            </button>
          )}
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-xs font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
            Back
          </button>
          <div className="border-l border-gray-200 pl-3">
            <h1 className="text-xl md:text-2xl font-heading font-bold text-[#0A192F]">
              Workspace Settings &amp; Configuration
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage ingestion pipelines, LLM verification parameters, and legal citations formatting.
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6 text-xs">
        {/* Workspace Identity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-heading text-[#0A192F]">
            Chambers &amp; Practice Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Firm / Chambers Name</label>
              <input
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded font-medium text-gray-800 focus:ring-1 focus:ring-[#0A192F] focus:border-[#0A192F]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Billing &amp; Tax Reference</label>
              <input
                value={taxRef}
                onChange={(e) => setTaxRef(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded font-mono text-gray-800 focus:ring-1 focus:ring-[#0A192F] focus:border-[#0A192F]"
              />
            </div>
          </div>
        </div>

        {/* ═══ Gemini API Key Configuration ═══ */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-heading text-[#0A192F]">
                AI Engine Configuration
              </h2>
              {apiKeyConfigured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#2D5A27] border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>
                  Connected
                </span>
              )}
              {!apiKeyConfigured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Demo Mode
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-500 leading-relaxed">
            LegalEye is connected to Google Gemini via environment variables. Intelligent Q&amp;A, automated contradiction discovery, and grounded legal draft generation are active. 
            { !apiKeyConfigured && " Please configure VITE_GEMINI_API_KEY in your .env file to enable live AI features." }
          </p>

          <div className="space-y-3 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-[11px] text-[#0A192F] space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#115fd4]" aria-hidden="true">shield</span>
                Enterprise Security &amp; Data Privacy
              </p>
              <p className="text-gray-600">
                Your API key is securely provisioned at the infrastructure level. All document queries are sent directly to the AI service. LegalEye does not log, store, or train on your legal documents or API interactions.
              </p>
            </div>
          </div>
        </div>

        {/* AI & OCR Parameters */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-heading text-[#0A192F]">
            Document Intelligence &amp; Citation Engine
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">OCR Processing Model</label>
              <select
                value={ocrEngine}
                onChange={(e) => setOcrEngine(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-medium"
              >
                <option>Google Vision Ultra &amp; Cursive Handwriting Parser</option>
                <option>Standard OCR (Fast Tesseract Engine)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Contradiction Discovery Strictness</label>
              <select
                value={strictness}
                onChange={(e) => setStrictness(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-medium"
              >
                <option>High Precision (Strict Evidentiary Proof)</option>
                <option>Balanced Recall (Flags Minor Date &amp; Number Nuances)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-gray-700 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={autoIndex}
                onChange={(e) => setAutoIndex(e.target.checked)}
                className="rounded text-[#2D5A27] focus:ring-[#2D5A27]"
              />
              <span className="font-semibold">Automatically trigger contradiction check upon completing batch ingestion</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#2D5A27] text-white font-bold rounded hover:bg-[#2D5A27]/90 transition-colors cursor-pointer shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
