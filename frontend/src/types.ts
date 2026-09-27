export type MatterStatus = 'Active' | 'Pending' | 'Under Review' | 'Closed';

export type Role = 'ADMIN' | 'PARTNER' | 'ASSOCIATE' | 'GUEST';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface MatterMember {
  user: User;
  role: Role;
  invitedAt: string;
}

export interface OpposingCounsel {
  id: string;
  name: string;
  firm: string;
  email?: string;
}

export interface KeyIssue {
  id: string;
  title: string;
  status: 'check' | 'warning' | 'pending';
  docRef?: string;
}

export interface ProceduralEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  statusColor?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  pages: number;
  uploadDate: string;
  status: 'Indexed' | 'Processing' | 'Failed' | 'Queued';
  docNumber: number;
}

export interface Matter {
  id: string;
  code: string; // e.g. "G&S-2023-14"
  title: string;
  client: string;
  caseDescription: string;
  jurisdiction: string;
  nextHearing: string;
  createdAt?: string;
  updatedAt?: string;
  status: MatterStatus;
  isPinned?: boolean;
  isArchived?: boolean;
  isCollaborative?: boolean;
  keyIssues: KeyIssue[];
  missingInfoNote: string;
  summaryText: Array<{
    paragraph: string;
    citations?: Array<{ label: string; docNum: number; page: number; docName: string; tooltip?: string; isWarning?: boolean }>;
  }>;
  timeline: ProceduralEvent[];
  documentsCount: number;
  indexedCount: number;
  documents?: any[];
  opposingCounsels: OpposingCounsel[];
  internalNotes: string;
  members: MatterMember[];
}

export interface ContradictionFinding {
  id: string;
  severity: 'High Severity' | 'Medium Severity' | 'Low Severity';
  title: string;
  statementA: {
    source: string;
    page: number;
    text: string;
    highlight: string;
  };
  statementB: {
    source: string;
    page: number;
    text: string;
    highlight: string;
  };
  status: 'unresolved' | 'dismissed' | 'issue_created' | 'flagged';
}

export interface MissingGapFinding {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'requested' | 'ignored';
}

export interface PipelineDoc {
  id: string;
  fileName: string;
  fileSize: string;
  pages: number;
  type: 'pdf' | 'docx' | 'txt';
  queued: 'completed' | 'active' | 'queued' | 'error';
  ocr: 'completed' | 'active' | 'queued' | 'error';
  classifying: 'completed' | 'active' | 'queued' | 'error';
  indexed: 'completed' | 'active' | 'queued' | 'error';
  progressLabel?: string;
  errorMessage?: string;
  errorSubtitle?: string;
}

export interface CitationDetail {
  docNum: number;
  totalDocs: number;
  docTitle: string;
  sourceCategory: string;
  pageNumber: number;
  totalPages: number;
  matchPercentage: number;
  isPrimarySource: boolean;
  citedSnippet: string;
  fullPageText?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: Array<{
    label: string;
    docNum: number;
    page: number;
    docName: string;
  }>;
  supportBadge?: 'Partially Supported' | 'High Confidence' | 'Conflict Detected' | 'Insufficient Evidence';
}

export interface Workspace {
  id: string;
  code: string;
  name: string;
  lastAccessed: string;
  color: string;
}

export type ViewRoute = 
  | 'login'
  | 'matters'
  | 'matter-detail'
  | 'pipeline'
  | 'contradictions'
  | 'documents'
  | 'settings'
  | 'profile'
  | 'projects'
  | 'library';
