import React, { useState, useEffect } from 'react';
import { 
  Trophy, Users, Target, RefreshCw, Filter, Award, Star, Zap, Activity,
  ChevronDown, LayoutGrid, BarChart3, Clock, MapPin, Hash, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamStanding {
  id: number;
  team_name: string;
  rank: number;
  league_points: number;
  pts_fal: number;
  pts_fts: number;
  pts_finish: number;
  r1: string;
  r2: string;
  r3: string;
  r4: string;
  r5: string;
  r6: string;
  is_inox: number;
  league_key: string;
}

interface FilterOption {
  round_group_id: number;
  round_name: string;
  season_name: string;
  league_key: string;
}

const ZRLDivisionResults: React.FC = () => {
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [results, setResults] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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
          const val = `${first.round_group_id}|${first.league_key}`;
          setSelectedOption(val);
          fetchResults(first.round_group_id, first.league_key);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      setError("Impossibile caricare le opzioni di filtro.");
      setLoading(false);
    }
  };

  const fetchResults = async (roundGroupId: number, leagueKey: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/division-results?round_group_id=${roundGroupId}&league_key=${leagueKey}`);
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

  const handleFilterChange = (rgid: number, lk: string) => {
    const val = `${rgid}|${lk}`;
    setSelectedOption(val);
    fetchResults(rgid, lk);
    setShowFilters(false);
  };

  const currentFilter = options.find(o => `${o.round_group_id}|${o.league_key}` === selectedOption);
  const inoxTeam = results.find(r => r.is_inox === 1);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <section className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-inox-orange/10 border border-inox-orange/20 rounded-full">
               <span className="text-[8px] font-black text-inox-orange uppercase tracking-widest">WTRL GC Engine</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-inox-cyan/10 border border-inox-cyan/20 rounded-full">
              <span className="text-[8px] font-black text-inox-cyan uppercase tracking-widest">Official Standings</span>
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
            ZRL <span className="text-zinc-800">LEAGUE GC</span>
          </h1>
        </div>

        {/* CUSTOM DROPDOWN FILTER */}
        <div className="relative w-full md:w-[320px]">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between text-left group hover:border-inox-orange/50 transition-all shadow-xl"
          >
            <div className="flex items-center gap-3">
              <Filter size={16} className="text-zinc-500" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Active Viewport</span>
                <span className="text-[10px] font-black uppercase text-white truncate">
                  {currentFilter ? `${currentFilter.round_name} - ${currentFilter.league_key}` : 'Seleziona Round'}
                </span>
              </div>
            </div>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 z-[100] bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar"
              >
                 {options.map((opt, i) => (
                   <button
                     key={i}
                     onClick={() => handleFilterChange(opt.round_group_id, opt.league_key)}
                     className="w-full px-6 py-4 text-left hover:bg-inox-orange/10 border-b border-zinc-800/50 last:border-0 transition-colors group"
                   >
                     <p className="text-[10px] font-black uppercase text-white group-hover:text-inox-orange transition-colors">{opt.round_name}</p>
                     <div className="flex justify-between items-center mt-1">
                        <p className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest">{opt.league_key}</p>
                        <p className="text-[8px] font-black text-zinc-700 uppercase">{opt.season_name}</p>
                     </div>
                   </button>
                 ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* QUICK STATS BENTO */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
         <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2 relative overflow-hidden group">
            <Hash size={14} className="text-zinc-600 mb-2" />
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Division Size</p>
            <p className="text-3xl font-black italic text-white">{results.length} Teams</p>
         </div>
         <div className="p-6 rounded-[2rem] bg-inox-orange/5 border border-inox-orange/10 flex flex-col gap-2 relative overflow-hidden group">
            <Star size={14} className="text-inox-orange mb-2" />
            <p className="text-[8px] font-black text-inox-orange/60 uppercase tracking-widest">INOX Position</p>
            <p className="text-3xl font-black italic text-inox-orange">{inoxTeam ? `#${inoxTeam.rank}` : 'N/A'}</p>
         </div>
         <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2 relative overflow-hidden group">
            <Trophy size={14} className="text-zinc-600 mb-2" />
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">League Points (j)</p>
            <p className="text-3xl font-black italic text-white">{inoxTeam ? inoxTeam.league_points : '0'}</p>
         </div>
         <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2 relative overflow-hidden group">
            <Activity size={14} className="text-zinc-600 mb-2" />
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Total Race Pts (e+k+i)</p>
            <p className="text-3xl font-black italic text-white">{inoxTeam ? inoxTeam.total_race_points : '0'}</p>
         </div>
      </section>

      {/* DATA VIEWPORT */}
      <section className="flex-1 bg-zinc-950 border border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <RefreshCw size={40} className="text-inox-orange animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Retrieving official GC...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
             <div className="p-8 rounded-full bg-zinc-900/50 border border-zinc-800 mb-6">
                <AlertCircle size={48} className="text-zinc-700" />
             </div>
             <p className="text-xl font-black italic text-zinc-500 uppercase tracking-tighter">No GC Data Sync</p>
             <p className="text-zinc-700 text-[10px] font-bold uppercase mt-2 tracking-widest">Please upload official WTRL JSON from Admin Panel</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-black/90 backdrop-blur-md">
                <tr className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 border-b border-zinc-900">
                  <th className="px-8 py-6 text-center w-24 bg-black/20">RANK</th>
                  <th className="px-8 py-6">TEAM NAME</th>
                  <th className="px-6 py-6 text-center text-inox-orange">LP (J)</th>
                  <th className="px-6 py-6 text-center">FAL (E)</th>
                  <th className="px-6 py-6 text-center">FTS (K)</th>
                  <th className="px-6 py-6 text-center">POS (I)</th>
                  <th className="px-8 py-6 text-center">RACE HISTORY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/30">
                {results.map((team) => {
                  const isFirst = team.rank === 1;
                  return (
                    <motion.tr 
                      key={team.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`group transition-all ${
                        team.is_inox 
                          ? 'bg-inox-orange/5 hover:bg-inox-orange/10' 
                          : 'hover:bg-zinc-900/40'
                      }`}
                    >
                      <td className="px-8 py-8 text-center">
                        <span className={`text-3xl font-black italic ${
                          isFirst ? 'text-inox-orange drop-shadow-[0_0_10px_rgba(252,103,25,0.4)]' : 'text-zinc-800 group-hover:text-zinc-600'
                        }`}>
                          #{team.rank}
                        </span>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col">
                          <span className={`font-black uppercase tracking-tight text-xl leading-none ${
                            team.is_inox ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                          }`}>
                            {team.team_name}
                          </span>
                          {team.is_inox === 1 && (
                            <div className="flex items-center gap-2 mt-2">
                               <span className="bg-inox-orange text-black px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-tighter italic">Official INOX Squadron</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-8 text-center">
                         <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-zinc-800 group-hover:border-inox-orange/40 transition-all">
                           <span className="text-xl font-black italic text-inox-orange">
                             {team.league_points}
                           </span>
                         </div>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <span className="text-xs font-black text-zinc-400">{team.pts_fal}</span>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <span className="text-xs font-black text-zinc-400">{team.pts_fts}</span>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <span className="text-xs font-black text-zinc-400">{team.pts_finish}</span>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex justify-center items-center gap-1.5">
                          {[team.r1, team.r2, team.r3, team.r4, team.r5, team.r6].map((pts, i) => (
                            pts !== "0" && pts !== null && (
                              <div key={i} className="flex flex-col items-center gap-1">
                                <span className="text-[6px] font-black text-zinc-700 uppercase tracking-tighter">R{i+1}</span>
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                  <span className="text-[10px] font-black text-zinc-500">{pts}</span>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};

export default ZRLDivisionResults;
