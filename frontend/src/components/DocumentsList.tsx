import { useState, useEffect } from 'react';
import { documentApi } from '../services/api';
import { Matter } from '../types';

interface DocumentsListProps {
  onBack: () => void;
  onOpenCitation: (key: string) => void;
  matter?: Matter;
  onOpenMobileSidebar?: () => void;
}

export function DocumentsList({ onBack, onOpenCitation, matter, onOpenMobileSidebar }: DocumentsListProps) {
  const [searchDoc, setSearchDoc] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (matter?.id) {
      documentApi.getAll(parseInt(matter.id))
        .then((res) => {
          setDocuments(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch documents:", err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [matter?.id]);

  const filtered = documents.filter((d) =>
    (d.file_name || d.name || '').toLowerCase().includes(searchDoc.toLowerCase()) ||
    (d.type || '').toLowerCase().includes(searchDoc.toLowerCase())
  );

  const matterCode = matter?.code || 'G&S-2023-14';

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F0F2F5] overflow-y-auto">

      {/* List */}
      <main className="p-6 max-w-[1600px] w-full mx-auto space-y-4 flex-1">
        
        {/* Top Actions: Title + Search */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-[#0A192F] font-heading uppercase tracking-wider">
              Matter Corpus & Document Index
            </h2>
            <span className="bg-emerald-50 text-[#2D5A27] border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {matter?.indexedCount || documents.length} Indexed
            </span>
          </div>
          
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2 text-gray-400 text-[18px]" aria-hidden="true">
              search
            </span>
            <input
              type="text"
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
              placeholder="Search indexed corpus..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:border-[#0A192F] focus:outline-none shadow-xs"
            />
          </div>
        </div>

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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Loading documents...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No documents found.</td>
                </tr>
              ) : (
                filtered.map((doc, index) => (
                  <tr key={doc.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#115fd4]">
                      Doc {index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-600 text-[18px]" aria-hidden="true">
                          picture_as_pdf
                        </span>
                        <span className="font-semibold text-gray-900">{doc.file_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">Matter Corpus</td>
                    <td className="py-3.5 px-4 text-gray-600">{doc.pages} pp ({doc.file_size})</td>
                    <td className="py-3.5 px-4 text-gray-600">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenCitation(`Doc ${index + 1}, p.1`)}
                        className="px-3 py-1 bg-[#0A192F] text-white hover:bg-[#115fd4] rounded text-xs font-semibold transition-colors cursor-pointer"
                      >
                        View Source
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
