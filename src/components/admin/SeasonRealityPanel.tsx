import React from 'react';
import { Database, Layout, Target } from 'lucide-react';
import { useRoundControl } from '../../pages/admin/RoundControlContext';

export default function RoundRealityPanel() {
  const { activeRound, selectedSeasonCode, activeRaces } = useRoundControl();
  
  const Status = ({ active, label }: { active: boolean, label: string }) => (
    <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
        <span className={`text-[11px] font-bold uppercase tracking-wide ${active ? 'text-green-400' : 'text-red-400'}`}>
            {label}
        </span>
    </div>
  );

  const displayRaces = React.useMemo(() => {
    const map = new Map<string, any>();

    if (!activeRaces || !Array.isArray(activeRaces)) return [];
activeRaces
  .filter(r => {
    if (!r || !r.name) return false;
    const n = r.name.toUpperCase();
    // Filtriamo per mantenere solo gare che seguono il pattern 'RACE X'
    // Escludiamo esplicitamente 'ROUND' e 'ARCHIVED'
    return !n.includes('ARCHIVED') && !n.includes('ROUND') && /RACE\s+\d+/.test(n);
  })
  .forEach(r => {
    // ... (rest of the logic)
        // Pulizia profonda del nome: "Race 1 (A)" -> "RACE 1"
        const cleanName = r.name.replace(/\s*\([A-Z]\)$/i, '').trim().toUpperCase();
        const category = r.subgroup_label || 'A';

        if (!map.has(cleanName)) {
          // Usiamo il nome originale senza categoria per la visualizzazione
          const displayName = r.name.replace(/\s*\([A-Z]\)$/i, '').trim();
          map.set(cleanName, { ...r, name: displayName, categories: [category] });
        } else {
          const existing = map.get(cleanName);
          if (!existing.categories.includes(category)) {
              existing.categories.push(category);
              existing.categories.sort();
          }
        }
      });

    return Array.from(map.values()).sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });
  }, [activeRaces]);

  return (
    <div className="bg-[#11131a] border border-gray-800 p-10 rounded-[2.5rem] shadow-xl h-full backdrop-blur-sm relative overflow-hidden flex flex-col">
        {/* ... (rest of the component) */}
        <div className="flex justify-between items-start mb-10 text-left">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <Database size={24} />
                </div>
                <h3 className="text-base font-black text-gray-200 uppercase tracking-[0.2em]">ROUND REALITY PANEL</h3>
            </div>
            <span className="text-xs font-bold text-gray-400 bg-black/40 px-4 py-1.5 rounded-lg border border-gray-800/50 uppercase tracking-widest">Live D1 State</span>
        </div>
        
        <div className="space-y-10 flex-1 text-left">
            <div className="space-y-5">
                <div className="flex items-center gap-3 border-l-4 border-gray-700 pl-5">
                    <Layout size={18} className="text-gray-500" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Metadata Context</span>
                </div>
                
                <div className="bg-[#090a10] p-6 rounded-2xl border border-gray-800 shadow-inner">
                    <span className="block text-[10px] font-black text-gray-600 uppercase mb-3 tracking-widest">Season Code</span>
                    <span className="text-3xl font-black text-white italic tracking-tight">{selectedSeasonCode || activeRound?.season_code || '---'}</span>
                </div>
            </div>

            <div className="space-y-5 pt-6 border-t border-gray-800/30">
                <div className="flex items-center gap-3 border-l-4 border-blue-500/50 pl-5">
                    <Target size={18} className="text-blue-500" />
                    <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Active Round Reality</span>
                </div>

                <div className="space-y-4 px-1 text-left">
                    <div className="flex justify-between items-center bg-black/20 p-5 rounded-2xl border border-gray-800/30">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Round Name</span>
                        <span className="text-lg font-black text-white tracking-tight italic uppercase">{activeRound?.name || '---'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-5 rounded-2xl border border-gray-800/30">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule</span>
                        <span className="text-sm font-black text-gray-200 tracking-tight">
                            {activeRound?.starts_at ? `${activeRound.starts_at} / ${activeRound.ends_at}` : '---'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-5 rounded-2xl border border-gray-800/30">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">WTRL ID</span>
                        <span className="text-lg font-black text-blue-400 tracking-tight font-mono">{activeRound?.wtrl_id || '---'}</span>
                    </div>
                </div>
            </div>

            {/* NUOVA SEZIONE: GARE DEL ROUND */}
            <div className="space-y-5 pt-6 border-t border-gray-800/30">
                <div className="flex items-center justify-between border-l-4 border-orange-500/50 pl-5">
                    <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Races in this Round</span>
                    <span className="text-xs font-black bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full border border-orange-500/20">{displayRaces?.length || 0}</span>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                    {displayRaces.length > 0 ? (
                        displayRaces.map((race) => (
                            <div key={race.name} className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all shadow-sm">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-black text-white italic uppercase tracking-wider">{race.name}</span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded border border-zinc-800">
                                            {race.date ? new Date(race.date).toLocaleDateString('it-IT', {day: '2-digit', month: 'short'}) : 'TBD'}
                                        </span>
                                        <div className="flex gap-1">
                                            {race.categories?.map((cat: string) => (
                                                <span key={cat} className="text-[9px] font-black bg-orange-500/10 text-orange-500 px-1.5 rounded border border-orange-500/20 uppercase">{cat}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase truncate">
                                        {race.world} <span className="text-zinc-600 mx-1">•</span> <span className="text-zinc-500">{race.route}</span>
                                    </p>
                                </div>
                                <div className={`h-2 w-2 rounded-full ml-4 shadow-sm ${race.status === 'completed' ? 'bg-green-500 shadow-green-500/20' : 'bg-zinc-700'}`}></div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed border-zinc-800 rounded-3xl bg-black/10">
                            <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em] italic">Nessuna gara importata</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col gap-4">
            <div className="flex justify-between items-center bg-zinc-900/50 p-5 rounded-2xl border border-gray-800/50">
                <Status active={activeRound !== null && activeRound !== undefined} label="Round Bound" />
                <Status active={Boolean(selectedSeasonCode || activeRound?.season_code)} label="Metadata Bound" />
            </div>
        </div>
    </div>
  );
}
