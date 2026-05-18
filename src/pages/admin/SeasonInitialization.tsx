import React, { useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Copy, Database, Trophy, Upload, Loader2, Trash2, Zap, RefreshCw } from 'lucide-react';
import { useZRLReality } from '../../services/ZRLRealityProvider';
import { useSeasonStatus } from '../../hooks/useSeasonStatus';
import { LiveLogPanel } from '../../components/admin/LiveLogPanel';

const SeasonInitialization: React.FC = () => {
  const { seasons, mutate: triggerRefresh } = useZRLReality();
  const activeSeason = Array.isArray(seasons?.data) ? seasons.data.find((s: any) => s.is_active) : null;
  const seasonId = (activeSeason?.external_season_id ?? 19).toString();
  
  // Pure API-driven state
  const { status, loading: statusLoading } = useSeasonStatus(seasonId);
  const [loading, setLoading] = useState<string | null>(null);

  const handleApiAction = async (endpoint: string, method: string = 'POST', body?: any) => {
    setLoading(endpoint);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await response.json();
      if (!response.ok || (data.error && !data.success)) throw new Error(data.error || 'Operazione fallita');
      toast.success("Operazione completata con successo");
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Season Initialization</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Operational Command Center</p>
        </div>
        <div className="text-right">
            <span className={`text-4xl font-black ${status?.lifecycle?.isReady ? 'text-green-500' : 'text-[#fc6719]'}`}>
                {status?.lifecycle?.isReady ? 'READY' : 'NOT INITIALIZED'}
            </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* 1. Lifecycle Controls */}
            <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                <h2 className="text-sm font-black uppercase text-zinc-400 mb-6">Season Lifecycle</h2>
                <div className="flex gap-4">
                    <button onClick={() => handleApiAction('/api/admin/season/activate')} className="bg-zinc-800 text-white font-black uppercase px-6 py-3 rounded-xl hover:bg-green-900">Activate</button>
                    <button onClick={() => handleApiAction('/api/admin/season/archive')} className="bg-zinc-800 text-white font-black uppercase px-6 py-3 rounded-xl hover:bg-zinc-700">Archive</button>
                    <button onClick={() => handleApiAction('/api/admin/season/reset')} className="bg-zinc-800 text-white font-black uppercase px-6 py-3 rounded-xl hover:bg-red-900">Reset</button>
                </div>
            </section>

            {/* 2, 3, 4. Data Imports */}
            <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 space-y-6">
                <h2 className="text-sm font-black uppercase text-zinc-400 mb-6">Data Imports</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => navigator.clipboard.writeText(`https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&action=teamlist`)} className="bg-zinc-800 text-white font-bold uppercase p-4 rounded-xl text-xs flex items-center justify-center gap-2"><Copy size={16}/> Copy Teams URL</button>
                    <button onClick={() => navigator.clipboard.writeText(`https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&action=roster`)} className="bg-zinc-800 text-white font-bold uppercase p-4 rounded-xl text-xs flex items-center justify-center gap-2"><Copy size={16}/> Copy Roster URL</button>
                    <button onClick={() => handleApiAction('/api/admin/season/sync')} className="bg-[#fc6719] text-black font-black uppercase p-4 rounded-xl text-xs flex items-center justify-center gap-2"><RefreshCw size={16}/> Full Sync</button>
                </div>
            </section>
        </div>

        {/* 5. Logs */}
        <aside>
            <LiveLogPanel logs={status?.logs || []} />
        </aside>
      </div>
    </div>
  );
};

export default SeasonInitialization;
