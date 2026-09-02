import { ViewRoute, Workspace, Role } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentRoute: ViewRoute;
  onNavigate: (route: ViewRoute) => void;
  activeWorkspace: Workspace;
  onSwitchWorkspace: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  currentRoute,
  onNavigate,
  activeWorkspace,
  onSwitchWorkspace,
  isMobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const { globalRole, setGlobalRole } = useAuth();

  const handleNav = (route: ViewRoute) => {
    onNavigate(route);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0A192F] text-white">
      {/* Brand & Workspace Selector */}
      <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#115fd4] flex items-center justify-center font-bold text-white shadow-xs">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">visibility</span>
          </div>
          <div>
            <h1 className="font-heading font-bold text-base leading-tight tracking-wide text-white">
              Legal &amp; Lens
            </h1>
            <p className="text-[11px] text-gray-400 font-sans">Legal Intelligence</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden text-gray-400 hover:text-white p-1 rounded hover:bg-[#1E293B] transition-colors"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
          </button>
        )}
      </div>

      {/* Active Workspace Bar */}
      <div className="px-4 py-3 bg-[#101F38] border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div 
            className="w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: activeWorkspace.color || '#2D5A27' }}
          >
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
          aria-label="Switch Workspace"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">swap_horiz</span>
        </button>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto font-sans text-xs" aria-label="Sidebar Navigation">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Core Workflows
        </div>

        <button
          onClick={() => handleNav('matters')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-medium cursor-pointer ${currentRoute === 'matters' || currentRoute === 'matter-detail'
            ? 'bg-[#1E293B] text-white font-semibold'
            : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
            }`}
        >
          <span className="material-symbols-outlined text-[20px] text-[#115fd4]" aria-hidden="true">folder_open</span>
          <span>Matters</span>
        </button>

        <button
          onClick={() => handleNav('pipeline')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-medium cursor-pointer ${currentRoute === 'pipeline'
            ? 'bg-[#1E293B] text-white font-semibold'
            : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
            }`}
        >
          <span className="material-symbols-outlined text-[20px] text-amber-400" aria-hidden="true">schema</span>
          <span>Processing Pipeline</span>
          <span className="ml-auto flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </button>

        <button
          onClick={() => handleNav('contradictions')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-medium cursor-pointer ${currentRoute === 'contradictions'
            ? 'bg-[#1E293B] text-white font-semibold'
            : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
            }`}
        >
          <span className="material-symbols-outlined text-[20px] text-red-400" aria-hidden="true">rule</span>
          <span>Contradictions &amp; Gaps</span>
        </button>

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Knowledge Base
        </div>

        <button
          onClick={() => handleNav('documents')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-medium cursor-pointer ${currentRoute === 'documents'
            ? 'bg-[#1E293B] text-white font-semibold'
            : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
            }`}
        >
          <span className="material-symbols-outlined text-[20px] text-emerald-400" aria-hidden="true">description</span>
          <span>Indexed Documents</span>
        </button>

        <button
          onClick={() => handleNav('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-medium cursor-pointer ${currentRoute === 'settings'
            ? 'bg-[#1E293B] text-white font-semibold'
            : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
            }`}
        >
          <span className="material-symbols-outlined text-[20px] text-gray-400" aria-hidden="true">settings</span>
          <span>Platform Settings</span>
        </button>
      </nav>

      {/* Role Switcher (For Development/Testing) */}
      <div className="px-4 py-3 bg-[#101F38] border-t border-[#1E293B] text-xs">
        <label className="text-gray-400 font-bold mb-1 block uppercase text-[10px]">Test Role (Global)</label>
        <select 
          value={globalRole} 
          onChange={(e) => setGlobalRole(e.target.value as Role)}
          className="w-full bg-[#1E293B] text-white border border-gray-700 rounded p-1.5 focus:outline-none focus:border-[#115fd4]"
        >
          <option value="PARTNER">Partner (Full)</option>
          <option value="ASSOCIATE">Associate (Edit)</option>
          <option value="GUEST">Guest (View Only)</option>
        </select>
      </div>

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
          className="ml-auto text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          title="Sign out / Switch"
          aria-label="Sign out"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 flex-col shrink-0 border-r border-[#1E293B] select-none h-screen sticky top-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] h-full shadow-2xl flex flex-col z-10">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
