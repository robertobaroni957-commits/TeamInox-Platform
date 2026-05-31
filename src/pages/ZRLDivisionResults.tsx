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
      console.error(err);
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
    
    if (!displayName || displayName === 'NULL' || displayName === '') {
      const key = l.league_key;
      if (key && key.length >= 7) {
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
    <div className={`min-h-screen ${snapshotMode ? 'bg-black p-4' : 'bg-[#0a0a0a] text-white p-4 md:p-6'} font-sans`}>
      <main ref={contentRef} className="max-w-[1400px] mx-auto space-y-6">
        
        {/* HEADER & FILTERS */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none text-white">
                ZRL <span className="text-zinc-700">RESULTS</span>
              </h1>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest max-w-lg">
                Visualizza i risultati delle gare e la classifica generale ufficiale.
              </p>
            </div>

            {!snapshotMode && (
              <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
                <button 
                  onClick={() => setViewMode('race')}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'race' ? 'bg-inox-cyan text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  Gara
                </button>
                <button 
                  onClick={() => setViewMode('gc')}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'gc' ? 'bg-inox-orange text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  GC
                </button>
              </div>
            )}
          </div>

          {!snapshotMode && (
            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={() => { setShowRoundFilters(!showRoundFilters); setShowLeagueFilters(false); }}       
                className="flex-1 px-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-left hover:border-inox-cyan/50 transition-all shadow-md"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-0.5">Round</span>
                  <span className="text-[11px] font-black uppercase text-white truncate tracking-widest">      
                    {currentRound ? currentRound.name : 'Seleziona...'}
                  </span>
                </div>
                <ChevronDown size={14} className="text-zinc-500" />
              </button>

              <button 
                onClick={() => { setShowLeagueFilters(!showLeagueFilters); setShowRoundFilters(false); }}      
                className="flex-1 px-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-left hover:border-inox-orange/50 transition-all shadow-md"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-0.5">Divisione</span>
                  <span className="text-[11px] font-black uppercase text-white truncate tracking-widest">      
                    {currentLeague ? formatLeagueName(currentLeague) : 'Seleziona...'}
                  </span>
                </div>
                <ChevronDown size={14} className="text-zinc-500" />
              </button>
            </div>
          )}
        </section>

        {/* INOX RIDERS RECAP (Only for Race mode) */}
        {viewMode === 'race' && inoxRiders.length > 0 && !loading && (
          <section className="bg-zinc-900/40 border border-inox-cyan/20 rounded-2xl p-4 shadow-lg">
              <h3 className="text-sm font-black italic uppercase text-white mb-4">RIDER BREAKDOWN</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {inoxRiders.map((rider, i) => (
                  <div key={i} className="bg-black/40 border border-zinc-800 rounded-lg p-3">
                    <p className="text-[8px] font-black uppercase text-zinc-500 truncate">{rider.rider_name}</p>
                    <div className="flex justify-between mt-2">
                        <span className="text-[9px] font-bold text-white">Fin: {rider.pts_finish}</span>
                        <span className="text-[9px] font-black text-inox-cyan">Tot: {rider.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
        )}

        {/* RESULTS TABLE */}
        <section className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-10 text-center"><RefreshCw size={24} className="text-inox-orange animate-spin mx-auto" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-800">
                    <th className="px-4 py-4 text-center">RANK</th>
                    <th className="px-4 py-4">SQUADRON</th>
                    {viewMode === 'gc' ? (
                      <>
                        <th className="px-2 py-4 text-center">LP</th>
                        <th className="px-2 py-4 text-center">TRP</th>
                      </>
                    ) : (
                      <>
                        <th className="px-2 py-4 text-center">TIME</th>
                        <th className="px-2 py-4 text-center">FIN</th>
                        <th className="px-2 py-4 text-center">FAL</th>
                        <th className="px-2 py-4 text-center">FTS</th>
                        <th className="px-2 py-4 text-center">TOT</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {results.map((team) => (
                    <tr key={`${team.team_name}-${team.rank}`} className={`text-[10px] ${team.is_inox ? 'bg-white/5' : ''}`}>
                      <td className="px-4 py-3 text-center font-black italic text-zinc-600">#{team.rank}</td>
                      <td className="px-4 py-3 font-bold text-zinc-300">{team.team_name}</td>
                      {viewMode === 'gc' ? (
                        <>
                          <td className="px-2 py-3 text-center text-inox-orange font-black">{team.league_points}</td>
                          <td className="px-2 py-3 text-center font-bold text-white">{team.total_race_points}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-3 text-center text-zinc-400 font-mono">{formatTime(team.team_time)}</td>
                          <td className="px-2 py-3 text-center font-bold text-white">{team.pts_finish}</td>
                          <td className="px-2 py-3 text-center text-zinc-500">{team.pts_fal}</td>  
                          <td className="px-2 py-3 text-center text-zinc-500">{team.pts_fts}</td>  
                          <td className="px-2 py-3 text-center font-black text-inox-cyan">{team.total_race_points}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ZRLDivisionResults;