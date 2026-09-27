import { useState, useEffect } from 'react';
import { ViewRoute, Matter, Workspace, CitationDetail } from './types';

import { initialWorkspaces, sampleCitations } from './data/mockData';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { MattersList } from './components/MattersList';
import { MatterDashboard } from './components/MatterDashboard';
import { DocumentsList } from './components/DocumentsList';
import { SettingsView } from './components/SettingsView';
import { CreateMatterModal } from './components/CreateMatterModal';
import { CitationDetailModal } from './components/CitationDetailModal';
import { DraftGeneratorModal } from './components/DraftGeneratorModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { LibraryView } from './components/LibraryView';
import { UserProfileView } from './components/UserProfileView';

function AppContent() {
  const { currentUser, logout } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<ViewRoute>('matters');
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(initialWorkspaces[0]);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(true);
    } else {
      setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
    }
  };
  
  const { matters, isLoading, error, updateMatter, createMatter, deleteMatter, refreshMatters } = useData();

  useEffect(() => {
    if (currentUser) {
      refreshMatters();
    }
  }, [currentUser]);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationDetail | null>(null);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  // Citation opening handler
  const handleOpenCitation = (key: string) => {
    if (sampleCitations[key]) {
      setActiveCitation(sampleCitations[key]);
    } else {
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

  const handleCreateMatter = async (newMatterData: Partial<Matter>) => {
    const newCode = `G&S-2023-${Math.floor(10 + Math.random() * 90)}`;
    const fullMatter = {
      code: newCode,
      title: newMatterData.title || 'New Matter',
      client: newMatterData.client || 'Client Representation',
      case_description: 'Newly initialized litigation matter corpus with scheduled hearing.',
      jurisdiction: newMatterData.jurisdiction || 'Delhi High Court',
      next_hearing: newMatterData.nextHearing || 'Nov 20, 2023',
      status: 'Active',
      internal_notes: '',
      missing_info_note: 'Initial indexing complete. Verify subsequent rejoinder submissions.',
    };

    const savedMatter = await createMatter(fullMatter as any);
    if (savedMatter) {
      setSelectedMatter(savedMatter);
      setIsCreateModalOpen(false);
      setCurrentRoute('matter-detail');
    }
  };

  const handleUpdateMatter = async (updatedMatter: Matter) => {
    setSelectedMatter(updatedMatter);
    await updateMatter(updatedMatter);
  };

  const handleCreateIssueFromContradiction = (title: string) => {
    if (!selectedMatter) return;
    const updatedIssues = [
      ...selectedMatter.keyIssues,
      { id: `ki-${Date.now()}`, title: `[Discrepancy] ${title}`, status: 'warning' as const }
    ];
    handleUpdateMatter({ ...selectedMatter, keyIssues: updatedIssues });
  };

  if (!currentUser || currentRoute === 'login') {
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
      {/* Left Sidebar (Slidable Desktop + Mobile Drawer) */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        activeWorkspace={activeWorkspace}
        onSwitchWorkspace={logout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isDesktopOpen={isDesktopSidebarOpen}
        onToggleDesktop={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        matters={matters}
      />

      {/* Main Workspace View Routing */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10 transition-all duration-300">
        {currentRoute === 'matters' && (
          <MattersList
            matters={matters.filter(m => !m.isArchived && !m.isCollaborative)}
            isLoading={isLoading}
            onSelectMatter={(matter) => {
              setSelectedMatter(matter);
              setCurrentRoute('matter-detail');
            }}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenMobileSidebar={handleToggleSidebar}
            onTogglePin={(matter) => updateMatter({ ...matter, isPinned: !matter.isPinned })}
          />
        )}

        {currentRoute === 'matter-detail' && (
          <MatterDashboard
            matter={selectedMatter!}
            onBack={() => setCurrentRoute('matters')}
            onOpenCitation={handleOpenCitation}
            onOpenDraftGenerator={() => setIsDraftModalOpen(true)}
            onOpenDocuments={() => setCurrentRoute('documents')}
            onOpenMobileSidebar={handleToggleSidebar}
            onUpdateMatter={updateMatter}
            onDeleteMatter={deleteMatter}
          />
        )}

        {currentRoute === 'documents' && (
          <DocumentsList
            onBack={() => setCurrentRoute('matter-detail')}
            onOpenCitation={handleOpenCitation}
            matter={selectedMatter!}
            onOpenMobileSidebar={handleToggleSidebar}
          />
        )}

        {currentRoute === 'settings' && (
          <SettingsView
            activeWorkspace={activeWorkspace}
            onBack={() => setCurrentRoute('matters')}
            onOpenMobileSidebar={handleToggleSidebar}
          />
        )}

        {currentRoute === 'projects' && (
          <MattersList
            matters={matters.filter(m => m.isCollaborative && !m.isArchived)}
            isLoading={isLoading}
            onSelectMatter={(matter) => {
              setSelectedMatter(matter);
              setCurrentRoute('matter-detail');
            }}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenMobileSidebar={handleToggleSidebar}
            onTogglePin={(matter) => updateMatter({ ...matter, isPinned: !matter.isPinned })}
          />
        )}

        {currentRoute === 'library' && (
          <LibraryView onOpenMobileSidebar={handleToggleSidebar} />
        )}

        {currentRoute === 'profile' && (
          <UserProfileView onOpenMobileSidebar={handleToggleSidebar} />
        )}
      </div>

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

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;

