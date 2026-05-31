import React, { useState, useEffect, useRef } from 'react';
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
      const res = await fetch('/api/division-results');
      const data = await res.json();
      if (data.success) {
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
      const res = await fetch(`/api/division-results?round_id=${roundId}&league_key=${leagueKey}&mode=${mode}`);
      const data = await res.json();
      if (data.success) {
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
    <div className={`min-h-screen ${snapshotMode ? 'bg-black p-12' : 'bg-[#0a0a0a] text-white p-4 md:p-8'} font-sans relative overflow-hidden`}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-inox-orange/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-inox-cyan/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <main ref={contentRef} className="max-w-[1600px] mx-auto space-y-8 relative z-10">
        
        {/* HEADER & FILTERS */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 bg-inox-orange/10 border border-inox-orange/20 rounded-full">
                  <span className="text-[10px] font-black text-inox-orange uppercase tracking-[0.3em]">WTRL GC Engine</span>
                </div>
                <div className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Official Standings</span>
                </div>
              </div>
              <h1 className={`font-black italic tracking-tighter uppercase leading-none text-white ${snapshotMode ? 'text-8xl' : 'text-6xl lg:text-8xl'}`}>
                ZRL <span className="text-zinc-700">RESULTS</span>
              </h1>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest max-w-xl">
                Visualizza i risultati delle gare e la classifica generale ufficiale.
              </p>
            </div>

            {!snapshotMode && (
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="bg-zinc-900/50 p-1.5 rounded-[1.5rem] border border-zinc-800 flex shadow-2xl backdrop-blur-md">
                  <button 
                    onClick={() => setViewMode('race')}
                    className={`px-8 py-3 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'race' ? 'bg-inox-cyan text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                  >
                    Gara
                  </button>
                  <button 
                    onClick={() => setViewMode('gc')}
                    className={`px-8 py-3 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'gc' ? 'bg-inox-orange text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                  >
                    GC
                  </button>
                </div>
              </div>
            )}
          </div>

          {!snapshotMode && (
            <div className="flex flex-col md:flex-row gap-4">
              {/* ROUND SELECTOR */}
              <div className="relative flex-1 md:flex-none md:w-[350px]">
                <button 
                  onClick={() => { setShowRoundFilters(!showRoundFilters); setShowLeagueFilters(false); }}       
                  className="w-full px-8 py-5 bg-zinc-900/60 border border-zinc-800 rounded-[1.5rem] flex items-center justify-between text-left group hover:border-inox-cyan/50 transition-all shadow-xl"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] leading-none mb-2">Round</span>
                    <span className="text-sm font-black uppercase text-white truncate tracking-widest">      
                      {currentRound ? currentRound.name : 'Seleziona Round'}
                    </span>
                  </div>
                  <ChevronDown size={18} className={`text-zinc-500 shrink-0 transition-transform ${showRoundFilters ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showRoundFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-3 z-[100] bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden max-h-80 overflow-y-auto custom-scrollbar"
                    >
                       {rounds.map((r) => (
                         <button
                           key={r.id}
                           onClick={() => { setSelectedRound(r.id); setShowRoundFilters(false); }}
                           className={`w-full px-8 py-5 text-left hover:bg-inox-cyan/10 border-b border-zinc-800/50 last:border-0 transition-all ${selectedRound === r.id ? 'bg-inox-cyan/5' : ''}`}
                         >
                           <p className={`text-xs font-black uppercase ${selectedRound === r.id ? 'text-inox-cyan' : 'text-white'}`}>{r.name}</p>
                           <p className="text-[10px] font-bold text-zinc-500 mt-1">{r.round_group_name}</p>     
                         </button>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* LEAGUE SELECTOR */}
              <div className="relative flex-1 md:flex-none md:w-[450px]">
                <button 
                  onClick={() => { setShowLeagueFilters(!showLeagueFilters); setShowRoundFilters(false); }}      
                  className="w-full px-8 py-5 bg-zinc-900/60 border border-zinc-800 rounded-[1.5rem] flex items-center justify-between text-left group hover:border-inox-orange/50 transition-all shadow-xl"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] leading-none mb-2">Divisione</span>
                    <span className="text-sm font-black uppercase text-white truncate tracking-widest">      
                      {currentLeague ? formatLeagueName(currentLeague) : 'Seleziona Divisione'}
                    </span>
                  </div>
                  <ChevronDown size={18} className={`text-zinc-500 shrink-0 transition-transform ${showLeagueFilters ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showLeagueFilters && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-3 z-[100] bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden max-h-80 overflow-y-auto custom-scrollbar"
                    >
                       {leagues.map((l) => (
                         <button
                           key={l.league_key}
                           onClick={() => { setSelectedLeague(l.league_key); setShowLeagueFilters(false); }}     
                           className={`w-full px-8 py-5 text-left hover:bg-inox-orange/10 border-b border-zinc-800/50 last:border-0 transition-all ${selectedLeague === l.league_key ? 'bg-inox-orange/5' : ''}`}
                         >
                           <p className={`text-xs font-black uppercase ${selectedLeague === l.league_key ? 'text-inox-orange' : 'text-white'}`}>
                              {l.league_display_name || `League ${l.league_key}`}
                           </p>
                           {l.inox_team_name && l.inox_team_name !== 'NULL' && (
                             <p className="text-[10px] font-bold text-inox-orange mt-1 italic tracking-widest">SQUADRA: {l.inox_team_name}</p>
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
          <section className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-zinc-900/40 border border-inox-cyan/30 rounded-[3rem] p-8 backdrop-blur-sm relative overflow-hidden group hover:border-inox-cyan/50 transition-all shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                 <Zap size={120} className="text-inox-cyan" />
              </div>
              <div className="flex items-center gap-6 mb-8">
                 <div className="w-16 h-16 bg-inox-cyan rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                    <Users size={32} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black italic uppercase text-white leading-none">RIDER BREAKDOWN</h3>
                    <p className="text-inox-cyan text-[11px] font-black uppercase tracking-[0.3em] mt-1">Dettaglio punti squadra INOX</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {inoxRiders.map((rider, i) => (
                  <div key={i} className="bg-black/40 border border-zinc-800 rounded-2xl p-6 space-y-4 hover:border-inox-cyan/30 transition-all">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">Corridore</p>
                      <p className="text-sm font-black uppercase text-white truncate">{rider.rider_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[8px] font-black text-zinc-600 uppercase">Finish</p>
                        <p className="text-xl font-black italic text-white">{rider.pts_finish}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-zinc-600 uppercase">Total</p>
                        <p className="text-xl font-black italic text-inox-cyan">{rider.total}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-zinc-800/50 flex justify-between">
                       <div className="flex flex-col">
                          <span className="text-[7px] font-black text-zinc-500 uppercase">FAL</span>
                          <span className="text-xs font-bold text-zinc-400">{rider.pts_fal}</span>
                       </div>
                       <div className="flex flex-col text-right">
                          <span className="text-[7px] font-black text-zinc-500 uppercase">FTS</span>
                          <span className="text-xs font-bold text-zinc-400">{rider.pts_fts}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* STATS OVERVIEW */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <div className="p-10 rounded-[3rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl backdrop-blur-sm">
              <Users size={24} className="text-zinc-600 mb-2" />
              <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Division Size</p>   
              <p className={`${snapshotMode ? 'text-6xl' : 'text-5xl lg:text-6xl'} font-black italic text-white tracking-tighter`}>{results.length} Teams</p>
           </div>
           
           <div className={`p-10 rounded-[3rem] border flex flex-col gap-3 relative overflow-hidden group transition-all shadow-2xl backdrop-blur-sm ${viewMode === 'gc' ? 'bg-inox-orange/10 border-inox-orange/20 hover:border-inox-orange/40' : 'bg-inox-cyan/10 border-inox-cyan/20 hover:border-inox-cyan/40'}`}>
              <div className="absolute -top-2 -right-2 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                 {viewMode === 'gc' ? <Star size={100} /> : <Zap size={100} />}
              </div>
              {viewMode === 'gc' ? <Star size={24} className="text-inox-orange mb-2" /> : <Zap size={24} className="text-inox-cyan mb-2" />}
              <p className={`text-[11px] font-black uppercase tracking-widest ${viewMode === 'gc' ? 'text-inox-orange/70' : 'text-inox-cyan/70'}`}>INOX Position</p>
              <p className={`${snapshotMode ? 'text-6xl' : 'text-5xl lg:text-6xl'} font-black italic tracking-tighter ${viewMode === 'gc' ? 'text-inox-orange' : 'text-inox-cyan'}`}>{inoxTeam ? `#${inoxTeam.rank}` : 'N/A'}</p>
           </div>

           <div className="p-10 rounded-[3rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl backdrop-blur-sm">
              <Trophy size={24} className="text-zinc-600 mb-2" />
              <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">{viewMode === 'gc' ? 'League Points (J)' : 'Finish Pts'}</p>
              <p className={`${snapshotMode ? 'text-6xl' : 'text-5xl lg:text-6xl'} font-black italic text-white tracking-tighter`}>
                {inoxTeam ? (viewMode === 'gc' ? inoxTeam.league_points : inoxTeam.pts_finish) : '0'}
              </p>
           </div>

           <div className="p-10 rounded-[3rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl backdrop-blur-sm">
              <Activity size={24} className="text-zinc-600 mb-2" />
              <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">{viewMode === 'gc' ? 'Total Race Pts (Σ)' : 'Bonus Pts (F/F)'}</p>
              <p className={`${snapshotMode ? 'text-6xl' : 'text-5xl lg:text-6xl'} font-black italic text-white tracking-tighter`}>
                {inoxTeam ? (viewMode === 'gc' ? inoxTeam.total_race_points : (inoxTeam.pts_fal + inoxTeam.pts_fts)) : '0'}
              </p>
           </div>
        </section>

        {/* RESULTS TABLE */}
        <section className={`flex-1 bg-zinc-900/30 border border-zinc-800 rounded-[4rem] overflow-hidden shadow-2xl relative backdrop-blur-sm ${snapshotMode ? 'max-h-[850px]' : ''}`}>
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-50">
              <RefreshCw size={64} className={`${viewMode === 'gc' ? 'text-inox-orange shadow-[0_0_30px_rgba(252,103,25,0.4)]' : 'text-inox-cyan shadow-[0_0_30px_rgba(0,255,255,0.4)]'} animate-spin mb-8`} />
              <p className="text-xs font-black uppercase tracking-[0.5em] text-zinc-400 italic">Syncing {viewMode.toUpperCase()} Intelligence...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center">      
               <div className="p-16 rounded-full bg-zinc-900 border border-zinc-800 mb-10 shadow-inner">        
                  <AlertCircle size={80} className="text-zinc-700" />
               </div>
               <p className="text-4xl font-black italic text-zinc-500 uppercase tracking-tighter leading-none">No {viewMode.toUpperCase()} Data Sync Detected</p>
               <p className="text-zinc-600 text-sm font-bold uppercase mt-6 tracking-[0.2em] max-w-md mx-auto leading-relaxed">Please ensure official WTRL results have been ingested via the Admin Panel to populate this viewport.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-800">
                    <th className="px-12 py-10 text-center w-40 bg-black/30">RANK</th>
                    <th className="px-12 py-10">SQUADRON NAME</th>
                    {viewMode === 'gc' ? (
                      <>
                        <th className="px-10 py-10 text-center text-inox-orange">LP (J)</th>
                        <th className="px-10 py-10 text-center">TRP (Σ)</th>
                      </>
                    ) : (
                      <>
                        <th className="px-10 py-10 text-center">TIME</th>
                        <th className="px-10 py-10 text-center">FINISH</th>
                        <th className="px-10 py-10 text-center">FAL</th>
                        <th className="px-10 py-10 text-center">FTS</th>
                        <th className="px-10 py-10 text-center text-inox-cyan">TOTAL</th>
                      </>
                    )}
                    {!snapshotMode && viewMode === 'gc' && <th className="px-12 py-10 text-center">MISSION HISTORY</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {results.map((team) => {
                    const isFirst = team.rank === 1;
                    const accentColor = viewMode === 'gc' ? 'inox-orange' : 'inox-cyan';
                    const accentHex = viewMode === 'gc' ? 'rgba(252,103,25,0.5)' : 'rgba(0,255,255,0.5)';      

                    return (
                      <motion.tr
                        key={`${team.team_name}-${team.rank}`}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`group transition-all ${team.is_inox ? `bg-${accentColor}/10 border-l-4 border-l-${accentColor}` : 'hover:bg-zinc-800/40 border-l-4 border-l-transparent'}`}
                      >
                        <td className="px-12 py-10 text-center">
                          <span className={`text-6xl font-black italic ${
                            isFirst ? `text-${accentColor} drop-shadow-[0_0_20px_${accentHex}]` : 'text-zinc-800 group-hover:text-zinc-500'
                          }`}>
                            #{team.rank}
                          </span>
                        </td>
                        <td className="px-12 py-10">
                          <div className="flex flex-col">
                            <span className={`text-2xl font-black italic uppercase tracking-tighter ${team.is_inox ? `text-${accentColor}` : 'text-white'}`}>
                              {team.team_name}
                            </span>
                            {team.is_inox === 1 && (
                              <div className="flex items-center gap-3 mt-4">
                                 <span className={`bg-${accentColor} text-black px-4 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest italic shadow-xl`}>Official Squadron</span>
                              </div>
                            )}
                          </div>
                        </td>
                        {viewMode === 'gc' ? (
                          <>
                            <td className="px-10 py-10 text-center">
                               <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-zinc-950 border border-zinc-800 group-hover:border-inox-orange/40 transition-all shadow-inner">
                                 <span className="text-4xl font-black italic text-inox-orange">
                                   {team.league_points}
                                 </span>
                               </div>
                            </td>
                            <td className="px-10 py-10 text-center">
                              <span className="text-2xl font-black text-white group-hover:scale-110 transition-transform inline-block">{team.total_race_points}</span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-10 py-10 text-center font-mono text-base text-zinc-300">
                                {formatTime(team.team_time)}
                            </td>
                            <td className="px-10 py-10 text-center text-xl font-black text-white">{team.pts_finish}</td>
                            <td className="px-10 py-10 text-center text-xl font-bold text-zinc-500">{team.pts_fal}</td>  
                            <td className="px-10 py-10 text-center text-xl font-bold text-zinc-500">{team.pts_fts}</td>  
                            <td className="px-10 py-10 text-center">
                               <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:border-inox-cyan/40 transition-all">
                                 <span className="text-3xl font-black italic text-inox-cyan">
                                   {team.total_race_points}
                                 </span>
                               </div>
                            </td>
                          </>
                        )}
                        {!snapshotMode && viewMode === 'gc' && (
                          <td className="px-12 py-10">
                            <div className="flex justify-center items-center gap-3">
                              {[team.r1, team.r2, team.r3, team.r4, team.r5, team.r6].map((pts, i) => (        
                                pts !== "0" && pts !== null && pts !== "" && (
                                  <div key={i} className="flex flex-col items-center gap-2 group/race">      
                                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-tighter group-hover/race:text-zinc-500 transition-colors">R{i+1}</span>
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg group-hover/race:border-inox-orange/30 transition-all">
                                      <span className="text-sm font-black italic text-white">{pts}</span>
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
          <div className="absolute bottom-20 left-20 flex items-center gap-6">
             <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 shadow-inner">
                <Info size={24} className={viewMode === 'gc' ? 'text-inox-orange' : 'text-inox-cyan'} />       
             </div>
             <div>
                <p className="text-[12px] font-black text-zinc-500 uppercase tracking-[0.3em]">Division Analysis Engine • Inoxteam Hub</p>
                <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mt-1">v2.0 • Real-time Cloudflare D1 Synchronization</p>
             </div>
          </div>
        )}
      </main>

      {/* FLOATING CAPTURE BUTTON */}
      {!snapshotMode && (
        <div className="fixed bottom-12 right-12 flex gap-4 z-[200]">
          <button
            onClick={() => setSnapshotMode(!snapshotMode)}
            className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:text-white transition-all"
          >
            {snapshotMode ? <X size={24} /> : <LayoutGrid size={24} />}
          </button>
          <button
            onClick={handleCapture}
            className={`px-12 py-6 ${viewMode === 'gc' ? 'bg-inox-orange' : 'bg-inox-cyan'} text-black font-black italic rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:scale-105 transition-all uppercase text-lg tracking-tighter border border-black/10`}
          >
            SAVE RANKING
          </button>
        </div>
      )}
    </div>
  );
};

export default ZRLDivisionResults;