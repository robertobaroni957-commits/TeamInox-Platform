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

// --- SUB-COMPONENTS ---
import ZRLSeasonStats from './ZRLSeasonStats';

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
  round_group_name: string;
  season_name: string;
  league_key: string;
  league_display_name: string;
  inox_team_name: string | null;
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
  const [viewType, setViewType] = useState<'round' | 'season'>('round');
  
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const formatLeagueName = (l: any) => {
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
        displayName = `League ${key || 'Unknown'}`;
      }
    }
    return `${displayName}${teamName}`;
  };

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/division-results');
      const json = await res.json();
      console.log("[Analytics] Filters API response:", json);

      if (json.success) {
        const uniqueOptions = new Map();
        const rounds = json.rounds || [];
        const leagues = json.leagues || [];

        if (rounds.length === 0 || leagues.length === 0) {
          console.warn("[Analytics] No rounds or leagues found");
          setOptions([]);
          setLoading(false);
          return;
        }
        
        rounds.forEach((r: any) => {
          leagues.forEach((l: any) => {
            const rgid = r.round_group_id || 1;
            const lk = l.league_key;
            if (!lk) return;

            const key = `${rgid}|${lk}`;
            if (!uniqueOptions.has(key)) {
              uniqueOptions.set(key, {
                round_group_id: rgid,
                round_group_name: r.round_group_name || `Round ${rgid}`,
                season_name: 'S19', 
                league_key: lk,
                league_display_name: l.league_display_name || null,
                inox_team_name: l.inox_team_name || null
              });
            }
          });
        });
        
        const formattedOptions = Array.from(uniqueOptions.values());
        console.log("[Analytics] Formatted options:", formattedOptions);
        setOptions(formattedOptions);

        if (formattedOptions.length > 0) {
          const first = formattedOptions[0];
          const initialKey = `${first.round_group_id}|${first.league_key}`;
          setSelectedOption(initialKey);
          fetchAnalytics(first.round_group_id, first.league_key);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("[Analytics] Error fetching filters:", err);
      setLoading(false);
    }
  };

  const fetchAnalytics = async (rgid: number, lk: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/zrl-analytics?round_group_id=${rgid}&league_key=${lk}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        const analytics = json.analytics || [];
        const inox = analytics.find((t: any) => t.is_inox === 1);
        if (inox) setSelectedTeam(inox.team_name);
        else if (analytics.length > 0) setSelectedTeam(analytics[0].team_name);
      }
    } catch (err) {
      console.error("[Analytics] Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (opt: string) => {
    setSelectedOption(opt);
    const [rgid, lk] = opt.split('|');
    fetchAnalytics(parseInt(rgid), lk);
    setShowFilters(false);
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

  // FIX: Selettore corretto
  const selectedOptionData = options.find(o => `${o.round_group_id}|${o.league_key}` === selectedOption);
  const currentTeamData = data?.analytics.find(t => t.team_name === selectedTeam);
  const inoxTeams = data?.analytics.filter(t => t.is_inox === 1) || [];

  if (loading && options.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-black/20">
      <RefreshCw size={40} className="text-inox-orange animate-spin" />
    </div>
  );

  if (viewType === 'season') {
    const currentLeagueKey = selectedOption.includes('|') ? selectedOption.split('|')[1] : '';
    return (
      <div className="min-h-screen space-y-6 pb-20 p-6 bg-black">
        {!snapshotMode && (
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-10">
            <div className="space-y-1">
              <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
                SEASON <span className="text-zinc-700">REPORT</span>
              </h1>
              <p className="text-inox-orange font-black text-[10px] tracking-[0.4em] uppercase">Aggregated Performance Index</p>
            </div>
            <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
              <button 
                onClick={() => setViewType('round')}
                className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-zinc-500 hover:text-zinc-300"
              >
                Round View
              </button>
              <button 
                onClick={() => setViewType('season')}
                className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-inox-orange text-black"
              >
                Season View
              </button>
            </div>
          </div>
        )}
        <ZRLSeasonStats leagueKey={currentLeagueKey} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${snapshotMode ? 'bg-[#050505] p-0' : 'space-y-6 pb-20 p-6'}`}>
      
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
              
              <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
                 <button 
                  onClick={() => setViewType('round')}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewType === 'round' ? 'bg-inox-orange text-black' : 'text-zinc-500 hover:text-white'}`}
                 >
                   Round
                 </button>
                 <button 
                  onClick={() => setViewType('season')}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewType === 'season' ? 'bg-inox-orange text-black' : 'text-zinc-500 hover:text-white'}`}
                 >
                   Season
                 </button>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-4 px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white hover:border-inox-orange transition-all shadow-xl min-w-[250px]"
                >
                   <Filter size={14} className="text-[#fc6719]" />
                   <div className="flex flex-col items-start min-w-0">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Active Division</span>
                      <span className="text-xs font-bold uppercase italic truncate max-w-[200px]">
                        {selectedOptionData ? formatLeagueName(selectedOptionData) : 'Select...'}
                      </span>
                   </div>
                   <ChevronDown size={14} className={`ml-auto transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 left-0 right-0 z-[100] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar"
                    >
                      {options.map((opt) => (
                        <button
                          key={`${opt.round_group_id}|${opt.league_key}`}
                          onClick={() => handleOptionChange(`${opt.round_group_id}|${opt.league_key}`)}
                          className={`w-full text-left px-6 py-4 hover:bg-zinc-800 flex flex-col transition-all border-b border-zinc-800/50 last:border-0 ${selectedOption === `${opt.round_group_id}|${opt.league_key}` ? 'bg-zinc-800 border-l-4 border-inox-orange' : ''}`}
                        >
                           <span className="text-[10px] font-black uppercase text-zinc-500">{opt.round_group_name}</span>
                           <span className="text-xs font-bold text-white uppercase italic">{formatLeagueName(opt)}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2 p-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl backdrop-blur-md shadow-xl overflow-x-auto max-w-full">
                {inoxTeams.map((team) => (
                  <button 
                    key={team.team_name}
                    onClick={() => setSelectedTeam(team.team_name)}
                    className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 ${selectedTeam === team.team_name ? 'bg-inox-orange text-black shadow-lg shadow-inox-orange/20' : 'text-zinc-500 hover:text-white'}`}
                  >
                    <Shield size={14} /> {team.team_name}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setSnapshotMode(true)}
                className="p-5 bg-white text-black rounded-2xl hover:bg-inox-orange transition-all shadow-2xl hover:scale-105"
              >
                <Camera size={20} />
              </button>
            </div>
          </div>

          {!snapshotMode && (
            <div className="flex gap-2 p-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl backdrop-blur-md shadow-xl self-start">
               <button 
                onClick={() => setActiveTab('strategy')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'strategy' ? 'bg-inox-cyan text-black shadow-lg shadow-inox-cyan/20' : 'text-zinc-500 hover:text-white'}`}
               >
                 <Shield size={14} /> Strategy DNA
               </button>
               <button 
                onClick={() => setActiveTab('roster')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'roster' ? 'bg-inox-cyan text-black shadow-lg shadow-inox-cyan/20' : 'text-zinc-500 hover:text-white'}`}
               >
                 <Users size={14} /> Roster Impact
               </button>
            </div>
          )}
        </section>
      )}

      <div ref={captureRef} className={snapshotMode ? 'w-[1080px] h-[1080px] bg-[#050505] p-12 overflow-hidden relative' : 'space-y-10'}>
        {snapshotMode && (
          <div className="flex items-center gap-6 mb-12">
            <div className="w-20 h-20 bg-[#fc6719] flex items-center justify-center rounded-3xl shadow-[0_0_30px_rgba(252,103,25,0.3)] border-4 border-white/10">
              <Shield size={40} className="text-black" />
            </div>
            <div>
               <h2 className="text-4xl font-black italic text-white leading-none tracking-tighter uppercase italic">
                 {currentTeamData?.team_name} <span className="text-zinc-700">INTEL</span>
               </h2>
               <p className="text-[#fc6719] font-black uppercase tracking-[0.4em] text-[10px] mt-2 italic">
                 {selectedOptionData?.round_group_name} • {selectedOptionData ? formatLeagueName(selectedOptionData) : ''}
               </p>
            </div>
          </div>
        )}

        {currentTeamData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-zinc-950/50 border border-zinc-900 rounded-[3rem] p-10 shadow-inner group/radar relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#fc6719]/5 to-transparent opacity-0 group-hover/radar:opacity-100 transition-opacity rounded-[3rem]" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={currentTeamData.dna}>
                        <PolarGrid stroke="#27272a" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: '900' }} />
                        <Radar
                          name={currentTeamData.team_name}
                          dataKey="A"
                          stroke="#fc6719"
                          fill="#fc6719"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-6">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tactical Archetype</p>
                    <p className="text-3xl font-black italic text-white uppercase tracking-tighter">{currentTeamData.archetype}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Division Rank', val: `#${currentTeamData.rank}`, color: 'text-white' },
                   { label: 'Finish Points', val: currentTeamData.stats.pts_finish, color: 'text-[#fc6719]' },
                   { label: 'Total FAL', val: currentTeamData.stats.pts_fal, color: 'text-orange-500' },
                   { label: 'Total FTS', val: currentTeamData.stats.pts_fts, color: 'text-inox-cyan' }
                 ].map((s, idx) => (
                   <div key={idx} className="bg-zinc-900/40 p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl group/stat hover:border-zinc-700 transition-all">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2">{s.label}</p>
                      <p className={`text-2xl font-black italic ${s.color}`}>{s.val}</p>
                   </div>
                 ))}
              </div>
            </div>

            <div className="lg:col-span-2">
               <AnimatePresence mode="wait">
                 {activeTab === 'strategy' ? (
                   <motion.div 
                    key="strategy"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                   >
                      <div className="bg-zinc-950/50 border border-zinc-900 rounded-[3rem] p-10 shadow-2xl">
                         <div className="flex items-center gap-3 mb-10">
                            <Brain size={24} className="text-inox-cyan" />
                            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Strategic Breakdown</h3>
                         </div>
                         
                         <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={currentTeamData.dna}>
                                <defs>
                                  <linearGradient id="colorA" x1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00bcd4" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="subject" hide />
                                <YAxis hide />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                                  itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="A" stroke="#00bcd4" strokeWidth={4} fillOpacity={1} fill="url(#colorA)" />
                              </AreaChart>
                            </ResponsiveContainer>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                            <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Round Point Distribution</p>
                               <div className="space-y-4">
                                  {[
                                    { label: 'FINISH POINTS', val: currentTeamData.stats.pts_finish, pct: (currentTeamData.stats.pts_finish / (currentTeamData.stats.total_trp || 1)) * 100 },
                                    { label: 'FAL SEGMENTS', val: currentTeamData.stats.pts_fal, pct: (currentTeamData.stats.pts_fal / (currentTeamData.stats.total_trp || 1)) * 100 },
                                    { label: 'FTS SEGMENTS', val: currentTeamData.stats.pts_fts, pct: (currentTeamData.stats.pts_fts / (currentTeamData.stats.total_trp || 1)) * 100 }
                                  ].map((p, idx) => (
                                    <div key={idx} className="space-y-2">
                                       <div className="flex justify-between text-[9px] font-black text-white">
                                          <span>{p.label}</span>
                                          <span>{p.val} PTS</span>
                                       </div>
                                       <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                          <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${p.pct}%` }}
                                            className="h-full bg-inox-cyan"
                                          />
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Historical Momentum</p>
                               <div className="flex items-end gap-2 h-32">
                                  {currentTeamData.stats.race_points.map((pt, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar relative">
                                       {pt !== null && pt > 0 && (
                                         <div className="absolute -top-6 bg-zinc-800 px-2 py-0.5 rounded text-[8px] font-black text-inox-orange opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                            {pt}
                                         </div>
                                       )}
                                       <motion.div 
                                         initial={{ height: 0 }}
                                         animate={{ height: pt ? `${Math.min(100, (pt / 1200) * 100)}%` : '4px' }}
                                         className={`w-full rounded-t-md transition-all ${pt ? 'bg-inox-orange group-hover/bar:bg-white shadow-[0_0_15px_rgba(252,103,25,0.2)]' : 'bg-zinc-800'}`}
                                       />
                                       <div className="flex flex-col items-center">
                                          <span className="text-[8px] font-black text-zinc-700">R{idx + 1}</span>
                                          {pt !== null && pt > 0 && (
                                            <span className="text-[7px] font-black text-inox-orange mt-0.5">{pt}</span>
                                          )}
                                        </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 ) : (
                   <motion.div 
                    key="roster"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-zinc-950/50 border border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl"
                   >
                      <div className="p-10 border-b border-zinc-900 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Users size={24} className="text-inox-orange" />
                            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Individual Impact</h3>
                         </div>
                         <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Active Roster {currentTeamData.roster.length} Riders</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead className="bg-black/40">
                              <tr className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                                 <th className="px-8 py-6">RIDER</th>
                                 <th className="px-6 py-6 text-center">PTS</th>
                                 <th className="px-6 py-6 text-center text-inox-cyan">FTS</th>
                                 <th className="px-6 py-6 text-center text-orange-500">FAL</th>
                                 <th className="px-6 py-6 text-center">FIN</th>
                                 <th className="px-8 py-6 text-right">MOMENTUM</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-zinc-900">
                              {currentTeamData.roster.sort((a,b) => b.points_total - a.points_total).map((rider, idx) => (
                                <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                                   <td className="px-8 py-6">
                                      <div className="flex flex-col">
                                         <span className="text-sm font-black text-white uppercase italic">{rider.rider_name}</span>
                                         <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">ID: {rider.zid}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-6 text-center">
                                      <span className="text-lg font-black italic text-[#fc6719]">{rider.points_total}</span>
                                   </td>
                                   <td className="px-6 py-6 text-center">
                                      <span className="text-xs font-bold text-zinc-400">{rider.pts_fts}</span>
                                   </td>
                                   <td className="px-6 py-6 text-center">
                                      <span className="text-xs font-bold text-zinc-400">{rider.pts_fal}</span>
                                   </td>
                                   <td className="px-6 py-6 text-center">
                                      <span className="text-xs font-bold text-zinc-400">{rider.pts_finish}</span>
                                   </td>
                                   <td className="px-8 py-6">
                                      <div className="flex justify-end gap-1">
                                         {rider.race_breakdown.map((r, ri) => (
                                           <div 
                                            key={ri} 
                                            className={`w-2 h-2 rounded-full ${r > 0 ? 'bg-inox-cyan' : 'bg-zinc-800'}`} 
                                            title={`Round ${ri+1}: ${r} pts`}
                                           />
                                         ))}
                                      </div>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        )}

        {snapshotMode && (
          <div className="absolute bottom-12 left-12 right-12 flex items-center justify-between pt-10 border-t border-zinc-900">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                   <Star size={18} className="text-[#fc6719]" />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">INOXTEAM COMMAND CENTER • SEASON REPORT 2025</p>
             </div>
             <p className="text-[10px] font-black text-zinc-700 uppercase italic">Confidential Intelligence Briefing</p>
          </div>
        )}
      </div>

      {snapshotMode && (
        <div className="fixed bottom-12 right-12 flex gap-4 z-[200]">
          <button 
            onClick={() => setSnapshotMode(false)}
            className="px-10 py-5 bg-zinc-800 text-white font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter border-2 border-zinc-700"
          >
            EXIT OPS
          </button>
          <button 
            onClick={handleCaptureClick}
            className="px-10 py-5 bg-[#fc6719] text-black font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter border-2 border-orange-600"
          >
            DOWNLOAD BRIEFING
          </button>
        </div>
      )}
    </div>
  );
};

export default ZRLAnalytics;
