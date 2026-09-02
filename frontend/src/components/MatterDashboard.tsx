import React, { useState, FormEvent } from 'react';
import { Matter, KeyIssue, ProceduralEvent, Role } from '../types';
import { AskMatterDrawer } from './AskMatterDrawer';
import { InviteMemberModal } from './InviteMemberModal';
import { PdfViewerPanel } from './PdfViewerPanel';
import { useAuth } from '../context/AuthContext';

interface MatterDashboardProps {
  matter: Matter;
  onBack: () => void;
  onOpenCitation: (key: string) => void;
  onOpenPipeline: () => void;
  onOpenContradictions: () => void;
  onOpenDraftGenerator: () => void;
  onOpenDocuments?: () => void;
}

export function MatterDashboard({
  matter,
  onBack,
  onOpenCitation,
  onOpenPipeline,
  onOpenContradictions,
  onOpenDraftGenerator,
  onOpenDocuments,
}: MatterDashboardProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline' | 'documents'>('summary');
  const [isSlideoverChatOpen, setIsSlideoverChatOpen] = useState(false);
  const [keyIssues, setKeyIssues] = useState<KeyIssue[]>(matter?.keyIssues || []);
  const [timelineEvents, setTimelineEvents] = useState<ProceduralEvent[]>(matter?.timeline || []);
  const [newIssueText, setNewIssueText] = useState('');
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfPage, setActivePdfPage] = useState<number>(1);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { hasRole } = useAuth();
  const isGuest = hasRole('GUEST', matter) && !hasRole('ASSOCIATE', matter);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddIssue = (e: FormEvent) => {
    e.preventDefault();
    if (!newIssueText.trim()) return;
    const newIssue: KeyIssue = {
      id: `ki-${Date.now()}`,
      title: newIssueText.trim(),
      status: 'pending'
    };
    const updatedIssues = [...keyIssues, newIssue];
    setKeyIssues(updatedIssues);
    setNewIssueText('');
    setShowAddIssue(false);
    showToast(`Added key issue: "${newIssue.title}"`);

    if (onUpdateMatter) {
      onUpdateMatter({
        ...matter,
        keyIssues: updatedIssues
      });
    }
  };

  const handleInvite = (email: string, role: Role, scope: string) => {
    showToast(`Invited ${email} as ${role} (${scope})`);
    if (onUpdateMatter) {
      onUpdateMatter({
        ...matter,
        members: [
          ...(matter.members || []),
          {
            user: { id: `u-${Date.now()}`, name: email.split('@')[0], email },
            role,
            invitedAt: new Date().toISOString()
          }
        ]
      });
    }
  };

  const renderSummaryTextWithCitations = () => {
    return (matter.summaryText || []).map((item, pIdx) => {
      let content = item.paragraph;
      return (
        <p key={pIdx} className="text-[13px] leading-relaxed text-gray-800 text-justify">
          {content}{' '}
          {item.citations?.map((cit, cIdx) => (
            <button
              key={cIdx}
              onClick={() => handleCitationClick(`Doc ${cit.docNum}, p.${cit.page}`)}
              className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded text-xs transition-colors cursor-pointer mr-1.5 ${
                cit.isWarning
                  ? 'text-[#B45309] bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FDE68A]'
                  : 'text-[#2D5A27] bg-[#2D5A27]/10 hover:bg-[#2D5A27]/20 border border-[#2D5A27]/20'
              }`}
              title={`View ${cit.docName} (p. ${cit.page})`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {cit.isWarning ? 'warning' : 'description'}
              </span>
              {cit.label}
            </button>
          ))}
        </p>
      );
    });
  };

  const handleCitationClick = (key: string) => {
    const match = key.match(/Doc\s+(\d+),\s*p\.(\d+)/);
    const pageNum = match ? parseInt(match[2], 10) : 1;
    setActivePdfPage(pageNum);
    // Use the dummy pdf we downloaded, or could be dynamic later based on docNum
    setActivePdfUrl('/sample_document.pdf');
  };

  return (
    <div className="flex-1 flex flex-row min-w-0 bg-[#F0F2F5] overflow-hidden">
      {/* Left Main Content */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${activePdfUrl ? 'w-1/2' : 'w-full'} overflow-y-auto`}>
      {/* Top Header / Breadcrumb */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <button
                onClick={onBack}
                className="hover:text-[#0A192F] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Matters
              </button>
              <span>/</span>
              <span className="text-[#0A192F] font-mono font-bold">{matter.code}</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-heading font-bold text-[#0A192F]">
                {matter.title}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#2D5A27] border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]"></span>
                {matter.status}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-gray-400">account_balance</span>
                {matter.jurisdiction}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenPipeline}
              className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#115fd4]">upload_file</span>
              Upload Briefs
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {!isGuest && (
                <>
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">person_add</span>
                    Invite
                  </button>
                  <button
                    onClick={onOpenDraftGenerator}
                    className="w-full sm:w-auto px-4 py-2 border border-[#2D5A27] bg-[#2D5A27]/5 hover:bg-[#2D5A27]/10 text-[#2D5A27] rounded text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit_document</span>
                    Generate Draft
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 mt-4 border-t border-gray-100 pt-3 text-xs font-semibold text-gray-500">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'text-[#0A192F] border-b-2 border-[#0A192F] font-bold'
                : 'hover:text-gray-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">summarize</span>
            Summary &amp; Findings
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'text-[#0A192F] border-b-2 border-[#0A192F] font-bold'
                : 'hover:text-gray-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">timeline</span>
            Procedural Timeline
          </button>

          <button
            onClick={() => {
              setActiveTab('documents');
              if (onOpenDocuments) onOpenDocuments();
            }}
            className={`pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'text-[#0A192F] border-b-2 border-[#0A192F] font-bold'
                : 'hover:text-gray-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">folder_open</span>
            Documents ({matter.documentsCount || matter.indexedCount || 0})
          </button>

          <button
            onClick={onOpenContradictions}
            className="pb-2 text-red-700 hover:text-red-900 transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
          >
            <span className="material-symbols-outlined text-[16px]">rule</span>
            Contradictions &amp; Gaps (2)
          </button>
        </div>
      </header>

      {/* Main 3-Column Dashboard Body */}
      <main className="p-6 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Key Issues & Missing Info (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Key Issues Card */}
            <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0A192F]">flag</span>
                  Key Issues
                </h3>
                <button
                  onClick={() => setShowAddIssue(!showAddIssue)}
                  className="text-[11px] text-[#115fd4] font-semibold hover:underline"
                >
                  + Add Issue
                </button>
              </div>

              {showAddIssue && (
                <form onSubmit={handleAddIssue} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newIssueText}
                    onChange={(e) => setNewIssueText(e.target.value)}
                    placeholder="Enter issue title..."
                    className="text-xs border border-gray-300 rounded px-2.5 py-1 flex-1 focus:outline-none focus:border-[#0A192F]"
                  />
                  <button
                    type="submit"
                    className="bg-[#0A192F] text-white text-xs px-2.5 py-1 rounded font-semibold"
                  >
                    Add
                  </button>
                </form>
              )}

              <div className="mt-3 space-y-2 text-xs">
                {keyIssues.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">flag_circle</span>
                    <p className="font-semibold text-gray-600">No Key Issues</p>
                    <p className="text-[11px] text-gray-400 mt-1">Issues will appear here as they are identified.</p>
                  </div>
                ) : (
                  keyIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-start gap-2.5 p-2 rounded bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      {issue.status === 'check' && (
                        <span className="material-symbols-outlined text-[#2D5A27] text-[18px] shrink-0">
                          check_circle
                        </span>
                      )}
                      {issue.status === 'warning' && (
                        <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0">
                          warning
                        </span>
                      )}
                      {issue.status === 'pending' && (
                        <span className="material-symbols-outlined text-gray-400 text-[18px] shrink-0">
                          pending
                        </span>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{issue.title}</p>
                        {issue.docRef && (
                          <button
                            onClick={() => onOpenCitation(issue.docRef!)}
                            className="text-[11px] text-[#115fd4] hover:underline font-mono mt-0.5 block"
                          >
                            Ref: {issue.docRef}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Missing Information Alert Card */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-4 text-xs shadow-xs">
              <div className="flex items-center gap-2 text-[#B45309] font-bold pb-2 border-b border-[#FDE68A]/60">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>Missing Information</span>
              </div>
              <p className="text-[#92400E] mt-2.5 leading-relaxed">
                {matter.missingInfoNote}
              </p>
              <button
                onClick={onOpenContradictions}
                className="mt-3 text-xs font-bold text-[#B45309] hover:text-[#78350F] flex items-center gap-1 cursor-pointer"
              >
                Review Gaps &amp; Contradictions
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>

            {/* Matter Metadata / Opposing Counsel */}
            <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4 text-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Opposing Representation
              </h3>
              {(matter.opposingCounsels || []).map((counsel) => (
                <div key={counsel.id} className="p-2 bg-gray-50 rounded border border-gray-100">
                  <p className="font-semibold text-gray-900">{counsel.name}</p>
                  <p className="text-gray-500 text-[11px]">{counsel.firm}</p>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-700">Internal Counsel Notes:</span>
                <p className="text-gray-600 text-[11px] mt-1 italic leading-relaxed">
                  "{matter.internalNotes}"
                </p>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Algorithmic Case Summary & Procedural Timeline (5 cols) */}
          <div className="lg:col-span-5 space-y-5 animate-fade-in">
            {/* Algorithmic Case Summary */}
            {activeTab === 'summary' && (
            <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-5 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A192F] font-heading">
                    Algorithmic Case Summary
                  </h2>
                  <span className="bg-emerald-50 text-[#2D5A27] border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    High Confidence
                  </span>
                </div>
                <button
                  onClick={() => alert('Re-synthesized case corpus against latest filings.')}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded"
                  title="Re-synthesize summary"
                >
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                </button>
              </div>

              <div className="space-y-3 font-sans">
                {(matter.summaryText || []).length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-gray-500 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-3 animate-pulse">hourglass_empty</span>
                    <p className="font-semibold text-gray-600">Awaiting Summary Analysis</p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-xs">Upload documents and queue the pipeline to automatically synthesize the case facts and legal arguments.</p>
                  </div>
                ) : (
                  renderSummaryTextWithCitations()
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>Verified across {matter.indexedCount} ingested filings</span>
                <span className="font-mono text-gray-400">Model: G&amp;S Legal-v3</span>
              </div>
            </div>
            )}

            {/* Procedural Timeline */}
            {(activeTab === 'summary' || activeTab === 'timeline') && (
            <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-5 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A192F] font-heading">
                  Procedural Timeline
                </h3>
                <span className="text-[11px] text-gray-500">{timelineEvents.length} Events Logged</span>
              </div>

              <div className="space-y-4 relative pl-4 border-l-2 border-gray-200">
                {timelineEvents.length === 0 ? (
                  <div className="py-6 text-gray-500 ml-[-16px]">
                    <p className="font-semibold text-gray-600 text-xs">No Timeline Events</p>
                    <p className="text-[11px] text-gray-400 mt-1">Events will be extracted from your documents automatically.</p>
                  </div>
                ) : (
                  timelineEvents.map((evt) => (
                    <div key={evt.id} className="relative group">
                      {/* Circle marker */}
                      <div
                        className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white"
                        style={{ backgroundColor: evt.statusColor || '#0A192F' }}
                      ></div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider uppercase">
                          {evt.date}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 mt-0.5">{evt.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{evt.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}
          </div>

          {/* RIGHT COLUMN: Docked Ask this Matter (3 cols) */}
          <div className="lg:col-span-3">
            <AskMatterDrawer
              isOpen={true}
              onClose={() => setIsSlideoverChatOpen(true)}
              onOpenCitation={handleCitationClick}
              isDockedMode={true}
              matterTitle={matter.title}
              matterId={matter.id}
            />
          </div>
        </div>
      </main>
      </div>

      {/* Right Side PDF Viewer (Split-Screen) */}
      {activePdfUrl && (
        <div className="hidden lg:block w-1/2 min-w-[500px] border-l border-gray-300 h-full">
          <PdfViewerPanel 
            documentUrl={activePdfUrl} 
            initialPage={activePdfPage} 
            onClose={() => setActivePdfUrl(null)} 
          />
        </div>
      )}

      {/* Slide-over Full Drawer (if user expanded chat) */}
      <AskMatterDrawer
        isOpen={isSlideoverChatOpen}
        onClose={() => setIsSlideoverChatOpen(false)}
        onOpenCitation={handleCitationClick}
        isDockedMode={false}
        matterTitle={matter.title}
        matterId={matter.id}
      />
      
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        matter={matter}
        onInvite={handleInvite}
      />
    </div>
  );
}
