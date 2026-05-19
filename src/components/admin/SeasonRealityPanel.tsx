import React from 'react';
import { Database, Layout, Target } from 'lucide-react';

export default function SeasonRealityPanel() {
  const Status = ({ active, label }: { active: boolean, label: string }) => (
    <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
        <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'text-green-400' : 'text-red-400'}`}>
            {label}
        </span>
    </div>
  );

  return (
    <div className="bg-[#11131a] border border-gray-800 p-8 rounded-[2rem] shadow-xl h-full backdrop-blur-sm relative overflow-hidden flex flex-col">
        <div className="flex justify-between items-start mb-8 text-left">
            <div className="flex items-center gap-2">
                <Database size={16} className="text-blue-500" />
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">REALITY PANEL</h3>
            </div>
            <span className="text-[9px] font-black text-gray-700 bg-black/40 px-2 py-1 rounded-lg border border-gray-800/50 uppercase tracking-widest">Live D1 State</span>
        </div>
        
        <div className="space-y-8 flex-1 text-left">
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-2 border-gray-800 pl-3">
                    <Layout size={12} className="text-gray-600" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Season Assets</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#090a10] p-4 rounded-2xl border border-gray-800/50 shadow-inner">
                        <span className="block text-[8px] font-black text-gray-600 uppercase mb-1">Total Teams</span>
                        <span className="text-xl font-black text-white italic">42</span>
                    </div>
                    <div className="bg-[#090a10] p-4 rounded-2xl border border-gray-800/50 shadow-inner">
                        <span className="block text-[8px] font-black text-gray-600 uppercase mb-1">Athletes Pool</span>
                        <span className="text-xl font-black text-blue-500 italic">218</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-800/30">
                <div className="flex items-center gap-2 border-l-2 border-blue-500/50 pl-3">
                    <Target size={12} className="text-blue-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Round Reality</span>
                </div>

                <div className="space-y-3 px-1 text-left">
                    <div className="flex justify-between items-end bg-black/20 p-3 rounded-xl border border-gray-800/30">
                        <span className="text-[9px] font-bold text-gray-500 uppercase text-left">Gare Configurate</span>
                        <span className="text-lg font-black text-white leading-none tracking-tighter">8 / 8</span>
                    </div>
                    <div className="flex justify-between items-end bg-black/20 p-3 rounded-xl border border-gray-800/30">
                        <span className="text-[9px] font-bold text-gray-500 uppercase text-left">Lineup Generate</span>
                        <span className="text-lg font-black text-white leading-none tracking-tighter">12 / 12</span>
                    </div>
                    <div className="flex justify-between items-end bg-black/20 p-3 rounded-xl border border-gray-800/30">
                        <span className="text-[9px] font-bold text-gray-500 uppercase text-left">Risultati Ingested</span>
                        <span className="text-lg font-black text-orange-500 leading-none tracking-tighter">6 / 8</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col gap-4">
            <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-gray-800/50">
                <Status active={true} label="Season Header" />
                <Status active={true} label="Round Context" />
                <Status active={false} label="Sync Lock" />
            </div>
            <div className="flex justify-between text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] px-1 text-left">
                <span>Last DB Write</span>
                <span className="text-gray-400 font-mono">19.05.2026 12:05</span>
            </div>
        </div>
    </div>
  );
}
