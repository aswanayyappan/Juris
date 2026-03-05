import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Scale, MessageSquare, Users, BookOpen, Search,
  Building2, CreditCard, LogOut, Coins, Menu, X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'AI Assistant',   path: '/dashboard',   icon: MessageSquare, desc: 'AI legal guidance' },
  { name: 'Case Search',    path: '/case-search',  icon: Search,        desc: 'Search case records' },
  { name: 'Legal Library',  path: '/library',      icon: BookOpen,      desc: 'Compliance insights' },
  { name: 'Business',       path: '/business',     icon: Building2,     desc: 'Track compliance' },
  { name: 'Buy Credits',    path: '/buy-credits',  icon: CreditCard,    desc: 'Upgrade your plan' },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Top gold accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow">
            <Scale className="h-5 w-5 text-slate-900" />
          </div>
          <div>
            <span
              className="text-xl font-bold text-white tracking-wide leading-none font-display"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              JURIS
            </span>
            <div className="text-[10px] text-amber-500/70 tracking-widest uppercase font-medium leading-tight">
              Legal Platform
            </div>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-sm shadow-md shadow-amber-500/20">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080D1A]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <Coins className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 font-semibold text-sm">{user?.credits ?? 0}</span>
          <span className="text-amber-500/70 text-xs">credits remaining</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium px-3 py-2">
          Navigation
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/15 border border-amber-500/25'
                  : 'hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/30'
                  : 'bg-white/[0.05] group-hover:bg-white/[0.08]'
              }`}>
                <Icon className={`h-4 w-4 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-200'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium leading-tight ${
                  isActive ? 'text-amber-300' : 'text-slate-300 group-hover:text-white'
                }`}>
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">{item.desc}</div>
              </div>
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/[0.07] border border-transparent hover:border-red-500/20 transition-all duration-200 group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #060B18 0%, #0A1020 50%, #060B18 100%)' }}>
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-9 h-9 rounded-lg bg-[#0A1020] border border-white/10 flex items-center justify-center text-white hover:bg-[#0D1526] transition-colors"
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Desktop */}
      <aside
        className="hidden lg:flex w-64 flex-col flex-shrink-0 sticky top-0 h-screen"
        style={{
          background: 'rgba(8, 13, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar — Mobile */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'rgba(8, 13, 26, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Subtle grid overlay */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            zIndex: 0,
          }}
        />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};
