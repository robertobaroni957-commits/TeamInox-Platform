import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  Trophy, Users, Target, RefreshCw, Filter, Award, Star, Zap, Activity,
  ChevronDown, LayoutGrid, BarChart3, Clock, MapPin, Hash, AlertCircle,
  Camera, Shield, Info, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

interface TeamStanding {
  id: number;
  team_name: string;
  rank: number;
  league_points?: number;
  pts_fal: number;
  pts_fts: number;
  pts_finish: number;
  total_race_points: number;
  team_time?: number;
  league_name?: string;
  r1?: string;
  r2?: string;
  r3?: string;
  r4?: string;
  r5?: string;
  r6?: string;
  is_inox: number;
  league_key: string;
}

interface RiderStanding {
  rider_name: string;
  time: number;
  pts_finish: number;
  pts_fal: number;
  pts_fts: number;
  total: number;
}

interface RoundOption {
  id: number;
  name: string;
  date: string;
  round_group_id: number;
  round_group_name: string;
}

interface LeagueOption {
  league_key: string;
  league_display_name: string | null;
  inox_team_name: string | null;
}

const ZRLDivisionResults: React.FC = () => {
  const [rounds, setRounds] = useState<RoundOption[]>([]);
  const [leagues, setLeagues] = useState<LeagueOption[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'gc' | 'race'>('gc');
  
  const [results, setResults] = useState<TeamStanding[]>([]);
  const [inoxRiders, setInoxRiders] = useState<RiderStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRoundFilters, setShowRoundFilters] = useState(false);
  const [showLeagueFilters, setShowLeagueFilters] = useState(false);
  const [snapshotMode, setSnapshotMode] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (selectedRound && selectedLeague) {
      fetchResults(selectedRound, selectedLeague, viewMode);
    }
  }, [selectedRound, selectedLeague, viewMode]);

  const fetchFilters = async () => {
    try {
      const data = await api.getDivisionFilters();
      if (data) {
        setRounds(data.rounds || []);
        setLeagues(data.leagues || []);
        
        if (data.rounds?.length > 0 && data.leagues?.length > 0) {
          setSelectedRound(data.rounds[0].id);
          setSelectedLeague(data.leagues[0].league_key);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      setError("Impossibile caricare i filtri.");
      setLoading(false);
    }
  };

  const fetchResults = async (roundId: number, leagueKey: string, mode: string) => {
    setLoading(true);
    try {
      const data = await api.getDivisionResults(roundId, leagueKey, mode);
      if (data) {
        setResults(data.results || []);
        setInoxRiders(data.inoxRiders || []);
      }
    } catch (err) {
      setError("Errore nel caricamento dei risultati.");
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    if (contentRef.current) {
      try {
        const canvas = await html2canvas(contentRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#0a0a0a',
        });
        const link = document.createElement('a');
        link.download = `zrl_rankings_${selectedLeague}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (e) {
        console.error("Capture error:", e);
      }
    }
  };

  const currentRound = rounds.find(r => r.id === selectedRound);
  const currentLeague = leagues.find(l => l.league_key === selectedLeague);
  const inoxTeam = results.find(r => r.is_inox === 1);

  const formatLeagueName = (l: LeagueOption | undefined) => {
    if (!l) return '---';
    const teamName = l.inox_team_name && l.inox_team_name !== 'NULL' ? ` (${l.inox_team_name})` : '';
    let displayName = l.league_display_name;
    
    if (!displayName || displayName === 'NULL') {
      const key = l.league_key;
      if (key.length >= 7) {
        const lKey = key.substring(1, 4);
        const cKey = key.substring(4, 5);
        const dKey = key.substring(5, 6);
        displayName = `League ${lKey} - ${cKey}${dKey}`;
      } else {
        displayName = `League ${key}`;
      }
    }
    return `${displayName}${teamName}`;
  };

  const formatTime = (seconds: number | undefined) => {
    if (!seconds) return '---';
    const hrs = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    return `${hrs > 0 ? hrs + ':' : ''}${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen ${snapshotMode ? 'bg-black p-16' : 'bg-[#0a0a0a] text-white p-6 md:p-12'} font-sans relative overflow-hidden`}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-inox-orange/5 rounded-full blur-[180px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-inox-cyan/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <main ref={contentRef} className="max-w-[1800px] mx-auto space-y-12 relative z-10">
        
        {/* HEADER & FILTERS */}
        <section className="flex flex-col gap-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="px-5 py-2 bg-inox-orange/10 border border-inox-orange/20 rounded-full">
                  <span className="text-[12px] font-black text-inox-orange uppercase tracking-[0.4em]">WTRL GC Engine</span>
                </div>
                <div className="px-5 py-2 bg-zinc-900 border border-zinc-800 rounded-full">
                  <span className="text-[12px] font-black text-zinc-500 uppercase tracking-[0.4em]">Official Standings</span>
                </div>
              </div>
              <h1 className={`font-black italic tracking-tighter uppercase leading-none text-white ${snapshotMode ? 'text-9xl' : 'text-4xl md:text-6xl lg:text-9xl'}`}>
                ZRL <span className="text-zinc-800">RESULTS</span>
              </h1>
              <p className="text-zinc-500 text-lg font-bold uppercase tracking-[0.2em] max-w-2xl leading-relaxed">
                Visualizza i risultati delle gare e la classifica generale ufficiale del team.
              </p>
            </div>

            {!snapshotMode && (
              <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
                <div className="bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-800 flex shadow-2xl backdrop-blur-md">
                  <button 
                    onClick={() => setViewMode('race')}
                    className={`px-12 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${viewMode === 'race' ? 'bg-inox-cyan text-black shadow-[0_0_25px_rgba(0,255,255,0.3)]' : 'text-zinc-500 hover:text-white'}`}
                  >
                    Gara
                  </button>
                  <button 
                    onClick={() => setViewMode('gc')}
                    className={`px-12 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${viewMode === 'gc' ? 'bg-inox-orange text-black shadow-[0_0_25px_rgba(252,103,25,0.3)]' : 'text-zinc-500 hover:text-white'}`}
                  >
                    GC
                  </button>
                </div>
              </div>
            )}
          </div>

          {!snapshotMode && (
            <div className="flex flex-col md:flex-row gap-6">
              {/* ROUND SELECTOR */}
              <div className="relative flex-1 md:flex-none md:w-[400px]">
                <button 
                  onClick={() => { setShowRoundFilters(!showRoundFilters); setShowLeagueFilters(false); }}       
                  className="w-full px-10 py-7 bg-zinc-900/60 border border-zinc-800 rounded-[2rem] flex items-center justify-between text-left group hover:border-inox-cyan/50 transition-all shadow-2xl"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] leading-none mb-3">Seleziona Round</span>
                    <span className="text-xl font-black uppercase text-white truncate tracking-widest">      
                      {currentRound ? currentRound.name : 'Scegli...'}
                    </span>
                  </div>
                  <ChevronDown size={24} className={`text-zinc-500 shrink-0 transition-transform ${showRoundFilters ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showRoundFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                      className="absolute top-full left-0 right-0 mt-4 z-[100] bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[500px] overflow-y-auto custom-scrollbar"
                    >
                       {rounds.map((r) => (
                         <button
                           key={r.id}
                           onClick={() => { setSelectedRound(r.id); setShowRoundFilters(false); }}
                           className={`w-full px-10 py-7 text-left hover:bg-inox-cyan/10 border-b border-zinc-800/50 last:border-0 transition-all ${selectedRound === r.id ? 'bg-inox-cyan/5' : ''}`}
                         >
                           <p className={`text-lg font-black uppercase ${selectedRound === r.id ? 'text-inox-cyan' : 'text-white'}`}>{r.name}</p>
                           <p className="text-[11px] font-bold text-zinc-500 mt-2 tracking-widest uppercase">{r.round_group_name}</p>     
                         </button>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* LEAGUE SELECTOR */}
              <div className="relative flex-1 md:flex-none md:w-[550px]">
                <button 
                  onClick={() => { setShowLeagueFilters(!showLeagueFilters); setShowRoundFilters(false); }}      
                  className="w-full px-10 py-7 bg-zinc-900/60 border border-zinc-800 rounded-[2rem] flex items-center justify-between text-left group hover:border-inox-orange/50 transition-all shadow-2xl"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] leading-none mb-3">Seleziona Divisione</span>
                    <span className="text-xl font-black uppercase text-white truncate tracking-widest">      
                      {currentLeague ? formatLeagueName(currentLeague) : 'Scegli...'}
                    </span>
                  </div>
                  <ChevronDown size={24} className={`text-zinc-500 shrink-0 transition-transform ${showLeagueFilters ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showLeagueFilters && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                      className="absolute top-full left-0 right-0 mt-4 z-[100] bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[500px] overflow-y-auto custom-scrollbar"
                    >
                       {leagues.map((l) => (
                         <button
                           key={l.league_key}
                           onClick={() => { setSelectedLeague(l.league_key); setShowLeagueFilters(false); }}     
                           className={`w-full px-10 py-7 text-left hover:bg-inox-orange/10 border-b border-zinc-800/50 last:border-0 transition-all ${selectedLeague === l.league_key ? 'bg-inox-orange/5' : ''}`}
                         >
                           <p className={`text-lg font-black uppercase ${selectedLeague === l.league_key ? 'text-inox-orange' : 'text-white'}`}>
                              {l.league_display_name || `League ${l.league_key}`}
                           </p>
                           {l.inox_team_name && l.inox_team_name !== 'NULL' && (
                             <p className="text-[11px] font-black text-inox-orange mt-2 italic tracking-[0.2em] uppercase">TEAM: {l.inox_team_name}</p>
                           )}
                         </button>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </section>

        {/* INOX RIDERS RECAP (Only for Race mode) */}
        {viewMode === 'race' && inoxRiders.length > 0 && !loading && (
          <section className="animate-in fade-in slide-in-from-top-6 duration-1000">
            <div className="bg-zinc-900/40 border border-inox-cyan/40 rounded-[4rem] p-12 backdrop-blur-md relative overflow-hidden group hover:border-inox-cyan/60 transition-all shadow-[0_0_50px_rgba(0,0,0,0.4)]">
              <div className="absolute top-0 right-0 p-16 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
                 <Zap size={200} className="text-inox-cyan" />
              </div>
              <div className="flex items-center gap-10 mb-12">
                 <div className="w-24 h-24 bg-inox-cyan rounded-[2rem] flex items-center justify-center text-black shadow-[0_0_40px_rgba(0,255,255,0.4)]">
                    <Users size={48} />
                 </div>
                 <div>
                    <h3 className="text-5xl font-black italic uppercase text-white leading-none tracking-tighter">RIDER BREAKDOWN</h3>
                    <p className="text-inox-cyan text-sm font-black uppercase tracking-[0.5em] mt-3">Dettaglio punti squadra INOX</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
                {inoxRiders.map((rider, i) => (
                  <div key={i} className="bg-black/60 border border-zinc-800/60 rounded-[2rem] p-8 space-y-6 hover:border-inox-cyan/40 hover:bg-black/80 transition-all group/card">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Corridore</p>
                      <p className="text-xl font-black uppercase text-white truncate group-hover/card:text-inox-cyan transition-colors">{rider.rider_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-zinc-600 uppercase">Finish</p>
                        <p className="text-3xl font-black italic text-white">{rider.pts_finish}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-zinc-600 uppercase">Total</p>
                        <p className="text-3xl font-black italic text-inox-cyan">{rider.total}</p>
                      </div>
                    </div>
                    <div className="pt-5 border-t border-zinc-800/80 flex justify-between">
                       <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">FAL</span>
                          <span className="text-lg font-bold text-zinc-300">{rider.pts_fal}</span>
                       </div>
                       <div className="flex flex-col gap-1 text-right">
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">FTS</span>
                          <span className="text-lg font-bold text-zinc-300">{rider.pts_fts}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* STATS OVERVIEW */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
           <div className="p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-4 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-2xl backdrop-blur-sm">
              <Users size={32} className="text-zinc-600 mb-2" />
              <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">Division Size</p>
              <p className={`${snapshotMode ? 'text-8xl' : 'text-4xl md:text-6xl lg:text-8xl'} font-black italic text-white tracking-tighter`}>{results.length} Teams</p>
           </div>

           <div className={`p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border flex flex-col gap-4 relative overflow-hidden group transition-all shadow-2xl backdrop-blur-sm ${viewMode === 'gc' ? 'bg-inox-orange/10 border-inox-orange/30 hover:border-inox-orange/50' : 'bg-inox-cyan/10 border-inox-cyan/30 hover:border-inox-cyan/50'}`}>
              <div className="absolute -top-2 -right-2 p-12 opacity-[0.04] group-hover:opacity-[0.1] transition-opacity">
                 {viewMode === 'gc' ? <Star size={150} /> : <Zap size={150} />}
              </div>
              {viewMode === 'gc' ? <Star size={32} className="text-inox-orange mb-2" /> : <Zap size={32} className="text-inox-cyan mb-2" />}
              <p className={`text-[12px] font-black uppercase tracking-widest ${viewMode === 'gc' ? 'text-inox-orange/70' : 'text-inox-cyan/70'}`}>INOX Position</p>
              <p className={`${snapshotMode ? 'text-8xl' : 'text-4xl md:text-6xl lg:text-8xl'} font-black italic tracking-tighter ${viewMode === 'gc' ? 'text-inox-orange' : 'text-inox-cyan'}`}>{inoxTeam ? `#${inoxTeam.rank}` : 'N/A'}</p>
           </div>

           <div className="p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-4 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-2xl backdrop-blur-sm">
              <Trophy size={32} className="text-zinc-600 mb-2" />
              <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">{viewMode === 'gc' ? 'League Points (J)' : 'Finish Pts'}</p>
              <p className={`${snapshotMode ? 'text-8xl' : 'text-4xl md:text-6xl lg:text-8xl'} font-black italic text-white tracking-tighter`}>
                {inoxTeam ? (viewMode === 'gc' ? inoxTeam.league_points : inoxTeam.pts_finish) : '0'}
              </p>
           </div>

           <div className="p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-4 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-2xl backdrop-blur-sm">
              <Activity size={32} className="text-zinc-600 mb-2" />
              <p className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">{viewMode === 'gc' ? 'Total Race Pts (Σ)' : 'Bonus Pts (F/F)'}</p>
              <p className={`${snapshotMode ? 'text-8xl' : 'text-4xl md:text-6xl lg:text-8xl'} font-black italic text-white tracking-tighter`}>
                {inoxTeam ? (viewMode === 'gc' ? inoxTeam.total_race_points : (inoxTeam.pts_fal + inoxTeam.pts_fts)) : '0'}
              </p>
           </div>
        </section>

        {/* RESULTS TABLE */}
        <section className={`flex-1 bg-zinc-900/30 border border-zinc-800 rounded-[5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] relative backdrop-blur-md ${snapshotMode ? 'max-h-[1000px]' : ''}`}>
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xl z-50">
              <RefreshCw size={80} className={`${viewMode === 'gc' ? 'text-inox-orange shadow-[0_0_50px_rgba(252,103,25,0.5)]' : 'text-inox-cyan shadow-[0_0_50px_rgba(0,255,255,0.5)]'} animate-spin mb-10`} />
              <p className="text-lg font-black uppercase tracking-[0.6em] text-zinc-400 italic animate-pulse">Synchronizing Intelligence...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-24 text-center">      
               <div className="p-20 rounded-full bg-zinc-900 border border-zinc-800 mb-12 shadow-inner">        
                  <AlertCircle size={100} className="text-zinc-700" />
               </div>
               <p className="text-5xl font-black italic text-zinc-500 uppercase tracking-tighter leading-none">No Data Intel Available</p>
               <p className="text-zinc-600 text-lg font-bold uppercase mt-8 tracking-[0.2em] max-w-xl mx-auto leading-relaxed">Ensure official WTRL telemetry has been processed to populate this division viewport.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="text-[13px] font-black uppercase tracking-[0.5em] text-zinc-400 border-b border-zinc-800">
                    <th className="px-16 py-12 text-center w-48 bg-black/40">RANK</th>
                    <th className="px-16 py-12">SQUADRON NAME</th>
                    {viewMode === 'gc' ? (
                      <>
                        <th className="px-12 py-12 text-center text-inox-orange">LP (J)</th>
                        <th className="px-12 py-12 text-center">TRP (Σ)</th>
                      </>
                    ) : (
                      <>
                        <th className="px-12 py-12 text-center">TIME</th>
                        <th className="px-12 py-12 text-center">FINISH</th>
                        <th className="px-12 py-12 text-center">FAL</th>
                        <th className="px-12 py-12 text-center">FTS</th>
                        <th className="px-12 py-12 text-center text-inox-cyan">TOTAL</th>
                      </>
                    )}
                    {!snapshotMode && viewMode === 'gc' && <th className="px-16 py-12 text-center">MISSION HISTORY</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {results.map((team) => {
                    const isFirst = team.rank === 1;
                    const accentColor = viewMode === 'gc' ? 'inox-orange' : 'inox-cyan';
                    const accentHex = viewMode === 'gc' ? 'rgba(252,103,25,0.6)' : 'rgba(0,255,255,0.6)';      

                    return (
                      <motion.tr
                        key={`${team.team_name}-${team.rank}`}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`group transition-all ${team.is_inox ? `bg-${accentColor}/10 border-l-8 border-l-${accentColor}` : 'hover:bg-zinc-800/40 border-l-8 border-l-transparent'}`}
                      >
                        <td className="px-16 py-12 text-center">
                          <span className={`text-7xl font-black italic ${
                            isFirst ? `text-${accentColor} drop-shadow-[0_0_30px_${accentHex}]` : 'text-zinc-800 group-hover:text-zinc-600'
                          }`}>
                            #{team.rank}
                          </span>
                        </td>
                        <td className="px-16 py-12">
                          <div className="flex flex-col gap-2">
                            <span className={`text-3xl font-black italic uppercase tracking-tighter ${team.is_inox ? `text-${accentColor}` : 'text-white'}`}>
                              {team.team_name}
                            </span>
                            {team.is_inox === 1 && (
                              <div className="flex items-center gap-4 mt-5">
                                 <span className={`bg-${accentColor} text-black px-6 py-2 rounded-[12px] text-xs font-black uppercase tracking-widest italic shadow-[0_10px_30px_rgba(0,0,0,0.5)]`}>Official Squadron</span>
                              </div>
                            )}
                          </div>
                        </td>
                        {viewMode === 'gc' ? (
                          <>
                            <td className="px-12 py-12 text-center">
                               <div className="inline-flex items-center justify-center w-28 h-24 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 group-hover:border-inox-orange/50 transition-all shadow-inner">
                                 <span className="text-5xl font-black italic text-inox-orange">
                                   {team.league_points}
                                 </span>
                               </div>
                            </td>
                            <td className="px-12 py-12 text-center">
                              <span className="text-4xl font-black text-white group-hover:scale-110 transition-transform inline-block">{team.total_race_points}</span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-12 py-12 text-center font-mono text-xl text-zinc-400">
                                {formatTime(team.team_time)}
                            </td>
                            <td className="px-12 py-12 text-center text-3xl font-black text-white">{team.pts_finish}</td>
                            <td className="px-12 py-12 text-center text-3xl font-bold text-zinc-600 group-hover:text-zinc-400">{team.pts_fal}</td>  
                            <td className="px-12 py-12 text-center text-3xl font-bold text-zinc-600 group-hover:text-zinc-400">{team.pts_fts}</td>  
                            <td className="px-12 py-12 text-center">
                               <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-zinc-950 border border-zinc-800 group-hover:border-inox-cyan/50 transition-all">
                                 <span className="text-4xl font-black italic text-inox-cyan">
                                   {team.total_race_points}
                                 </span>
                               </div>
                            </td>
                          </>
                        )}
                        {!snapshotMode && viewMode === 'gc' && (
                          <td className="px-16 py-12">
                            <div className="flex justify-center items-center gap-4">
                              {[team.r1, team.r2, team.r3, team.r4, team.r5, team.r6].map((pts, i) => (        
                                pts !== "0" && pts !== null && pts !== "" && (
                                  <div key={i} className="flex flex-col items-center gap-3 group/race">      
                                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-tighter group-hover/race:text-zinc-500 transition-colors">R{i+1}</span>
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-2xl group-hover/race:border-inox-orange/40 transition-all">
                                      <span className="text-lg font-black italic text-white">{pts}</span>
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
            </div>
          )}
        </section>

        {/* FOOTER INFO */}
        {snapshotMode && (
          <div className="absolute bottom-24 left-24 flex items-center gap-8">
             <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-inner">
                <Info size={32} className={viewMode === 'gc' ? 'text-inox-orange' : 'text-inox-cyan'} />       
             </div>
             <div>
                <p className="text-xl font-black text-zinc-500 uppercase tracking-[0.4em]">Inoxteam Division Analysis Engine</p>
                <p className="text-xs font-bold text-zinc-700 uppercase tracking-widest mt-2">Enterprise Telemetry v2.5 • Real-time Cloudflare Integration</p>
             </div>
          </div>
        )}
      </main>

      {/* FLOATING CAPTURE BUTTON */}
      {!snapshotMode && (
        <div className="fixed bottom-6 right-6 md:bottom-12 md:right-12 flex gap-3 md:gap-6 z-[200]">
          <button
            onClick={() => setSnapshotMode(!snapshotMode)}
            className="w-14 h-14 md:w-20 md:h-20 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:text-white transition-all group"
          >
            {snapshotMode ? <X size={24} /> : <LayoutGrid size={24} className="group-hover:rotate-90 transition-transform duration-500" />}
          </button>
          <button
            onClick={handleCapture}
            className={`px-6 py-3 md:px-16 md:py-8 ${viewMode === 'gc' ? 'bg-inox-orange shadow-[0_0_40px_rgba(252,103,25,0.3)]' : 'bg-inox-cyan shadow-[0_0_40px_rgba(0,255,255,0.3)]'} text-black font-black italic rounded-full hover:scale-105 transition-all uppercase text-sm md:text-2xl tracking-tighter border border-black/10`}
          >
            SAVE RANKING
          </button>
        </div>
      )}
    </div>
  );
};

export default ZRLDivisionResults;