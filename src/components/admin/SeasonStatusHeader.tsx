import React from 'react';
import { 
  Activity, AlertTriangle, CheckCircle2, Clock, 
  Database, Loader2, Server, ShieldAlert 
} from 'lucide-react';
import { SeasonStatus } from '../../hooks/useSeasonStatus';

interface Props {
  status: SeasonStatus | null;
  loading: boolean;
  error: string | null;
}

export const SeasonStatusHeader: React.FC<Props> = ({ status, loading, error }) => {
  if (loading) return <div className="p-6 border-b border-zinc-800 animate-pulse text-zinc-500 font-black italic text-[10px] uppercase">Connecting to control plane...</div>;
  if (error) return (
    <div className="p-6 border-b border-zinc-800 bg-red-950/20 text-red-400 flex items-center gap-3">
      <ShieldAlert size={16} />
      <span className="font-black text-[10px] uppercase italic">System Offline: {error}</span>
    </div>
  );
  if (!status) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-zinc-800 bg-zinc-900/30">
      {/* Season Name */}
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Active Season</span>
        <span className="text-sm font-black italic text-white uppercase truncate">{status.seasonName}</span>
      </div>

      {/* Lifecycle Status */}
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Lifecycle State</span>
        <div className="flex items-center gap-2 mt-1">
          <div className={`h-2 w-2 rounded-full ${status.importActive ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs font-black italic text-zinc-300 uppercase">{status.lifecycleStatus}</span>
        </div>
      </div>

      {/* Last Operation */}
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Last Op</span>
        <span className="text-xs font-bold text-zinc-400 truncate mt-1">{status.lastOperation}</span>
      </div>

      {/* Indicators */}
      <div className="flex items-center justify-end gap-3">
        {status.isReady && <div className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded text-[9px] font-black uppercase italic"><CheckCircle2 size={12}/> Ready</div>}
        {status.hasErrors && <div className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded text-[9px] font-black uppercase italic"><AlertTriangle size={12}/> Error</div>}
        {status.isStale && <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-[9px] font-black uppercase italic"><Clock size={12}/> Stale</div>}
        <div className="text-zinc-600"><Server size={14} /></div>
      </div>
    </div>
  );
};
