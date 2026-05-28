import React, { useMemo } from 'react';
import { Info } from 'lucide-react';
import { useRoundControl } from '../../pages/admin/RoundControlContext';

export default function SeasonSelector() {
  const { selectedSeasonCode, setSelectedSeasonCode, seasons } = useRoundControl();

  /**
   * CLEAN VIEW MODEL (NO SPORCIZIA DB)
   */
  const cleanSeasons = useMemo(() => {
    return (seasons || [])
      .filter((s: any) => s && typeof s === 'object')
      .filter((s: any) => s.code != null)
      .filter((s: any) => s.name && s.name.trim() !== '')
      // dedupe per code
      .filter(
        (s: any, index: number, self: any[]) =>
          index === self.findIndex(x => x.code === s.code)
      );
  }, [seasons]);

  return (
    <div className="bg-[#11131a] p-8 rounded-[2rem] border border-gray-800 shadow-xl h-full flex flex-col justify-center">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-lg leading-none shadow-lg shadow-blue-900/20">
            01
          </span>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
            Stagione Attiva
          </h2>
        </div>

        <div className="group relative">
          <Info size={18} className="text-zinc-700 hover:text-blue-500 transition-colors cursor-help" />
          <div className="absolute z-50 invisible group-hover:visible bg-black border border-zinc-800 p-4 rounded-xl w-64 -right-2 top-8 shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 pointer-events-none">
            <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed tracking-wider">Seleziona la stagione di riferimento per filtrare i round e le gare visualizzate.</p>
          </div>
        </div>
      </div>

      {/* SELECT */}
      <div className="relative">
        <select
          value={selectedSeasonCode || ''}
          onChange={(e) => setSelectedSeasonCode(e.target.value || null)}
          className="w-full bg-[#090a10] border-2 border-gray-800 text-white text-sm p-5 rounded-2xl appearance-none cursor-pointer hover:border-blue-500/50 outline-none transition-all font-black tracking-tight shadow-inner"
        >
          <option value="" className="bg-[#090a10]">Tutte le Stagioni</option>
          {cleanSeasons.map((s: any) => (
            <option key={s.code} value={s.code} className="bg-[#090a10] py-4 uppercase">
              {s.name}
            </option>
          ))}
        </select>

        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="4">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
