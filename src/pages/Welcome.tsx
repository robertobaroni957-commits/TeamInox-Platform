import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Zap } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-zinc-100 font-sans selection:bg-[#00AEEF]/30 overflow-hidden relative flex flex-col items-center justify-center p-6">
      
      {/* BACKGROUND VIDEO & OVERLAY (Consistent with platform) */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0 opacity-10 saturate-50 blur-[1px] pointer-events-none"
      >
        <source src="https://www.teaminox.it/wp-content/uploads/2025/11/Presentazione-2025-.mp4" type="video/mp4" />
      </video>
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-[#0D0D0D]/80 via-[#0D0D0D] to-[#0D0D0D] z-0 pointer-events-none"></div>

      {/* CENTERED CONTENT */}
      <div className="relative z-10 w-full max-w-sm text-center">
        
        {/* LOGO */}
        <div className="mb-12 animate-fade-in">
          <img 
            src="https://www.teaminox.it/wp-content/uploads/2023/11/cropped-INOX-semplice-colore-lineare.png" 
            className="h-16 md:h-20 mx-auto transition-transform hover:scale-110 duration-500" 
            alt="Team Inox Logo" 
          />
        </div>

        {/* WELCOME TITLE */}
        <h1 className="text-2xl font-black italic tracking-tighter uppercase mb-12 text-zinc-400">
          Benvenuto nel <span className="text-zinc-100">Team Inox</span>
        </h1>

        {/* CTA BUTTONS */}
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#FF6A00] hover:bg-[#e65c00] text-black font-black rounded-2xl transition-all shadow-2xl shadow-[#FF6A00]/20 uppercase italic tracking-tighter text-lg"
          >
            <ShieldCheck size={24} />
            <span>Accedi</span>
          </button>

          <button 
            onClick={() => navigate('/guest')}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-zinc-900 border border-zinc-800 hover:border-[#00AEEF] text-zinc-300 hover:text-[#00AEEF] font-black rounded-2xl transition-all uppercase italic tracking-tighter text-lg"
          >
            <Zap size={24} />
            <span>Scopri il Team Inox</span>
          </button>
        </div>

        {/* MINIMAL FOOTER */}
        <footer className="mt-16 pt-8 border-t border-zinc-900">
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
             Unified Platform &copy; 2026
           </p>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
