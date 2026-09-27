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

export const initialMatters: Matter[] = [
  {
    id: '1',
    code: 'LE-2024-001',
    title: 'Sharma Industries v. Global Tech Solutions — IP Infringement',
    client: 'Sharma Industries Pvt Ltd',
    caseDescription: 'Dispute involving alleged infringement of proprietary industrial design patents held by Sharma Industries Pvt Ltd. The Defendant, Global Tech Solutions, is accused of manufacturing and distributing products that replicate patented schematics without licensing under Patents Act, 1970.',
    jurisdiction: 'Delhi High Court, New Delhi',
    nextHearing: 'Oct 15, 2024',
    status: 'Active',
    isPinned: true,
    isArchived: false,
    isCollaborative: true,
    internalNotes: 'Client has expressed urgency regarding interim injunction. Senior Partner to review draft Written Statement before filing.',
    missingInfoNote: 'Awaiting certified copies of patent registration certificates (Patent Nos. 2019/DEL/001234 and 2020/DEL/005678). Also pending: Defendant audited financial statements for FY 2022-23.',
    keyIssues: [
      { id: '1', title: 'Validity of Patent Registration under Section 3(d)', status: 'check', docRef: 'Doc 1, p.3' },
      { id: '2', title: 'Prior art defence — public domain disclosure before priority date', status: 'warning', docRef: 'Doc 2, p.7' },
      { id: '3', title: 'Calculation of damages under Section 108 of Patents Act', status: 'pending', docRef: 'Doc 3, p.15' },
    ],
    timeline: [
      { id: '1', date: 'Jan 15, 2024', title: 'Suit Filed — CS(COMM) 412/2024', description: 'Original suit filed before Delhi High Court (Commercial Division) seeking permanent injunction and damages.', statusColor: '#2D5A27' },
      { id: '2', date: 'Feb 22, 2024', title: 'Summons Issued to Defendant', description: 'Court issued summons to Global Tech Solutions through registered post and email service.', statusColor: '#115fd4' },
      { id: '3', date: 'Apr 10, 2024', title: 'Written Statement Filed by Defendant', description: 'Defendant filed Written Statement denying all allegations and raising prior art defence under Section 64.', statusColor: '#B45309' },
      { id: '4', date: 'Jun 5, 2024', title: 'Application for Interim Injunction (Order 39 Rules 1 & 2)', description: 'Plaintiff filed application seeking ad-interim injunction restraining Defendant from manufacturing impugned products.', statusColor: '#0A192F' },
      { id: '5', date: 'Oct 15, 2024', title: 'Next Hearing — Arguments on Injunction Application', description: 'Listed for arguments on the interim injunction application. Both parties to file written submissions 3 days prior.', statusColor: '#DC2626' },
    ],
    documentsCount: 4,
    indexedCount: 4,
    documents: [],
    summaryText: [
      'Comprehensive intellectual property litigation ongoing before Delhi High Court Commercial Division.',
      'Primary relief sought is permanent injunction under Section 108 of the Patents Act, 1970.',
      'Interim injunction application under Order 39 Rules 1 & 2 is scheduled for hearing on Oct 15, 2024.'
    ],
    members: [],
    opposingCounsels: []
  },
  {
    id: '2',
    code: 'LE-2024-002',
    title: 'Adani Logistics v. Union of India — Arbitration & Section 34 Challenge',
    client: 'Adani Logistics Ltd',
    caseDescription: 'Arbitration dispute arising out of concession agreement for dry port terminal operations. Challenge to Arbitral Award filed under Section 34 of the Arbitration and Conciliation Act, 1996.',
    jurisdiction: 'Bombay High Court, Mumbai',
    nextHearing: 'Nov 02, 2024',
    status: 'In Review',
    isPinned: false,
    isArchived: false,
    isCollaborative: false,
    internalNotes: 'Prepare compilation of precedents on patent illegality and scope of intervention under Section 34(2A).',
    missingInfoNote: 'Need signed copy of the arbitral tribunal dissenting opinion.',
    keyIssues: [
      { id: '1', title: 'Grounds of patent illegality under Section 34(2A)', status: 'check', docRef: 'Doc 1, p.10' },
      { id: '2', title: 'Limitation period compliance under Section 34(3)', status: 'check', docRef: 'Doc 1, p.2' },
    ],
    timeline: [
      { id: '1', date: 'Aug 14, 2023', title: 'Arbitral Award Rendered', description: 'Sole arbitrator passed majority award directing payment of escalated operational costs.', statusColor: '#2D5A27' },
      { id: '2', date: 'Nov 10, 2023', title: 'Section 34 Petition Filed', description: 'Commercial Arbitration Petition filed before the Bombay High Court.', statusColor: '#115fd4' },
      { id: '3', date: 'Nov 02, 2024', title: 'Next Hearing — Final Disposal', description: 'Scheduled for final disposal before the Commercial Division bench.', statusColor: '#DC2626' }
    ],
    documentsCount: 6,
    indexedCount: 6,
    documents: [],
    summaryText: ['Commercial arbitration challenge under Section 34 of Arbitration Act 1996.'],
    members: [],
    opposingCounsels: []
  }
];
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
