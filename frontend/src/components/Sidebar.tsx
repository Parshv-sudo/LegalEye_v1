import { useState } from 'react';
import { ViewRoute, Workspace, Role, Matter } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentRoute: ViewRoute;
  onNavigate: (route: ViewRoute) => void;
  activeWorkspace: Workspace;
  onSwitchWorkspace: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isDesktopOpen?: boolean;
  onToggleDesktop?: () => void;
  onOpenCreateModal?: () => void;
  matters?: Matter[];
  onSelectMatter?: (matter: Matter) => void;
}

export function Sidebar({
  currentRoute,
  onNavigate,
  activeWorkspace,
  onSwitchWorkspace,
  isMobileOpen = false,
  onCloseMobile,
  isDesktopOpen = true,
  onToggleDesktop,
  onOpenCreateModal,
  matters = [],
  onSelectMatter,
}: SidebarProps) {
  const { globalRole, setGlobalRole } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);

  const handleNav = (route: ViewRoute) => {
    onNavigate(route);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0A192F] text-white">
      {/* Brand & Toggle Header */}
      <div 
        className={`p-4 border-b border-[#1E293B] flex items-center h-[64px] shrink-0 ${isDesktopOpen ? 'justify-between' : 'justify-center cursor-pointer'}`}
        onMouseEnter={() => !isDesktopOpen && setIsHoveringHeader(true)}
        onMouseLeave={() => !isDesktopOpen && setIsHoveringHeader(false)}
        onClick={() => {
          if (!isDesktopOpen && onToggleDesktop) onToggleDesktop();
        }}
        title={!isDesktopOpen ? "Open sidebar" : undefined}
      >
        <div className="flex items-center gap-2.5">
          {(!isDesktopOpen && isHoveringHeader) ? (
            <div className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
               <span className="material-symbols-outlined text-[24px]" aria-hidden="true">right_panel_open</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded bg-[#115fd4] flex items-center justify-center font-bold text-white shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">visibility</span>
            </div>
          )}
          
          {isDesktopOpen && (
            <div className="animate-fadeIn truncate">
              <h1 className="font-heading font-bold text-base leading-tight tracking-wide text-white truncate">
                LegalEye
              </h1>
              <p className="text-[11px] text-gray-400 font-sans truncate">Legal Intelligence</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        {onToggleDesktop && (
          <button
            onClick={onToggleDesktop}
            className={`hidden md:flex text-gray-400 hover:text-white p-1 rounded hover:bg-[#1E293B] transition-colors shrink-0 ${!isDesktopOpen ? '!hidden' : ''}`}
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">left_panel_close</span>
          </button>
        )}
        
        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden text-gray-400 hover:text-white p-1 rounded hover:bg-[#1E293B] transition-colors shrink-0"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
          </button>
        )}
      </div>

      {/* Active Workspace Bar (Hidden when collapsed on desktop) */}
      {(isDesktopOpen || isMobileOpen) && (
        <div className="px-4 py-3 bg-[#101F38] border-b border-[#1E293B] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 overflow-hidden">
            <div 
              className="w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: activeWorkspace.color || '#2D5A27' }}
            >
              {activeWorkspace.code}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-gray-200 truncate">{activeWorkspace.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{activeWorkspace.lastAccessed}</p>
            </div>
          </div>
          <button
            onClick={onSwitchWorkspace}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">logout</span>
          </button>
        </div>
      )}

      {/* Main Navigation Items */}
      <nav className={`flex-1 overflow-y-auto font-sans text-xs flex flex-col gap-1 ${isDesktopOpen ? 'px-3 py-4' : 'px-2 py-4 items-center'}`} aria-label="Sidebar Navigation">
        
        {/* Create Matter Button (ChatGPT "New Chat" Style) */}
        <button
          onClick={onOpenCreateModal}
          title={!isDesktopOpen ? "Create Matter" : undefined}
          className={`flex items-center gap-3 rounded transition-colors font-medium cursor-pointer mb-2 ${isDesktopOpen ? 'w-full px-3 py-2.5 text-left bg-[#1E293B] text-white hover:bg-[#2A374A]' : 'w-10 h-10 justify-center shrink-0 text-white bg-[#1E293B] hover:bg-[#2A374A]'}`}
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">edit_square</span>
          {(isDesktopOpen || isMobileOpen) && <span className="animate-fadeIn font-semibold">Create Matter</span>}
        </button>

        {/* Active Matters (Visible when collapsed) */}
        <button
          onClick={() => handleNav('matters')}
          title={!isDesktopOpen ? "Active Matters" : undefined}
          className={`flex items-center gap-3 rounded transition-colors font-medium cursor-pointer ${isDesktopOpen ? 'w-full px-3 py-2.5 text-left' : 'w-10 h-10 justify-center shrink-0'} ${currentRoute === 'matters' || currentRoute === 'matter-detail'
            ? 'bg-[#1a2b47] text-white font-semibold'
            : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
            }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentRoute === 'matters' || currentRoute === 'matter-detail' ? 'text-white' : 'text-gray-400'}`} aria-hidden="true">folder</span>
          {(isDesktopOpen || isMobileOpen) && <span className="animate-fadeIn">Active Matters</span>}
        </button>

        {/* Library (Hidden when collapsed) */}
        {(isDesktopOpen || isMobileOpen) && (
          <button
            onClick={() => handleNav('library')}
            className={`flex items-center gap-3 rounded transition-colors font-medium cursor-pointer w-full px-3 py-2.5 text-left ${currentRoute === 'library'
              ? 'bg-[#1a2b47] text-white font-semibold'
              : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
              }`}
          >
            <span className="material-symbols-outlined text-[20px] text-gray-400" aria-hidden="true">menu_book</span>
            <span className="animate-fadeIn">Library</span>
          </button>
        )}

        {/* Collaborative Space (Hidden when collapsed) */}
        {(isDesktopOpen || isMobileOpen) && (
          <button
            onClick={() => handleNav('projects')}
            className={`flex items-center gap-3 rounded transition-colors font-medium cursor-pointer w-full px-3 py-2.5 text-left ${currentRoute === 'projects'
              ? 'bg-[#1a2b47] text-white font-semibold'
              : 'text-gray-300 hover:bg-[#101F38] hover:text-white'
              }`}
          >
            <span className="material-symbols-outlined text-[20px] text-gray-400" aria-hidden="true">folder_open</span>
            <span className="animate-fadeIn">Collaborative Space</span>
          </button>
        )}

        {/* Pinned Section */}
        {(!isDesktopOpen && !isMobileOpen) ? (
          <button
            title="Pinned Matters"
            onClick={() => { if (onToggleDesktop) onToggleDesktop(); }}
            className="w-10 h-10 flex items-center justify-center shrink-0 text-gray-400 hover:text-white hover:bg-[#101F38] transition-colors cursor-pointer mt-4 rounded"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">push_pin</span>
          </button>
        ) : (
          <div className="mt-6 mb-1 animate-fadeIn">
            <div className="px-3 pb-2 text-[11px] font-bold text-gray-400">
              Pinned
            </div>
            <div className="flex flex-col">
              {matters.filter(m => m.isPinned).length > 0 ? (
                matters.filter(m => m.isPinned).map(matter => (
                  <button 
                    key={matter.id}
                    onClick={() => { if (onSelectMatter) onSelectMatter(matter); if (onCloseMobile) onCloseMobile(); }} 
                    className="px-3 py-2 text-left text-gray-300 hover:bg-[#101F38] hover:text-white rounded flex items-center gap-2 truncate cursor-pointer transition-colors group"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-500 shrink-0">push_pin</span>
                    <span className="truncate">{matter.title}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-1 text-[11px] text-gray-500 italic">No pinned matters</div>
              )}
            </div>
          </div>
        )}

        {/* Recents Section */}
        {(!isDesktopOpen && !isMobileOpen) ? (
          <button
            title="Recent Matters"
            onClick={() => { if (onToggleDesktop) onToggleDesktop(); }}
            className="w-10 h-10 flex items-center justify-center shrink-0 text-gray-400 hover:text-white hover:bg-[#101F38] transition-colors cursor-pointer mt-2 rounded"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">history</span>
          </button>
        ) : (
          <div className="mt-4 mb-1 animate-fadeIn">
            <div className="px-3 pb-2 text-[11px] font-bold text-gray-400">
              Recents
            </div>
            <div className="flex flex-col">
              {matters.slice(0, 5).map(matter => (
                <button 
                  key={matter.id}
                  onClick={() => { if (onSelectMatter) onSelectMatter(matter); if (onCloseMobile) onCloseMobile(); }} 
                  className="px-3 py-2 text-left text-gray-300 hover:bg-[#101F38] hover:text-white rounded flex items-center gap-2 truncate cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-gray-500 shrink-0">chat_bubble</span>
                  <span className="truncate">{matter.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Senior Associate Profile Footer with Dropdown Menu */}
      <div className="relative border-t border-[#1E293B] bg-[#101F38]">
        {isProfileMenuOpen && (
          <div className="absolute bottom-full left-0 w-full mb-1 bg-[#1E293B] border border-gray-700 rounded shadow-xl py-1 z-50 text-xs shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
            <button 
              className="w-full text-left px-4 py-2 text-gray-200 hover:bg-[#115fd4] hover:text-white transition-colors cursor-pointer flex items-center gap-2"
              onClick={() => {
                setIsProfileMenuOpen(false);
                handleNav('profile' as ViewRoute);
              }}
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
              User Profile
            </button>
            <button 
              className="w-full text-left px-4 py-2 text-gray-200 hover:bg-[#115fd4] hover:text-white transition-colors cursor-pointer flex items-center gap-2"
              onClick={() => {
                setIsProfileMenuOpen(false);
                handleNav('settings');
              }}
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
              Workspace Settings
            </button>
            <div className="border-t border-gray-700 my-1"></div>
            <button 
              className="w-full text-left px-4 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
              onClick={() => {
                setIsProfileMenuOpen(false);
                handleNav('settings');
              }}
            >
              <span className="material-symbols-outlined text-[16px]">credit_card</span>
              Billing & Plan
            </button>

            <button 
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
              onClick={() => {
                setIsProfileMenuOpen(false);
                onSwitchWorkspace();
              }}
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sign Out
            </button>
          </div>
        )}
        
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          title={!isDesktopOpen ? "Profile Options" : undefined}
          className={`w-full flex items-center transition-colors cursor-pointer text-left hover:bg-[#1a2b47] ${isDesktopOpen ? 'p-3 gap-3' : 'p-3 justify-center'}`}
        >
          <div className="w-8 h-8 rounded-full bg-[#115fd4] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs">
            PM
          </div>
          {(isDesktopOpen || isMobileOpen) && (
            <>
              <div className="overflow-hidden flex-1 animate-fadeIn">
                <p className="text-xs font-semibold text-white truncate">Adv. Priya Mehta</p>
                <p className="text-[10px] text-gray-400 truncate">Senior Associate</p>
              </div>
              <span className="material-symbols-outlined text-[18px] text-gray-400 shrink-0">
                {isProfileMenuOpen ? 'expand_more' : 'expand_less'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside className={`hidden md:flex flex-col shrink-0 border-r border-[#1E293B] select-none h-screen sticky top-0 z-30 transition-[width] duration-300 ease-in-out ${isDesktopOpen ? 'w-64' : 'w-[68px]'}`}>
        <div className={`h-full ${isDesktopOpen ? 'w-64' : 'w-[68px]'} overflow-hidden`}>
          {navContent}
        </div>
      </aside>

      {/* Mobile Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] h-full shadow-2xl flex flex-col z-10">
            <div className="w-64 h-full overflow-hidden">
              {navContent}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
