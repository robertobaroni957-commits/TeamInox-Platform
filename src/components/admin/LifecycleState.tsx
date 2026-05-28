import React from 'react';
import { Shield, Globe, Zap, Circle } from 'lucide-react';
import { useRoundControl } from '../../pages/admin/RoundControlContext';

export default function LifecycleState() {
  const { activeRound } = useRoundControl();
  const syncStatus = activeRound?.sync_state || "PENDING";
  const roundStatus = "OPERATIONAL"; 
  
  const getBadgeColor = (s: string) => {
    switch(s) {
      case 'COMPLETED': return 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
      case 'OPERATIONAL': return 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
      case 'SYNCING': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'FAILED': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="bg-[#11131a] border border-gray-800 p-10 rounded-[2.5rem] shadow-xl h-full backdrop-blur-sm relative overflow-hidden text-left">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl text-left"></div>
        
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3 text-left">
            <div className="p-2 bg-blue-500/10 rounded-lg">
                <Zap size={18} className="text-blue-500" />
            </div>
            LIFECYCLE STATUS
        </h3>
        
        <div className="space-y-10 text-left">
            <div className="space-y-4">
                <div className="flex justify-between items-center text-left">
                    <div className="flex items-center gap-3">
                        <Globe size={18} className="text-gray-600" />
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-left">Sync State</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${getBadgeColor(syncStatus)}`}>
                        {syncStatus}
                    </span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full transition-all duration-1000 ${syncStatus === 'COMPLETED' ? 'bg-green-500/60 w-full' : 'bg-amber-500/60 w-2/3'}`}></div>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="h-6 w-px bg-gray-800"></div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-left">
                    <div className="flex items-center gap-3">
                        <Shield size={18} className="text-gray-600" />
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-left uppercase">Round {activeRound?.wtrl_id || '---'} context</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${getBadgeColor(roundStatus)}`}>
                        {roundStatus}
                    </span>
                </div>
                <div className="bg-[#090a10] p-6 rounded-2xl border border-gray-800/50 text-left shadow-inner">
                    <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase text-left tracking-wide italic">
                        Sincronizzazione WTRL abilitata per il round corrente. Il sistema è pronto per l'importazione dei dati e la validazione dei risultati.
                    </p>
                </div>
            </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800/50 space-y-4 text-left">
            <div className="flex justify-between text-xs font-bold uppercase tracking-[0.2em] text-left">
                <span className="text-gray-600">Round Sequence</span>
                <span className="text-white font-mono italic">#{activeRound?.round_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-[0.2em] text-left">
                <span className="text-gray-600">Sync Engine</span>
                <span className="text-blue-500 animate-pulse flex items-center gap-2">
                    <Circle size={10} fill="currentColor" /> ONLINE
                </span>
            </div>
        </div>
    </div>
  );
}
