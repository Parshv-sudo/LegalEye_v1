import React from 'react';
import { ViewRoute, Workspace } from '../types';

interface SidebarProps {
  currentRoute: ViewRoute;
  onNavigate: (route: ViewRoute) => void;
  activeWorkspace: Workspace;
  onSwitchWorkspace: () => void;
}

export function Sidebar({
  currentRoute,
  onNavigate,
  activeWorkspace,
  onSwitchWorkspace
}: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0A192F] text-white flex flex-col shrink-0 border-r border-[#1E293B] select-none h-screen sticky top-0">
      {/* Brand & Workspace Selector */}
      <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#115fd4] flex items-center justify-center font-bold text-white shadow-xs">
            <span className="material-symbols-outlined text-[18px]">gavel</span>
          </div>
          <div>
            <h1 className="font-heading font-bold text-base leading-tight tracking-wide text-white">
              Gavel &amp; Slate
            </h1>
            <p className="text-[11px] text-gray-400 font-sans">Legal Intelligence</p>
          </div>
        </div>
      </div>

      {/* Active Workspace Bar */}
      <div className="px-4 py-3 bg-[#101F38] border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded bg-[#2D5A27] text-[10px] font-bold flex items-center justify-center text-white shrink-0">
            {activeWorkspace.code}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-200 truncate">{activeWorkspace.name}</p>
            <p className="text-[10px] text-gray-400">{activeWorkspace.lastAccessed}</p>
          </div>
        </div>
        <button
          onClick={onSwitchWorkspace}
          className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          title="Switch Workspace"
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
        </button>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto font-sans text-xs">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Core Workflows
        </div>

        <button
          onClick={() => onNavigate('matters')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-medium ${
            currentRoute === 'matters' || currentRoute === 'matter-detail'
              ? 'bg-[#1E293B] text-white font-semibold'
              : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] text-[#115fd4]">folder_open</span>
          <span>Matters</span>
          <span className="ml-auto bg-[#1E293B] border border-gray-700 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            42
          </span>
        </button>

        <button
          onClick={() => onNavigate('pipeline')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-medium ${
            currentRoute === 'pipeline'
              ? 'bg-[#1E293B] text-white font-semibold'
              : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] text-amber-400">schema</span>
          <span>Processing Pipeline</span>
          <span className="ml-auto flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </button>

        <button
          onClick={() => onNavigate('contradictions')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-medium ${
            currentRoute === 'contradictions'
              ? 'bg-[#1E293B] text-white font-semibold'
              : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] text-red-400">rule</span>
          <span>Contradictions &amp; Gaps</span>
          <span className="ml-auto bg-red-900/60 text-red-300 border border-red-700/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
            2 Alerts
          </span>
        </button>

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Knowledge Base
        </div>

        <button
          onClick={() => onNavigate('documents')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-medium ${
            currentRoute === 'documents'
              ? 'bg-[#1E293B] text-white font-semibold'
              : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] text-emerald-400">description</span>
          <span>Indexed Documents</span>
          <span className="ml-auto text-gray-400 text-[11px]">302 pp</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-medium ${
            currentRoute === 'settings'
              ? 'bg-[#1E293B] text-white font-semibold'
              : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] text-gray-400">settings</span>
          <span>Workspace Settings</span>
        </button>
      </nav>

      {/* Senior Associate Profile Footer */}
      <div className="p-3 border-t border-[#1E293B] bg-[#101F38] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#115fd4] flex items-center justify-center font-bold text-white text-xs shrink-0">
          JD
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-white truncate">John Doe</p>
          <p className="text-[10px] text-gray-400 truncate">Senior Associate</p>
        </div>
        <button
          onClick={onSwitchWorkspace}
          className="ml-auto text-gray-400 hover:text-white p-1"
          title="Sign out / Switch"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
        </button>
      </div>
    </aside>
  );
}
