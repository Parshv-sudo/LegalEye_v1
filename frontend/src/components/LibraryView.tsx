import React, { useState, useEffect } from 'react';
import { documentApi } from '../services/api';

interface DocumentGlobal {
  id: number;
  file_name: string;
  file_size: string;
  pages: number;
  uploaded_at: string;
  matter: number;
  indexed: string;
}

interface LibraryViewProps {
  onOpenMobileSidebar: () => void;
}

export function LibraryView({ onOpenMobileSidebar }: LibraryViewProps) {
  const [documents, setDocuments] = useState<DocumentGlobal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await documentApi.getAllGlobal();
        setDocuments(response.data);
      } catch (err) {
        console.error("Failed to fetch library documents", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F4F4F4] min-h-full">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0 shadow-sm sticky top-0 z-20">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden w-10 h-10 rounded hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#0A192F]">Document Library</h2>
          <p className="text-xs text-gray-500">All uploaded documents across your collaborative space</p>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#115fd4]">library_books</span>
              Global Document Index
            </h3>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {documents.length} Total
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50/80 uppercase border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-semibold">Document Name</th>
                  <th className="px-6 py-3 font-semibold">Matter ID</th>
                  <th className="px-6 py-3 font-semibold">Size</th>
                  <th className="px-6 py-3 font-semibold">Pages</th>
                  <th className="px-6 py-3 font-semibold">Uploaded</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
                        <p>Loading library...</p>
                      </div>
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <p>No documents found in the library.</p>
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-[#115fd4] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-gray-400">description</span>
                        {doc.file_name}
                      </td>
                      <td className="px-6 py-3 text-gray-600">Matter #{doc.matter}</td>
                      <td className="px-6 py-3 text-gray-500 text-xs">{doc.file_size || 'N/A'}</td>
                      <td className="px-6 py-3 text-gray-500 text-xs">{doc.pages || 0}</td>
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          doc.indexed === 'completed'
                            ? 'bg-[#2D5A27]/10 text-[#2D5A27]'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.indexed || 'Processing'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
