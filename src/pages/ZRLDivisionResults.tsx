import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Users, Target, RefreshCw, Filter, Award, Star, Zap, Activity,
  ChevronDown, LayoutGrid, BarChart3, Clock, MapPin, Hash, AlertCircle,
  Camera, Shield, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

interface TeamStanding {
  id: number;
  team_name: string;
  rank: number;
  league_points: number;
  pts_fal: number;
  pts_fts: number;
  pts_finish: number;
  total_race_points: number;
  league_name: string;
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
  league_display_name: string;
}

const ZRLDivisionResults: React.FC = () => {
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [results, setResults] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [snapshotMode, setSnapshotMode] = useState(false);
  
  const captureRef = useRef<HTMLDivElement>(null);

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

  const handleCapture = async () => {
    if (captureRef.current) {
      try {
        const canvas = await html2canvas(captureRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#050505',
        });
        const link = document.createElement('a');
        link.download = `zrl_rankings_${currentFilter?.league_key}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (e) {
        console.error("Capture error:", e);
      }
    }
  };

  const currentFilter = options.find(o => `${o.round_group_id}|${o.league_key}` === selectedOption);
  const inoxTeam = results.find(r => r.is_inox === 1);

  const formatLeagueName = (opt: FilterOption) => {
    if (opt.league_display_name && opt.league_display_name !== 'NULL') return opt.league_display_name;
    const key = opt.league_key;
    if (key.length >= 7) {
      const l = key.substring(0, 3);
      const c = key.substring(4, 5);
      const n = key.substring(5, 6);
      return `League ${l} - ${c}${n}`;
    }
    return key;
  };

  return (
    <div className={`transition-all duration-500 ${snapshotMode ? 'bg-[#050505] p-0 overflow-hidden' : 'space-y-8 pb-20 animate-in fade-in duration-700 px-6 pt-6'}`}>
      
      {/* HEADER SECTION (Hidden in snapshot) */}
      {!snapshotMode && (
        <section className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-inox-orange/10 border border-inox-orange/20 rounded-full">
                 <span className="text-[9px] font-black text-inox-orange uppercase tracking-[0.2em]">WTRL GC Engine</span>
              </div>
              <div className="px-3 py-1 bg-inox-cyan/10 border border-inox-cyan/20 rounded-full">
                <span className="text-[9px] font-black text-inox-cyan uppercase tracking-[0.2em]">Official Standings</span>
              </div>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
              ZRL <span className="text-zinc-700">LEAGUE GC</span>
            </h1>
            <p className="text-zinc-400 font-bold italic text-sm uppercase tracking-widest italic">
               Classifica Generale ufficiale aggiornata all'ultimo Round operativo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            {/* CUSTOM DROPDOWN FILTER */}
            <div className="relative flex-1 md:flex-none md:w-[400px]">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full px-6 py-5 bg-zinc-900/60 border border-zinc-800 rounded-[1.5rem] flex items-center justify-between text-left group hover:border-inox-orange/50 transition-all shadow-2xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-4 min-w-0 overflow-hidden">
                  <Filter size={18} className="text-zinc-500 shrink-0 group-hover:text-inox-orange transition-colors" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] leading-none mb-1.5">Active Viewport</span>
                    <span className="text-[11px] font-black uppercase text-white truncate pr-2 tracking-widest">
                      {currentFilter ? `${currentFilter.round_name} • ${formatLeagueName(currentFilter)}` : 'Seleziona Round'}
                    </span>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-zinc-500 shrink-0 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-3 z-[100] bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden max-h-[450px] overflow-y-auto custom-scrollbar backdrop-blur-md"
                  >
                     <div className="p-4 border-b border-zinc-800 bg-black/20">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Seleziona Divisione</p>
                     </div>
                     {options.map((opt, i) => (
                       <button
                         key={i}
                         onClick={() => handleFilterChange(opt.round_group_id, opt.league_key)}
                         className="w-full px-6 py-4 text-left hover:bg-inox-orange/10 border-b border-zinc-800/50 last:border-0 transition-all group"
                       >
                         <p className="text-xs font-black uppercase text-white group-hover:text-inox-orange transition-colors tracking-tight">{opt.round_name}</p>
                         <div className="flex justify-between items-center mt-1.5">
                            <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">{formatLeagueName(opt)}</p>
                            <p className="text-[8px] font-black text-zinc-700 uppercase">{opt.season_name}</p>
                         </div>
                       </button>
                     ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setSnapshotMode(true)}
              className="p-5 bg-white text-black rounded-2xl hover:bg-inox-orange transition-all shadow-2xl hover:scale-105 active:scale-95"
            >
              <Camera size={20} />
            </button>
          </div>
        </section>
      )}

      <div ref={captureRef} className={snapshotMode ? 'w-[1080px] h-[1080px] bg-[#050505] p-12 flex flex-col justify-center border-[20px] border-zinc-900 mx-auto relative' : 'space-y-8'}>
        
        {/* SNAPSHOT HEADER */}
        {snapshotMode && (
          <div className="absolute top-12 left-12 right-12 flex items-center gap-5">
            <div className="w-20 h-20 bg-inox-orange flex items-center justify-center rounded-[2rem] shadow-[0_0_40px_rgba(252,103,25,0.3)]">
              <Shield size={40} className="text-black" />
            </div>
            <div className="flex flex-col">
               <h2 className="text-4xl font-black italic text-white leading-none tracking-tighter uppercase">INOXTEAM <span className="text-zinc-700">Rankings</span></h2>
               <p className="text-inox-orange font-black uppercase tracking-[0.4em] text-sm mt-1">Official Division GC</p>
            </div>
            <div className="ml-auto text-right">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{currentFilter?.round_name}</p>
                <p className="text-xl font-black text-white uppercase italic">{currentFilter ? formatLeagueName(currentFilter) : ''}</p>
            </div>
          </div>
        )}

        {/* QUICK STATS BENTO */}
        <section className={`grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0 ${snapshotMode ? 'mt-20 mb-8' : ''}`}>
           <div className="p-6 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl backdrop-blur-sm">
              <Hash size={16} className="text-zinc-600 mb-2" />
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Division Size</p>
              <p className={`${snapshotMode ? 'text-5xl' : 'text-4xl'} font-black italic text-white tracking-tighter`}>{results.length} Teams</p>
           </div>
           <div className="p-6 rounded-[2.5rem] bg-inox-orange/10 border border-inox-orange/20 flex flex-col gap-2 relative overflow-hidden group hover:border-inox-orange/40 transition-all shadow-2xl backdrop-blur-sm">
              <div className="absolute -top-2 -right-2 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                 <Star size={80} />
              </div>
              <Star size={16} className="text-inox-orange mb-2" />
              <p className="text-[9px] font-black text-inox-orange/70 uppercase tracking-widest">INOX Position</p>
              <p className={`${snapshotMode ? 'text-5xl' : 'text-4xl'} font-black italic text-inox-orange tracking-tighter`}>{inoxTeam ? `#${inoxTeam.rank}` : 'N/A'}</p>
           </div>
           <div className="p-6 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl backdrop-blur-sm">
              <Trophy size={16} className="text-zinc-600 mb-2" />
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">League Points (j)</p>
              <p className={`${snapshotMode ? 'text-5xl' : 'text-4xl'} font-black italic text-white tracking-tighter`}>{inoxTeam ? inoxTeam.league_points : '0'}</p>
           </div>
           <div className="p-6 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl backdrop-blur-sm">
              <Activity size={16} className="text-zinc-600 mb-2" />
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Total Race Pts (Σ)</p>
              <p className={`${snapshotMode ? 'text-5xl' : 'text-4xl'} font-black italic text-white tracking-tighter`}>{inoxTeam ? inoxTeam.total_race_points : '0'}</p>
           </div>
        </section>

        {/* DATA VIEWPORT */}
        <section className={`flex-1 bg-zinc-900/30 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl relative backdrop-blur-sm ${snapshotMode ? 'max-h-[650px]' : ''}`}>
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-50">
              <RefreshCw size={48} className="text-inox-orange animate-spin mb-6 shadow-[0_0_20px_rgba(252,103,25,0.3)]" />
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">Retrieving official GC Intel...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
               <div className="p-10 rounded-full bg-zinc-900 border border-zinc-800 mb-8 shadow-inner">
                  <AlertCircle size={64} className="text-zinc-700" />
               </div>
               <p className="text-2xl font-black italic text-zinc-500 uppercase tracking-tighter leading-none">No GC Data Sync Detected</p>
               <p className="text-zinc-600 text-[11px] font-bold uppercase mt-4 tracking-[0.2em] max-w-xs mx-auto">Please upload official WTRL JSON from Admin Panel to initialize the viewport.</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-800">
                  <tr className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    <th className="px-10 py-6 text-center w-32 bg-black/20">RANK</th>
                    <th className="px-10 py-6">SQUADRON NAME</th>
                    <th className="px-8 py-6 text-center text-inox-orange">LP (J)</th>
                    <th className="px-8 py-6 text-center">TRP (Σ)</th>
                    {!snapshotMode && <th className="px-10 py-6 text-center">MISSION HISTORY</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {(snapshotMode ? results.slice(0, 8) : results).map((team) => {
                    const isFirst = team.rank === 1;
                    return (
                      <motion.tr 
                        key={team.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`group transition-all ${
                          team.is_inox 
                            ? 'bg-inox-orange/10' 
                            : 'hover:bg-zinc-800/40'
                        }`}
                      >
                        <td className="px-10 py-6 text-center">
                          <span className={`text-4xl font-black italic ${
                            isFirst ? 'text-inox-orange drop-shadow-[0_0_15px_rgba(252,103,25,0.4)]' : 'text-zinc-800 group-hover:text-zinc-500'
                          }`}>
                            #{team.rank}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex flex-col">
                            <span className={`font-black uppercase tracking-tight ${snapshotMode ? 'text-3xl' : 'text-2xl'} leading-none ${
                              team.is_inox ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                            }`}>
                              {team.team_name}
                            </span>
                            {team.is_inox === 1 && (
                              <div className="flex items-center gap-2 mt-3">
                                 <span className="bg-inox-orange text-black px-3 py-1 rounded-[6px] text-[9px] font-black uppercase tracking-widest italic shadow-lg">Official Squadron</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <div className={`inline-flex items-center justify-center ${snapshotMode ? 'w-20 h-20' : 'w-16 h-16'} rounded-[1.5rem] bg-zinc-950 border border-zinc-800 group-hover:border-inox-orange/40 transition-all shadow-inner`}>
                             <span className={`${snapshotMode ? 'text-3xl' : 'text-2xl'} font-black italic text-inox-orange`}>
                               {team.league_points}
                             </span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="text-lg font-black text-white group-hover:scale-110 transition-transform inline-block">{team.total_race_points}</span>
                        </td>
                        {!snapshotMode && (
                          <td className="px-10 py-6">
                            <div className="flex justify-center items-center gap-2">
                              {[team.r1, team.r2, team.r3, team.r4, team.r5, team.r6].map((pts, i) => (
                                pts !== "0" && pts !== null && (
                                  <div key={i} className="flex flex-col items-center gap-1.5 group/race">
                                    <span className="text-[7px] font-black text-zinc-700 uppercase tracking-tighter group-hover/race:text-zinc-500 transition-colors">R{i+1}</span>
                                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-md group-hover/race:border-inox-orange/30 transition-all">
                                      <span className="text-xs font-black text-zinc-500 group-hover/race:text-white transition-colors">{pts}</span>
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {snapshotMode && results.length > 8 && (
                  <div className="p-8 text-center bg-black/20 border-t border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Full standings available at teaminox-platform.pages.dev</p>
                  </div>
              )}
            </div>
          )}
        </section>

        {/* SNAPSHOT FOOTER */}
        {snapshotMode && (
          <div className="absolute bottom-12 left-12 flex items-center gap-3">
             <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 shadow-inner">
                <Info size={16} className="text-inox-orange" />
             </div>
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Division Analysis developed by Inoxteam Hub</p>
          </div>
        )}
      </div>

      {/* --- EXIT & SAVE BUTTONS --- */}
      {snapshotMode && (
        <div className="fixed bottom-12 right-12 flex gap-4 z-[200]">
          <button
            onClick={() => setSnapshotMode(false)}
            className="px-8 py-4 bg-zinc-800 text-white font-black italic rounded-full shadow-xl hover:scale-110 transition-all uppercase text-sm tracking-tighter border border-zinc-700"
          >
            EXIT
          </button>
          <button
            onClick={handleCapture}
            className="px-8 py-4 bg-inox-orange text-black font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter border border-orange-600"
          >
            SAVE RANKING
          </button>
        </div>
      )}
    </div>
  );
};

export default ZRLDivisionResults;
