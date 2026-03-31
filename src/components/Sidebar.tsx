import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Trophy, Zap, Shield, LayoutDashboard,Home, Users, User, Mail } from 'lucide-react'; 

interface UserData {
  role: 'athlete' | 'captain' | 'admin' | 'moderator';
  name: string;
}

const Sidebar: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('inox_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ 
          role: payload.role || 'athlete', 
          name: payload.username || 'Rider' 
        });
      } catch (e) {
        console.error('Session Error:', e);
        localStorage.removeItem('inox_token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('inox_token');
    setUser(null);
    navigate('/');
  };

  const NavItem = ({ to, icon: Icon, label, special }: { to: string; icon: any; label: string; special?: string }) => (
    <NavLink
      to={to}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-l-4 ${
          isActive 
            ? (special === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500 shadow-[inset_4px_0_15px_rgba(239,68,68,0.1)]' : 
               special === 'mwt' ? 'bg-inox-orange/10 text-inox-orange border-inox-orange shadow-[inset_4px_0_15px_rgba(252,103,25,0.1)]' :
               'bg-inox-cyan/10 text-inox-cyan border-inox-cyan shadow-[inset_4px_0_15px_rgba(0,240,255,0.1)]')
            : 'text-zinc-500 border-transparent hover:bg-zinc-900/50 hover:text-zinc-300'
        }`
      }
    >
      <Icon size={18} strokeWidth={2.5} />
      <span>{label}</span>
    </NavLink>
  );

  const SectionTitle = ({ children }: { children: string }) => (
    <div className="px-4 pt-8 pb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900/50 mb-2">
      {children}
    </div>
  );

  if (!user) return null;

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[100] p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl text-inox-orange"
      >
        <div className="flex flex-col gap-1 w-5">
          <span className={`h-1 bg-current transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`h-1 bg-current transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`h-1 bg-current transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80] lg:hidden"
        ></div>
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-[300px] bg-black border-r border-zinc-900 z-[90] transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-8 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://www.teaminox.it/wp-content/uploads/2023/11/cropped-INOX-semplice-colore-lineare.png" className="h-8" alt="" />
            <span className="text-2xl font-black italic tracking-tighter text-white uppercase">
              INOX<span className="text-inox-orange">PLATFORM</span>
            </span>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 py-6 border-b border-zinc-900 bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 ${
              user.role === 'admin' ? 'border-red-500 text-red-500 bg-red-500/10' :
              user.role === 'captain' ? 'border-inox-orange text-inox-orange bg-inox-orange/10' :
              'border-inox-cyan text-inox-cyan bg-inox-cyan/10'
            }`}>
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase truncate max-w-[160px]">{user.name}</p>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          <SectionTitle>Main Hub</SectionTitle>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="War Room" />
          <NavItem to="/racing" icon={Zap} label="Gare Live" />
          <NavItem to="/ranking" icon={Trophy} label="Classifiche MWT" special="mwt" />
          <NavItem to="/events" icon={Calendar} label="Calendario Eventi" />

          {/* ATHLETE SECTION */}
          <SectionTitle>Rider Tools</SectionTitle>
          <NavItem to="/availability" icon={Calendar} label="Disponibilità" />
          <NavItem to="/teams" icon={Users} label="I Miei Team" />

          {/* CAPTAIN SECTION */}
          {(user.role === 'captain' || user.role === 'admin') && (
            <>
              <SectionTitle>Captain Deck</SectionTitle>
              <NavItem to="/roster" icon={Shield} label="Gestione Roster" />
            </>
          )}

          {/* ADMIN SECTION */}
          {user.role === 'admin' && (
            <>
              <SectionTitle>Command Center</SectionTitle>
              <NavItem to="/admin/users" icon={Users} label="Gestione Utenti" special="admin" />
              <NavItem to="/admin/events" icon={Calendar} label="Gestione Eventi" special="admin" />
              <NavItem to="/admin/teams" icon={Shield} label="Config Squadre" special="admin" />
            </>
          )}

          <div className="mt-8 pt-4 border-t border-zinc-900">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} strokeWidth={2.5} />
              <span>Scollegati (Logout)</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
