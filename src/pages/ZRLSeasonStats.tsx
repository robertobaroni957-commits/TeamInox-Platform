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
          const firstInox = json.leagues.find(l => l.has_inox === 1) || json.leagues[0];
          setSelectedLeague(firstInox.league_key);
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
    <div className="flex flex-col items-center justify-center py-20">
      <RefreshCw size={48} className="text-inox-orange animate-spin mb-4" />
      <p className="text-zinc-500 font-black uppercase tracking-[0.3em]">Loading Season Intel...</p>
    </div>
  );

  return (
    <div className="space-y-16 pb-20">
      
      {/* HEADER & SELECTOR */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-zinc-900 pb-12">
        <div className="space-y-2">
           <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Season <span className="text-zinc-800">Intelligence</span></h2>
           <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest italic">Aggregated performance data for current league</p>
        </div>

        <div className="relative w-full lg:w-[400px]">
           <button 
             onClick={() => setShowLeagueDropdown(!showLeagueDropdown)}
             className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between hover:border-inox-orange transition-all"
           >
             <span className="text-sm font-black uppercase text-white">
               {formatLeagueName(leagues.find(l => l.league_key === selectedLeague))}
             </span>
             <Filter size={16} className="text-zinc-500" />
           </button>
           
           <AnimatePresence>
             {showLeagueDropdown && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                 className="absolute top-full mt-2 left-0 right-0 z-[100] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto"
               >
                 {leagues.map((l) => (
                   <button
                     key={l.league_key}
                     onClick={() => { setSelectedLeague(l.league_key); setShowLeagueDropdown(false); }}
                     className="w-full text-left px-6 py-4 hover:bg-zinc-800 flex items-center justify-between border-b border-zinc-800/50 last:border-0"
                   >
                     <span className={`text-xs font-black uppercase ${selectedLeague === l.league_key ? 'text-inox-orange' : 'text-white'}`}>
                       {formatLeagueName(l)}
                     </span>
                     {l.has_inox === 1 && <Shield size={12} className="text-inox-orange" />}
                   </button>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
           <RefreshCw size={40} className="text-inox-orange animate-spin opacity-50" />
        </div>
      ) : (
        <div className="space-y-24">
          
          {/* TEAM CARDS */}
          {(() => {
            const maxPoints = Math.max(...inoxTeams.map(t => Math.max(...Object.values(t.history).map(h => h.pts), 0)), 100);
            
            return inoxTeams.map((team, idx) => {
              const fullChartData = [1, 2, 3, 4, 5, 6, 7, 8].map(rIdx => ({
                 name: `R${rIdx}`,
                 pts: team.history[rIdx]?.pts || 0
              }));

              const radarData = [
                { subject: 'Finish', A: Math.min(100, (team.totals.finish / (team.totals.total || 1)) * 150) },
                { subject: 'FAL', A: Math.min(100, (team.totals.fal / (team.totals.total || 1)) * 300) },
                { subject: 'FTS', A: Math.min(100, (team.totals.fts / (team.totals.total || 1)) * 300) },
                { subject: 'LP', A: (team.league_points || 0) * 5 },
                { subject: 'Rank', A: team.overall_rank ? (100 - team.overall_rank * 5) : 50 }
              ];

              const gradientId = `grad-${team.team_name.replace(/\s+/g, '-')}-${idx}`;

              return (
                <motion.div 
                  key={team.team_name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-zinc-950 border border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl"
                >
                  <div className="grid grid-cols-1 xl:grid-cols-12">
                     {/* INFO PANEL */}
                     <div className="xl:col-span-4 p-10 border-b xl:border-b-0 xl:border-r border-zinc-900 space-y-10">
                        <div className="flex items-center gap-5">
                           <div className="w-14 h-14 bg-inox-orange rounded-2xl flex items-center justify-center text-black shadow-lg shadow-inox-orange/20">
                              <Shield size={28} />
                           </div>
                           <div>
                              <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{team.team_name}</h3>
                              <p className="text-inox-orange text-[9px] font-black uppercase tracking-widest mt-2">Official Squad Performance</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                              <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Rank</p>
                              <p className="text-3xl font-black italic text-white">#{team.overall_rank || 'N/A'}</p>
                           </div>
                           <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                              <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Points</p>
                              <p className="text-3xl font-black italic text-inox-orange">{team.league_points || 0}</p>
                           </div>
                        </div>

                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height={250}>
                             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                               <PolarGrid stroke="#27272a" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: '900' }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                               <Radar
                                 name={team.team_name}
                                 dataKey="A"
                                 stroke="#fc6719"
                                 fill="#fc6719"
                                 fillOpacity={0.5}
                               />
                             </RadarChart>
                          </ResponsiveContainer>
                        </div>
                     </div>

                     {/* CHART PANEL */}
                     <div className="xl:col-span-8 p-10 space-y-10">
                        <div className="flex justify-between items-center">
                           <h4 className="text-xl font-black italic text-white uppercase tracking-tighter">Season Progression</h4>
                           <div className="px-4 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{team.archetype}</span>
                           </div>
                        </div>

                        <div className="h-[300px] w-full bg-black/40 rounded-[2.5rem] p-6 border border-zinc-900/50">
                          <ResponsiveContainer width="100%" height={250}>
                             <AreaChart data={fullChartData}>
                               <defs>
                                 <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#fc6719" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#fc6719" stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} fontWeight={900} />
                               <YAxis hide domain={[0, maxPoints]} />
                               <Tooltip 
                                 contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '1rem' }}
                                 itemStyle={{ fontSize: '10px', fontWeight: '900' }}
                               />
                               <Area type="monotone" dataKey="pts" stroke="#fc6719" strokeWidth={4} fill={`url(#${gradientId})`} />
                             </AreaChart>
                          </ResponsiveContainer>
                        </div>

                      <div className="grid grid-cols-3 gap-3 md:gap-6">
                         {[
                           { label: 'Finish', val: team.totals.finish, color: 'text-white' },
                           { label: 'FAL', val: team.totals.fal, color: 'text-orange-500' },
                           { label: 'FTS', val: team.totals.fts, color: 'text-inox-cyan' }
                         ].map(s => (
                           <div key={s.label} className="flex flex-col">
                              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{s.label}</span>
                              <span className={`text-3xl font-black italic ${s.color}`}>{s.val}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </motion.div>
            );
          });
        })()}

          {/* MVP TABLE */}
          {divisionStats && (
            <section className="space-y-8 pt-12 border-t border-zinc-900">
               <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-inox-cyan rounded-full" />
                  <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Division <span className="text-zinc-800">Top 10</span></h2>
               </div>
               
               <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] overflow-hidden overflow-x-auto">
                  <table className="w-full text-left min-w-[400px]">
                     <thead>
                        <tr className="bg-zinc-900/50 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                           <th className="px-8 py-6">Rank</th>
                           <th className="px-8 py-6">Athlete</th>
                           <th className="px-8 py-6 text-right">Total Pts</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-900">
                        {divisionStats.top_riders.map((rider, idx) => (
                          <tr key={idx} className={`hover:bg-white/5 transition-colors ${rider.is_inox ? 'bg-inox-orange/5' : ''}`}>
                             <td className="px-8 py-6">
                                <span className={`text-2xl font-black italic ${idx < 3 ? 'text-inox-orange' : 'text-zinc-800'}`}>#{idx + 1}</span>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex flex-col">
                                   <span className="text-sm font-black text-white uppercase italic">{rider.rider_name}</span>
                                   <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{rider.team_name}</span>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <span className="text-xl font-black italic text-white">{rider.total_pts}</span>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default ZRLSeasonStats;
