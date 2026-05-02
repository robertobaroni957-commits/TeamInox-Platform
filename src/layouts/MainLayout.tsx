import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Non mostriamo l'avviso se siamo già nella pagina della disponibilità
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
        // Silenzioso per non disturbare l'utente se l'API fallisce
        console.error('Availability check failed');
      }
    };

    checkStatus();
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500 selection:text-black">
      {/* Sidebar fissa */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* GLOBAL ALERT BANNER (Step 2 logic) */}
        {showWarning && (
          <div className="bg-orange-500 text-black px-4 py-2 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-500">
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

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950 p-4 lg:p-6">
          {/* Dashboard/Page content injected here */}
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
