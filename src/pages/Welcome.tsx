import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, ChevronRight } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* SFONDO DINAMICO - SEMPLIFICATO */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#FF6A00]/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#00AEEF]/5 blur-[120px] rounded-full opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        
        {/* LOGO */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <img 
            src="https://www.teaminox.it/wp-content/uploads/2023/11/cropped-INOX-semplice-colore-lineare.png" 
            className="h-20 md:h-24 drop-shadow-[0_0_20px_rgba(255,106,0,0.2)]" 
            alt="Team Inox Logo" 
            onError={(e) => {
              // Fallback se l'immagine esterna viene bloccata
              e.currentTarget.src = "https://via.placeholder.com/200x80?text=TEAM+INOX";
            }}
          />
        </motion.div>

        {/* TITOLO */}
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-[#FF6A00] text-xs md:text-sm font-black uppercase italic tracking-[0.4em] mb-2 opacity-80">
            Inoxteam Racing Dept.
          </h2>
          
          <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            UNIFIED <span className="text-zinc-500">PLATFORM</span>
          </h1>
          
          <p className="text-zinc-500 font-medium italic text-sm md:text-base max-w-md mx-auto opacity-70">
            Eccellenza agonistica e gestione di precisione.
          </p>
        </div>

        {/* AZIONI */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-xl px-4">
          <button 
            onClick={() => navigate('/login')}
            className="flex-1 px-8 py-5 bg-[#FF6A00] text-black font-black rounded-2xl hover:bg-[#ff7b1a] transition-all uppercase italic tracking-tighter text-lg flex items-center justify-center gap-3 shadow-lg"
          >
            <ShieldCheck size={24} />
            <span>ACCEDI</span>
          </button>

          <button 
            onClick={() => navigate('/guest')}
            className="flex-1 px-8 py-5 bg-zinc-900/80 border border-zinc-800 hover:border-[#00AEEF] text-zinc-300 font-black rounded-2xl transition-all uppercase italic tracking-tighter text-lg flex items-center justify-center gap-3"
          >
            <Zap size={24} />
            <span>SCOPRI</span>
            <ChevronRight size={18} />
          </button>
        </div>

        <footer className="mt-20">
           <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em] opacity-50">
             Est. 2026 — Champions Only
           </p>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
