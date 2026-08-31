import { useState } from 'react';
import { sampleCitations } from '../data/mockData';

interface DocumentsListProps {
  onBack: () => void;
  onOpenCitation: (key: string) => void;
}

export function DocumentsList({ onBack, onOpenCitation }: DocumentsListProps) {
  const [searchDoc, setSearchDoc] = useState('');

  const documents = [
    { num: 4, title: "Plaintiff's Initial Brief v2.pdf", cat: 'Pleadings & Affidavits', pages: 42, size: '2.4 MB', date: 'Aug 05, 2023', match: '100%' },
    { num: 7, title: 'Patent Registry Filing Prior Art.pdf', cat: 'Public Registry Records', pages: 48, size: '4.8 MB', date: 'Sep 14, 2021', match: '78%' },
    { num: 2, title: 'Signed Non-Disclosure Agreement (Executed).pdf', cat: 'Exhibit A: Contracts', pages: 8, size: '1.2 MB', date: 'Oct 12, 2021', match: '100%' },
    { num: 3, title: 'Memorandum of Law in Support of Summary Judgment.pdf', cat: 'Exhibit C: Affidavits', pages: 302, size: '18.4 MB', date: 'Oct 18, 2023', match: '100%' },
    { num: 12, title: 'Jurisdictional Submissions & Citations.pdf', cat: 'Court Pleadings', pages: 36, size: '2.1 MB', date: 'Oct 19, 2023', match: '94%' },
    { num: 1, title: 'Rejoinder Affidavit (Pending Verified Copy).pdf', cat: 'Pleadings & Affidavits', pages: 16, size: '1.1 MB', date: 'Oct 20, 2023', match: '62%' },
    { num: 8, title: 'Email Correspondence Trail with Technical Vendors.pdf', cat: 'Correspondence', pages: 24, size: '3.6 MB', date: 'Nov 02, 2022', match: '88%' }
  ];

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchDoc.toLowerCase()) ||
    d.cat.toLowerCase().includes(searchDoc.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F0F2F5] overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <button onClick={onBack} className="hover:text-[#0A192F] flex items-center gap-1 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Matters
              </button>
              <span>/</span>
              <span className="text-gray-700">G&amp;S-2023-14</span>
              <span>/</span>
              <span className="text-[#0A192F] font-bold">Indexed Documents</span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-xl md:text-2xl font-heading font-bold text-[#0A192F]">
                Matter Corpus &amp; Document Index
              </h1>
              <span className="bg-green-50 text-[#2D5A27] border border-green-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                42 Documents Indexed
              </span>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2 text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
              placeholder="Search indexed corpus..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* List */}
      <main className="p-6 max-w-7xl w-full mx-auto space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Doc #</th>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Pages</th>
                <th className="py-3 px-4">Indexed Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {filtered.map((doc) => (
                <tr key={doc.num} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#115fd4]">
                    Doc {doc.num}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-600 text-[18px]">
                        picture_as_pdf
                      </span>
                      <span className="font-semibold text-gray-900">{doc.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{doc.cat}</td>
                  <td className="py-3.5 px-4 text-gray-600">{doc.pages} pp ({doc.size})</td>
                  <td className="py-3.5 px-4 text-gray-600">{doc.date}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onOpenCitation(`Doc ${doc.num}, p.1`)}
                      className="px-3 py-1 bg-[#0A192F] text-white hover:bg-[#115fd4] rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Source
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
