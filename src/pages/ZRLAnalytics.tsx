import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Target, Zap, Activity, Filter, ChevronDown, 
  Award, Star, Camera, Share2, BarChart3, TrendingUp,
  Shield, Users, Info, ExternalLink, RefreshCw, Wind, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';
import html2canvas from 'html2canvas';

// --- INTERFACES ---
interface AnalyticsData {
  team_name: string;
  rank: number;
  is_inox: number;
  archetype: string;
  dna: { subject: string; A: number }[];
  roster: { rider_name: string; zwid: number; points_total: number }[];
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

// --- UTILITIES ---
const traitIconMap: Record<string, React.ReactNode> = {
  "Power": <Zap size={16} />,
  "Endurance": <Activity size={16} />,
  "Sprint": <Wind size={16} />,
  "Tactics": <Brain size={16} />
};

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

  // --- FUNZIONE DI CATTURA AGGIORNATA ---
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
        link.download = `inoxteam_zrl_snapshot_${Date.now()}.png`;
        link.href = imageDataUrl;
        link.click();
        
        console.log("Snapshot catturato con successo!");
      } catch (error) {
        console.error("Errore durante la cattura dello snapshot:", error);
      }
    }
  };

  const currentTeamData = data?.analytics.find(t => t.team_name === selectedTeam);
  const inoxTeams = data?.analytics.filter(t => t.is_inox === 1) || [];

  if (loading && options.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <RefreshCw size={40} className="text-inox-orange animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${snapshotMode ? 'bg-[#050505] p-0 overflow-hidden' : 'space-y-8 pb-20 p-6'}`}>
      
      {/* HEADER BAR (Nascosta in Snapshot) */}
      {!snapshotMode && (
        <section className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
              STRAT <span className="text-zinc-800">MAP</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            {/* Division Selector */}
            <div className="relative group">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-3 px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white hover:border-inox-orange transition-all"
              >
                <Filter size={16} className={showFilters ? 'text-inox-orange' : 'text-zinc-500'} />
                <span className="text-xs font-black uppercase tracking-widest">
                  {opt.league_display_name || opt.league_key || 'Seleziona Divisione'}
                </span>                <ChevronDown size={16} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-4 w-80 bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden z-[100]"
                  >
                    <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Disponibili</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-2 custom-scrollbar">
                      {options && options.length > 0 ? (
                        options.map((opt) => {
                          // Ensure opt and its essential properties are valid before using them
                          if (!opt || opt.round_group_id === undefined || opt.league_key === undefined || opt.season_name === undefined || opt.round_name === undefined || opt.league_display_name === undefined) {
                            console.warn("Skipping invalid option object:", opt);
                            return null; // Skip rendering this item if essential data is missing
                          }
                          const optionValue = `${opt.round_group_id}|${opt.league_key}`;
                          return (
                            <button
                              key={optionValue}
                              onClick={() => {
                                setSelectedOption(optionValue);
                                fetchAnalytics(opt.round_group_id, opt.league_key);
                                setShowFilters(false);
                              }}
                              className={`w-full text-left p-4 rounded-2xl transition-all ${selectedOption === optionValue ? 'bg-inox-orange/10 border border-inox-orange/20' : 'hover:bg-zinc-800/50'}`}
                            >
                              <p className={`text-xs font-black uppercase ${selectedOption === optionValue ? 'text-inox-orange' : 'text-white'}`}>
                                {opt.league_display_name}
                              </p>
                              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter mt-1">
                                {opt.season_name} • {opt.round_name}
                              </p>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-center py-4 text-xs font-bold text-zinc-600 uppercase tracking-tighter">Nessuna opzione disponibile</p>
                      )}
                    </div>
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
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${selectedTeam === t.team_name ? 'bg-inox-orange text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  {t.team_name.split(' ').pop()}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setSnapshotMode(true)}
              className="p-4 bg-white text-black rounded-2xl hover:bg-inox-orange transition-all shadow-xl"
            >
              <Camera size={18} />
            </button>
          </div>
        </section>
      )}

      {/* --- VIEWPORT DI CATTURA --- */}
      <div 
        ref={captureRef} 
        className={`relative ${snapshotMode ? 'p-12 w-[1080px] h-[1080px] mx-auto flex flex-col justify-center items-center bg-[#050505] border-[16px] border-zinc-900' : 'grid grid-cols-1 xl:grid-cols-12 gap-8'}`}
      >
        
        {/* WATERMARK (Solo in Snapshot) */}
        {snapshotMode && (
          <div className="absolute top-12 left-12 flex items-center gap-4">
            <div className="w-16 h-16 bg-inox-orange flex items-center justify-center rounded-2xl">
              <Shield size={32} className="text-black" />
            </div>
            <div className="flex flex-col">
               <h2 className="text-3xl font-black italic text-white leading-none tracking-tighter">INOXTEAM</h2>
               <p className="text-inox-orange font-black uppercase tracking-[0.3em] text-xs">Official Intelligence Hub</p>
            </div>
          </div>
        )}

        {/* RADAR CARD */}
        <div className={`${snapshotMode ? 'w-[800px] h-[600px] mt-20' : 'xl:col-span-7'} bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 relative shadow-2xl`}>
           <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-inox-orange uppercase tracking-widest mb-1">Squad Tactical Archetype</p>
                 <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{selectedTeam}</h3>
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg mt-3">
                    <Zap size={12} className="text-inox-orange" />
                    <span className="text-[10px] font-black text-white uppercase italic">{currentTeamData?.archetype}</span>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Season Rank</p>
                 <p className="text-5xl font-black italic text-white tracking-tighter">#{currentTeamData?.rank}</p>
              </div>
           </div>

           <div className="h-[400px] w-full">
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

        {/* MVP & ROSTER CARDS */}
        <div className={`${snapshotMode ? 'w-full flex justify-center gap-6 mt-12 px-6' : 'xl:col-span-5 flex flex-col gap-6'}`}>
          {/* TEAM ROSTER SECTION */}
          {!snapshotMode && currentTeamData && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Users size={20} className="text-inox-orange" />
                <h4 className="text-sm font-black uppercase tracking-widest text-white">Team Roster & Points</h4>
              </div>
              <div className="space-y-3">
                {currentTeamData.roster.length > 0 ? (
                  currentTeamData.roster.map((rider, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                      <p className="text-xs font-bold text-zinc-300 uppercase">{rider.rider_name}</p>
                      <p className="text-xs font-black text-inox-orange">{rider.points_total} <span className="text-[8px] text-zinc-600">PTS</span></p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-xs font-bold text-zinc-600 uppercase tracking-tighter">Nessun dato corridore trovato</p>
                )}
              </div>
            </div>
          )}

          {/* GLOBAL MVPs SECTION */}
          <div className={`${snapshotMode ? 'flex gap-6 w-full' : 'space-y-4'}`}>
            <div className={snapshotMode ? 'hidden' : 'flex items-center gap-3 mb-2 px-2'}>
              <Star size={18} className="text-inox-orange fill-inox-orange" />
              <h4 className="text-sm font-black uppercase tracking-widest text-white">Division MVPs (Inox)</h4>
            </div>
            
            {data?.mvps.slice(0, snapshotMode ? 3 : 5).map((mvp, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] flex-1 min-w-0">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-black rounded-2xl flex flex-col items-center justify-center border border-zinc-800">
                      <span className="text-xl font-black italic text-inox-orange">#{mvp.position}</span>
                   </div>
                   <div className="flex-1 min-w-0 text-left">
                      <p className="text-lg font-black italic text-white uppercase truncate">{mvp.rider_name}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{mvp.team_name}</p>
                        <p className="text-[11px] font-black text-inox-orange">{mvp.points_total} <span className="text-[7px] text-zinc-600">PTS</span></p>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AGGREGATE SCORE (Solo in Snapshot) */}
        {snapshotMode && (
          <div className="absolute bottom-12 right-12 text-right">
            <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px] mb-2">Aggregate Score</p>
            <div className="flex items-baseline gap-2 justify-end">
               <span className="text-6xl font-black italic text-white leading-none">{currentTeamData?.stats.total_lp}</span>
               <span className="text-2xl font-black italic text-zinc-700 uppercase">LP</span>
            </div>
          </div>
        )}

        {/* --- EXIT & SAVE BUTTONS (Allineati a destra come richiesto) --- */}
        {snapshotMode && (
          <div className="fixed bottom-12 right-12 flex gap-4 z-[200]">
            <button
              onClick={() => setSnapshotMode(false)}
              className="px-8 py-4 bg-zinc-800 text-white font-black italic rounded-full shadow-xl hover:scale-110 transition-all uppercase text-sm tracking-tighter"
            >
              EXIT SNAPSHOT
            </button>
            <button
              onClick={handleCaptureClick}
              className="px-8 py-4 bg-inox-orange text-black font-black italic rounded-full shadow-2xl hover:scale-110 transition-all uppercase text-sm tracking-tighter"
            >
              SAVE SNAPSHOT
            </button>
          </div>
        )}

      </div> {/* Fine CaptureRef */}
    </div>
  );
};

export default ZRLAnalytics;