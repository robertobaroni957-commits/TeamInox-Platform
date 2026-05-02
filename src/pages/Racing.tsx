// src/pages/Racing.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Round, RaceResult, Series } from '../services/types';
import { Trophy, RefreshCw, Calendar } from 'lucide-react';

const Racing: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      const data = await api.getSeries();
      setSeries(data);
      const active = data.find(s => s.is_active) || data[0];
      if (active) setSelectedSeries(active.id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedSeries) loadRounds(selectedSeries);
  }, [selectedSeries]);

  const loadRounds = async (seriesId: number) => {
    try {
      const data = await api.getRounds(seriesId);
      setRounds(data);
      if (data.length > 0) setSelectedRound(data[0].id);
      else setSelectedRound(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedRound) loadResults(selectedRound);
    else setResults([]);
  }, [selectedRound]);

  const loadResults = async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getResults(id);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">

          {/* Series Selector */}
          <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50">
            <Calendar size={14} className="text-zinc-500" />
            <select 
              value={selectedSeries || ''} 
              onChange={(e) => setSelectedSeries(Number(e.target.value))}
              className="bg-transparent text-white text-xs font-bold focus:outline-none min-w-[120px]"
            >
              {series.map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.is_active ? '★' : ''}</option>
              ))}
            </select>
          </div>

          {/* Round Selector */}
          <select 
            value={selectedRound || ''} 
            onChange={(e) => setSelectedRound(Number(e.target.value))}
            className="bg-zinc-800/50 text-white px-3 py-1.5 rounded-lg border border-zinc-700/50 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full sm:w-48"
          >
            {rounds.length > 0 ? rounds.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            )) : <option value="">Nessun Round</option>}
          </select>
          
          <button 
            onClick={() => selectedRound && loadResults(selectedRound)}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl flex flex-col max-h-[calc(100vh-200px)]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 shrink-0">
          <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase italic tracking-tight">
            <Trophy className="text-[#fc6719]" size={20} />
            Classifica Round
          </h2>
          <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">
            {results.length} Riders
          </span>
        </div>

        <div className="overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-zinc-900 shadow-sm">
              <tr className="bg-zinc-800/40 text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">
                <th className="px-4 py-3 text-center w-16 border-b border-zinc-800">Pos</th>
                <th className="px-4 py-3 border-b border-zinc-800">Atleta</th>
                <th className="px-4 py-3 border-b border-zinc-800">Team</th>
                <th className="px-4 py-3 border-b border-zinc-800">Tempo</th>
                <th className="px-4 py-3 text-right border-b border-zinc-800">Punti</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/30">
              {results.map((res, idx) => (
                <tr key={res.zwid} className="hover:bg-zinc-800/20 transition-colors group">
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-[10px] font-black ${
                      idx === 0 ? 'bg-[#fc6719]/20 text-[#fc6719] border border-[#fc6719]/30' : 
                      idx === 1 ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/30' :
                      idx === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                      'text-zinc-600 bg-zinc-950'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>

                  <td className="px-4 py-2.5">
                    <div className="font-bold text-sm text-white group-hover:text-[#00f0ff] transition-colors leading-none">{res.name}</div>
                    <div className="text-[9px] text-zinc-600 font-medium mt-0.5">ZWID: {res.zwid}</div>
                  </td>

                  <td className="px-4 py-2.5 text-[10px] font-black text-zinc-500 uppercase tracking-tight">{res.team}</td>

                  <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">
                    {new Date(res.time * 1000).toISOString().substr(11, 8)}
                  </td>

                  <td className="px-4 py-2.5 text-right">
                    <span className="text-base font-black text-white italic">{res.points_total}</span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default Racing;
