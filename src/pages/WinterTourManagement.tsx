import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Star, Shield, Layout, Settings } from 'lucide-react';

const WinterTourManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 text-white">
      {/* Header */}
      <header className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#fc6719] hover:border-[#fc6719]/40 transition-all group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Gestione Winter Tour</h1>
          <p className="text-zinc-500 font-medium italic text-sm mt-1 uppercase tracking-widest">Pannello di controllo Master Winter Tour</p>
        </div>
      </header>

      {/* Grid di Gestione */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Placeholder: Gestione Campionato */}
        <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 hover:border-[#fc6719]/30 transition-all group shadow-xl relative overflow-hidden">
          <Trophy size={150} className="absolute -right-10 -bottom-10 opacity-[0.03] -rotate-12 group-hover:opacity-[0.07] transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-[#fc6719] mb-6 group-hover:scale-110 transition-transform">
              <Settings size={24} />
            </div>
            <h3 className="text-xl font-black italic uppercase mb-2">Configurazione Stagione</h3>
            <p className="text-zinc-500 text-sm italic mb-8">Definisci le date di inizio/fine, il numero di tappe e il regolamento punti.</p>
            <div className="space-y-3">
              <div className="h-4 w-full bg-zinc-800 rounded-lg"></div>
              <div className="h-4 w-3/4 bg-zinc-800 rounded-lg"></div>
            </div>
            <p className="text-[10px] font-black text-zinc-600 uppercase mt-8 tracking-widest">Modulo in sviluppo</p>
          </div>
        </div>

        {/* Placeholder: Hall of Fame & Premi */}
        <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 hover:border-[#fc6719]/30 transition-all group shadow-xl relative overflow-hidden">
          <Star size={150} className="absolute -right-10 -bottom-10 opacity-[0.03] rotate-12 group-hover:opacity-[0.07] transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-[#fc6719] mb-6 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-black italic uppercase mb-2">Albo d'Oro & Storico</h3>
            <p className="text-zinc-500 text-sm italic mb-8">Gestisci i vincitori delle stagioni passate e i premi speciali assegnati.</p>
            <div className="flex -space-x-3 overflow-hidden">
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-zinc-900 bg-zinc-800"></div>
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-zinc-900 bg-zinc-800"></div>
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-zinc-900 bg-zinc-800"></div>
            </div>
            <p className="text-[10px] font-black text-zinc-600 uppercase mt-8 tracking-widest">Modulo in sviluppo</p>
          </div>
        </div>
      </div>

      {/* Sezione Placeholder: Tappe */}
      <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-zinc-800 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Layout size={14} className="text-[#fc6719]" /> Gestione Tappe Winter Tour
          </h3>
          <span className="px-4 py-1 rounded-full bg-zinc-800 text-zinc-500 text-[9px] font-bold uppercase tracking-widest border border-zinc-700">
            Next Edition: Dec 2026
          </span>
        </div>
        <div className="p-12 border-2 border-dashed border-zinc-800 rounded-[2rem] text-center">
          <p className="text-zinc-600 font-black italic uppercase tracking-tighter text-xl">Nessuna tappa attiva al momento</p>
          <p className="text-zinc-700 text-xs mt-2 uppercase tracking-widest font-bold">I dati verranno caricati una volta aperta la nuova stagione</p>
        </div>
      </div>
    </div>
  );
};

export default WinterTourManagement;
