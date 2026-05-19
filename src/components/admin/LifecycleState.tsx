import React from 'react';
import { Shield, Globe, Zap, Circle } from 'lucide-react';
import { useSeasonInit } from '../../pages/admin/SeasonInitContext';

export default function LifecycleState() {
  const { activeRound, activeSeason } = useSeasonInit();
  const seasonStatus = activeSeason?.is_active ? "ACTIVE" : "ARCHIVED";
  const roundStatus = "OPERATIONAL"; // Derivabile da DB in futuro
  
  const getBadgeColor = (s: string) => {
    switch(s) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
      case 'OPERATIONAL': return 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
      case 'ARCHIVED': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="bg-[#11131a] border border-gray-800 p-8 rounded-[2rem] shadow-xl h-full backdrop-blur-sm relative overflow-hidden text-left">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl text-left"></div>
        
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2 text-left">
            <Zap size={14} className="text-blue-500" />
            LIFECYCLE STATUS
        </h3>
        
        <div className="space-y-6 text-left">
            <div className="space-y-3">
                <div className="flex justify-between items-center text-left">
                    <div className="flex items-center gap-2">
                        <Globe size={14} className="text-gray-600" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Global Season</span>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border ${getBadgeColor(seasonStatus)}`}>
                        {seasonStatus}
                    </span>
                </div>
                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className={`h-full w-full ${activeSeason?.is_active ? 'bg-green-500/50' : 'bg-amber-500/50'}`}></div>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="h-4 w-px bg-gray-800"></div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-left">
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-gray-600" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Active Round 0{activeRound}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border ${getBadgeColor(roundStatus)}`}>
                        {roundStatus}
                    </span>
                </div>
                <div className="bg-[#090a10] p-4 rounded-2xl border border-gray-800/50 text-left">
                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase text-left">
                        Sincronizzazione API abilitata per il round corrente. Il sistema è pronto per l'importazione dei risultati.
                    </p>
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800/50 space-y-2 text-left">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-left">
                <span className="text-gray-600">Last Status Change</span>
                <span className="text-gray-400 font-mono italic">Oggi, 11:45</span>
            </div>
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-left">
                <span className="text-gray-600">Sync Engine</span>
                <span className="text-blue-500 animate-pulse flex items-center gap-1">
                    <Circle size={8} fill="currentColor" /> Connected
                </span>
            </div>
        </div>
    </div>
  );
}
