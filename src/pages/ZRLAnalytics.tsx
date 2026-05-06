import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Target, Zap, Activity, Filter, ChevronDown, 
  Award, Star, Camera, Share2, BarChart3, TrendingUp,
  Shield, Users, Info, ExternalLink, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';

interface AnalyticsData {
  team_name: string;
  rank: number;
  is_inox: number;
  archetype: string;
  dna: { subject: string; A: number }[];
  stats: {
    total_lp: number;
    total_trp: number;
    races_completed: number;
  };
}

interface MVP {
  rider_name: string;
  team_name: string;
  points_total: number;
  position: number;
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
  const [data, setData] = useState<{ analytics: AnalyticsData[]; mvps: MVP[] } | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [snapshotMode, setSnapshotMode] = useState(false);
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
        // Seleziona automaticamente il primo team Inox
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

  const currentTeamData = data?.analytics.find(t => t.team_name === selectedTeam);
  const inoxTeams = data?.analytics.filter(t => t.is_inox === 1) || [];

  if (loading && options.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw size={40} className="text-inox-orange animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Initializing Tactical Data...</p>
      </div>
    </div>
  );

  if (!loading && options.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-8 text-center">
       <div className="p-10 rounded-full bg-zinc-900/50 border border-zinc-800 mb-8">
          <BarChart3 size={64} className="text-zinc-700" />
       </div>
       <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-4">Strat Map Offline</h2>
       <p className="text-zinc-500 text-sm max-w-md mx-auto uppercase font-bold tracking-widest leading-relaxed">
          Nessuna classifica ufficiale (GC) rilevata nel sistema. <br/>
          <span className="text-inox-orange">Sincronizza i dati a squadre</span> dallo Step 5 delle Operations per attivare l'analisi DNA.
       </p>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${snapshotMode ? 'bg-[#050505] p-0' : 'space-y-8 pb-20'}`}>
      
      {/* TOP HUB BAR - Hidden in Snapshot */}
      {!snapshotMode && (
        <section className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 animate-in fade-in duration-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-inox-orange/10 border border-inox-orange/20 rounded-full">
                <span className="text-[9px] font-black text-inox-orange uppercase tracking-[0.2em]">Data Intelligence</span>
              </div>
              <div className="px-3 py-1 bg-inox-cyan/10 border border-inox-cyan/20 rounded-full">
                <span className="text-[9px] font-black text-inox-cyan uppercase tracking-[0.2em]">F1 Telemetry Mode</span>
              </div>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
              STRAT <span className="text-zinc-800">MAP</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
             {/* Filter Dropdown */}
             <div className="relative flex-1 md:flex-none">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full md:w-[320px] px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between text-left group hover:border-inox-orange/50 transition-all shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <Filter size={16} className="text-zinc-500" />
                    <span className="text-[10px] font-black uppercase text-white truncate max-w-[200px]">
                      {options.find(o => `${o.round_group_id}|${o.league_key}` === selectedOption)?.league_display_name || 'Seleziona Divisione'}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 z-[100] bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar"
                    >
                      {options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedOption(`${opt.round_group_id}|${opt.league_key}`);
                            fetchAnalytics(opt.round_group_id, opt.league_key);
                            setShowFilters(false);
                          }}
                          className="w-full px-6 py-4 text-left hover:bg-inox-orange/10 border-b border-zinc-800/50 last:border-0 transition-colors"
                        >
                          <p className="text-[10px] font-black uppercase text-white">{opt.league_display_name || opt.league_key}</p>
                          <p className="text-[8px] font-bold text-zinc-500 uppercase">{opt.round_name}</p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* Team Selector */}
             <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
                {inoxTeams.map(t => (
                  <button
                    key={t.team_name}
                    onClick={() => setSelectedTeam(t.team_name)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${selectedTeam === t.team_name ? 'bg-inox-orange text-black shadow-lg shadow-inox-orange/20' : 'text-zinc-500 hover:text-white'}`}
                  >
                    {t.team_name.split(' ').pop()}
                  </button>
                ))}
             </div>

             <button 
                onClick={() => setSnapshotMode(true)}
                className="p-4 bg-white text-black rounded-2xl hover:bg-inox-orange hover:text-white transition-all shadow-xl"
                title="Social Snapshot"
             >
                <Camera size={18} />
             </button>
          </div>
        </section>
      )}

      {/* SNAPSHOT VIEWPORT */}
      <div ref={captureRef} className={`relative ${snapshotMode ? 'p-12 w-[1080px] h-[1080px] mx-auto flex flex-col justify-center items-center bg-[#050505] border-[16px] border-zinc-900' : 'grid grid-cols-1 xl:grid-cols-12 gap-8'}`}>
        
        {/* WATERMARK - Only in Snapshot */}
        {snapshotMode && (
          <div className="absolute top-12 left-12 flex items-center gap-4">
            <div className="w-16 h-16 bg-inox-orange flex items-center justify-center rounded-2xl">
              <Shield size={32} className="text-black" />
            </div>
            <div className="flex flex-col">
               <h2 className="text-3xl font-black italic text-white leading-none">INOXTEAM</h2>
               <p className="text-inox-orange font-black uppercase tracking-[0.3em] text-xs">Official Media Hub</p>
            </div>
          </div>
        )}

        {/* 🕸️ TEAM DNA (RADAR) */}
        <div className={`${snapshotMode ? 'w-[800px] h-[600px] mt-20' : 'xl:col-span-7'} bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl`}>
           <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-inox-orange uppercase tracking-widest leading-none mb-1">Squad Tactical Archetype</p>
                 <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">{selectedTeam}</h3>
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                    <Zap size={12} className="text-inox-orange" />
                    <span className="text-[10px] font-black text-white uppercase italic">{currentTeamData?.archetype}</span>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Season Rank</p>
                 <p className="text-5xl font-black italic text-white tracking-tighter">#{currentTeamData?.rank}</p>
              </div>
           </div>

           <div className="h-[400px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={currentTeamData?.dna}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 900 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={selectedTeam}
                    dataKey="A"
                    stroke="#fc6719"
                    fill="#fc6719"
                    fillOpacity={0.4}
                    strokeWidth={4}
                  />
                </RadarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* 🃏 MVP CARDS / STATS */}
        <div className={`${snapshotMode ? 'w-full flex justify-center gap-6 mt-12' : 'xl:col-span-5 flex flex-col gap-6'}`}>
           {/* MVP CARDS */}
           <div className={`space-y-4 ${snapshotMode ? 'w-full grid grid-cols-5 gap-4 space-y-0' : ''}`}>
              <div className={snapshotMode ? 'hidden' : 'px-2'}>
                 <h4 className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2 mb-4">
                    <Star size={14} className="text-inox-orange" /> Squad Top Performers
                 </h4>
              </div>

              {data?.mvps.map((mvp, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] relative overflow-hidden group hover:border-inox-orange/50 transition-all shadow-xl"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Users size={60} />
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                     <div className="w-14 h-14 bg-black rounded-2xl flex flex-col items-center justify-center border border-zinc-800">
                        <span className="text-[8px] font-black text-zinc-600 uppercase">Rank</span>
                        <span className="text-xl font-black italic text-inox-orange">#{mvp.position}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-lg font-black italic text-white uppercase truncate leading-tight">{mvp.rider_name}</p>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">{mvp.team_name}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Points</p>
                        <p className="text-2xl font-black italic text-white leading-none">{mvp.points_total}</p>
                     </div>
                  </div>
                </motion.div>
              ))}
           </div>

           {/* TOTAL SCORE BOX - only in snapshot */}
           {snapshotMode && (
             <div className="absolute bottom-12 right-12 text-right">
                <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px] mb-2">Aggregate Power Score</p>
                <div className="flex items-baseline gap-4 justify-end">
                   <span className="text-6xl font-black italic text-white">{currentTeamData?.stats.total_lp}</span>
                   <span className="text-2xl font-black italic text-zinc-700">LP</span>
                </div>
             </div>
           )}
        </div>

        {/* EXIT SNAPSHOT - Button at bottom right */}
        {snapshotMode && (
          <button 
            onClick={() => setSnapshotMode(false)}
            className="fixed bottom-12 right-12 px-8 py-4 bg-inox-orange text-black font-black italic rounded-full shadow-2xl hover:scale-110 transition-all z-[200]"
          >
            EXIT SNAPSHOT
          </button>
        )}
      </div>

    </div>
  );
};

export default ZRLAnalytics;
