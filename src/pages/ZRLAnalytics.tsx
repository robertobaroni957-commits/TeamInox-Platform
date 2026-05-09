import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Target, Zap, Activity, Filter, ChevronDown, 
  Award, Star, Camera, Share2, BarChart3, TrendingUp,
  Shield, Users, Info, ExternalLink, RefreshCw, Wind, Brain,
  LayoutGrid, PieChart, LineChart, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell
} from 'recharts';
import html2canvas from 'html2canvas';

// --- INTERFACES ---
interface AnalyticsData {
  team_name: string;
  rank: number;
  is_inox: number;
  archetype: string;
  dna: { subject: string; A: number }[];
  roster: { 
    rider_name: string; 
    zid: number; 
    points_total: number;
    pts_fal: number;
    pts_fts: number;
    pts_finish: number;
    race_breakdown: number[];
  }[];
  stats: {
    total_lp: number;
    total_trp: number;
    races_completed: number;
    pts_fal: number;
    pts_fts: number;
    pts_finish: number;
    race_points: (number | null)[];
  };
}

interface FilterOption {
  round_group_id: number;
  round_name: string;
  season_name: string;
  league_key: string;
  league_display_name: string;
}

const ZRLAnalytics: React.FC = () => {
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [data, setData] = useState<{ analytics: AnalyticsData[] } | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [snapshotMode, setSnapshotMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'strategy' | 'roster'>('strategy');
  
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await fetch('/api/division-results');
      const json = await res.json();
      if (json.success) {
        setOptions(json.options);
        if (json.options.length > 0) {
          const first = json.options[0];
          setSelectedOption(`${first.round_group_id}|${first.league_key}`);
          fetchAnalytics(first.round_group_id, first.league_key);
        }
      }
    } catch (err) {
      console.error("Error fetching filters", err);
    }
  };

  const fetchAnalytics = async (rgid: number, lk: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/zrl-analytics?round_group_id=${rgid}&league_key=${lk}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        const inox = json.analytics.find((t: any) => t.is_inox === 1);
        if (inox) setSelectedTeam(inox.team_name);
        else if (json.analytics.length > 0) setSelectedTeam(json.analytics[0].team_name);
      }
    } catch (err) {
      console.error("Error fetching analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureClick = async () => {
    if (captureRef.current) {
      try {
        const canvas = await html2canvas(captureRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#050505',
        });
        const imageDataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `inoxteam_analytics_${Date.now()}.png`;
        link.href = imageDataUrl;
        link.click();
      } catch (error) {
        console.error("Snapshot error:", error);
      }
    }
  };

  const currentTeamData = data?.analytics.find(t => t.team_name === selectedTeam);
  const inoxTeams = data?.analytics.filter(t => t.is_inox === 1) || [];
  const selectedOptionData = options.find(o => `${o.round_group_id}|${o.league_key}` === selectedOption);

  if (loading && options.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-black/20">
      <RefreshCw size={40} className="text-inox-orange animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${snapshotMode ? 'bg-[#050505] p-0' : 'space-y-6 pb-20 p-6'}`}>
      
      {/* HEADER & CONTROLS (Nascosti in Snapshot) */}
      {!snapshotMode && (
        <section className="flex flex-col gap-8">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
            <div className="space-y-1">
              <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
                INTEL <span className="text-zinc-700">HUB</span>
              </h1>
              <p className="text-inox-orange font-black text-[10px] tracking-[0.4em] uppercase">Advanced Team Analytics</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
              {/* Division Selector */}
              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-3 px-6 py-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-white hover:border-inox-orange transition-all shadow-xl backdrop-blur-sm"
                >
                  <Filter size={18} className={showFilters ? 'text-inox-orange' : 'text-zinc-500'} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    {selectedOptionData?.league_display_name || selectedOptionData?.league_key || 'Seleziona Divisione'}
                  </span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full right-0 mt-4 w-80 bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden z-[100] backdrop-blur-md">
                      <div className="max-h-96 overflow-y-auto p-2 custom-scrollbar">
                        {options.map((opt) => (
                          <button key={`${opt.round_group_id}|${opt.league_key}`} onClick={() => { setSelectedOption(`${opt.round_group_id}|${opt.league_key}`); fetchAnalytics(opt.round_group_id, opt.league_key); setShowFilters(false); }} className={`w-full text-left p-4 rounded-2xl transition-all ${selectedOption === `${opt.round_group_id}|${opt.league_key}` ? 'bg-inox-orange/10 border border-inox-orange/20' : 'hover:bg-zinc-800/50'}`}>
                            <p className={`text-xs font-black uppercase ${selectedOption === `${opt.round_group_id}|${opt.league_key}` ? 'text-inox-orange' : 'text-white'}`}>{opt.league_display_name}</p>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">{opt.season_name} • {opt.round_name}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Team Selector */}
              <div className="flex bg-zinc-900/60 p-2 rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-sm">
                {inoxTeams.map(t => (
                  <button key={t.team_name} onClick={() => setSelectedTeam(t.team_name)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${selectedTeam === t.team_name ? 'bg-inox-orange text-black shadow-lg shadow-inox-orange/20' : 'text-zinc-500 hover:text-white'}`}>
                    {t.team_name.split(' ').pop()}
                  </button>
                ))}
              </div>

              <button onClick={() => setSnapshotMode(true)} className="p-5 bg-white text-black rounded-2xl hover:bg-inox-orange transition-all shadow-2xl hover:scale-105 active:scale-95">
                <Camera size={20} />
              </button>
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex gap-2 p-2 bg-zinc-900/40 border border-zinc-800 w-fit rounded-2xl backdrop-blur-sm shadow-inner">
            <button
              onClick={() => setActiveTab('strategy')}
              className={`flex items-center gap-3 px-10 py-3.5 rounded-xl transition-all ${activeTab === 'strategy' ? 'bg-zinc-800 text-white shadow-xl border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <PieChart size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest">Strategy Hub</span>
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-3 px-10 py-3.5 rounded-xl transition-all ${activeTab === 'roster' ? 'bg-zinc-800 text-white shadow-xl border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Users size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest">Roster Explorer</span>
            </button>
          </div>
        </section>
      )}

      {/* --- CONTENT AREA --- */}
      <div ref={captureRef} className={snapshotMode ? 'p-12 w-[1080px] h-[1080px] mx-auto bg-[#050505] relative flex flex-col justify-center' : ''}>
        
        {/* SNAPSHOT HEADER */}
        {snapshotMode && (
          <div className="absolute top-12 left-12 flex items-center gap-5">
            <div className="w-20 h-20 bg-inox-orange flex items-center justify-center rounded-[2rem] shadow-[0_0_40px_rgba(252,103,25,0.3)]">
              <Shield size={40} className="text-black" />
            </div>
            <div className="flex flex-col">
               <h2 className="text-4xl font-black italic text-white leading-none tracking-tighter uppercase">INOXTEAM <span className="text-zinc-700">Analytics</span></h2>
               <p className="text-inox-orange font-black uppercase tracking-[0.4em] text-sm mt-1">Official Intelligence Report</p>
            </div>
          </div>
        )}

        {/* TAB 1: STRATEGY HUB */}
        {(activeTab === 'strategy' || snapshotMode) && (
          <div className={`grid gap-8 ${snapshotMode ? 'grid-cols-12 mt-20' : 'grid-cols-1 xl:grid-cols-12'}`}>
            {/* RADAR CARD */}
            <div className={`${snapshotMode ? 'col-span-7 h-[650px]' : 'xl:col-span-7 min-h-[600px]'} bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-10 relative shadow-2xl flex flex-col backdrop-blur-sm hover:border-zinc-700/50 transition-all`}>
               <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-2">Squad Tactical DNA</p>
                     <h3 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">{selectedTeam}</h3>
                     <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl mt-4 backdrop-blur-md">
                        <Zap size={14} className="text-inox-orange" />
                        <span className="text-[11px] font-black text-white uppercase italic tracking-widest">{currentTeamData?.archetype}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Season Rank</p>
                     <p className="text-6xl font-black italic text-white tracking-tighter drop-shadow-2xl">#{currentTeamData?.rank}</p>
                  </div>
               </div>

               <div className="flex-1 w-full min-h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={currentTeamData?.dna}>
                      <PolarGrid stroke="#3f3f46" strokeWidth={1} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name={selectedTeam} dataKey="A" stroke="#fc6719" fill="#fc6719" fillOpacity={0.4} strokeWidth={4} dot={{ r: 4, fill: '#fc6719', strokeWidth: 2, stroke: '#fff' }} />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* TEAM STATS PANEL */}
            <div className={`${snapshotMode ? 'col-span-5 flex flex-col gap-6' : 'xl:col-span-5 flex flex-col gap-6'}`}>
               <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl flex-1 backdrop-blur-sm hover:border-zinc-700/50 transition-all">
                  <div className="flex items-center gap-3 mb-10">
                     <div className="p-2.5 bg-zinc-800 rounded-xl text-inox-orange border border-zinc-700 shadow-inner">
                        <BarChart3 size={20} />
                     </div>
                     <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white">Performance Metrics</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-12">
                     <div className="space-y-1 group">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">Total LP</p>
                        <p className="text-5xl font-black italic text-white tracking-tighter">{currentTeamData?.stats.total_lp}</p>
                     </div>
                     <div className="space-y-1 group">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">Total Race Pts</p>
                        <p className="text-5xl font-black italic text-white tracking-tighter">{currentTeamData?.stats.total_trp}</p>
                     </div>
                  </div>

                  <div className="space-y-8">
                     {[
                       { label: 'FINISH POINTS', val: currentTeamData?.stats.pts_finish, color: '#3b82f6', icon: Trophy },
                       { label: 'FAL INTERMEDIATES', val: currentTeamData?.stats.pts_fal, color: '#fc6719', icon: Zap },
                       { label: 'FTS INTERMEDIATES', val: currentTeamData?.stats.pts_fts, color: '#fbbf24', icon: Activity }
                     ].map((s, i) => (
                       <div key={i} className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                             <div className="flex items-center gap-2">
                                <s.icon size={12} className="text-zinc-500" />
                                <span className="text-zinc-500">{s.label}</span>
                             </div>
                             <span className="text-white bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-700 shadow-inner">{s.val}</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden shadow-inner p-[1px] border border-zinc-800">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (s.val || 0) / 10)}%` }} transition={{ delay: i * 0.1, duration: 1 }} className="h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: s.color }} />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               {/* RACE TREND CHART */}
               {!snapshotMode && (
                 <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl h-[280px] backdrop-blur-sm hover:border-zinc-700/50 transition-all">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-zinc-800 rounded-xl text-emerald-400 border border-zinc-700 shadow-inner">
                             <TrendingUp size={18} />
                          </div>
                          <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white">Season Trajectory</h4>
                       </div>
                    </div>
                    <div className="h-[140px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={currentTeamData?.stats.race_points.map((p, i) => ({ name: `R${i+1}`, pts: p || 0 }))}>
                             <defs>
                                <linearGradient id="colorPts" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#fc6719" stopOpacity={0.4}/>
                                   <stop offset="95%" stopColor="#fc6719" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <Area type="monotone" dataKey="pts" stroke="#fc6719" strokeWidth={4} fillOpacity={1} fill="url(#colorPts)" />
                             <XAxis dataKey="name" hide />
                             <YAxis hide />
                             <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }} itemStyle={{ color: '#fc6719' }} cursor={{ stroke: '#fc6719', strokeWidth: 1, strokeDasharray: '4 4' }} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* TAB 2: ROSTER EXPLORER (Grid 3 Columns) */}
        {activeTab === 'roster' && !snapshotMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentTeamData?.roster.map((rider, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl hover:border-inox-orange/50 transition-all group backdrop-blur-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-inox-orange transition-colors">{rider.rider_name}</p>
                    {i === 0 && (
                      <span className="inline-flex px-3 py-1 bg-inox-orange text-black text-[9px] font-black uppercase rounded-lg shadow-lg shadow-inox-orange/20 animate-pulse mt-2">
                        Unit MVP
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white leading-none tracking-tighter">{rider.points_total}</p>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Total Intel Pts</p>
                  </div>
                </div>

                  {/* Data Row */}
                  <div className="pt-6 border-t border-zinc-800 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800 shadow-inner group/stat hover:border-zinc-700 transition-colors">
                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">FAL</span>
                         <span className="text-2xl font-black text-white tracking-tighter leading-none group-hover/stat:text-inox-orange transition-colors">{rider.pts_fal || 0}</span>
                      </div>
                      <div className="flex flex-col bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800 shadow-inner group/stat hover:border-zinc-700 transition-colors">
                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">FTS</span>
                         <span className="text-2xl font-black text-white tracking-tighter leading-none group-hover/stat:text-yellow-400 transition-colors">{rider.pts_fts || 0}</span>
                      </div>
                      <div className="flex flex-col bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800 shadow-inner group/stat hover:border-zinc-700 transition-colors">
                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">FIN</span>
                         <span className="text-2xl font-black text-white tracking-tighter leading-none group-hover/stat:text-blue-400 transition-colors">{rider.pts_finish || 0}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center justify-between bg-zinc-950/30 p-3 rounded-2xl border border-zinc-800 shadow-inner overflow-x-auto no-scrollbar">
                      {rider.race_breakdown.map((pts, idx) => (
                        <div key={idx} className={`flex flex-col items-center min-w-[40px] p-2 rounded-xl border transition-all ${pts > 0 ? 'bg-zinc-900 border-zinc-700 shadow-md scale-105' : 'bg-black/10 border-transparent opacity-20'}`}>
                          <span className="text-[8px] font-black text-zinc-600 uppercase leading-none mb-1.5">R{idx + 1}</span>
                          <span className={`text-sm font-black leading-none ${pts > 0 ? 'text-inox-orange' : 'text-zinc-800'}`}>{pts}</span>
                        </div>
                      ))}
                    </div>
                  </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* AGGREGATE SCORE (Solo in Snapshot) */}
        {snapshotMode && (
          <div className="absolute bottom-12 right-12 text-right">
            <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[11px] mb-3 text-zinc-500">Official Division Intelligence</p>
            <div className="flex items-baseline gap-6 justify-end">
               <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Season LP</p>
                  <p className="text-6xl font-black italic text-white leading-none tracking-tighter">{currentTeamData?.stats.total_lp}</p>
               </div>
               <div className="w-px h-16 bg-zinc-800 shadow-xl" />
               <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Division Rank</p>
                  <p className="text-6xl font-black italic text-inox-orange leading-none tracking-tighter">#{currentTeamData?.rank}</p>
               </div>
            </div>
          </div>
        )}

        {/* --- EXIT & SAVE BUTTONS --- */}
        {snapshotMode && (
          <div className="fixed bottom-12 right-12 flex gap-4 z-[200]">
            <button onClick={() => setSnapshotMode(false)} className="px-10 py-5 bg-zinc-800 text-white font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter border border-zinc-700">EXIT REPORT</button>
            <button onClick={handleCaptureClick} className="px-10 py-5 bg-orange-500 text-black font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter border border-orange-600">DOWNLOAD INTEL</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ZRLAnalytics;
