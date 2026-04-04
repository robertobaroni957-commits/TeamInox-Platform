import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* ELEGANT GRADIENT BACKDROP (Replaces problematic video) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF6A00]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00AEEF]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* LOGO */}
        <div className="mb-12">
          <img 
            src="https://www.teaminox.it/wp-content/uploads/2023/11/cropped-INOX-semplice-colore-lineare.png" 
            className="h-16 md:h-20 mx-auto hover:scale-105 transition-transform duration-500" 
            alt="Team Inox Logo" 
          />
        </div>

        {/* WELCOME TITLE */}
        <h1 className="text-2xl font-black italic tracking-tighter uppercase mb-12 text-zinc-400">
          Benvenuto nella <span className="text-zinc-100">Unified Platform</span>
        </h1>

        {/* CTA BUTTONS */}
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#FF6A00] hover:bg-[#e65c00] text-black font-black rounded-2xl transition-all shadow-2xl shadow-[#FF6A00]/20 uppercase italic tracking-tighter text-lg"
          >
            <ShieldCheck size={24} />
            <span>Accedi al Profilo</span>
          </button>

          <button 
            onClick={() => navigate('/guest')}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-zinc-900 border border-zinc-800 hover:border-[#00AEEF] text-zinc-300 hover:text-[#00AEEF] font-black rounded-2xl transition-all uppercase italic tracking-tighter text-lg"
          >
            <Zap size={24} />
            <span>Scopri il Team</span>
          </button>
        </div>

        <footer className="mt-16 pt-8 border-t border-zinc-900/50">
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
             Inoxteam Unified &copy; 2026
           </p>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
