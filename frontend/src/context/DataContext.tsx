import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Matter } from '../types';
import { matterApi } from '../services/api';

interface DataContextType {
  matters: Matter[];
  isLoading: boolean;
  error: string | null;
  refreshMatters: () => Promise<void>;
  updateMatter: (updated: Matter) => Promise<void>;
  createMatter: (matterData: Partial<Matter>) => Promise<Matter | null>;
  deleteMatter: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Transform API response (which could be snake_case or camelCase) into
 * the frontend Matter shape. Handles both directions gracefully.
 */
function transformMatterFromApi(raw: any): Matter {
  return {
    id: String(raw.id),
    code: raw.code || '',
    title: raw.title || '',
    client: raw.client || '',
    caseDescription: raw.caseDescription ?? raw.case_description ?? '',
    jurisdiction: raw.jurisdiction || '',
    nextHearing: raw.nextHearing ?? raw.next_hearing ?? '',
    status: raw.status || 'Active',
    isPinned: raw.isPinned ?? raw.is_pinned ?? false,
    isArchived: raw.isArchived ?? raw.is_archived ?? false,
    isCollaborative: raw.isCollaborative ?? raw.is_collaborative ?? false,
    internalNotes: raw.internalNotes ?? raw.internal_notes ?? '',
    missingInfoNote: raw.missingInfoNote ?? raw.missing_info_note ?? '',
    
    // Nested arrays
    keyIssues: (raw.keyIssues ?? raw.key_issues ?? []).map((ki: any) => ({
      id: String(ki.id),
      title: ki.title || '',
      status: ki.status || 'pending',
      docRef: ki.docRef ?? ki.doc_ref ?? '',
    })),
    timeline: (raw.timeline ?? raw.timeline_events ?? []).map((te: any) => ({
      id: String(te.id),
      date: te.date || '',
      title: te.title || '',
      description: te.description || '',
      statusColor: te.statusColor ?? te.status_color ?? '#0A192F',
    })),
    
    // Counts
    documentsCount: raw.documentsCount ?? raw.documents_count ?? (raw.documents?.length ?? 0),
    indexedCount: raw.indexedCount ?? raw.indexed_count ?? 0,
    
    // Arrays that may not exist yet
    documents: raw.documents ?? [],
    summaryText: raw.summaryText ?? raw.summary_text ?? [],
    members: raw.members ?? [],
    opposingCounsels: raw.opposingCounsels ?? raw.opposing_counsels ?? [],
  };
}

/**
 * Transform frontend Matter → API payload for create/update.
 * The backend serializer now accepts both camelCase and snake_case,
 * so we can send camelCase directly.
 */
function transformMatterToApi(matter: Partial<Matter>): any {
  const payload: any = {};
  
  if (matter.code !== undefined) payload.code = matter.code;
  if (matter.title !== undefined) payload.title = matter.title;
  if (matter.client !== undefined) payload.client = matter.client;
  if (matter.caseDescription !== undefined) payload.case_description = matter.caseDescription;
  if (matter.jurisdiction !== undefined) payload.jurisdiction = matter.jurisdiction;
  if ((matter as any).nextHearing !== undefined) payload.next_hearing = (matter as any).nextHearing;
  if ((matter as any).next_hearing !== undefined) payload.next_hearing = (matter as any).next_hearing;
  if (matter.status !== undefined) payload.status = matter.status;
  if (matter.isPinned !== undefined) payload.is_pinned = matter.isPinned;
  if (matter.isArchived !== undefined) payload.is_archived = matter.isArchived;
  if (matter.isCollaborative !== undefined) payload.is_collaborative = matter.isCollaborative;
  if (matter.internalNotes !== undefined) payload.internal_notes = matter.internalNotes;
  if (matter.missingInfoNote !== undefined) payload.missing_info_note = matter.missingInfoNote;
  
  // Organization FK
  if ((matter as any).organization !== undefined) payload.organization = (matter as any).organization;
  
  return payload;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatters = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await matterApi.getAll();
      const transformed = (response.data as any[]).map(transformMatterFromApi);
      setMatters(transformed);
    } catch (err: any) {
      console.error('Failed to fetch matters', err);
      if (err.response?.status !== 401) {
        setError('Could not connect to the backend server. Make sure Django is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatters();
  }, []);


  const updateMatter = async (updated: Matter) => {
    try {
      const apiPayload = transformMatterToApi(updated);
      await matterApi.update(Number(updated.id), apiPayload);
      setMatters(prev => prev.map(m => m.id === updated.id ? updated : m));
    } catch (err) {
      console.error('Failed to update matter', err);
    }
  };

  const createMatter = async (matterData: Partial<Matter>) => {
    try {
      // Ensure organization is set
      const apiPayload = transformMatterToApi(matterData);
      if (!apiPayload.organization) apiPayload.organization = 1;
      
      const response = await matterApi.create(apiPayload);
      const newMatter = transformMatterFromApi(response.data);
      setMatters(prev => [newMatter, ...prev]);
      return newMatter;
    } catch (err) {
      console.error('Failed to create matter', err);
      return null;
    }
  };

  const deleteMatter = async (id: string) => {
    try {
      await matterApi.delete(Number(id));
      setMatters(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete matter', err);
    }
  };

  return (
    <DataContext.Provider value={{
      matters,
      isLoading,
      error,
      refreshMatters: fetchMatters,
      updateMatter,
      createMatter,
      deleteMatter
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
