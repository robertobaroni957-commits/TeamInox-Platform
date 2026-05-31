import React, { useState, useEffect } from 'react';
import { 
  Shield, Zap, Trophy, RefreshCw, ChevronRight, 
  BarChart3, Users, Star, Target, TrendingUp,
  Award, Activity, LayoutGrid, Info, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Cell, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

interface RoundResult {
  pts: number;
  details: {
    finish: number;
    fal: number;
    fts: number;
  };
}

interface InoxTeamPerformance {
  team_name: string;
  overall_rank: number | null;
  league_points: number | null;
  archetype: string;
  history: Record<number, RoundResult>;
  totals: {
    finish: number;
    fal: number;
    fts: number;
    total: number;
  };
}

interface TopRider {
  rider_name: string;
  team_name: string;
  is_inox: number;
  total_pts: number;
  total_fal: number;
  total_fts: number;
  total_finish: number;
}

interface LeagueOption {
  league_key: string;
  league_display_name: string | null;
  has_inox: number;
}

interface SeasonStatsResponse {
  success: boolean;
  leagues: LeagueOption[];
  inox_performance?: InoxTeamPerformance[];
  division_stats?: {
    top_riders: TopRider[];
    avg_round_pts: number;
    total_teams: number;
  };
}

interface ZRLSeasonStatsProps {
  leagueKey?: string;
}

const ZRLSeasonStats: React.FC<ZRLSeasonStatsProps> = ({ leagueKey: initialLeagueKey }) => {
  const [selectedLeague, setSelectedLeague] = useState<string>(initialLeagueKey || '');
  const [leagues, setLeagues] = useState<LeagueOption[]>([]);
  const [inoxTeams, setInoxTeams] = useState<InoxTeamPerformance[]>([]);
  const [divisionStats, setDivisionStats] = useState<SeasonStatsResponse['division_stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLeagueDropdown, setShowLeagueDropdown] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchLeagueStats(selectedLeague);
    }
  }, [selectedLeague]);

  const fetchInitialData = async () => {
    try {
      const res = await fetch('/api/season-stats');
      const json: SeasonStatsResponse = await res.json();
      if (json.success) {
        setLeagues(json.leagues);
        if (!selectedLeague && json.leagues.length > 0) {
          setSelectedLeague(json.leagues[0].league_key);
        }
      }
    } catch (err) {
      console.error("Error fetching leagues", err);
    } finally {
      if (!selectedLeague) setLoading(false);
    }
  };

  const fetchLeagueStats = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/season-stats?league_key=${key}`);
      const json: SeasonStatsResponse = await res.json();
      if (json.success) {
        setInoxTeams(json.inox_performance || []);
        setDivisionStats(json.division_stats || null);
      }
    } catch (err) {
      console.error("Error fetching league stats", err);
    } finally {
      setLoading(false);
    }
  };

  const formatLeagueName = (l: LeagueOption | undefined) => {
    if (!l) return '---';
    if (l.league_display_name && l.league_display_name !== 'NULL') return l.league_display_name;
    const key = l.league_key;
    if (key.length >= 7) {
      const lKey = key.substring(1, 4);
      const cKey = key.substring(4, 5);
      const dKey = key.substring(5, 6);
      return `League ${lKey} - ${cKey}${dKey}`;
    }
    return `League ${key}`;
  };

  if (loading && leagues.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a]">
      <RefreshCw size={48} className="text-inox-orange animate-spin mb-4" />
      <p className="text-zinc-500 font-black uppercase tracking-[0.3em]">Calibrating Season Intelligence...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 space-y-12 pb-32 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-inox-orange/5 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-inox-cyan/5 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* HEADER SECTION */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 relative z-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
             <div className="px-4 py-1.5 bg-inox-orange/10 border border-inox-orange/20 rounded-full">
               <span className="text-[10px] font-black text-inox-orange uppercase tracking-[0.3em]">Season Analytics</span>
             </div>
             <div className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">v2.5 Enterprise</span>
             </div>
           </div>
           <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-white">
             SEASON <span className="text-zinc-800">STATS</span>
           </h1>
           <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest max-w-xl">
             Analisi dettagliata delle prestazioni stagionali, DNA tattico e ranking della divisione.
           </p>
        </div>

        <div className="relative w-full lg:w-[450px]">
           <button 
             onClick={() => setShowLeagueDropdown(!showLeagueDropdown)}
             className="w-full px-8 py-6 bg-zinc-900/60 border border-zinc-800 rounded-[2rem] flex items-center justify-between group hover:border-inox-orange/50 transition-all shadow-2xl backdrop-blur-md"
           >
             <div className="flex flex-col items-start text-left">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] leading-none mb-2">Division Active View</span>
                <span className="text-lg font-black uppercase text-white truncate max-w-[300px]">      
                  {formatLeagueName(leagues.find(l => l.league_key === selectedLeague))}
                </span>
             </div>
             <Filter size={20} className={`text-zinc-500 transition-transform ${showLeagueDropdown ? 'rotate-180 text-inox-orange' : ''}`} />
           </button>

           <AnimatePresence>
             {showLeagueDropdown && (
               <motion.div 
                 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                 className="absolute top-full mt-4 left-0 right-0 z-[100] bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar"
               >
                 {leagues.map((l) => (
                   <button
                     key={l.league_key}
                     onClick={() => { setSelectedLeague(l.league_key); setShowLeagueDropdown(false); }}
                     className={`w-full text-left px-8 py-6 hover:bg-inox-orange/10 flex items-center justify-between transition-all border-b border-zinc-800/50 last:border-0 ${selectedLeague === l.league_key ? 'bg-inox-orange/5' : ''}`}
                   >
                     <div className="flex flex-col">
                        <span className={`text-sm font-black uppercase ${selectedLeague === l.league_key ? 'text-inox-orange' : 'text-white'}`}>{formatLeagueName(l)}</span>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">ID: {l.league_key}</span>
                     </div>
                     {l.has_inox === 1 && (
                        <div className="w-8 h-8 rounded-xl bg-inox-orange/20 border border-inox-orange/30 flex items-center justify-center text-inox-orange">
                           <Shield size={16} />
                        </div>
                     )}
                   </button>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
           <RefreshCw size={64} className="text-inox-orange animate-spin opacity-50" />
           <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.5em] animate-pulse italic">Aggregating Division Telemetry...</p>
        </div>
      ) : (
        <div className="space-y-16 animate-in fade-in duration-1000">
          
          {/* TOP METRICS SECTION */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             <div className="bg-zinc-900/40 p-10 rounded-[3rem] border border-zinc-800 flex flex-col gap-4 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl">
                <Users size={32} className="text-zinc-600" />
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Division Size</p>
                <p className="text-6xl font-black italic text-white tracking-tighter">{divisionStats?.total_teams || 0} <span className="text-zinc-800">Teams</span></p>
             </div>
             
             <div className="bg-inox-cyan/10 p-10 rounded-[3rem] border border-inox-cyan/20 flex flex-col gap-4 relative overflow-hidden group hover:border-inox-cyan/40 transition-all shadow-2xl">
                <Activity size={32} className="text-inox-cyan" />
                <p className="text-[11px] font-black text-inox-cyan/70 uppercase tracking-widest">Avg Round Points</p>
                <p className="text-6xl font-black italic text-inox-cyan tracking-tighter">{divisionStats?.avg_round_pts || 0}</p>
                <div className="absolute -bottom-4 -right-4 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                   <TrendingUp size={120} />
                </div>
             </div>

             <div className="bg-inox-orange/10 p-10 rounded-[3rem] border border-inox-orange/20 flex flex-col gap-4 relative overflow-hidden group hover:border-inox-orange/40 transition-all shadow-2xl">
                <Star size={32} className="text-inox-orange" />
                <p className="text-[11px] font-black text-inox-orange/70 uppercase tracking-widest">Inox Squadrons</p>
                <p className="text-6xl font-black italic text-inox-orange tracking-tighter">{inoxTeams.length}</p>
                <div className="absolute -bottom-4 -right-4 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                   <Shield size={120} />
                </div>
             </div>

             <div className="bg-zinc-900/40 p-10 rounded-[3rem] border border-zinc-800 flex flex-col gap-4 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl">
                <Target size={32} className="text-zinc-600" />
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Top Inox Rider</p>
                <p className="text-3xl font-black italic text-white leading-tight uppercase truncate">{divisionStats?.top_riders.find(r => r.is_inox === 1)?.rider_name || 'N/A'}</p>
                <p className="text-inox-orange text-[10px] font-black uppercase tracking-widest">MVP Candidate</p>
             </div>
          </section>

          {/* INOX PERFORMANCE CARDS */}
          <section className="space-y-12">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-8 bg-inox-orange rounded-full" />
               <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Inox <span className="text-zinc-800 text-3xl">Squad Analysis</span></h2>
            </div>

            <div className="grid grid-cols-1 gap-16">
              {inoxTeams.map((team, idx) => {
                const chartData = [1, 2, 3, 4, 5, 6].map(rIdx => ({
                  name: `R${rIdx}`,
                  pts: team.history[rIdx]?.pts || 0,
                  finish: team.history[rIdx]?.details.finish || 0,
                  fal: team.history[rIdx]?.details.fal || 0,
                  fts: team.history[rIdx]?.details.fts || 0
                }));

                const radarData = [
                  { subject: 'Finish', A: (team.totals.finish / (team.totals.total || 1)) * 100, fullMark: 100 },
                  { subject: 'FAL', A: (team.totals.fal / (team.totals.total || 1)) * 100, fullMark: 100 },
                  { subject: 'FTS', A: (team.totals.fts / (team.totals.total || 1)) * 100, fullMark: 100 },
                  { subject: 'Consistency', A: (Object.keys(team.history).length / 4) * 100, fullMark: 100 },
                  { subject: 'Effort', A: 85, fullMark: 100 }
                ];

                return (
                  <motion.div 
                    key={team.team_name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-zinc-950/50 border border-zinc-900 rounded-[4rem] overflow-hidden shadow-2xl group hover:border-zinc-800 transition-all"
                  >
                    <div className="grid grid-cols-1 xl:grid-cols-12">
                       {/* LEFT INFO PANEL */}
                       <div className="xl:col-span-4 p-12 border-b xl:border-b-0 xl:border-r border-zinc-900 flex flex-col justify-between space-y-12">
                          <div className="space-y-6">
                             <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-inox-orange rounded-3xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(252,103,25,0.3)] border-4 border-white/10">
                                   <Shield size={32} />
                                </div>
                                <div>
                                   <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{team.team_name}</h3>
                                   <div className="flex items-center gap-4 mt-3">
                                      <p className="text-[11px] font-black text-inox-orange uppercase tracking-[0.2em] italic underline decoration-2 underline-offset-4 decoration-inox-orange/50">#Official Squadron</p>
                                   </div>
                                </div>
                             </div>

                             <div className="p-8 bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 relative overflow-hidden group/arch hover:border-inox-cyan/50 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                   <Zap size={16} className="text-inox-cyan" />
                                   <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Tactical DNA Archetype</span>
                                </div>
                                <p className="text-2xl font-black italic text-white uppercase leading-tight tracking-tighter">{team.archetype}</p>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
                                   <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">League Points</p>
                                   <p className="text-3xl font-black italic text-inox-orange">{team.league_points || 0} <span className="text-[10px] text-zinc-700">LP</span></p>
                                </div>
                                <div className="p-6 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
                                   <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Div Rank</p>
                                   <p className="text-3xl font-black italic text-white">#{team.overall_rank || 'N/A'}</p>
                                </div>
                             </div>
                          </div>

                          <div className="h-[250px] w-full flex items-center justify-center">
                             <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                  <PolarGrid stroke="#27272a" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: '900' }} />
                                  <Radar
                                    name={team.team_name}
                                    dataKey="A"
                                    stroke="#fc6719"
                                    fill="#fc6719"
                                    fillOpacity={0.6}
                                  />
                                </RadarChart>
                             </ResponsiveContainer>
                          </div>
                       </div>

                       {/* RIGHT CHART PANEL */}
                       <div className="xl:col-span-8 p-12 space-y-12">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                             <div className="flex items-center gap-4">
                                <BarChart3 size={24} className="text-inox-cyan" />
                                <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter">Season Progression</h4>
                             </div>
                             <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                   <div className="w-3 h-3 rounded bg-inox-orange" />
                                   <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Total Points</span>
                                </div>
                                <div className="flex items-center gap-2">
                                   <div className="w-3 h-3 rounded bg-inox-cyan" />
                                   <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">FAL Bonus</span>
                                </div>
                             </div>
                          </div>

                          <div className="h-[350px] w-full bg-black/40 rounded-[3rem] p-8 border border-zinc-900/50">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                  <defs>
                                    <linearGradient id="colorPts" x1="0" y2="1">
                                      <stop offset="5%" stopColor="#fc6719" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#fc6719" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} fontWeight={900} />
                                  <YAxis hide />
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '1.5rem' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                  />
                                  <Area type="monotone" dataKey="pts" stroke="#fc6719" strokeWidth={5} fillOpacity={1} fill="url(#colorPts)" />
                                </AreaChart>
                             </ResponsiveContainer>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             {[
                               { label: 'FINISH POWER', val: team.totals.finish, icon: Trophy, color: 'text-white' },
                               { label: 'FAL AGGRESSION', val: team.totals.fal, icon: Zap, color: 'text-inox-orange' },
                               { label: 'FTS VELOCITY', val: team.totals.fts, icon: Activity, color: 'text-inox-cyan' }
                             ].map((stat, sidx) => (
                               <div key={sidx} className="p-8 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 flex flex-col gap-4 hover:scale-[1.02] transition-transform">
                                  <stat.icon size={24} className={stat.color} />
                                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                                  <p className={`text-4xl font-black italic tracking-tighter ${stat.color}`}>{stat.val}</p>
                                  <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">Season Aggregate</p>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* DIVISION MVP SECTION */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-zinc-900">
             <div className="lg:col-span-4 space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-8 bg-inox-cyan rounded-full shadow-[0_0_15px_rgba(0,188,212,0.4)]" />
                   <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">MVP <span className="text-zinc-800 text-3xl">Hall of Fame</span></h2>
                </div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] leading-relaxed italic">
                   I 10 migliori atleti della divisione basati sull'indice di impatto punti totale (Finish + Bonus).
                </p>
                <div className="p-10 bg-gradient-to-br from-inox-orange/20 to-transparent border border-inox-orange/30 rounded-[3rem] relative overflow-hidden group">
                   <div className="relative z-10 flex flex-col gap-6">
                      <div className="w-16 h-16 bg-inox-orange rounded-2xl flex items-center justify-center text-black shadow-2xl">
                         <Award size={32} />
                      </div>
                      <div>
                         <h5 className="text-xs font-black text-inox-orange uppercase tracking-[0.3em] mb-2">Division Dominator</h5>
                         <p className="text-3xl font-black italic text-white uppercase tracking-tighter leading-tight">
                            {divisionStats?.top_riders[0]?.rider_name}
                         </p>
                         <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Team: {divisionStats?.top_riders[0]?.team_name}</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                         <span className="text-5xl font-black italic text-white">{divisionStats?.top_riders[0]?.total_pts}</span>
                         <span className="text-xs font-black text-inox-orange uppercase tracking-widest italic">Points Earned</span>
                      </div>
                   </div>
                   <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                      <TrendingUp size={180} className="text-inox-orange" />
                   </div>
                </div>
             </div>

             <div className="lg:col-span-8">
                <div className="bg-zinc-950/50 border border-zinc-900 rounded-[4rem] overflow-hidden shadow-2xl">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-900/80">
                           <th className="px-10 py-8 text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Rank</th>
                           <th className="px-10 py-8 text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Athlete</th>
                           <th className="px-10 py-8 text-center text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">FAL/FTS</th>
                           <th className="px-10 py-8 text-right text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Total Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                         {divisionStats?.top_riders.map((rider, ridx) => (
                           <tr key={ridx} className={`group hover:bg-white/5 transition-all ${rider.is_inox ? 'bg-inox-orange/5' : ''}`}>
                              <td className="px-10 py-8">
                                 <span className={`text-3xl font-black italic ${ridx < 3 ? 'text-inox-orange' : 'text-zinc-800 group-hover:text-zinc-500'}`}>#{ridx + 1}</span>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex flex-col">
                                    <span className={`text-lg font-black uppercase italic ${rider.is_inox ? 'text-inox-orange' : 'text-white'}`}>{rider.rider_name}</span>
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1 italic">{rider.team_name}</span>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex justify-center items-center gap-3">
                                    <div className="flex flex-col items-center">
                                       <span className="text-[8px] font-black text-zinc-700 uppercase">FAL</span>
                                       <span className="text-xs font-black text-inox-cyan">{rider.total_fal}</span>
                                    </div>
                                    <div className="w-px h-6 bg-zinc-800" />
                                    <div className="flex flex-col items-center">
                                       <span className="text-[8px] font-black text-zinc-700 uppercase">FTS</span>
                                       <span className="text-xs font-black text-orange-500">{rider.total_fts}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <span className="text-2xl font-black italic text-white group-hover:scale-110 transition-transform inline-block">{rider.total_pts}</span>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </section>
        </div>
      )}

      {/* FOOTER INFO */}
      <footer className="mt-20 pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
               <Info size={20} className="text-inox-orange" />
            </div>
            <div>
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Division Analytics Engine • Inoxteam Intel Hub</p>
               <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mt-1">Real-time Cloudflare D1 Sync • Round Group Aggregator v2.5</p>
            </div>
         </div>
         <p className="text-[9px] font-black text-zinc-700 uppercase italic">Confidential Data Access • Authorized Personnel Only</p>
      </footer>
    </div>
  );
};

export default ZRLSeasonStats;
