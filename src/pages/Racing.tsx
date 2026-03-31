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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">

          {/* Series Selector */}
          <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-700">
            <Calendar size={16} className="text-zinc-400" />
            <select 
              value={selectedSeries || ''} 
              onChange={(e) => setSelectedSeries(Number(e.target.value))}
              className="bg-transparent text-white text-sm focus:outline-none min-w-[140px]"
            >
              {series.map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.is_active ? '(Attiva)' : ''}</option>
              ))}
            </select>
          </div>

          {/* Round Selector */}
          <select 
            value={selectedRound || ''} 
            onChange={(e) => setSelectedRound(Number(e.target.value))}
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full md:w-64"
          >
            {rounds.length > 0 ? rounds.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            )) : <option value="">Nessun Round</option>}
          </select>
          
          <button 
            onClick={() => selectedRound && loadResults(selectedRound)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-[#fc6719]" size={24} />
            Classifica Round
          </h2>
          <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
            {results.length} Atleti Rilevati
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-800/30 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold text-center w-20">Pos</th>
                <th className="px-6 py-4 font-semibold">Atleta</th>
                <th className="px-6 py-4 font-semibold">Team</th>
                <th className="px-6 py-4 font-semibold">Tempo</th>
                <th className="px-6 py-4 font-semibold text-right">Punti</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/50">
              {results.map((res, idx) => (
                <tr key={res.zwid} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full text-xs font-black ${
                      idx === 0 ? 'bg-[#fc6719]/20 text-[#fc6719] border border-[#fc6719]/30' : 
                      idx === 1 ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/30' :
                      idx === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                      'text-zinc-500 bg-zinc-800/50'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-white group-hover:text-[#00f0ff] transition-colors">{res.name}</div>
                    <div className="text-[10px] text-zinc-500">ZWID: {res.zwid}</div>
                  </td>

                  <td className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{res.team}</td>

                  <td className="px-6 py-4 font-mono text-sm text-zinc-300">
                    {new Date(res.time * 1000).toISOString().substr(11, 8)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-black text-white">{res.points_total}</span>
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
