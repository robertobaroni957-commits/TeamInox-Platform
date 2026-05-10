import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Users, Target, Zap, Activity, Star, 
  BarChart3, TrendingUp, Shield, Info, RefreshCw, 
  Search, Camera, ChevronRight, Hash, Award,
  Crown, Flame, FastForward, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

// --- INTERFACES ---
interface TeamRoundStat {
  lp: number;
  trp: number;
  fal: number;
  fts: number;
  fin: number;
}

interface TeamSeasonStat {
  team_name: string;
  league_key: string;
  total_lp: number;
  total_trp: number;
  total_fal: number;
  total_fts: number;
  total_finish: number;
  is_inox: number;
  rounds: Record<number, TeamRoundStat>;
}

interface RiderSeasonStat {
  rider_name: string;
  team_name: string;
  zid: number;
  total_points: number;
  total_finish: number;
  total_fal: number;
  total_fts: number;
  races_count: number;
  is_inox: number;
  rounds: Record<number, number>;
}

interface SeasonData {
  success: boolean;
  season_id: string;
  league_key: string | null;
  teams: TeamSeasonStat[];
  riders: RiderSeasonStat[];
  highlights: {
    top_scorer: RiderSeasonStat | null;
    top_sprinter: RiderSeasonStat | null;
    top_attacker: RiderSeasonStat | null;
    most_consistent: RiderSeasonStat | null;
  };
}

interface ZRLSeasonStatsProps {
  leagueKey?: string;
  seasonId?: string;
}

const ZRLSeasonStats: React.FC<ZRLSeasonStatsProps> = ({ leagueKey, seasonId = "19" }) => {
  const [data, setData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teams' | 'riders'>('teams');
  const [searchTerm, setSearchTerm] = useState('');
  const [snapshotMode, setSnapshotMode] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSeasonStats();
  }, [leagueKey, seasonId]);

  const fetchSeasonStats = async () => {
    setLoading(true);
    try {
      let url = `/api/season-stats?season_id=${seasonId}`;
      if (leagueKey) url += `&league_key=${leagueKey}`;
      
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Error fetching season stats", err);
    } finally {
      setLoading(false);
    }
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
        link.download = `zrl_season_report_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (e) {
        console.error("Capture error:", e);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RefreshCw size={40} className="text-inox-orange animate-spin" />
    </div>
  );

  const filteredRiders = data?.riders.filter(r => 
    r.rider_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const roundIndices = [1, 2, 3, 4]; // Round da visualizzare

  return (
    <div className={`transition-all duration-500 ${snapshotMode ? 'bg-[#050505] p-0' : 'space-y-8 pb-20'}`}>
      
      {/* HEADER SECTION (Hidden in snapshot) */}
      {!snapshotMode && (
        <section className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 px-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-inox-orange/10 border border-inox-orange/20 rounded-full">
                 <span className="text-[9px] font-black text-inox-orange uppercase tracking-[0.2em]">Season Intelligence</span>
              </div>
              <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">ZRL Season {data?.season_id}</span>
              </div>
              {data?.league_key && (
                <div className="px-3 py-1 bg-inox-cyan/10 border border-inox-cyan/20 rounded-full">
                  <span className="text-[9px] font-black text-inox-cyan uppercase tracking-[0.2em]">{data.league_key}</span>
                </div>
              )}
            </div>
            <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
              SEASON <span className="text-zinc-700">REPORT</span>
            </h1>
            <p className="text-zinc-500 font-bold italic text-sm uppercase tracking-widest">
               Analisi aggregata delle performance per Round.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="flex gap-2 p-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl backdrop-blur-md shadow-xl">
               <button 
                onClick={() => setActiveTab('teams')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'teams' ? 'bg-inox-orange text-black shadow-lg shadow-inox-orange/20' : 'text-zinc-500 hover:text-white'}`}
               >
                 <Shield size={14} /> Team Performance
               </button>
               <button 
                onClick={() => setActiveTab('riders')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'riders' ? 'bg-inox-orange text-black shadow-lg shadow-inox-orange/20' : 'text-zinc-500 hover:text-white'}`}
               >
                 <Users size={14} /> Rider Index
               </button>
            </div>
            <button 
              onClick={() => setSnapshotMode(true)}
              className="p-5 bg-white text-black rounded-2xl hover:bg-inox-orange transition-all shadow-2xl hover:scale-105"
            >
              <Camera size={20} />
            </button>
          </div>
        </section>
      )}

      <div ref={captureRef} className={snapshotMode ? 'w-[1200px] bg-[#050505] p-12 flex flex-col border-[20px] border-zinc-900 mx-auto relative min-h-screen' : 'px-6 space-y-10'}>
        
        {/* SNAPSHOT HEADER */}
        {snapshotMode && (
          <div className="flex items-center gap-6 mb-12">
            <div className="w-24 h-24 bg-inox-orange flex items-center justify-center rounded-[2.5rem] shadow-[0_0_50px_rgba(252,103,25,0.3)] border-4 border-white/20">
              <Shield size={48} className="text-black" />
            </div>
            <div className="flex flex-col">
               <h2 className="text-5xl font-black italic text-white leading-none tracking-tighter uppercase">INOXTEAM <span className="text-zinc-700">SEASON REPORT</span></h2>
               <p className="text-inox-orange font-black uppercase tracking-[0.5em] text-sm mt-2 italic">ZRL SEASON {data?.season_id} OFFICIAL PERFORMANCE LOG</p>
            </div>
          </div>
        )}

        {/* SEASON HIGHLIGHTS BENTO */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Season MVP', value: data?.highlights.top_scorer?.rider_name, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
             { label: 'Sprint King', value: data?.highlights.top_sprinter?.rider_name, icon: FastForward, color: 'text-inox-cyan', bg: 'bg-inox-cyan/10' },
             { label: 'Top Attacker', value: data?.highlights.top_attacker?.rider_name, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
             { label: 'Iron Rider', value: data?.highlights.most_consistent?.rider_name, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
           ].map((h, i) => (
             <div key={i} className="p-6 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800/50 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all shadow-2xl backdrop-blur-md">
                <div className="absolute -top-2 -right-2 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                   <h.icon size={80} />
                </div>
                <h.icon size={20} className={h.color} />
                <div>
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{h.label}</p>
                   <p className="text-xl font-black italic text-white uppercase tracking-tighter leading-tight">{h.value || 'N/A'}</p>
                </div>
             </div>
           ))}
        </section>

        {/* TEAM GC VIEW */}
        {activeTab === 'teams' && (
          <section className="space-y-6">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-md">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-black/40 border-b border-zinc-800">
                        <tr className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                           <th className="px-8 py-6">Squadra</th>
                           <th className="px-4 py-6 text-center text-inox-orange">LP</th>
                           {roundIndices.map(r => (
                             <th key={r} className="px-4 py-6 text-center border-l border-zinc-800/30">R{r} Rank</th>
                           ))}
                           <th className="px-8 py-6 text-right">Performance Mix</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-800/50">
                        {data?.teams.map((team, idx) => (
                          <React.Fragment key={idx}>
                            <tr 
                              onClick={() => setExpandedTeam(expandedTeam === team.team_name ? null : team.team_name)}
                              className={`group cursor-pointer transition-all ${team.is_inox ? 'bg-inox-orange/5 hover:bg-inox-orange/10' : 'hover:bg-zinc-800/40'}`}
                            >
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <span className="text-2xl font-black italic text-zinc-800">#{idx + 1}</span>
                                     <div className="flex flex-col">
                                        <span className="text-lg font-black text-white uppercase tracking-tight italic">{team.team_name}</span>
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{team.league_key}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-4 py-6 text-center">
                                  <span className="text-xl font-black italic text-inox-orange">{team.total_lp}</span>
                               </td>
                               {roundIndices.map(r => {
                                 const rd = team.rounds[r];
                                 return (
                                   <td key={r} className="px-4 py-6 text-center border-l border-zinc-800/30">
                                      {rd ? (
                                        <div className="flex flex-col items-center">
                                           <span className="text-xs font-black text-white">{rd.lp}pt</span>
                                           <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest">{rd.trp} TRP</span>
                                        </div>
                                      ) : <span className="text-zinc-800 font-black">-</span>}
                                   </td>
                                 );
                               })}
                               <td className="px-8 py-6">
                                  <div className="flex justify-end gap-1.5">
                                     {[
                                       { label: 'FIN', val: team.total_finish, color: 'bg-white' },
                                       { label: 'FTS', val: team.total_fts, color: 'bg-inox-cyan' },
                                       { label: 'FAL', val: team.total_fal, color: 'bg-orange-500' }
                                     ].map((p, pi) => (
                                       <div key={pi} className="flex flex-col items-center gap-1">
                                          <div className={`h-10 w-1.5 rounded-full bg-zinc-800 relative overflow-hidden`}>
                                             <motion.div 
                                              initial={{ height: 0 }}
                                              animate={{ height: `${(p.val / (team.total_trp || 1)) * 100}%` }}
                                              className={`absolute bottom-0 left-0 right-0 ${p.color}`}
                                             />
                                          </div>
                                          <span className="text-[6px] font-black text-zinc-600">{p.label}</span>
                                       </div>
                                     ))}
                                  </div>
                               </td>
                            </tr>
                            
                            <AnimatePresence>
                              {expandedTeam === team.team_name && (
                                <motion.tr 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-black/40"
                                >
                                  <td colSpan={roundIndices.length + 3} className="px-8 py-8">
                                     <div className="grid grid-cols-4 gap-6">
                                        {roundIndices.map(r => {
                                          const rd = team.rounds[r];
                                          if (!rd) return null;
                                          return (
                                            <div key={r} className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800 space-y-4">
                                               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800 pb-2">Round {r} Breakdown</p>
                                               <div className="space-y-2">
                                                  {[
                                                    { label: 'Finish Points', val: rd.fin, color: 'text-white' },
                                                    { label: 'FAL Points', val: rd.fal, color: 'text-orange-500' },
                                                    { label: 'FTS Points', val: rd.fts, color: 'text-inox-cyan' }
                                                  ].map((item, ii) => (
                                                    <div key={ii} className="flex justify-between items-center">
                                                       <span className="text-[8px] font-bold text-zinc-600 uppercase">{item.label}</span>
                                                       <span className={`text-xs font-black italic ${item.color}`}>{item.val}</span>
                                                    </div>
                                                  ))}
                                               </div>
                                            </div>
                                          );
                                        })}
                                     </div>
                                  </td>
                                </motion.tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </section>
        )}

        {/* RIDER INDEX VIEW */}
        {activeTab === 'riders' && (
          <section className="space-y-6">
             {!snapshotMode && (
               <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-[2rem] border-2 border-zinc-800 shadow-xl backdrop-blur-md">
                  <Search size={20} className="text-zinc-500 ml-4" />
                  <input 
                    type="text" 
                    placeholder="Search by rider or squadron..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-white font-bold uppercase italic text-sm w-full focus:ring-0 outline-none"
                  />
               </div>
             )}

             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredRiders.map((rider, i) => (
                  <motion.div 
                    key={rider.zid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.01 }}
                    className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl hover:border-inox-orange/50 transition-all group backdrop-blur-md relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                       <div className="space-y-1">
                          <p className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-inox-orange transition-colors">{rider.rider_name}</p>
                          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{rider.team_name}</p>
                       </div>
                       
                       <div className="flex items-center gap-6">
                          {roundIndices.map(r => (
                            <div key={r} className="flex flex-col items-center">
                               <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">R{r}</p>
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${rider.rounds[r] ? 'bg-zinc-950 border-inox-orange/40' : 'bg-transparent border-zinc-800/50 opacity-30'}`}>
                                  <span className={`text-xs font-black italic ${rider.rounds[r] ? 'text-white' : 'text-zinc-700'}`}>{rider.rounds[r] || '0'}</span>
                               </div>
                            </div>
                          ))}
                          <div className="h-12 w-px bg-zinc-800 ml-2" />
                          <div className="text-right">
                             <p className="text-4xl font-black italic text-white tracking-tighter">{rider.total_points}</p>
                             <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Season Total</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800/50">
                       {[
                         { label: 'FINISH', val: rider.total_finish, color: 'text-white', icon: Trophy },
                         { label: 'FTS SPEED', val: rider.total_fts, color: 'text-inox-cyan', icon: FastForward },
                         { label: 'FAL POWER', val: rider.total_fal, color: 'text-orange-500', icon: Flame },
                         { label: 'RACES', val: rider.races_count, color: 'text-zinc-500', icon: Activity }
                       ].map((s, idx) => (
                         <div key={idx} className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800 ${s.color}`}>
                               <s.icon size={12} />
                            </div>
                            <div>
                               <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">{s.label}</p>
                               <p className={`text-sm font-black italic ${s.color}`}>{s.val}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </motion.div>
                ))}
             </div>
          </section>
        )}

        {/* SNAPSHOT FOOTER */}
        {snapshotMode && (
          <div className="mt-12 pt-8 border-t border-zinc-900 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                   <Info size={18} className="text-inox-orange" />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Season Strategic Intelligence developed by Inoxteam Command Center</p>
             </div>
             <p className="text-[10px] font-black text-zinc-700 uppercase italic">© 2025 INOXTEAM OFFICIAL REPORT</p>
          </div>
        )}
      </div>

      {/* --- EXIT & SAVE BUTTONS --- */}
      {snapshotMode && (
        <div className="fixed bottom-12 right-12 flex gap-4 z-[200]">
          <button onClick={() => setSnapshotMode(false)} className="px-10 py-5 bg-zinc-800 text-white font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter border-2 border-zinc-700">EXIT HALL</button>
          <button onClick={handleCapture} className="px-10 py-5 bg-inox-orange text-black font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter border-2 border-orange-600">DOWNLOAD REPORT</button>
        </div>
      )}
    </div>
  );
};

export default ZRLSeasonStats;
