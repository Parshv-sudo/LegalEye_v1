import { Matter, ContradictionFinding, MissingGapFinding, PipelineDoc, CitationDetail, ChatMessage, Workspace } from '../types';

export const initialWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    code: 'MW',
    name: 'My Workspace',
    lastAccessed: 'Just now',
    color: '#115fd4',
  }
];

export const initialMatters: Matter[] = [];
export const initialContradictions: ContradictionFinding[] = [];
export const initialMissingGaps: MissingGapFinding[] = [];
export const initialPipelineDocs: PipelineDoc[] = [];
export const sampleCitations: Record<string, CitationDetail> = {};
export const initialChatMessages: ChatMessage[] = [];

export const indianCourtsList = [
  'Supreme Court of India, New Delhi',
  'Delhi High Court, New Delhi',
  'Bombay High Court, Mumbai',
  'Madras High Court, Chennai',
  'Calcutta High Court, Kolkata',
  'Karnataka High Court, Bengaluru',
  'National Company Law Appellate Tribunal (NCLAT)',
  'National Company Law Tribunal (NCLT) Principal Bench',
  'Competition Commission of India (CCI), New Delhi',
  'Securities Appellate Tribunal (SAT), Mumbai',
  'National Green Tribunal (NGT) Principal Bench'
];
