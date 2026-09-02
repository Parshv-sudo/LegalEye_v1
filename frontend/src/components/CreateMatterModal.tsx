import { useState, useRef, useEffect } from 'react';
import { OpposingCounsel, Matter } from '../types';
import { indianCourtsList } from '../data/mockData';

interface CreateMatterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatter: (newMatter: Partial<Matter>) => void;
}

export function CreateMatterModal({ isOpen, onClose, onCreateMatter }: CreateMatterModalProps) {
  const [currentStep, setCurrentStep] = useState(1); // Start on Step 1: Client Info

  // Form State with clean defaults
  const [clientName, setClientName] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [practiceArea, setPracticeArea] = useState('Commercial Litigation & Arbitration');

  const [jurisdiction, setJurisdiction] = useState('');
  const [jurisdictionSearchOpen, setJurisdictionSearchOpen] = useState(false);
  const [counsels, setCounsels] = useState<OpposingCounsel[]>([
    { id: '1', name: '', firm: '', email: '' }
  ]);
  const [internalNotes, setInternalNotes] = useState('');
  const [files, setFiles] = useState<string[]>([
    'Initial_Pleadings_Notice.pdf',
    'Vakalatnama_Executed.pdf'
  ]);

  const jurisdictionRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (jurisdictionRef.current && !jurisdictionRef.current.contains(event.target as Node)) {
        setJurisdictionSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleAddCounsel = () => {
    setCounsels([
      ...counsels,
      { id: String(Date.now()), name: '', firm: '', email: '' }
    ]);
  };

  const handleRemoveCounsel = (id: string) => {
    setCounsels(counsels.filter((c) => c.id !== id));
  };

  const handleCounselChange = (id: string, field: keyof OpposingCounsel, val: string) => {
    setCounsels(
      counsels.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final Submit
      const newMatter: Partial<Matter> = {
        title: caseTitle || 'Commercial Dispute Matter',
        client: clientName || 'Client Corp',
        jurisdiction: jurisdiction || 'Delhi High Court',
        status: 'Active',
        nextHearing: 'Nov 18, 2023',
        opposingCounsels: counsels.filter((c) => c.name.trim()),
        internalNotes: internalNotes
      };
      onCreateMatter(newMatter);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  const filteredCourts = indianCourtsList.filter((court) =>
    court.toLowerCase().includes(jurisdiction.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0A192F]/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Modal Container */}
      <main
        id="create-matter-modal"
        className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-[760px] bg-white sm:rounded-lg shadow-2xl flex flex-col relative z-10 transition-all overflow-hidden"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200 bg-white shrink-0 sm:rounded-t-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label="Back"
              className="sm:hidden text-gray-500 hover:text-gray-900 p-1 -ml-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#0A192F]">
              Create New Matter
            </h1>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="hidden sm:flex text-gray-400 hover:text-gray-700 p-1 transition-colors rounded-full hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </header>

        {/* Stepper + Form */}
        <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
          {/* Left Sidebar: Stepper */}
          <aside className="hidden sm:block w-[210px] bg-[#F0F2F5] border-r border-gray-200 p-6 shrink-0 overflow-y-auto">
            <nav aria-label="Progress">
              <ol className="overflow-hidden space-y-6" role="list">
                {/* Step 1 */}
                <li className="relative">
                  <div className={`absolute top-4 left-3 -ml-px h-full w-0.5 ${currentStep > 1 ? 'bg-[#2D5A27]' : 'bg-gray-300'}`}></div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="relative flex items-start text-left group w-full cursor-pointer"
                  >
                    <span className="h-8 flex items-center">
                      {currentStep > 1 ? (
                        <span className="relative z-10 w-6 h-6 flex items-center justify-center bg-[#2D5A27] rounded-full text-white">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                      ) : (
                        <span className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full border-2 ${currentStep === 1 ? 'border-[#2D5A27] bg-white' : 'border-gray-300 bg-white'}`}>
                          {currentStep === 1 && <span className="w-2 h-2 bg-[#2D5A27] rounded-full"></span>}
                        </span>
                      )}
                    </span>
                    <span className="ml-3 min-w-0 flex flex-col">
                      <span className={`text-[11px] font-semibold tracking-wide uppercase ${currentStep >= 1 ? 'text-[#2D5A27]' : 'text-gray-400'}`}>
                        Step 1
                      </span>
                      <span className={`text-sm font-medium ${currentStep === 1 ? 'text-[#1A1A1A] font-semibold' : 'text-gray-700'}`}>
                        Client Info
                      </span>
                    </span>
                  </button>
                </li>

                {/* Step 2 */}
                <li className="relative">
                  <div className={`absolute top-4 left-3 -ml-px h-full w-0.5 ${currentStep > 2 ? 'bg-[#2D5A27]' : 'bg-gray-300'}`}></div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="relative flex items-start text-left group w-full cursor-pointer"
                  >
                    <span className="h-8 flex items-center">
                      {currentStep > 2 ? (
                        <span className="relative z-10 w-6 h-6 flex items-center justify-center bg-[#2D5A27] rounded-full text-white">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                      ) : (
                        <span className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full border-2 ${currentStep === 2 ? 'border-[#2D5A27] bg-white' : 'border-gray-300 bg-white'}`}>
                          {currentStep === 2 && <span className="w-2 h-2 bg-[#2D5A27] rounded-full"></span>}
                        </span>
                      )}
                    </span>
                    <span className="ml-3 min-w-0 flex flex-col">
                      <span className={`text-[11px] font-semibold tracking-wide uppercase ${currentStep >= 2 ? 'text-[#2D5A27]' : 'text-gray-400'}`}>
                        Step 2
                      </span>
                      <span className={`text-sm font-medium ${currentStep === 2 ? 'text-[#1A1A1A] font-semibold' : 'text-gray-700'}`}>
                        Case Metadata
                      </span>
                    </span>
                  </button>
                </li>

                {/* Step 3 */}
                <li className="relative">
                  <div className={`absolute top-4 left-3 -ml-px h-full w-0.5 ${currentStep > 3 ? 'bg-[#2D5A27]' : 'bg-gray-300'}`}></div>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="relative flex items-start text-left group w-full cursor-pointer"
                  >
                    <span className="h-8 flex items-center">
                      {currentStep > 3 ? (
                        <span className="relative z-10 w-6 h-6 flex items-center justify-center bg-[#2D5A27] rounded-full text-white">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                      ) : (
                        <span className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full border-2 ${currentStep === 3 ? 'border-[#2D5A27] bg-white' : 'border-gray-300 bg-white'}`}>
                          {currentStep === 3 && <span className="w-2 h-2 bg-[#2D5A27] rounded-full"></span>}
                        </span>
                      )}
                    </span>
                    <span className="ml-3 min-w-0 flex flex-col">
                      <span className={`text-[11px] font-semibold tracking-wide uppercase ${currentStep >= 3 ? 'text-[#2D5A27]' : 'text-gray-400'}`}>
                        Step 3
                      </span>
                      <span className={`text-sm font-medium ${currentStep === 3 ? 'text-[#1A1A1A] font-semibold' : 'text-gray-500'}`}>
                        Documents
                      </span>
                    </span>
                  </button>
                </li>

                {/* Step 4 */}
                <li className="relative">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="relative flex items-start text-left group w-full cursor-pointer"
                  >
                    <span className="h-8 flex items-center">
                      {currentStep > 4 ? (
                        <span className="relative z-10 w-6 h-6 flex items-center justify-center bg-[#2D5A27] rounded-full text-white">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                      ) : (
                        <span className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full border-2 ${currentStep === 4 ? 'border-[#2D5A27] bg-white' : 'border-gray-300 bg-white'}`}>
                          {currentStep === 4 && <span className="w-2 h-2 bg-[#2D5A27] rounded-full"></span>}
                        </span>
                      )}
                    </span>
                    <span className="ml-3 min-w-0 flex flex-col">
                      <span className={`text-[11px] font-semibold tracking-wide uppercase ${currentStep === 4 ? 'text-[#2D5A27]' : 'text-gray-400'}`}>
                        Step 4
                      </span>
                      <span className={`text-sm font-medium ${currentStep === 4 ? 'text-[#1A1A1A] font-semibold' : 'text-gray-500'}`}>
                        Review
                      </span>
                    </span>
                  </button>
                </li>
              </ol>
            </nav>
          </aside>

          {/* Mobile Progress Bar */}
          <div className="sm:hidden w-full bg-[#F0F2F5] border-b border-gray-200 h-1.5 flex shrink-0">
            <div
              className="bg-[#2D5A27] h-full transition-all"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>

          {/* Form Content Area */}
          <section className="flex-1 overflow-y-auto p-4 sm:p-6 sm:px-8 bg-white">
            {/* STEP 1: CLIENT INFO */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-[#0A192F] mb-1">
                    Client &amp; Case Information
                  </h2>
                  <p className="text-xs text-gray-500">
                    Enter primary client representation details and practice domain.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                      Client Name <span className="text-[#991B1B]">*</span>
                    </label>
                    <input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Reliance Industries Limited"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-[#2D5A27] focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                      Case Title / Caption <span className="text-[#991B1B]">*</span>
                    </label>
                    <input
                      value={caseTitle}
                      onChange={(e) => setCaseTitle(e.target.value)}
                      placeholder="e.g. Reliance Industries vs. Union of India"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-[#2D5A27] focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                      Practice Area / Division
                    </label>
                    <select
                      value={practiceArea}
                      onChange={(e) => setPracticeArea(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-[#2D5A27] focus:border-[#2D5A27]"
                    >
                      <option>Commercial Litigation &amp; Arbitration</option>
                      <option>Antitrust &amp; Competition Law</option>
                      <option>Corporate Governance &amp; Insolvency</option>
                      <option>Intellectual Property Enforcement</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CASE METADATA (EXACT MATCH TO IMAGE 1) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-[#0A192F] mb-1">
                    Case Metadata
                  </h2>
                  <p className="text-xs text-gray-500">
                    Define the jurisdiction and opposing parties for this matter.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  {/* Jurisdiction Combobox */}
                  <div ref={jurisdictionRef} className="space-y-2 relative">
                    <label className="block text-sm font-semibold text-[#1A1A1A]" htmlFor="jurisdiction">
                      Jurisdiction <span className="text-[#991B1B]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]" aria-hidden="true">
                          account_balance
                        </span>
                      </div>
                      <input
                        id="jurisdiction"
                        name="jurisdiction"
                        value={jurisdiction}
                        onChange={(e) => {
                          setJurisdiction(e.target.value);
                          setJurisdictionSearchOpen(true);
                        }}
                        onFocus={() => setJurisdictionSearchOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setJurisdictionSearchOpen(false);
                        }}
                        placeholder="Search Indian courts (e.g., Delhi High Court)"
                        type="text"
                        className="block w-full pl-10 pr-10 py-2.5 sm:py-2 text-sm border border-gray-300 rounded bg-white text-[#1A1A1A] placeholder-gray-400 focus:ring-1 focus:ring-[#2D5A27] focus:border-[#2D5A27] transition-colors"
                      />
                      {jurisdiction && (
                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                          <button
                            type="button"
                            onClick={() => setJurisdiction('')}
                            aria-label="Clear"
                            className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Type to search across High Courts, Supreme Court, or Tribunals.
                    </p>

                    {/* Autocomplete Dropdown */}
                    {jurisdictionSearchOpen && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                        {filteredCourts.length > 0 ? (
                          filteredCourts.map((court, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setJurisdiction(court);
                                setJurisdictionSearchOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px] text-gray-400" aria-hidden="true">visibility</span>
                              {court}
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-gray-400">No courts matched your search.</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Opposing Counsel Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-[#1A1A1A]">
                      Opposing Counsel
                    </label>
                    <div className="space-y-3" id="counsel-list">
                      {counsels.map((counsel, index) => (
                        <div key={counsel.id} className="flex items-start gap-2 relative group">
                          <div className="flex-1 space-y-3 p-3 sm:p-4 border border-gray-300 rounded bg-[#F0F2F5]/50 relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-[#1A1A1A]" htmlFor={`counsel_name_${index}`}>
                                  Counsel Name
                                </label>
                                <input
                                  id={`counsel_name_${index}`}
                                  value={counsel.name}
                                  onChange={(e) => handleCounselChange(counsel.id, 'name', e.target.value)}
                                  placeholder="Enter name"
                                  type="text"
                                  className="block w-full py-2 px-3 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-[#2D5A27] focus:border-[#2D5A27] transition-colors"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-[#1A1A1A]" htmlFor={`counsel_firm_${index}`}>
                                  Law Firm / Chamber
                                </label>
                                <input
                                  id={`counsel_firm_${index}`}
                                  value={counsel.firm}
                                  onChange={(e) => handleCounselChange(counsel.id, 'firm', e.target.value)}
                                  placeholder="Enter firm"
                                  type="text"
                                  className="block w-full py-2 px-3 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-[#2D5A27] focus:border-[#2D5A27] transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                          {counsels.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCounsel(counsel.id)}
                              aria-label="Remove counsel"
                              className="mt-1 sm:mt-0 text-gray-400 hover:text-[#991B1B] p-2 rounded transition-colors"
                              title="Remove counsel"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCounsel}
                      className="w-full sm:w-auto mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 border border-dashed border-gray-300 rounded text-sm font-semibold text-[#1A1A1A] bg-white hover:bg-[#F0F2F5] transition-colors min-h-[44px]"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Add Counsel
                    </button>
                  </div>

                  {/* Internal Notes */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-sm font-semibold text-[#1A1A1A]" htmlFor="internal_notes">
                      Internal Notes (Optional)
                    </label>
                    <textarea
                      id="internal_notes"
                      name="internal_notes"
                      rows={3}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Any specific instructions or initial thoughts regarding this matter..."
                      className="block w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-[#1A1A1A] placeholder-gray-400 focus:ring-1 focus:ring-[#2D5A27] focus:border-[#2D5A27] resize-y transition-colors"
                    ></textarea>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: DOCUMENTS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-[#0A192F] mb-1">
                    Upload Matter Documents
                  </h2>
                  <p className="text-xs text-gray-500">
                    Ingest pleadings, affidavits, and correspondence for OCR &amp; indexing.
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center hover:border-[#0A192F] transition-colors bg-gray-50 cursor-pointer">
                  <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">cloud_upload</span>
                  <p className="text-sm font-semibold text-[#1A1A1A]">Drag &amp; drop PDF files</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT up to 50MB</p>
                  <button
                    type="button"
                    onClick={() => setFiles([...files, `Document_Exhibit_${files.length + 1}.pdf`])}
                    className="mt-3 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-100"
                  >
                    + Browse Files
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Queued for Ingestion ({files.length})</p>
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded text-xs">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-600 text-base">picture_as_pdf</span>
                        <span className="font-medium text-gray-800">{file}</span>
                      </div>
                      <span className="text-[10px] text-[#2D5A27] font-semibold bg-green-50 px-2 py-0.5 rounded">Ready</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-[#0A192F] mb-1">
                    Review Matter Details
                  </h2>
                  <p className="text-xs text-gray-500">
                    Verify all parameters before provisioning intelligence indexes.
                  </p>
                </div>

                <div className="bg-[#F0F2F5] p-4 rounded border border-gray-200 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium">Matter Title</span>
                    <span className="font-bold text-gray-900">{caseTitle}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium">Client</span>
                    <span className="font-semibold text-gray-900">{clientName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium">Jurisdiction</span>
                    <span className="font-semibold text-gray-900">{jurisdiction || 'Delhi High Court'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium">Opposing Counsel</span>
                    <span className="font-semibold text-gray-900">
                      {counsels.map((c) => c.name || 'Unassigned').join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Documents Queued</span>
                    <span className="font-semibold text-[#2D5A27]">{files.length} documents</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between sm:justify-end gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 bg-[#F0F2F5] sm:rounded-b-lg shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold text-[#1A1A1A] bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors min-h-[44px]"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-2 text-sm font-semibold text-white bg-[#2D5A27] border border-transparent rounded hover:bg-[#2D5A27]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D5A27] transition-colors min-h-[44px] shadow-sm flex items-center justify-center gap-2"
          >
            {currentStep === 4 ? 'Create Matter' : 'Continue'}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </footer>
      </main>
    </div>
  );
}
