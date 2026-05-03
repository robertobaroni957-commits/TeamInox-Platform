import React, { useState, useEffect } from 'react';
import { Trophy, Users, Timer, Target, ChevronRight, Hash } from 'lucide-react';

interface DivisionResult {
  id: number;
  rider_name: string;
  team_name: string;
  position: number;
  time: number;
  points_finish: number;
  points_fal: number;
  points_fts: number;
  points_total: number;
  is_inox: number;
  league_key: string;
}

interface FilterOption {
  round_id: number;
  league_key: string;
  round_name: string;
}

const ZRLDivisionResults: React.FC = () => {
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [results, setResults] = useState<DivisionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await fetch('/api/division-results');
      const data = await res.json();
      if (data.success) {
        setOptions(data.options);
        if (data.options.length > 0) {
          const first = data.options[0];
          const val = `${first.round_id}|${first.league_key}`;
          setSelectedOption(val);
          fetchResults(first.round_id, first.league_key);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      setError("Impossibile caricare le opzioni di filtro.");
      setLoading(false);
    }
  };

  const fetchResults = async (roundId: number, leagueKey: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/division-results?round_id=${roundId}&league_key=${leagueKey}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      setError("Errore nel caricamento dei risultati.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedOption(val);
    const [rid, key] = val.split('|');
    fetchResults(parseInt(rid), key);
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "--:--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds - Math.floor(seconds)) * 100);
    
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-[#0a0a0a] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <Trophy className="text-orange-500" size={40} />
            Classifiche <span className="text-orange-500">ZRL Division</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-xs tracking-[0.2em] mt-2">Risultati completi importati da WTRL</p>
        </div>

        <div className="flex flex-col gap-2 min-w-[300px]">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Seleziona Gara e Lega</label>
          <select 
            value={selectedOption}
            onChange={handleFilterChange}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 font-bold text-white focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer"
          >
            {options.map((opt, i) => (
              <option key={i} value={`${opt.round_id}|${opt.league_key}`}>
                {opt.round_name} - {opt.league_key}
              </option>
            ))}
            {options.length === 0 && <option>Nessun dato disponibile</option>}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-zinc-500 font-black uppercase italic tracking-widest">Caricamento Classifica...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center text-red-500 font-bold">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="py-20 text-center bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-800">
          <Users className="mx-auto text-zinc-700 mb-4" size={48} />
          <p className="text-zinc-500 font-black uppercase italic tracking-widest text-xl">Nessun risultato trovato</p>
          <p className="text-zinc-600 text-xs mt-2 uppercase font-bold">Importa i risultati dalla dashboard per popolare questa vista.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/60 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-800">
                  <th className="px-6 py-5 text-center w-20"><Hash size={14} className="mx-auto" /></th>
                  <th className="px-6 py-5">Corridore / Team</th>
                  <th className="px-6 py-5 text-center"><Timer size={14} className="mx-auto" /></th>
                  <th className="px-6 py-5 text-center">FINISH</th>
                  <th className="px-6 py-5 text-center">FAL</th>
                  <th className="px-6 py-5 text-center">FTS</th>
                  <th className="px-6 py-5 text-center text-orange-500">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {results.map((rider, index) => {
                  const isFirst = rider.position === 1;
                  return (
                    <tr 
                      key={rider.id} 
                      className={`group transition-all ${
                        rider.is_inox 
                          ? 'bg-orange-500/10 hover:bg-orange-500/20' 
                          : 'hover:bg-zinc-800/30'
                      }`}
                    >
                      <td className="px-6 py-5 text-center">
                        <span className={`text-2xl font-black italic ${
                          isFirst ? 'text-orange-500' : 'text-zinc-700 group-hover:text-zinc-500'
                        }`}>
                          {rider.position ? `#${rider.position}` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className={`font-black uppercase tracking-tight text-lg ${
                            rider.is_inox ? 'text-orange-400' : 'text-white'
                          }`}>
                            {rider.rider_name}
                          </span>
                          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            {rider.team_name}
                            {rider.is_inox === 1 && (
                              <span className="bg-orange-500 text-black px-1.5 py-0.5 rounded text-[8px] font-black ml-2">INOX</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center font-mono text-zinc-400">
                        {formatTime(rider.time)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-bold text-zinc-300">{rider.points_finish}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-bold text-zinc-300">{rider.points_fal}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-bold text-zinc-300">{rider.points_fts}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:border-orange-500/50 transition-colors">
                          <span className="text-xl font-black italic text-orange-500">
                            {rider.points_total}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZRLDivisionResults;
