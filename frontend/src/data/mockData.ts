import { Matter, ContradictionFinding, MissingGapFinding, PipelineDoc, CitationDetail, ChatMessage, Workspace } from '../types';

export const initialWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    code: 'MA',
    name: 'Mehta & Associates',
    lastAccessed: 'Just now',
    color: '#115fd4',
  }
];

// Cleared all dummy cases — ready for real matter and document uploads
export const initialMatters: Matter[] = [];

export const initialContradictions: ContradictionFinding[] = [
  {
    id: 'c-seed-1',
    severity: 'High Severity',
    title: 'Construction Progress Conflict',
    statementA: {
      source: 'Site_Inspection_Report_Plaintiff_Engineer.pdf',
      page: 1,
      text: 'Upon thorough physical inspection, the undersigned observes that the overall construction progress stands at approximately 45% completion as against the scheduled 90% that should have been achieved by this date.',
      highlight: '45% completion',
    },
    statementB: {
      source: 'Site_Inspection_Report_Defendant_Engineer.pdf',
      page: 1,
      text: 'Based on our comprehensive assessment conducted over three working days, the overall project completion stands at 78% which represents substantial progress considering the regulatory delays.',
      highlight: '78%',
    },
    status: 'unresolved',
  },
  {
    id: 'c-seed-2',
    severity: 'High Severity',
    title: 'Concrete Grade Non-Compliance',
    statementA: {
      source: 'Site_Inspection_Report_Plaintiff_Engineer.pdf',
      page: 2,
      text: 'Core samples extracted from Tower A, Floor 8, indicate concrete compressive strength of M-20 to M-22 grade, which is significantly below the M-30 minimum specified in Clause 7.3 of the JDA.',
      highlight: 'M-20 to M-22 grade',
    },
    statementB: {
      source: 'Site_Inspection_Report_Defendant_Engineer.pdf',
      page: 2,
      text: 'Cube test results from our NABL-accredited laboratory confirm compressive strength ranging from 28.5 MPa to 34.2 MPa, meeting the M-25/M-30 specifications.',
      highlight: '28.5 MPa to 34.2 MPa',
    },
    status: 'unresolved',
  },
  {
    id: 'c-seed-3',
    severity: 'High Severity',
    title: 'Payment Amount Discrepancy',
    statementA: {
      source: 'Payment_Schedule_Bank_Statements.pdf',
      page: 2,
      text: 'GRAND TOTAL PAID TO APEX CONSTRUCTIONS LTD.: Rs. 20,25,00,000/- (Rupees Twenty Crores Twenty-Five Lakhs Only). All amounts verified against HDFC Bank statements.',
      highlight: 'Rs. 20,25,00,000/-',
    },
    statementB: {
      source: 'Reply_Legal_Notice_Defendant.pdf',
      page: 1,
      text: 'Our client has received only Rs. 8,30,00,000/- (Rupees Eight Crores Thirty Lakhs Only) from Meridian Realty against the claimed Rs. 20,25,00,000/-. Your client\'s payment schedule is fabricated.',
      highlight: 'Rs. 8,30,00,000/-',
    },
    status: 'unresolved',
  },
  {
    id: 'c-seed-4',
    severity: 'Medium Severity',
    title: 'Fund Diversion Denial Contradicted by Board Minutes',
    statementA: {
      source: 'Board_Meeting_Minutes_Apex_Sep2023.pdf',
      page: 1,
      text: 'The CMD proposed diverting Rs. 3,50,00,000/- from the Sector 72 project escrow to meet urgent EMI obligations for the Sector 89 project. The Board approved the temporary diversion by a vote of 3:1.',
      highlight: 'diverting Rs. 3,50,00,000/-',
    },
    statementB: {
      source: 'Reply_Legal_Notice_Defendant.pdf',
      page: 2,
      text: 'The payment to PNB account was for material procurement from a vendor. The account belongs to M/s VM Enterprises, a legitimate material supplier, not a personal account.',
      highlight: 'legitimate material supplier',
    },
    status: 'unresolved',
  },
];

export const initialMissingGaps: MissingGapFinding[] = [
  {
    id: 'gap-1',
    title: 'Defendant\'s NABL Laboratory Reports Missing',
    description: 'The Defendant\'s engineer references NABL-accredited laboratory reports (Report Nos. CT/2024/0145 to CT/2024/0168) confirming concrete grade compliance. These reports have not been produced or filed despite requests. Their existence cannot be verified.',
    status: 'open',
  },
  {
    id: 'gap-2',
    title: 'Apex Constructions Audited Financial Statements (FY 2022-24)',
    description: 'Audited financial statements for FY 2022-23 and FY 2023-24 are required to trace the flow of Rs. 20.25 Crores received and establish the quantum of fund diversion. Repeated requests have gone unanswered.',
    status: 'open',
  },
  {
    id: 'gap-3',
    title: 'M/s VM Enterprises — Incorporation and GST Records',
    description: 'The Defendant claims PNB A/c No. 6145002100098765 belongs to M/s VM Enterprises, a material supplier. However, the Plaintiff has identified that this entity shares its registered address with the CMD\'s personal residence. Company registration and GST returns are needed to verify legitimacy.',
    status: 'requested',
  },
];

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
