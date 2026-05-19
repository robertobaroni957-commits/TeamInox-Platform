import React from 'react';
import { Info } from 'lucide-react';

export default function ImportOptions() {
  return (
    <div className="bg-[#11131a] border border-gray-800 p-4 rounded-xl shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none">04</span>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opzioni</h2>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] font-black text-gray-500 uppercase block mb-1">Sorgente</label>
            <select className="w-full bg-[#090a10] border border-gray-800 text-gray-200 text-[10px] p-1.5 rounded outline-none">
              <option>WTRL (Live)</option>
              <option>CSV</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black text-gray-500 uppercase block mb-1">Modo</label>
            <select className="w-full bg-[#090a10] border border-gray-800 text-gray-200 text-[10px] p-1.5 rounded outline-none">
              <option>Full</option>
              <option>Delta</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-gray-800/50">
          <span className="text-[9px] font-bold text-gray-500 uppercase">Simulazione (Dry)</span>
          <input 
            type="checkbox" 
            className="w-3 h-3 rounded border-gray-600 bg-[#090a10] accent-blue-600 cursor-pointer" 
          />
        </div>
      </div>
    </div>
  );
}
