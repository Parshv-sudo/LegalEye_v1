import { useState } from 'react';
import { Workspace } from '../types';

interface SettingsViewProps {
  activeWorkspace: Workspace;
  onBack: () => void;
}

export function SettingsView({ activeWorkspace }: SettingsViewProps) {
  const [ocrEngine, setOcrEngine] = useState('Google Vision Ultra & Cursive Handwriting Parser');
  const [strictness, setStrictness] = useState('High Precision (Strict Evidentiary Proof)');
  const [autoIndex, setAutoIndex] = useState(true);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F0F2F5] overflow-y-auto">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-[#0A192F]">
            Workspace Settings &amp; Configuration
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage ingestion pipelines, LLM verification parameters, and legal citations formatting.
          </p>
        </div>
      </header>

      <main className="p-6 max-w-4xl w-full mx-auto space-y-6 text-xs">
        {/* Workspace Identity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-heading text-[#0A192F]">
            Chambers &amp; Practice Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Firm / Chambers Name</label>
              <input
                defaultValue={activeWorkspace.name}
                className="w-full p-2 border border-gray-300 rounded font-medium text-gray-800"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Billing &amp; Tax Reference</label>
              <input
                defaultValue="GSTIN-07AAAAA0000A1Z5"
                className="w-full p-2 border border-gray-300 rounded font-mono text-gray-800"
              />
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
              onClick={() => alert('Settings saved successfully.')}
              className="px-4 py-2 bg-[#2D5A27] text-white font-bold rounded hover:bg-[#2D5A27]/90 transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
