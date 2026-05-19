import React from 'react';
import { Info } from 'lucide-react';
import { useSeasonInit } from '../../pages/admin/SeasonInitContext';

export default function SeasonSelector() {
  const { selectedSeasonId, setSelectedSeasonId, seasons } = useSeasonInit();

  return (
    <div className="bg-[#11131a] p-4 rounded-xl border border-gray-800 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none">01</span>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stagione</h2>
        </div>
        <div className="group relative">
            <Info size={12} className="text-zinc-700 hover:text-blue-500 transition-colors cursor-help" />
            <div className="absolute z-50 invisible group-hover:visible bg-black border border-gray-700 p-2 rounded-lg w-48 -right-2 top-6 shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all">
                <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight">Seleziona la stagione globale su cui operare.</p>
            </div>
        </div>
      </div>

      <div className="relative">
        <select 
          value={selectedSeasonId || ''} 
          onChange={(e) => setSelectedSeasonId(Number(e.target.value))}
          className="w-full bg-[#090a10] border border-gray-800 text-gray-200 text-xs p-3 rounded-lg appearance-none cursor-pointer hover:border-blue-500/50 outline-none transition-all font-bold"
        >
          {seasons.map((s: any) => (
            <option key={s.id} value={s.id} className="bg-[#11131a]">
              {s.name} {s.is_active ? '(ACTIVE)' : ''}
            </option>
          ))}
          {seasons.length === 0 && <option disabled>Nessuna stagione</option>}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>

      <button className="mt-3 w-full py-2 bg-blue-600/5 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
        + Nuova Stagione
      </button>
    </div>
  );
}
