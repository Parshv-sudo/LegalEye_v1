import React, { useState } from 'react';
import { Matter } from '../types';

interface DraftGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  matter: Matter;
}

export function DraftGeneratorModal({ isOpen, onClose, matter }: DraftGeneratorModalProps) {
  const [draftType, setDraftType] = useState('Written Statement / Reply to Statement of Claim');
  const [tone, setTone] = useState('Assertive & Grounded');
  const [includeCitations, setIncludeCitations] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [generatedDraft, setGeneratedDraft] = useState<string>(
    `IN THE HIGH COURT OF DELHI AT NEW DELHI\n` +
    `(EXTRAORDINARY ORIGINAL CIVIL JURISDICTION)\n` +
    `COMMERCIAL SUIT NO. 412 OF 2023\n\n` +
    `IN THE MATTER OF:\n` +
    `${matter.title}\n\n` +
    `WRITTEN STATEMENT ON BEHALF OF DEFENDANT\n\n` +
    `MOST RESPECTFULLY SHOWETH:\n\n` +
    `1. That the present suit instituted by the Plaintiff is misconceived, untenable in law, and barred by statutory provisions governing arbitration and confidentiality covenants.\n\n` +
    `2. PRELIMINARY OBJECTION AS TO JURISDICTION:\n` +
    `   The Defendant submits that under Clause 12.1 of the Agreement dated October 12, 2021 [Doc 2, p.1], the parties agreed that all disputes arising out of or in connection with the schematics shall be submitted to fast-track arbitration under SIAC Rules. Consequently, the jurisdiction of this Hon'ble Court is ousted.\n\n` +
    `3. REPLY ON MERITS REGARDING ALLEGED BREACH OF CLAUSE 4.2:\n` +
    `   Paragraph 14 of the Statement of Claim is vehemently denied. The technical drawings referenced therein were published in the Indian Patent Journal on September 14, 2021 [Doc 7, p.4], prior to the execution of the NDA. Thus, no actionable breach of confidentiality occurred.\n\n` +
    `4. PRAYER:\n` +
    `   In light of the aforesaid facts and authoritative precedents in Kesavananda Bharati [Doc 3, p.14], the Defendant prays that this Hon'ble Court may be pleased to:\n` +
    `   (a) Dismiss the Plaintiff's suit with exemplary costs;\n` +
    `   (b) Pass such other and further orders as deemed fit.\n\n` +
    `VERIFICATION:\n` +
    `Verified at New Delhi on this 24th day of October, 2023, that the contents of paragraphs 1 to 4 are true to my knowledge and belief.`
  );

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (draftType.includes('Injunction')) {
        setGeneratedDraft(
          `IN THE HIGH COURT OF DELHI AT NEW DELHI\n` +
          `I.A. NO. _____ OF 2023\n` +
          `IN CS (COMM) 412/2023\n\n` +
          `APPLICATION UNDER ORDER XXXIX RULES 1 & 2 READ WITH SECTION 151 CPC FOR AD-INTERIM EX-PARTE INJUNCTION\n\n` +
          `1. The Applicant/Plaintiff has established a prima facie case regarding proprietary schematics protected under NDA Clause 4.2 [Doc 4, p.12].\n` +
          `2. Balance of convenience lies overwhelmingly in favor of the Applicant, as unauthorized disclosure will cause irreversible commercial prejudice.\n` +
          `3. Irreparable injury will be sustained unless the Defendant is restrained immediately from licensing the technology.\n\n` +
          `PRAYER:\n` +
          `Restrain the Defendant from alienating, transmitting, or deploying the disputed technical schematics till next date of hearing.`
        );
      } else if (draftType.includes('Legal Notice')) {
        setGeneratedDraft(
          `LEGAL NOTICE UNDER SECTION 80 CPC & SECTION 73 CONTRACT ACT\n\n` +
          `To: ${matter.opposingCounsels[0]?.firm || 'Opposing Chambers'}\n` +
          `Dated: October 24, 2023\n\n` +
          `SUB: Demand Notice for Immediate Cessation of NDA Violation & Damages Claim\n\n` +
          `Under instructions from our Client, ${matter.client}, we hereby serve upon you this notice regarding material breaches of Clause 4.2 [Doc 4, p.12].\n\n` +
          `You are called upon to cease and desist within 7 days, failing which civil and criminal remedies shall be initiated without further notice.`
        );
      } else {
        setGeneratedDraft(
          `SYNOPSIS AND LIST OF DATES\n\n` +
          `12.10.2021 - Execution of Bilateral NDA [Doc 2, p.1]\n` +
          `05.08.2023 - Statement of Claim filed by Claimant [Doc 4, p.12]\n` +
          `18.10.2023 - Interim Injunction Arguments [Doc 12, p.4]\n` +
          `24.10.2023 - Matter listed for framing of issues before Hon'ble High Court.`
        );
      }
      setIsGenerating(false);
    }, 1100);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0A192F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#115fd4]">auto_awesome</span>
            <div>
              <h2 className="font-heading text-lg font-bold">Generate AI Legal Draft</h2>
              <p className="text-xs text-gray-300">Grounded against {matter.documentsCount} indexed documents in {matter.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 flex-1 overflow-hidden">
          {/* Left Configuration Pane */}
          <div className="p-5 border-r border-gray-200 bg-[#F0F2F5]/50 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Pleading Template</label>
              <select
                value={draftType}
                onChange={(e) => setDraftType(e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded bg-white font-medium text-gray-800 focus:ring-1 focus:ring-[#0A192F]"
              >
                <option>Written Statement / Reply to Statement of Claim</option>
                <option>Application under Order 39 Rules 1 &amp; 2 (Interim Injunction)</option>
                <option>Legal Notice for Breach of Confidentiality</option>
                <option>Chronology of Events &amp; Synopsis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Tone &amp; Strategy</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded bg-white font-medium text-gray-800"
              >
                <option>Assertive &amp; Grounded</option>
                <option>Defensive / Jurisdictional Challenge</option>
                <option>Equitable / Settlement Oriented</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCitations}
                  onChange={(e) => setIncludeCitations(e.target.checked)}
                  className="rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                />
                <span className="font-medium">Embed inline source citations [Doc X, p.Y]</span>
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-[11px] text-[#0A192F] space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#115fd4]">verified</span>
                Evidentiary Grounding
              </p>
              <p className="text-gray-600">
                Pleadings are compiled exclusively using facts verified across indexed affidavits and contracts.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 bg-[#2D5A27] text-white text-xs font-bold rounded hover:bg-[#2D5A27]/90 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isGenerating ? 'hourglass_top' : 'magic_button'}
              </span>
              {isGenerating ? 'Generating Pleading...' : 'Re-Generate Pleading'}
            </button>
          </div>

          {/* Right Preview Editor */}
          <div className="p-5 md:col-span-2 flex flex-col bg-white overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Draft Preview</span>
                <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">Ready for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="text-xs px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1 text-gray-700 font-medium"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => alert('Draft exported to Word (.docx) with active citation hyperlinking.')}
                  className="text-xs px-2.5 py-1 bg-[#0A192F] text-white rounded hover:bg-[#115fd4] flex items-center gap-1 font-medium"
                >
                  <span className="material-symbols-outlined text-[14px]">file_download</span>
                  Export .DOCX
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto font-serif text-sm leading-relaxed p-4 bg-gray-50 border border-gray-200 rounded whitespace-pre-wrap text-gray-900 select-text">
              {generatedDraft}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
