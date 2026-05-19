import React from 'react';
import { Activity, CheckCircle2, Zap } from 'lucide-react';
import { useSeasonInit } from '../../pages/admin/SeasonInitContext';

export default function ImportProgress() {
  const { activeRound } = useSeasonInit();
  
  const bars = [
    { label: "Teams Sync", value: 12, total: 12 },
    { label: "Races Data", value: 8, total: 8 },
    { label: "Roster Ingest", value: 42, total: 142 },
    { label: "Results Map", value: 0, total: 8 },
  ];

  const ProgressBar = ({ value, total }: { value: number, total: number }) => {
    const percentage = Math.min(100, (value / total) * 100);
    const isComplete = value === total && total > 0;
    
    return (
      <div className="w-full bg-[#090a10] rounded-full h-1.5 overflow-hidden border border-gray-800/30">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            isComplete ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className="bg-[#11131a] border border-gray-800 p-8 rounded-[2rem] shadow-xl h-full backdrop-blur-sm relative overflow-hidden flex flex-col">
      <div className="flex justify-between items-start mb-8 text-left">
        <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-500" />
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">IMPORT PROGRESS</h3>
        </div>
        <div className="bg-blue-600/10 border border-blue-500/20 px-3 py-1 rounded-lg">
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                Round 0{activeRound}
            </span>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 font-bold uppercase mb-8 leading-relaxed text-left">
        Stato di completamento dei task di sincronizzazione per la mini-season corrente.
      </p>

      <div className="space-y-6 flex-1 text-left">
        {bars.map((b) => (
          <div key={b.label} className="group text-left">
            <div className="flex justify-between items-center text-[10px] mb-2 font-black uppercase tracking-tight">
              <span className="text-gray-400 group-hover:text-white transition-colors">{b.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-100 font-mono">
                    {b.value} / {b.total}
                </span>
                {b.value === b.total && b.total > 0 && (
                    <CheckCircle2 size={12} className="text-green-500" />
                )}
              </div>
            </div>
            <ProgressBar value={b.value} total={b.total} />
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Zap size={12} className="text-orange-500" />
              <span className="text-[9px] font-black text-gray-600 uppercase">Operational Status</span>
          </div>
          <button className="text-blue-500 text-[9px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors">
              Details →
          </button>
      </div>
    </div>
  );
}
