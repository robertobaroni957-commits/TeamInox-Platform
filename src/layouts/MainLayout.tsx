import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  AlertTriangle, 
  ChevronRight, 
  LayoutGrid, 
  LogOut,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [user, setUser] = useState<{username: string, role: string} | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('inox_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.username, role: payload.role });
      } catch (e) {
        localStorage.removeItem('inox_token');
        setUser(null);
      }
    }

    if (location.pathname === '/availability') {
      setShowWarning(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const data = await api.checkAvailabilityStatus();
        if (data.missing) {
          setShowWarning(true);
        }
      } catch (err) {
        console.error('Availability check failed');
      }
    };

    checkStatus();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('inox_token');
    navigate('/login');
  };

  const isHub = location.pathname === '/dashboard';
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans selection:bg-inox-cyan selection:text-black overflow-x-hidden">
      
      {/* UNIVERSAL TOP BAR */}
      <header className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-xl border-b border-zinc-900 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-1.5 h-6 bg-[#fc6719] rounded-full shadow-[0_0_15px_rgba(252,103,25,0.4)] group-hover:scale-y-110 transition-transform" />
            <h2 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">INOXTEAM</h2>
          </Link>
          
          {/* Universal Back to Hub */}
          {!isHub && (
            <button 
              onClick={() => navigate('/dashboard')}
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-[10px] font-black uppercase tracking-widest group"
            >
              <LayoutGrid size={14} className="group-hover:rotate-90 transition-transform" />
              <span>Back to Hub</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          {/* Mobile Back to Hub */}
          {!isHub && (
            <button 
              onClick={() => navigate('/dashboard')}
              className="md:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400"
            >
              <LayoutGrid size={18} />
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3 lg:gap-4 pl-4 border-l border-zinc-900">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[9px] font-black text-white uppercase tracking-tighter leading-none">{user.username}</span>
                <span className={`text-[7px] font-black uppercase tracking-widest mt-0.5 ${isAdmin ? 'text-red-500' : 'text-[#fc6719]'}`}>{user.role}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-900 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="px-5 py-2 bg-white text-black font-black italic uppercase rounded-xl text-[10px] tracking-widest hover:bg-[#fc6719] hover:text-white transition-all shadow-lg shadow-white/5"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* GLOBAL ALERT BANNER */}
        {showWarning && (
          <div className="bg-[#fc6719] text-black px-4 py-2 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="fill-black/20" />
              <p className="text-[10px] font-black uppercase italic tracking-tight">
                Azione Richiesta: Compila la tua disponibilità ZRL!
              </p>
            </div>
            <Link 
              to="/availability" 
              className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:scale-105 transition-all"
            >
              Compila <ChevronRight size={12} />
            </Link>
          </div>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

