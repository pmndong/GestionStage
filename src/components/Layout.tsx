import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Eye, Map, CheckSquare, BookOpen, ChevronLeft, ChevronRight, Menu, Calendar, TrendingUp, StickyNote,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',             label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/planning',     label: 'Planning',      icon: Calendar },
  { to: '/interviews',   label: 'Interviews',    icon: Users },
  { to: '/observations', label: 'Observations',  icon: Eye },
  { to: '/processus',    label: 'Cartographie',  icon: Map },
  { to: '/impact',       label: 'Impact',        icon: TrendingUp },
  { to: '/checklist',    label: 'Checklist',     icon: CheckSquare },
  { to: '/dictionnaire', label: 'Dictionnaire',  icon: BookOpen },
  { to: '/notes',        label: 'Notes',          icon: StickyNote },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #00b894 0%, #00966e 100%)' }}>
          <span className="text-white font-bold text-sm">G</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-slate-800 text-sm whitespace-nowrap">GérerStage</span>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5 transition-all text-sm font-medium
                ${isActive
                  ? 'bg-[#00b894]/10 text-[#00966e] border border-[#00b894]/20'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-slate-200 p-2 hidden md:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 border-r border-slate-200 transition-all duration-200"
        style={{ width: collapsed ? 64 : 220, background: '#ffffff' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 flex flex-col w-64 border-r border-slate-200 bg-white">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-slate-700">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-slate-800 text-sm">GérerStage</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
