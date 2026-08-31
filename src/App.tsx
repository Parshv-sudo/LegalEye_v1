import { useState } from 'react';
import { ViewRoute, Matter, Workspace, CitationDetail } from './types';
import { initialMatters, initialWorkspaces, sampleCitations } from './data/mockData';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { MattersList } from './components/MattersList';
import { MatterDashboard } from './components/MatterDashboard';
import { DocumentPipeline } from './components/DocumentPipeline';
import { ContradictionsGaps } from './components/ContradictionsGaps';
import { DocumentsList } from './components/DocumentsList';
import { SettingsView } from './components/SettingsView';
import { CreateMatterModal } from './components/CreateMatterModal';
import { CitationDetailModal } from './components/CitationDetailModal';
import { DraftGeneratorModal } from './components/DraftGeneratorModal';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<ViewRoute>('matters');
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(initialWorkspaces[0]);
  const [matters, setMatters] = useState<Matter[]>(initialMatters);
  const [selectedMatter, setSelectedMatter] = useState<Matter>(initialMatters[0]);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationDetail | null>(null);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  // Citation opening handler
  const handleOpenCitation = (key: string) => {
    // Check if key is in sample citations or construct a fallback citation detail
    if (sampleCitations[key]) {
      setActiveCitation(sampleCitations[key]);
    } else {
      // Parse key like "Doc 4, p.12"
      const match = key.match(/Doc\s+(\d+),\s*p\.(\d+)/);
      const docNum = match ? parseInt(match[1], 10) : 4;
      const pageNum = match ? parseInt(match[2], 10) : 12;

      setActiveCitation({
        docNum,
        totalDocs: 42,
        docTitle: `Document_Pleading_Batch_Doc_${docNum}.pdf`,
        sourceCategory: 'Verified Evidentiary Filing',
        pageNumber: pageNum,
        totalPages: 120,
        matchPercentage: 96,
        isPrimarySource: true,
        citedSnippet: `Clause ${docNum}.${pageNum}: All terms, representations, warranties, and disclosures remain strictly binding upon all signatories under applicable procedural mandates.`
      });
    }
  };

  const handleCreateMatter = (newMatterData: Partial<Matter>) => {
    const newCode = `G&S-2023-${Math.floor(10 + Math.random() * 90)}`;
    const fullMatter: Matter = {
      id: `m-${Date.now()}`,
      code: newCode,
      title: newMatterData.title || 'New Matter',
      client: newMatterData.client || 'Client Representation',
      caseDescription: 'Newly initialized litigation matter corpus with scheduled hearing.',
      jurisdiction: newMatterData.jurisdiction || 'Delhi High Court',
      nextHearing: newMatterData.nextHearing || 'Nov 20, 2023',
      status: 'Active',
      documentsCount: 2,
      indexedCount: 2,
      keyIssues: [
        { id: `ki-${Date.now()}-1`, title: 'Preliminary Review & Submissions', status: 'check' },
        { id: `ki-${Date.now()}-2`, title: 'Evidentiary Cross-Verification', status: 'pending' }
      ],
      missingInfoNote: 'Initial indexing complete. Verify subsequent rejoinder submissions.',
      summaryText: [
        {
          paragraph: `Proceedings initiated before the ${newMatterData.jurisdiction || 'High Court'}. Initial pleadings submitted for docketing.`,
          citations: [{ label: '[Doc 1, p.1]', docNum: 1, page: 1, docName: 'Initial Filing' }]
        }
      ],
      timeline: [
        {
          id: `t-${Date.now()}`,
          date: 'OCT 24, 2023',
          title: 'Matter Ingested',
          description: 'Created case folder and indexed initial filings.'
        }
      ],
      opposingCounsels: newMatterData.opposingCounsels || [],
      internalNotes: newMatterData.internalNotes || 'Matter opened for review.'
    };

    setMatters([fullMatter, ...matters]);
    setSelectedMatter(fullMatter);
    setCurrentRoute('matter-detail');
  };

  const handleCreateIssueFromContradiction = (title: string) => {
    if (!selectedMatter) return;
    const updatedIssues = [
      ...selectedMatter.keyIssues,
      { id: `ki-${Date.now()}`, title: `[Discrepancy] ${title}`, status: 'warning' as const }
    ];
    const updatedMatter = { ...selectedMatter, keyIssues: updatedIssues };
    setSelectedMatter(updatedMatter);
    setMatters(matters.map((m) => (m.id === selectedMatter.id ? updatedMatter : m)));
  };

  // If on login route
  if (currentRoute === 'login') {
    return (
      <LoginScreen
        onLogin={(ws) => {
          setActiveWorkspace(ws);
          setCurrentRoute('matters');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F0F2F5] overflow-hidden text-[#1A1A1A] font-sans">
      {/* Left Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        activeWorkspace={activeWorkspace}
        onSwitchWorkspace={() => setCurrentRoute('login')}
      />

      {/* Main Workspace View Routing */}
      {currentRoute === 'matters' && (
        <MattersList
          matters={matters}
          onSelectMatter={(matter) => {
            setSelectedMatter(matter);
            setCurrentRoute('matter-detail');
          }}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenPipeline={() => setCurrentRoute('pipeline')}
          onOpenContradictions={() => setCurrentRoute('contradictions')}
        />
      )}

      {currentRoute === 'matter-detail' && (
        <MatterDashboard
          matter={selectedMatter}
          onBack={() => setCurrentRoute('matters')}
          onOpenCitation={handleOpenCitation}
          onOpenPipeline={() => setCurrentRoute('pipeline')}
          onOpenContradictions={() => setCurrentRoute('contradictions')}
          onOpenDraftGenerator={() => setIsDraftModalOpen(true)}
        />
      )}

      {currentRoute === 'pipeline' && (
        <DocumentPipeline
          onBack={() => setCurrentRoute('matters')}
          onOpenMatter={() => setCurrentRoute('matter-detail')}
        />
      )}

      {currentRoute === 'contradictions' && (
        <ContradictionsGaps
          onBack={() => setCurrentRoute('matter-detail')}
          onOpenCitation={handleOpenCitation}
          onCreateIssueFromFinding={handleCreateIssueFromContradiction}
        />
      )}

      {currentRoute === 'documents' && (
        <DocumentsList
          onBack={() => setCurrentRoute('matters')}
          onOpenCitation={handleOpenCitation}
        />
      )}

      {currentRoute === 'settings' && (
        <SettingsView
          activeWorkspace={activeWorkspace}
          onBack={() => setCurrentRoute('matters')}
        />
      )}

      {/* Global Modals */}
      <CreateMatterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateMatter={handleCreateMatter}
      />

      <CitationDetailModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      <DraftGeneratorModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        matter={selectedMatter}
      />
    </div>
  );
}

export default App;
