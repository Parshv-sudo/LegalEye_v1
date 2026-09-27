import { useState, useMemo } from 'react';
import { Matter, MatterStatus } from '../types';
import { useAuth } from '../context/AuthContext';

interface MattersListProps {
  matters: Matter[];
  isLoading?: boolean;
  onSelectMatter: (matter: Matter) => void;
  onOpenCreateModal: () => void;
  onOpenMobileSidebar?: () => void;
  onTogglePin: (matter: Matter) => void;
}

export function MattersList({
  matters,
  isLoading = false,
  onSelectMatter,
  onOpenCreateModal,
  onOpenMobileSidebar,
  onTogglePin,
}: MattersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const { hasRole } = useAuth();
  
  // Create matter is restricted to Associates and above globally
  const canCreateMatter = hasRole('ASSOCIATE');

  const filteredMatters = useMemo(() => {
    return matters.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'All') return true;
      if (activeFilter === 'Active') return m.status === 'Active';
      if (activeFilter === 'Pending') return m.status === 'Pending';
      if (activeFilter === 'High Court') return m.jurisdiction.includes('High Court');
      if (activeFilter === 'Supreme Court') return m.jurisdiction.includes('Supreme Court');
      return true;
    });
  }, [matters, searchTerm, activeFilter]);

  const getStatusBadge = (status: MatterStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#2D5A27] border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]"></span>
            Active
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Pending
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F0F2F5] overflow-y-auto">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              className="md:hidden text-gray-600 hover:text-gray-900 p-1 -ml-1 rounded transition-colors"
              aria-label="Open navigation menu"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">menu</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-bold text-[#0A192F]">Active Matters</h1>
              <span className="bg-gray-100 text-gray-700 font-sans text-xs font-bold px-2 py-0.5 rounded-full">
                {matters.length} Total
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Cross-referenced litigation briefs, indexed schedules, and active tribunal proceedings.
            </p>
          </div>
        </div>

        {/* Global Search & Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]" aria-hidden="true">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search matters, clients, or IDs..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-1 focus:ring-[#0A192F] focus:border-[#0A192F] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 sm:p-6 space-y-4 max-w-7xl w-full mx-auto">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {['All', 'Active', 'Pending', 'High Court', 'Supreme Court'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[#0A192F] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filter} {filter === 'All' && `(${matters.length})`}
              {filter === 'Active' && `(${matters.filter((m) => m.status === 'Active').length})`}
              {filter === 'Pending' && `(${matters.filter((m) => m.status === 'Pending').length})`}
            </button>
          ))}
        </div>

        {/* Matters Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Matter Code &amp; Title</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Jurisdiction</th>
                  <th className="py-3.5 px-4">Date Created</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-skeleton-pulse">
                      <td className="py-4 px-4"><div className="h-10 bg-gray-200 rounded w-full"></div></td>
                      <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded w-3/4"></div></td>
                      <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded w-1/2"></div></td>
                      <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded w-1/2"></div></td>
                      <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded w-1/3"></div></td>
                      <td className="py-4 px-4 text-right"><div className="h-6 bg-gray-200 rounded w-8 ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredMatters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 max-w-md mx-auto animate-slide-up">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-3xl text-gray-400" aria-hidden="true">layers_clear</span>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">No matters found</h3>
                        <p className="text-sm text-gray-500 mb-6">
                          {searchTerm 
                            ? `No matters match the search term "${searchTerm}". Try a different query or clear the search.` 
                            : 'Your workspace is currently empty. Create a new matter to begin organizing documents, extracting insights, and collaborating with your team.'}
                        </p>
                        {canCreateMatter && !searchTerm && (
                          <button
                            onClick={onOpenCreateModal}
                            className="px-5 py-2.5 bg-[#111111] hover:bg-black text-white rounded font-medium shadow-sm transition-colors cursor-pointer"
                          >
                            Create Your First Matter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMatters.map((matter) => (
                    <tr
                      key={matter.id}
                      onClick={() => onSelectMatter(matter)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-[#0A192F]/5 group-hover:bg-[#115fd4]/10 text-[#0A192F] group-hover:text-[#115fd4] flex items-center justify-center shrink-0 transition-colors">
                          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">folder</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-[#115fd4]">
                              {matter.code}
                            </span>
                            {matter.code === 'G&S-2023-14' && (
                              <span className="bg-[#FEF08A] text-[#854D0E] text-[10px] font-bold px-1.5 py-0.2 rounded">
                                Benchmark Case
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm text-[#0A192F] group-hover:text-[#115fd4] transition-colors line-clamp-1">
                            {matter.title}
                          </p>
                          <p className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">
                            {matter.caseDescription}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-gray-800">
                      {matter.client}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <span className="material-symbols-outlined text-gray-400 text-[16px]" aria-hidden="true">
                          account_balance
                        </span>
                        <span>{matter.jurisdiction}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-gray-700">
                      {matter.createdAt ? new Date(matter.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="py-4 px-4">
                      {getStatusBadge(matter.status)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onTogglePin(matter)}
                          className={`p-1 rounded cursor-pointer transition-colors ${matter.isPinned ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-300 hover:text-amber-500 hover:bg-gray-100'}`}
                          title={matter.isPinned ? "Unpin Matter" : "Pin Matter"}
                          aria-label={matter.isPinned ? "Unpin Matter" : "Pin Matter"}
                        >
                          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                            {matter.isPinned ? 'keep' : 'keep'}
                          </span>
                        </button>
                        <button
                          onClick={() => onSelectMatter(matter)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-[#0A192F] hover:text-white rounded text-[11px] font-semibold text-gray-700 transition-colors cursor-pointer ml-1"
                        >
                          Open
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-[#F8F9FA] border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredMatters.length} of {matters.length} total matters</span>
          </div>
        </div>
      </main>
    </div>
  );
}
