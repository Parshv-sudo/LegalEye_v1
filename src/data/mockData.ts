import { Matter, ContradictionFinding, MissingGapFinding, PipelineDoc, CitationDetail, ChatMessage, Workspace } from '../types';

export const initialWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    code: 'S&A',
    name: 'Smith & Associates',
    lastAccessed: 'Last accessed 2h ago',
    color: '#115fd4',
  },
  {
    id: 'ws-2',
    code: 'LGP',
    name: 'Legal Global Partners',
    lastAccessed: 'Last accessed 2 days ago',
    color: '#101722',
  },
  {
    id: 'ws-3',
    code: 'V&M',
    name: 'Vakil & Mehta Chambers',
    lastAccessed: 'Last accessed 5 days ago',
    color: '#2D5A27',
  }
];

export const initialMatters: Matter[] = [
  {
    id: 'm-1',
    code: 'G&S-2023-14',
    title: 'Reliance Industries vs. Union of India',
    client: 'Reliance Industries Limited',
    caseDescription: 'Taxation dispute, assessment year 2021 & alleged breach of confidentiality stipulations under statutory inspection protocols.',
    jurisdiction: 'Delhi High Court',
    nextHearing: 'Oct 24, 2023',
    status: 'Active',
    documentsCount: 42,
    indexedCount: 42,
    keyIssues: [
      { id: 'ki-1', title: 'Breach of NDA Clause 4.2', status: 'check', docRef: '[Doc 4, p.12]' },
      { id: 'ki-2', title: 'Quantification of Damages', status: 'warning', docRef: '[Doc 7, p.4]' },
      { id: 'ki-3', title: 'Jurisdictional Challenge', status: 'pending', docRef: '[Doc 12, p.4]' }
    ],
    missingInfoNote: 'System flagged references to "Exhibit C" in the Statement of Claim, but no corresponding document has been indexed.',
    summaryText: [
      {
        paragraph: 'The claimant alleges a material breach of the Non-Disclosure Agreement dated Oct 12, 2021. The core contention rests on the unauthorized transmission of proprietary schematics to a third-party vendor.',
        citations: [
          { label: '[Doc 4, p.12]', docNum: 4, page: 12, docName: "Plaintiff's Initial Brief v2", tooltip: 'Clause 4.2 Non-Disclosure Covenant' }
        ]
      },
      {
        paragraph: 'Defense counters that the information was already in the public domain prior to the disclosure date, citing an earlier patent filing.',
        citations: [
          { label: '[Doc 7, p.4]', docNum: 7, page: 4, docName: "Patent Registry Filing Prior Art", isWarning: true, tooltip: 'Algorithmic Confidence: Partially Supported' }
        ]
      }
    ],
    timeline: [
      {
        id: 't-1',
        date: 'OCT 12, 2021',
        title: 'NDA Executed',
        description: 'Parties signed the initial confidentiality agreement.',
        statusColor: '#0A192F'
      },
      {
        id: 't-2',
        date: 'AUG 05, 2023',
        title: 'Statement of Claim Filed',
        description: 'Claimant initiated proceedings citing breach of contract.',
        statusColor: '#2D5A27'
      },
      {
        id: 't-3',
        date: 'OCT 18, 2023',
        title: 'Interim Injunction Hearing',
        description: 'Single bench heard preliminary arguments on stay application.',
        statusColor: '#B45309'
      }
    ],
    opposingCounsels: [
      {
        id: 'oc-1',
        name: 'K.K. Venugopal & Associates',
        firm: 'Independent',
        email: 'counsel@venugopal.in'
      }
    ],
    internalNotes: 'Senior Counsel advised focusing on the patent filing timestamp discrepancy during oral arguments.'
  },
  {
    id: 'm-2',
    code: 'G&S-2023-42',
    title: 'TechCorp Merger Approval',
    client: 'TechCorp International Ltd.',
    caseDescription: 'CCI Clearance filing under Section 6(2) of Competition Act.',
    jurisdiction: 'CCI N. Delhi',
    nextHearing: 'Nov 12, 2023',
    status: 'Pending',
    documentsCount: 28,
    indexedCount: 26,
    keyIssues: [
      { id: 'ki-21', title: 'Market Share Threshold in SaaS', status: 'check' },
      { id: 'ki-22', title: 'Exclusivity Clause Scrutiny', status: 'warning' }
    ],
    missingInfoNote: 'Audited balance sheet for FY 2022-23 pending submission.',
    summaryText: [
      {
        paragraph: 'Antitrust review focusing on horizontal overlap in enterprise collaboration toolkits across South Asia regions.',
        citations: [{ label: '[Doc 2, p.7]', docNum: 2, page: 7, docName: 'Form I Notification' }]
      }
    ],
    timeline: [
      {
        id: 't-21',
        date: 'SEP 01, 2023',
        title: 'Notice of Proposed Combination',
        description: 'Joint filing submitted to Competition Commission of India.'
      }
    ],
    opposingCounsels: [
      {
        id: 'oc-2',
        name: 'Shardul Amarchand Mangaldas & Co',
        firm: 'Corporate Regulatory Practice'
      }
    ],
    internalNotes: 'Awaiting market inquiries summary from Director General.'
  },
  {
    id: 'm-3',
    code: 'G&S-2023-88',
    title: 'Amazon vs Future Retail Arbitration',
    client: 'Amazon NV Investment Holdings',
    caseDescription: 'Emergency arbitrator award enforcement under SIAC Rules.',
    jurisdiction: 'Supreme Court of India',
    nextHearing: 'Dec 05, 2023',
    status: 'Active',
    documentsCount: 65,
    indexedCount: 65,
    keyIssues: [
      { id: 'ki-31', title: 'Enforceability of EA Orders under Sec 17(1)', status: 'check' },
      { id: 'ki-32', title: 'Scope of Alienation of Retail Assets', status: 'warning' }
    ],
    missingInfoNote: 'Minutes of board meeting dated Aug 29, 2020 referenced in rejoinder.',
    summaryText: [
      {
        paragraph: 'Petitioner seeks implementation of the interim order prohibiting transfer of retail assets without prior investor consent.',
        citations: [{ label: '[Doc 5, p.22]', docNum: 5, page: 22, docName: 'SIAC Interim Order' }]
      }
    ],
    timeline: [
      {
        id: 't-31',
        date: 'OCT 25, 2020',
        title: 'Emergency Arbitrator Ruling',
        description: 'SIAC granted interim injunction against asset transfer.'
      }
    ],
    opposingCounsels: [
      {
        id: 'oc-3',
        name: 'Harish Salve & Partners',
        firm: 'Senior Advocate'
      }
    ],
    internalNotes: 'Coordinate with Singapore arbitration team for updated deposition logs.'
  },
  {
    id: 'm-4',
    code: 'G&S-2023-09',
    title: 'Tata Sons vs. Cyrus Mistry Estate',
    client: 'Tata Consultancy Services',
    caseDescription: 'Corporate governance appeal regarding Article 75 articles of association powers.',
    jurisdiction: 'Supreme Court',
    nextHearing: 'Jan 15, 2024',
    status: 'Closed',
    documentsCount: 110,
    indexedCount: 110,
    keyIssues: [
      { id: 'ki-41', title: 'Oppression and Mismanagement Claims under Sec 241', status: 'check' }
    ],
    missingInfoNote: 'All exhibits matched and verified.',
    summaryText: [
      {
        paragraph: 'Review petition disposed of affirming appellate court findings on the validity of executive removal.',
        citations: [{ label: '[Doc 1, p.89]', docNum: 1, page: 89, docName: 'Supreme Court Judgment' }]
      }
    ],
    timeline: [
      {
        id: 't-41',
        date: 'MAR 26, 2021',
        title: 'Final Judgment Pronounced',
        description: 'Supreme Court set aside NCLAT order.'
      }
    ],
    opposingCounsels: [
      {
        id: 'oc-4',
        name: 'Aryama Sundaram Chambers',
        firm: 'Senior Counsel'
      }
    ],
    internalNotes: 'Matter closed following final taxation of costs.'
  }
];

export const initialContradictions: ContradictionFinding[] = [
  {
    id: 'c-1',
    severity: 'High Severity',
    title: 'Timeline Inconsistency regarding Asset Transfer',
    statementA: {
      source: "Exhibit C (Defendant's Initial Disclosure)",
      page: 14,
      text: '"...the entirety of the shares were successfully transferred to the holding entity on the morning of October 12th, 2022, prior to any knowledge of the impending audit."',
      highlight: 'on the morning of October 12th, 2022'
    },
    statementB: {
      source: 'Rejoinder Affidavit (Plaintiff)',
      page: 8,
      text: '"Bank records clearly indicate that the holding account remained inactive until late November 2022, proving the transfer was backdated."',
      highlight: 'late November 2022'
    },
    status: 'unresolved'
  },
  {
    id: 'c-2',
    severity: 'Medium Severity',
    title: 'Intellectual Property Assignment Date Conflict',
    statementA: {
      source: 'Schedule II - Proprietary Assignment Deed',
      page: 3,
      text: '"The underlying algorithmic patents were assigned irrevocably as of January 15, 2021 to the subsidiary entity."',
      highlight: 'January 15, 2021'
    },
    statementB: {
      source: 'Cross-Examination Transcript - Mr. R. Mehta',
      page: 29,
      text: '"We did not finalize any assignment documentation until after the funding round closed in May 2021."',
      highlight: 'after the funding round closed in May 2021'
    },
    status: 'unresolved'
  }
];

export const initialMissingGaps: MissingGapFinding[] = [
  {
    id: 'g-1',
    title: 'Missing Exhibit Reference',
    description: 'Paragraph 42 of the Plaintiff\'s main brief heavily relies on "Exhibit F (Email Correspondence)", but this document was not found in the ingested batch.',
    status: 'open'
  },
  {
    id: 'g-2',
    title: 'Unsigned Addendum to Service Agreement',
    description: 'Reference made to a 2022 Fee Addendum in paragraph 18, but only the 2019 master agreement has been indexed in the matter corpus.',
    status: 'open'
  }
];

export const initialPipelineDocs: PipelineDoc[] = [
  {
    id: 'p-1',
    fileName: 'Plaintiff_Initial_Brief_v2.pdf',
    fileSize: '2.4 MB',
    pages: 42,
    type: 'pdf',
    queued: 'completed',
    ocr: 'completed',
    classifying: 'completed',
    indexed: 'completed',
    progressLabel: 'Fully Indexed'
  },
  {
    id: 'p-2',
    fileName: 'Exhibit_A_Financial_Records.pdf',
    fileSize: '15.1 MB',
    pages: 304,
    type: 'pdf',
    queued: 'completed',
    ocr: 'completed',
    classifying: 'active',
    indexed: 'queued',
    progressLabel: 'Classifying... (60%)'
  },
  {
    id: 'p-3',
    fileName: 'Defendant_Response_Draft.pdf',
    fileSize: '8.3 MB',
    pages: 112,
    type: 'pdf',
    queued: 'completed',
    ocr: 'active',
    classifying: 'queued',
    indexed: 'queued',
    progressLabel: 'OCR Scanning... (25%)'
  },
  {
    id: 'p-4',
    fileName: 'Handwritten_Notes_Scan.pdf',
    fileSize: '1.2 MB',
    pages: 12,
    type: 'pdf',
    queued: 'completed',
    ocr: 'error',
    classifying: 'queued',
    indexed: 'queued',
    errorMessage: 'Parse Error: Illegible scan on p.4-7',
    errorSubtitle: 'The OCR engine failed to extract meaningful text from these pages, likely due to low resolution or heavy handwritten content.'
  },
  {
    id: 'p-5',
    fileName: 'Witness_Testimony_Transcripts.docx',
    fileSize: '0.8 MB',
    pages: 56,
    type: 'docx',
    queued: 'queued',
    ocr: 'queued',
    classifying: 'queued',
    indexed: 'queued',
    progressLabel: 'Pending in queue'
  },
  {
    id: 'p-6',
    fileName: 'Exhibit_C_Affidavits_Certified.pdf',
    fileSize: '6.4 MB',
    pages: 88,
    type: 'pdf',
    queued: 'completed',
    ocr: 'completed',
    classifying: 'completed',
    indexed: 'completed',
    progressLabel: 'Fully Indexed'
  }
];

export const sampleCitations: Record<string, CitationDetail> = {
  'Doc 4, p.12': {
    docNum: 4,
    totalDocs: 42,
    docTitle: "Plaintiff's Initial Brief v2.pdf",
    sourceCategory: 'Exhibit C: Affidavits',
    pageNumber: 12,
    totalPages: 42,
    matchPercentage: 100,
    isPrimarySource: true,
    citedSnippet: 'Clause 4.2: The receiving party shall maintain strict confidentiality over all engineering schematics, trade secrets, algorithms, and technical documentation transmitted under this Agreement.'
  },
  'Doc 7, p.4': {
    docNum: 7,
    totalDocs: 42,
    docTitle: 'Patent Registry Filing Prior Art.pdf',
    sourceCategory: 'Public Registry Records',
    pageNumber: 4,
    totalPages: 48,
    matchPercentage: 78,
    isPrimarySource: false,
    citedSnippet: 'Claim 3 discloses a distributed computational framework for multi-tenant database routing, published under Indian Patent Journal on September 14, 2021.'
  },
  'Doc 2, p.1': {
    docNum: 2,
    totalDocs: 42,
    docTitle: 'Signed Non-Disclosure Agreement (Executed).pdf',
    sourceCategory: 'Exhibit A: Contracts',
    pageNumber: 1,
    totalPages: 8,
    matchPercentage: 100,
    isPrimarySource: true,
    citedSnippet: 'Clause 1.2: "Confidential Information" is defined as any and all technical and non-technical information including patent, copyright, trade secret, and proprietary information, techniques, sketches, drawings, models, inventions, know-how, processes, apparatus, equipment, algorithms...'
  },
  'Doc 3, p.14': {
    docNum: 3,
    totalDocs: 42,
    docTitle: 'Memorandum of Law in Support of Summary Judgment.pdf',
    sourceCategory: 'Exhibit C: Affidavits',
    pageNumber: 14,
    totalPages: 302,
    matchPercentage: 100,
    isPrimarySource: true,
    citedSnippet: 'The plaintiff primarily relies on Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225 for the basic structure doctrine to argue against the recent statutory amendments and preserve constitutional remedies.'
  },
  'Doc 12, p.4': {
    docNum: 12,
    totalDocs: 42,
    docTitle: 'Jurisdictional Submissions & Citations.pdf',
    sourceCategory: 'Court Pleadings',
    pageNumber: 4,
    totalPages: 36,
    matchPercentage: 94,
    isPrimarySource: true,
    citedSnippet: 'Citing L. Chandra Kumar v. Union of India (1997) 3 SCC 261, the power of judicial review vested in the High Courts under Article 226 is an integral part of the basic structure of the Constitution.'
  },
  'Doc 1, p.2': {
    docNum: 1,
    totalDocs: 42,
    docTitle: 'Rejoinder Affidavit (Pending Verified Copy).pdf',
    sourceCategory: 'Pleadings & Affidavits',
    pageNumber: 2,
    totalPages: 16,
    matchPercentage: 62,
    isPrimarySource: false,
    citedSnippet: 'A document titled "Rejoinder Affidavit" is listed in the index schedule, but physical copy verification is pending completion.'
  }
};

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    text: 'What are the key precedents cited by the plaintiff?',
    timestamp: '10:42 AM'
  },
  {
    id: 'msg-2',
    sender: 'ai',
    text: 'The plaintiff primarily relies on Kesavananda Bharati v. State of Kerala for the basic structure doctrine to argue against the recent statutory amendments. [Doc 3, p.14]\n\nThey further cite L. Chandra Kumar v. Union of India to defend the jurisdiction of the High Courts under Article 226. [Doc 12, p.4]',
    timestamp: '10:43 AM',
    citations: [
      { label: '[Doc 3, p.14]', docNum: 3, page: 14, docName: 'Memorandum of Law in Support of Summary Judgment' },
      { label: '[Doc 12, p.4]', docNum: 12, page: 4, docName: 'Jurisdictional Submissions' }
    ]
  },
  {
    id: 'msg-3',
    sender: 'user',
    text: 'Did the opposing counsel file the rejoinder?',
    timestamp: '10:45 AM'
  },
  {
    id: 'msg-4',
    sender: 'ai',
    text: 'A document titled "Rejoinder Affidavit" is present in the index [Doc 1, p.2], but the actual file appears to be missing from the uploaded matter corpus. The opposing counsel was scheduled to file it by October 12th based on the last order sheet.',
    timestamp: '10:45 AM',
    supportBadge: 'Partially Supported',
    citations: [
      { label: '[Doc 1, p.2]', docNum: 1, page: 2, docName: 'Rejoinder Affidavit Index' }
    ]
  }
];

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
