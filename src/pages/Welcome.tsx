// src/pages/Welcome.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronRight, Trophy, Users } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0d0f11] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background Glows - Usando colori hex per sicurezza */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#fc6719]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8 max-w-4xl px-6 py-12">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
          <span className="w-2 h-2 rounded-full bg-[#fc6719] animate-pulse" />
          Season 2026 Live Now
        </div>

        {/* Hero Text */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none uppercase">
            INOX<span className="text-[#fc6719]">TEAM</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl font-medium tracking-wide max-w-2xl mx-auto leading-relaxed">
            La piattaforma definitiva per il cronometraggio live, la gestione dei roster e il ranking del team Inox.
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <button 
            onClick={() => navigate('/login')}
            className="group relative inline-flex items-center gap-4 px-10 py-5 bg-white text-black font-black text-xl rounded-2xl hover:scale-105 transition-all shadow-xl hover:shadow-white/20"
          >
            ENTER THE ARENA
            <div className="w-8 h-8 rounded-full bg-[#fc6719] flex items-center justify-center text-white group-hover:translate-x-2 transition-transform">
              <ChevronRight size={20} />
            </div>
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-16 border-t border-zinc-800/50">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#00f0ff] border border-zinc-800 mx-auto shadow-inner">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Live Stats</h3>
              <p className="text-zinc-500 text-sm mt-1">Dati in tempo reale da Sauce4Zwift direttamente nel browser.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#fc6719] border border-zinc-800 mx-auto shadow-inner">
              <Trophy size={28} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Dynamic Ranking</h3>
              <p className="text-zinc-500 text-sm mt-1">Classifiche cumulate calcolate istantaneamente su database D1.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-100 border border-zinc-800 mx-auto shadow-inner">
              <Users size={28} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Roster ZRL</h3>
              <p className="text-zinc-500 text-sm mt-1">Organizza i tuoi team con il builder intelligente per i capitani.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Frame Effect */}
      <div className="absolute inset-0 pointer-events-none border-[24px] border-zinc-900/10" />
    </div>
  );
};

export default Welcome;
