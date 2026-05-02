import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LogOut, Calendar, Trophy, Zap, Shield, LayoutDashboard, 
  Home, Users, User, Mail, Settings, Briefcase
} from 'lucide-react'; 

interface UserData {
  role: 'user' | 'captain' | 'admin' | 'moderator' | 'guest';
  name: string;
}

const Sidebar: React.FC = () => {
  const [user, setUser] = useState<UserData | null>({ role: 'guest', name: 'GUEST RIDER' });
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('inox_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const rawRole = payload.role;
        const role = (rawRole === 'athlete' ? 'user' : rawRole) as UserData['role'];
        setUser({ role, name: payload.username || 'Rider' });
      } catch (e) {
        localStorage.removeItem('inox_token');
        setUser({ role: 'guest', name: 'GUEST RIDER' });
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('inox_token');
    setUser({ role: 'guest', name: 'GUEST RIDER' });
    navigate('/');
  };

  const NavItem = ({ to, icon: Icon, label, special }: { to: string; icon: any; label: string; special?: string }) => (
    <NavLink
      to={to}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) => 
        `flex items-center gap-3 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border-l-2 ${
          isActive 
            ? (special === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500 shadow-[inset_2px_0_10px_rgba(239,68,68,0.1)]' : 
               special === 'zrl' ? 'bg-orange-500/10 text-orange-500 border-orange-500 shadow-[inset_2px_0_10px_rgba(252,103,25,0.1)]' :
               'bg-inox-cyan/10 text-inox-cyan border-inox-cyan shadow-[inset_2px_0_10px_rgba(0,240,255,0.1)]')
            : 'text-zinc-500 border-transparent hover:bg-zinc-900/50 hover:text-zinc-300'
        }`
      }
    >
      <Icon size={16} strokeWidth={2.5} />
      <span>{label}</span>
    </NavLink>
  );

  const SectionTitle = ({ children }: { children: string }) => (
    <div className="px-3 pt-4 pb-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900/50 mb-1.5">
      {children}
    </div>
  );

  const isGuest = user?.role === 'guest';
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const isCaptain = user?.role === 'captain' || user?.role === 'admin';

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-3 left-3 z-[100] p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-inox-orange shadow-lg">
        <div className="flex flex-col gap-1 w-4">
          <span className={`h-0.5 bg-current transition-all ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`h-0.5 bg-current transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`h-0.5 bg-current transition-all ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </div>
      </button>

      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] lg:hidden"></div>}

      <aside className={`fixed lg:static inset-y-0 left-0 w-60 bg-black border-r border-zinc-900 z-[90] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-zinc-900 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#fc6719] rounded-full shadow-[0_0_15px_rgba(252,103,25,0.3)]" />
          <h2 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">INOXTEAM</h2>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <SectionTitle>{isGuest ? 'Public' : 'Main Hub'}</SectionTitle>
          {isGuest ? (
            <NavItem to="/" icon={Home} label="Philosophy" />
          ) : (
            <NavItem to="/dashboard" icon={LayoutDashboard} label="War Room" />
          )}
          <NavItem to="/racing" icon={Zap} label="Gare Live" />
          <NavItem to="/events" icon={Calendar} label="Calendario Team" />
          <NavItem to="/ranking" icon={Trophy} label="Classifiche" />

          {/* LEAGUES & COMPETITIONS */}
          {!isGuest && (
            <>
              <SectionTitle>Leagues & Racing</SectionTitle>
              {/* ZRL Section */}
              <div className="space-y-1 mb-3">
                <div className="px-3 py-1 text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em]">Zwift Racing League</div>
                {isCaptain ? (
                  <NavItem to="/zrl-operations" icon={Briefcase} label="ZRL Operations" special="zrl" />
                ) : (
                  <NavItem to="/availability" icon={Calendar} label="Mia Disponibilità ZRL" />
                )}
              </div>

              {/* Winter Tour Section */}
              <div className="space-y-1">
                <div className="px-3 py-1 text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em]">Master Winter Tour</div>
                {isAdmin ? (
                  <NavItem to="/winter-tour-management" icon={Trophy} label="Winter Management" />
                ) : (
                  <NavItem to="/ranking" icon={Star} label="Winter Rankings" />
                )}
              </div>
            </>
          )}

          {/* ADMINISTRATION */}
          {isAdmin && (
            <>
              <SectionTitle>Administration</SectionTitle>
              <NavItem to="/admin" icon={Shield} label="Command Center" special="admin" />
              <NavItem to="/admin/users" icon={Users} label="Gestione Utenti" special="admin" />
              <NavItem to="/admin/events" icon={Settings} label="Configurazione Eventi" special="admin" />
            </>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-900">
            {isGuest ? (
              <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-inox-orange hover:bg-inox-orange/10 transition-all">
                <User size={16} strokeWidth={2.5} />
                <span>Login</span>
              </button>
            ) : (
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all">
                <LogOut size={16} strokeWidth={2.5} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
