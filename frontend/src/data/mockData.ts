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
  
  // High Courts
  'Allahabad High Court',
  'Andhra Pradesh High Court, Amaravati',
  'Bombay High Court, Mumbai',
  'Calcutta High Court, Kolkata',
  'Chhattisgarh High Court, Bilaspur',
  'Delhi High Court, New Delhi',
  'Gauhati High Court, Guwahati',
  'Gujarat High Court, Ahmedabad',
  'Himachal Pradesh High Court, Shimla',
  'Jammu & Kashmir and Ladakh High Court, Srinagar/Jammu',
  'Jharkhand High Court, Ranchi',
  'Karnataka High Court, Bengaluru',
  'Kerala High Court, Kochi',
  'Madhya Pradesh High Court, Jabalpur',
  'Madras High Court, Chennai',
  'Meghalaya High Court, Shillong',
  'Orissa High Court, Cuttack',
  'Patna High Court, Patna',
  'Punjab and Haryana High Court, Chandigarh',
  'Rajasthan High Court, Jodhpur',
  'Sikkim High Court, Gangtok',
  'Telangana High Court, Hyderabad',
  'Tripura High Court, Agartala',
  'Uttarakhand High Court, Nainital',
  
  // Major Tribunals & Commissions
  'National Company Law Appellate Tribunal (NCLAT)',
  'National Company Law Tribunal (NCLT) Principal Bench, New Delhi',
  'National Company Law Tribunal (NCLT), Mumbai',
  'National Company Law Tribunal (NCLT), Chennai',
  'Competition Commission of India (CCI), New Delhi',
  'Securities Appellate Tribunal (SAT), Mumbai',
  'National Green Tribunal (NGT) Principal Bench, New Delhi',
  'Central Administrative Tribunal (CAT) Principal Bench',
  'Armed Forces Tribunal (AFT) Principal Bench',
  'Income Tax Appellate Tribunal (ITAT), Delhi',
  'Income Tax Appellate Tribunal (ITAT), Mumbai',
  'Customs, Excise and Service Tax Appellate Tribunal (CESTAT)',
  'Debts Recovery Appellate Tribunal (DRAT), Delhi',
  
  // District Courts (Major Cities)
  'Tis Hazari Courts, Delhi',
  'Patiala House Courts, New Delhi',
  'Karkardooma Courts, East Delhi',
  'Rohini Courts, North West Delhi',
  'Dwarka Courts, South West Delhi',
  'Saket Courts, South Delhi',
  'Rouse Avenue Court Complex, New Delhi',
  'City Civil and Sessions Court, Mumbai',
  'Chief Metropolitan Magistrate (CMM) Court, Esplanade, Mumbai',
  'District and Sessions Court, Pune',
  'District and Sessions Court, Bengaluru',
  'City Civil Court, Bengaluru',
  'City Civil Court, Chennai',
  'City Civil Court, Hyderabad',
  'City Civil Court, Kolkata',
  'District and Sessions Court, Ahmedabad',
  'District and Sessions Court, Gurugram',
  'District and Sessions Court, Noida (Gautam Buddha Nagar)'
];
