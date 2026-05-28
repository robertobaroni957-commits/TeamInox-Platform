import React from 'react';
import { Terminal, Clock, Hash } from 'lucide-react';
import { useRoundControl } from '../../pages/admin/RoundControlContext';

export default function ActivityLog() {
  const { activeRound } = useRoundControl();


  const logs = [
    { time: "12:15:02", context: "ROUND", msg: `Gare Round 0${activeRound?.round_number || '4'} sincronizzate con successo`, type: "success" },
    { time: "12:05:10", context: "SEASON", msg: "Header Stagione 2026/27 creato", type: "success" },
    { time: "11:58:43", context: "ROUND", msg: "Configurazione WTRL ID 19 validata", type: "success" },
    { time: "11:45:00", context: "ROUND", msg: "Mapping Categorie A/B/C/D completato", type: "success" },
    { time: "11:30:12", context: "SYSTEM", msg: "Architettura D1 allineata", type: "info" },
  ];

  const getContextBadge = (ctx: string) => {
    switch(ctx) {
      case 'SEASON': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'ROUND': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }
  };

  return (
    <div className="bg-[#11131a] border border-gray-800 p-10 rounded-[2.5rem] shadow-xl h-full backdrop-blur-sm flex flex-col relative overflow-hidden text-left">
      <div className="absolute -bottom-10 -right-10 opacity-[0.03] text-gray-400 text-left">
          <Terminal size={200} />
      </div>

      <div className="flex items-center gap-4 mb-10 text-left relative z-10">
        <div className="p-3 bg-zinc-900 rounded-xl text-zinc-500 border border-zinc-800 shadow-inner">
            <Terminal size={22} />
        </div>
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] text-left">SYSTEM ACTIVITY LOG</h3>
      </div>

      <div className="space-y-2 font-mono overflow-y-auto flex-1 custom-scrollbar pr-3 relative z-10 text-left">
        {logs.map((l, i) => (
          <div 
            key={i} 
            className={`
                flex flex-col sm:flex-row gap-4 py-4 px-4 rounded-2xl border transition-all duration-300 items-start sm:items-center group text-left
                ${l.type === 'error' 
                    ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]' 
                    : 'border-transparent hover:bg-zinc-900/40 hover:border-gray-800'
                }
            `}
          >
            <div className={`flex items-center gap-2 font-black min-w-[90px] text-left ${l.type === 'error' ? 'text-red-400' : 'text-gray-600'}`}>
                <Clock size={14} />
                <span className="text-xs text-left">{l.time}</span>
            </div>

            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border tracking-widest text-left ${getContextBadge(l.context)}`}>
                {l.context}
            </span>

            <div className="flex-1 text-left min-w-0">
                <span className={`text-xs font-black uppercase tracking-tight transition-colors text-left block truncate ${
                    l.type === 'success' ? 'text-green-500/90' : 
                    l.type === 'error' ? 'text-red-500 underline decoration-red-500/30 underline-offset-4' : 'text-blue-400/90'
                }`}>
                    {l.msg}
                </span>
            </div>
            
            {l.type === 'error' && (
                <div className="flex items-center gap-2 animate-pulse text-red-500">
                    <AlertCircle size={14} />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Critical</span>
                </div>
            )}
            
            <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity text-left ml-2">
                <Hash size={12} className="text-gray-700" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-gray-800 flex items-center justify-between text-left relative z-10">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-left italic">Storage: D1 Persistent Engine</span>
          <button className="text-blue-500 text-xs font-black uppercase tracking-[0.2em] hover:text-blue-400 transition-all flex items-center gap-3 text-left group">
              Full Archive
              <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="4" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
          </button>
      </div>
    </div>
  );
}

