import { useState, useRef, useEffect } from 'react';
import { ContradictionFinding, MissingGapFinding, Matter } from '../types';
import { initialContradictions, initialMissingGaps } from '../data/mockData';
import { matterApi } from '../services/api';

interface ContradictionsGapsProps {
  onBack: () => void;
  onOpenCitation: (key: string) => void;
  onCreateIssueFromFinding?: (title: string) => void;
  matter?: Matter;
  onOpenMobileSidebar?: () => void;
}

export function ContradictionsGaps({
  onBack,
  onOpenCitation,
  onCreateIssueFromFinding,
  matter,
  onOpenMobileSidebar,
}: ContradictionsGapsProps) {
  const [contradictions, setContradictions] = useState<ContradictionFinding[]>(initialContradictions);
  const [gaps, setGaps] = useState<MissingGapFinding[]>(initialMissingGaps);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleDismissContradiction = (id: string) => {
    setContradictions(contradictions.map((c) => (c.id === id ? { ...c, status: 'dismissed' } : c)));
    showToast('Discrepancy marked as dismissed.');
  };

  const handleFlagForCounsel = (id: string) => {
    setContradictions(contradictions.map((c) => (c.id === id ? { ...c, status: 'flagged' } : c)));
    showToast('Discrepancy flagged for Senior Counsel review.');
  };

  const handleCreateIssue = (item: ContradictionFinding) => {
    if (onCreateIssueFromFinding) {
      onCreateIssueFromFinding(item.title);
    }
    setContradictions(contradictions.map((c) => (c.id === item.id ? { ...c, status: 'issue_created' } : c)));
    showToast(`Created key issue from: "${item.title}"`);
  };

  const handleRequestDocument = (gapId: string) => {
    setGaps(gaps.map((g) => (g.id === gapId ? { ...g, status: 'requested' } : g)));
    showToast('Document request email drafted and sent to client liaison.');
  };

  const handleIgnoreGap = (gapId: string) => {
    setGaps(gaps.map((g) => (g.id === gapId ? { ...g, status: 'ignored' } : g)));
    showToast('Missing document reference ignored.');
  };

  const unresolvedCount = contradictions.filter((c) => c.status === 'unresolved').length;
  const matterCode = matter?.code || 'G&S-2023-14';

  const handleReAnalyze = async () => {
    if (!matter?.id) {
      showToast('No active matter selected.');
      return;
    }

    setIsScanning(true);
    showToast('Scanning corpus for contradictions via API...');
    try {
      const response = await matterApi.analyze(parseInt(matter.id));
      const results = response.data.findings || [];
      if (results.length > 0) {
        const newFindings: ContradictionFinding[] = results.map((r: any) => ({
          ...r,
          status: 'unresolved' as const
        }));
        setContradictions((prev) => [...newFindings, ...prev]);
        showToast(`Found ${results.length} new contradictions.`);
      } else {
        showToast('No additional contradictions found in the current corpus.');
      }
    } catch (error) {
      console.error("Analysis failed", error);
      showToast('Analysis failed. Check your API connectivity.');
    }
    setIsScanning(false);
  };

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
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              {onOpenMobileSidebar && (
                <button
                  onClick={onOpenMobileSidebar}
                  className="md:hidden text-gray-600 hover:text-gray-900 p-1 -ml-1 rounded transition-colors"
                  aria-label="Open navigation menu"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">menu</span>
                </button>
              )}
              <button onClick={onBack} className="hover:text-[#0A192F] flex items-center gap-1 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
                Matters
              </button>
              <span>/</span>
              <span className="text-gray-700 font-mono">{matterCode}</span>
              <span>/</span>
              <span className="text-[#0A192F] font-bold">Contradictions &amp; Gaps</span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-xl md:text-2xl font-heading font-bold text-[#0A192F]">
                Algorithmic Contradictions &amp; Gaps
              </h1>
              <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unresolvedCount} Unresolved Findings
              </span>
            </div>
          </div>

          <button
            onClick={handleReAnalyze}
            disabled={isScanning}
            className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] text-[#0A192F] ${isScanning ? 'animate-spin' : ''}`} aria-hidden="true">autorenew</span>
            {isScanning ? 'Scanning...' : 'Re-Analyze Corpus'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Banner Info */}
        <div className="bg-[#0A192F] text-white rounded-lg p-5 shadow-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-[#115fd4] text-[24px] shrink-0 mt-0.5" aria-hidden="true">
            insights
          </span>
          <div>
            <h2 className="text-sm font-bold font-heading">
              Evidentiary Cross-Reference Matrix
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed mt-1">
              The system has cross-referenced {matter?.indexedCount || 42} indexed documents in {matterCode} and identified potential factual discrepancies and missing information critical to the case timeline.
            </p>
          </div>
        </div>

        {/* Section 1: Factual Discrepancies */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 font-heading flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-[18px]" aria-hidden="true">rule</span>
              Factual Discrepancies ({contradictions.length})
            </h3>
            <span className="text-xs text-gray-500">Cross-verified citations</span>
          </div>

          <div className="space-y-4">
            {contradictions.length === 0 ? (
              <div className="py-12 text-center border rounded-lg border-dashed border-gray-300 bg-white">
                <span className="material-symbols-outlined text-4xl text-emerald-400 mb-3" aria-hidden="true">check_circle</span>
                <p className="font-semibold text-gray-700">No Discrepancies Found</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">The system has not detected any factual contradictions or inconsistencies in the currently indexed corpus.</p>
              </div>
            ) : (
              contradictions.map((finding) => (
                <div
                key={finding.id}
                className={`bg-white border rounded-lg shadow-xs overflow-hidden transition-all ${
                  finding.status === 'dismissed'
                    ? 'opacity-50 border-gray-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Finding Header */}
                <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        finding.severity.includes('High')
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {finding.severity}
                    </span>
                    <h4 className="font-bold text-sm text-[#0A192F]">{finding.title}</h4>
                  </div>

                  {finding.status === 'flagged' && (
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Flagged for Counsel
                    </span>
                  )}
                  {finding.status === 'issue_created' && (
                    <span className="text-xs font-semibold text-[#2D5A27] bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      Converted to Key Issue
                    </span>
                  )}
                </div>

                {/* Side-by-Side Statements */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                  {/* Statement A */}
                  <div className="bg-[#F8F9FA] border border-gray-200 rounded p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-200">
                        <span className="font-semibold text-gray-800">{finding.statementA.source}</span>
                        <button
                          onClick={() => onOpenCitation(`Doc 4, p.${finding.statementA.page}`)}
                          className="text-[#115fd4] font-mono hover:underline text-[11px] cursor-pointer"
                        >
                          Page {finding.statementA.page}
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-800 mt-2 font-serif text-justify">
                        {finding.statementA.text.split(finding.statementA.highlight).map((part, i, arr) => (
                          <span key={i}>
                            {part}
                            {i < arr.length - 1 && (
                              <span className="squiggly-underline font-semibold bg-red-50 text-red-900 px-0.5">
                                {finding.statementA.highlight}
                              </span>
                            )}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>

                  {/* Statement B */}
                  <div className="bg-[#F8F9FA] border border-gray-200 rounded p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-200">
                        <span className="font-semibold text-gray-800">{finding.statementB.source}</span>
                        <button
                          onClick={() => onOpenCitation(`Doc 7, p.${finding.statementB.page}`)}
                          className="text-[#115fd4] font-mono hover:underline text-[11px] cursor-pointer"
                        >
                          Page {finding.statementB.page}
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-800 mt-2 font-serif text-justify">
                        {finding.statementB.text.split(finding.statementB.highlight).map((part, i, arr) => (
                          <span key={i}>
                            {part}
                            {i < arr.length - 1 && (
                              <span className="squiggly-underline font-semibold bg-red-50 text-red-900 px-0.5">
                                {finding.statementB.highlight}
                              </span>
                            )}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => handleDismissContradiction(finding.id)}
                    className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleCreateIssue(finding)}
                    className="px-3 py-1.5 bg-white border border-[#0A192F] text-[#0A192F] rounded hover:bg-gray-100 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]" aria-hidden="true">flag</span>
                    Create Key Issue
                  </button>
                  <button
                    onClick={() => handleFlagForCounsel(finding.id)}
                    className="px-3 py-1.5 bg-[#0A192F] text-white rounded hover:bg-[#115fd4] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]" aria-hidden="true">priority_high</span>
                    Flag for Counsel
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        </section>

        {/* Section 2: Missing Information & Gaps */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 font-heading flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px]" aria-hidden="true">warning</span>
              Missing Information &amp; Gaps ({gaps.length})
            </h3>
          </div>

          <div className="space-y-4">
            {gaps.length === 0 ? (
              <div className="py-12 text-center border rounded-lg border-dashed border-gray-300 bg-white">
                <span className="material-symbols-outlined text-4xl text-amber-400 mb-3" aria-hidden="true">check_circle</span>
                <p className="font-semibold text-gray-700">No Missing Information Detected</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">The system has not identified any missing critical documents or gaps in the provided case history.</p>
              </div>
            ) : (
              gaps.map((gap) => (
                <div
                key={gap.id}
                className="bg-white border-l-4 border-l-amber-500 border border-gray-200 rounded-r-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">find_in_page</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0A192F]">{gap.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                      {gap.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs">
                  {gap.status === 'requested' ? (
                    <span className="text-xs font-semibold text-[#2D5A27] bg-green-50 px-2.5 py-1 rounded border border-green-200">
                      Request Dispatched
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleIgnoreGap(gap.id)}
                        className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium transition-colors cursor-pointer"
                      >
                        Ignore
                      </button>
                      <button
                        onClick={() => handleRequestDocument(gap.id)}
                        className="px-3.5 py-1.5 bg-[#2D5A27] text-white rounded hover:bg-[#2D5A27]/90 font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]" aria-hidden="true">mail</span>
                        Request Document
                      </button>
                    </>
                  )}
                </div>
              </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
