import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Shield } from 'lucide-react';

const MainLayout: React.FC = () => {
  const location = useLocation();

  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return 'ZRL War Room';
    if (path === '/racing') return 'Gare Live';
    if (path === '/teams') return 'Roster Squadre';
    if (path === '/login') return 'Rider Access';
    if (path === '/availability') return 'Mia Disponibilità';
    if (path === '/roster') return 'Command Center';
    if (path === '/events') return 'Calendario Eventi';
    if (path === '/admin/users') return 'Gestione Utenti';
    if (path === '/admin/events') return 'Gestione Eventi';
    if (path === '/ranking') return 'Classifiche';
    return 'Inoxteam Platform';
  };

  return (
    <div className="flex h-screen bg-[#0d0f11] text-zinc-100 overflow-hidden font-sans relative">
      
      {/* BACKGROUND VIDEO & OVERLAY */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0 opacity-10 saturate-50 blur-[1px] pointer-events-none"
      >
        <source src="https://www.teaminox.it/wp-content/uploads/2025/11/Presentazione-2025-.mp4" type="video/mp4" />
      </video>
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-[#0d0f11]/80 via-[#0d0f11] to-[#0d0f11] z-0 pointer-events-none shadow-inner"></div>

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* HEADER */}
        <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/40 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-20">
          <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">
            {getPageTitle(location.pathname)}
          </h1>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <Shield size={10} className="text-cyan-500" />
              <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">
                Encrypted Session: Active
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-inner group cursor-pointer hover:border-inox-orange transition-all">
              <span className="text-[10px] font-black text-zinc-500 group-hover:text-inox-orange transition-all">IX</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
