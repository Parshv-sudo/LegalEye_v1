import { useState, useMemo } from 'react';
import { Matter, MatterStatus } from '../types';

interface MattersListProps {
  matters: Matter[];
  onSelectMatter: (matter: Matter) => void;
  onOpenCreateModal: () => void;
  onOpenPipeline: () => void;
  onOpenContradictions: () => void;
}

export function MattersList({
  matters,
  onSelectMatter,
  onOpenCreateModal,
  onOpenPipeline,
  onOpenContradictions,
}: MattersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');

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
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
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

        {/* Global Search & Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search matters, clients, or IDs (Press /)..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-1 focus:ring-[#0A192F] focus:border-[#0A192F] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-[#2D5A27] hover:bg-[#2D5A27]/90 text-white rounded text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Create Matter</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6 space-y-4 max-w-7xl w-full mx-auto">
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

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenPipeline}
              className="text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">schema</span>
              Queue Pipeline (12 docs)
            </button>
            <button
              onClick={onOpenContradictions}
              className="text-xs text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">rule</span>
              2 Gaps Flagged
            </button>
          </div>
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
                  <th className="py-3.5 px-4">Next Hearing</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {filteredMatters.map((matter) => (
                  <tr
                    key={matter.id}
                    onClick={() => onSelectMatter(matter)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-[#0A192F]/5 group-hover:bg-[#115fd4]/10 text-[#0A192F] group-hover:text-[#115fd4] flex items-center justify-center shrink-0 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">folder</span>
                        </div>
                        <div>
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
                        <span className="material-symbols-outlined text-gray-400 text-[16px]">
                          account_balance
                        </span>
                        <span>{matter.jurisdiction}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-gray-700">
                      {matter.nextHearing}
                    </td>

                    <td className="py-4 px-4">
                      {getStatusBadge(matter.status)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectMatter(matter)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-[#0A192F] hover:text-white rounded text-[11px] font-semibold text-gray-700 transition-colors"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => onOpenContradictions()}
                          className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                          title="View Contradictions"
                        >
                          <span className="material-symbols-outlined text-[18px]">rule</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-[#F8F9FA] border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredMatters.length} of {matters.length} total matters</span>
            <div className="flex items-center gap-2">
              <button disabled className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-400 cursor-not-allowed">Previous</button>
              <span className="font-semibold text-gray-800">Page 1 of 1</span>
              <button disabled className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-400 cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
