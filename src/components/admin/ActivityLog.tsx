import React from 'react';
import { Terminal, Clock, Hash } from 'lucide-react';
import { useSeasonInit } from '../../pages/admin/SeasonInitContext';

export default function ActivityLog() {
  const { activeRound } = useSeasonInit();

  const logs = [
    { time: "12:15:02", context: "ROUND", msg: `Risultati Round 0${activeRound} sincronizzati`, type: "success" },
    { time: "12:05:10", context: "SEASON", msg: "Header Stagione 2026/27 creato", type: "success" },
    { time: "11:58:43", context: "ROUND", msg: "Sync Team 'Inox Knights' completato", type: "success" },
    { time: "11:45:00", context: "ROUND", msg: "Errore Import Gare (Timeout API)", type: "error" },
    { time: "11:30:12", context: "SYSTEM", msg: "Architettura D1 validata", type: "info" },
  ];

  const getContextBadge = (ctx: string) => {
    switch(ctx) {
      case 'SEASON': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'ROUND': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }
  };

  return (
    <div className="bg-[#11131a] border border-gray-800 p-8 rounded-[2rem] shadow-xl h-full backdrop-blur-sm flex flex-col relative overflow-hidden text-left">
      <div className="absolute -bottom-6 -right-6 opacity-[0.03] text-gray-400 text-left">
          <Terminal size={140} />
      </div>

      <div className="flex items-center gap-3 mb-8 text-left">
        <div className="p-2 bg-zinc-900 rounded-lg text-zinc-500 border border-gray-800"><Terminal size={18} /></div>
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] text-left">SYSTEM ACTIVITY LOG</h3>
      </div>

      <div className="space-y-1 font-mono text-[10px] overflow-y-auto flex-1 custom-scrollbar pr-2 relative z-10 text-left">
        {logs.map((l, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-3 py-3 border-b border-gray-800/50 last:border-0 items-start sm:items-center group text-left">
            <div className="flex items-center gap-1.5 text-gray-600 font-bold min-w-[70px] text-left">
                <Clock size={10} />
                <span className="text-left">{l.time}</span>
            </div>

            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getContextBadge(l.context)} text-left`}>
                {l.context}
            </span>

            <div className="flex-1 text-left">
                <span className={`font-bold uppercase tracking-tight transition-colors group-hover:text-white text-left ${
                    l.type === 'success' ? 'text-green-500/80' : 
                    l.type === 'error' ? 'text-red-500/80' : 'text-blue-400/80'
                }`}>
                    {l.msg}
                </span>
            </div>
            
            <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity text-left">
                <Hash size={10} className="text-gray-700" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between text-left">
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-left">Storage: D1 Persistent Log</span>
          <button className="text-blue-500 text-[9px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1.5 text-left">
              Full Archive
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="4" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
          </button>
      </div>
    </div>
  );
}
