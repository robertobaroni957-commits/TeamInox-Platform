import React from 'react';
import { useRoundControl } from '../../pages/admin/RoundControlContext';

export default function RoundSelector() {
    const { rounds, selectedRoundId, setSelectedRoundId, setSelectedWtrlId } = useRoundControl();

    const handleRoundChange = (round: any) => {
        setSelectedRoundId(round.id);
        setSelectedWtrlId(round.wtrl_id);
    };

    return (
        <div className="bg-[#11131a] p-8 rounded-[2.5rem] border border-gray-800 shadow-xl h-full flex flex-col">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6 pl-1">Round Context</h3>
            <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                {rounds.map((r: any) => (
                    <button 
                        key={r.id}
                        onClick={() => handleRoundChange(r)}
                        className={`p-6 rounded-2xl border transition-all text-left flex flex-col gap-2 relative overflow-hidden group active:scale-[0.98] ${
                            selectedRoundId === r.id 
                            ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-900/20' 
                            : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-600 hover:bg-zinc-900/60 shadow-md'
                        }`}
                    >
                        {selectedRoundId === r.id && (
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                        )}
                        
                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                            <span className="italic">{r.name || `Round ${r.round_number || r.id}`}</span>
                            <span className={`font-mono px-2 py-0.5 rounded text-[10px] ${selectedRoundId === r.id ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                WTRL:{r.wtrl_id}
                            </span>
                        </div>
                        
                        {r.starts_at && (
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-tight ${selectedRoundId === r.id ? 'text-blue-100' : 'text-zinc-500'}`}>
                                    {new Date(r.starts_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} 
                                    <span className="mx-2 opacity-30">—</span>
                                    {new Date(r.ends_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                        )}

                        <div className={`h-1 w-0 group-hover:w-full transition-all duration-500 rounded-full mt-1 ${selectedRoundId === r.id ? 'bg-white/40' : 'bg-blue-500/40'}`}></div>
                    </button>
                ))}

                {rounds.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-3xl bg-black/10">
                        <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em] italic leading-relaxed px-10">
                            Nessun round trovato per questa stagione
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
