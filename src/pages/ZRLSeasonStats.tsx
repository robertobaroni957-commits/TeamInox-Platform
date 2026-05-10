import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Users, Target, Zap, Activity, Star, 
  BarChart3, TrendingUp, Shield, Info, RefreshCw, 
  Search, Camera, ChevronRight, Hash, Award,
  Crown, Flame, FastForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

// --- INTERFACES ---
interface TeamSeasonStat {
  team_name: string;
  league_key: string;
  total_lp: number;
  total_trp: number;
  total_fal: number;
  total_fts: number;
  total_finish: number;
  is_inox: number;
  segments_completed: number;
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
}

interface SeasonData {
  success: boolean;
  season_id: string;
  teams: TeamSeasonStat[];
  riders: RiderSeasonStat[];
  highlights: {
    top_scorer: RiderSeasonStat | null;
    top_sprinter: RiderSeasonStat | null;
    top_attacker: RiderSeasonStat | null;
    most_consistent: RiderSeasonStat | null;
  };
}

const ZRLSeasonStats: React.FC = () => {
  const [data, setData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teams' | 'riders'>('teams');
  const [searchTerm, setSearchTerm] = useState('');
  const [snapshotMode, setSnapshotMode] = useState(false);
  
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSeasonStats();
  }, []);

  const fetchSeasonStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/season-stats?season_id=19');
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
        link.download = `zrl_season_recap_${Date.now()}.png`;
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

  const topInoxTeams = data?.teams.filter(t => t.is_inox === 1) || [];

  return (
    <div className={`transition-all duration-500 ${snapshotMode ? 'bg-[#050505] p-0 overflow-hidden' : 'space-y-8 pb-20'}`}>
      
      {/* HEADER SECTION (Hidden in snapshot) */}
      {!snapshotMode && (
        <section className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 px-6 pt-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-inox-orange/10 border border-inox-orange/20 rounded-full">
                 <span className="text-[9px] font-black text-inox-orange uppercase tracking-[0.2em]">Season Intelligence</span>
              </div>
              <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">ZRL Season {data?.season_id}</span>
              </div>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
              SEASON <span className="text-zinc-700">RECAP</span>
            </h1>
            <p className="text-zinc-400 font-bold italic text-sm uppercase tracking-widest italic">
               Aggregazione totale delle performance: Squadre e Atleti.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="flex gap-2 p-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl backdrop-blur-md shadow-xl">
               <button 
                onClick={() => setActiveTab('teams')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'teams' ? 'bg-inox-orange text-black shadow-lg shadow-inox-orange/20' : 'text-zinc-500 hover:text-white'}`}
               >
                 <Shield size={14} /> Team GC
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

      <div ref={captureRef} className={snapshotMode ? 'w-[1080px] h-[1080px] bg-[#050505] p-12 flex flex-col justify-center border-[20px] border-zinc-900 mx-auto relative' : 'px-6 space-y-10'}>
        
        {/* SNAPSHOT HEADER */}
        {snapshotMode && (
          <div className="absolute top-12 left-12 right-12 flex items-center gap-6">
            <div className="w-24 h-24 bg-inox-orange flex items-center justify-center rounded-[2.5rem] shadow-[0_0_50px_rgba(252,103,25,0.3)] border-4 border-white/20">
              <Shield size={48} className="text-black" />
            </div>
            <div className="flex flex-col">
               <h2 className="text-5xl font-black italic text-white leading-none tracking-tighter uppercase">INOXTEAM <span className="text-zinc-700">Hall of Fame</span></h2>
               <p className="text-inox-orange font-black uppercase tracking-[0.5em] text-sm mt-2 italic">ZRL SEASON {data?.season_id} OFFICIAL REPORT</p>
            </div>
          </div>
        )}

        {/* SEASON HIGHLIGHTS BENTO */}
        <section className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${snapshotMode ? 'mt-32' : ''}`}>
           {[
             { label: 'Season MVP', value: data?.highlights.top_scorer?.rider_name, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
             { label: 'Sprint King', value: data?.highlights.top_sprinter?.rider_name, icon: FastForward, color: 'text-inox-cyan', bg: 'bg-inox-cyan/10' },
             { label: 'Top Attacker', value: data?.highlights.top_attacker?.rider_name, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
             { label: 'Iron Rider', value: data?.highlights.most_consistent?.rider_name, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
           ].map((h, i) => (
             <div key={i} className={`p-6 rounded-[2.5rem] ${h.bg} border border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all shadow-2xl backdrop-blur-md`}>
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
          <section className="bg-zinc-900/40 border-2 border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-md relative">
             <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-3">
                   <Shield size={24} className="text-inox-orange" />
                   <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Team Season Standings</h3>
                </div>
                {!snapshotMode && (
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ranked by Season LP</span>
                )}
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-zinc-950/50 border-b border-zinc-800">
                      <tr className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                         <th className="px-10 py-6 text-center">RANK</th>
                         <th className="px-10 py-6">SQUADRON</th>
                         <th className="px-8 py-6 text-center text-inox-orange">TOTAL LP</th>
                         <th className="px-8 py-6 text-center">TOTAL TRP</th>
                         <th className="px-6 py-6 text-center opacity-60">FIN</th>
                         <th className="px-6 py-6 text-center opacity-60">FAL</th>
                         <th className="px-6 py-6 text-center opacity-60">FTS</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-800/50">
                      {(snapshotMode ? data?.teams.slice(0, 10) : data?.teams)?.map((team, idx) => (
                        <tr key={idx} className={`group transition-all ${team.is_inox ? 'bg-inox-orange/5 hover:bg-inox-orange/10' : 'hover:bg-zinc-800/40'}`}>
                           <td className="px-10 py-6 text-center">
                              <span className={`text-4xl font-black italic ${idx < 3 ? 'text-white' : 'text-zinc-800'}`}>#{idx + 1}</span>
                           </td>
                           <td className="px-10 py-6">
                              <div className="flex flex-col">
                                 <span className="text-2xl font-black text-white uppercase tracking-tight leading-none italic">{team.team_name}</span>
                                 <span className="text-[9px] font-bold text-zinc-500 mt-2 uppercase tracking-widest">{team.league_key}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-950 border-2 border-zinc-800 group-hover:border-inox-orange/40 transition-all shadow-inner">
                                 <span className="text-2xl font-black italic text-inox-orange">{team.total_lp}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <span className="text-xl font-black text-white tracking-tighter">{team.total_trp}</span>
                           </td>
                           <td className="px-6 py-6 text-center">
                              <span className="text-xs font-black text-zinc-500">{team.total_finish}</span>
                           </td>
                           <td className="px-6 py-6 text-center">
                              <span className="text-xs font-black text-zinc-500">{team.total_fal}</span>
                           </td>
                           <td className="px-6 py-6 text-center">
                              <span className="text-xs font-black text-zinc-500">{team.total_fts}</span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>
        )}

        {/* RIDER INDEX VIEW */}
        {activeTab === 'riders' && !snapshotMode && (
          <section className="space-y-6">
             <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-[2rem] border-2 border-zinc-800 shadow-xl backdrop-blur-md">
                <Search size={20} className="text-zinc-500 ml-4" />
                <input 
                  type="text" 
                  placeholder="Search by name or team..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none text-white font-bold uppercase italic text-sm w-full focus:ring-0 outline-none"
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRiders.map((rider, i) => (
                  <motion.div 
                    key={rider.zid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-zinc-900/40 border-2 border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl hover:border-inox-orange/50 transition-all group backdrop-blur-md relative overflow-hidden"
                  >
                    {rider.is_inox === 1 && (
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                         <Shield size={100} />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-8 relative z-10">
                       <div className="space-y-1">
                          <p className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-inox-orange transition-colors">{rider.rider_name}</p>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{rider.team_name}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-4xl font-black italic text-white tracking-tighter">{rider.total_points}</p>
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">Season Pts</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-6 border-t border-zinc-800 relative z-10">
                       {[
                         { label: 'FIN', val: rider.total_finish, color: 'text-white' },
                         { label: 'FAL', val: rider.total_fal, color: 'text-orange-500' },
                         { label: 'FTS', val: rider.total_fts, color: 'text-inox-cyan' },
                         { label: 'EVT', val: rider.races_count, color: 'text-zinc-500' }
                       ].map((s, idx) => (
                         <div key={idx} className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800 text-center shadow-inner group/stat hover:border-zinc-700 transition-all">
                            <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className={`text-sm font-black italic ${s.color}`}>{s.val}</p>
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
          <div className="absolute bottom-12 left-12 flex items-center gap-3">
             <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border-2 border-zinc-800 shadow-inner">
                <Info size={18} className="text-inox-orange" />
             </div>
             <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]">Season Strategic Intelligence developed by Inoxteam Command Center</p>
          </div>
        )}
      </div>

      {/* --- EXIT & SAVE BUTTONS --- */}
      {snapshotMode && (
        <div className="fixed bottom-12 right-12 flex gap-4 z-[200]">
          <button onClick={() => setSnapshotMode(false)} className="px-10 py-5 bg-zinc-800 text-white font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter border-2 border-zinc-700">EXIT Hall</button>
          <button onClick={handleCapture} className="px-10 py-5 bg-inox-orange text-black font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter border-2 border-orange-600">DOWNLOAD Hall of Fame</button>
        </div>
      )}
    </div>
  );
};

export default ZRLSeasonStats;
