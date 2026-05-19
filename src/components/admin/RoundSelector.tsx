import React from 'react';
import { Layers, CheckCircle2, Circle, Info } from 'lucide-react';
import { useSeasonInit } from '../../pages/admin/SeasonInitContext';

export default function RoundSelector() {
  const { activeRound, setActiveRound } = useSeasonInit();
  const rounds = [1, 2, 3, 4];

  return (
    <div className="bg-[#11131a] border border-gray-800 p-4 rounded-xl shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none">02</span>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Round Context</h2>
        </div>
        <div className="group relative">
            <Info size={12} className="text-zinc-700 hover:text-blue-500 transition-colors cursor-help" />
            <div className="absolute z-50 invisible group-hover:visible bg-black border border-gray-700 p-2 rounded-lg w-48 -right-2 top-6 shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all">
                <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight">Imposta il contesto per le azioni di import e sync.</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-1">
        {rounds.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRound(r)}
            className={`
              flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200
              ${activeRound === r
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-[#090a10] border-gray-800 text-gray-500 hover:border-gray-700'
              }
            `}
          >
            <span className={`text-[8px] font-black uppercase tracking-tighter ${activeRound === r ? 'text-blue-100' : 'text-gray-600'}`}>R0{r}</span>
            <span className={`text-[10px] font-black italic uppercase leading-none ${activeRound === r ? 'text-white' : 'text-gray-500'}`}>OP</span>
          </button>
        ))}
      </div>
    </div>
  );
}
