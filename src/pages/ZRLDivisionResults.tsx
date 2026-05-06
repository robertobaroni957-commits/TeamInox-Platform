import React, { useState, useEffect } from 'react';
import { 
  Trophy, Users, Timer, Target, ChevronRight, Hash, 
  RefreshCw, Filter, Search, Award, Star, Zap, Activity,
  ChevronDown, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

interface DivisionResult {
  id: number;
  rider_name: string;
  team_name: string;
  position: number;
  time: number;
  points_finish: number;
  points_fal: number;
  points_fts: number;
  points_total: number;
  is_inox: number;
  league_key: string;
  zwid: number;
}

interface FilterOption {
  round_id: number;
  league_key: string;
  round_name: string;
}

const ZRLDivisionResults: React.FC = () => {
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [results, setResults] = useState<DivisionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('inox_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (e) {
        console.error("Auth error");
      }
    }
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await fetch('/api/division-results');
      const data = await res.json();
      if (data.success) {
        setOptions(data.options);
        if (data.options.length > 0) {
          const first = data.options[0];
          const val = `${first.round_id}|${first.league_key}`;
          setSelectedOption(val);
          fetchResults(first.round_id, first.league_key);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      setError("Impossibile caricare le opzioni di filtro.");
      setLoading(false);
    }
  };

  const fetchResults = async (roundId: number, leagueKey: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/division-results?round_id=${roundId}&league_key=${leagueKey}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      setError("Errore nel caricamento dei risultati.");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedOption) return;
    const [roundId] = selectedOption.split('|');
    setSyncLoading(true);
    try {
      const res = await fetch('/api/admin/sync-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        },
        body: JSON.stringify({ round_id: parseInt(roundId) })
      });
      const data = await res.json();
      if (data.success) {
        const [rid, lk] = selectedOption.split('|');
        fetchResults(parseInt(rid), lk);
      } else {
        alert("Errore Sync: " + data.error);
      }
    } catch (err) {
      alert("Errore di connessione.");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleFilterChange = (rid: number, lk: string) => {
    const val = `${rid}|${lk}`;
    setSelectedOption(val);
    fetchResults(rid, lk);
    setShowFilters(false);
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "--:--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds - Math.floor(seconds)) * 100);
    
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const inoxRiders = results.filter(r => r.is_inox === 1);
  const bestPosition = inoxRiders.length > 0 ? Math.min(...inoxRiders.map(r => r.position || 999)) : null;
  const totalInoxPoints = inoxRiders.reduce((acc, r) => acc + (r.points_total || 0), 0);

  const isAdmin = userRole === 'admin' || userRole === 'moderator';

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700">
      
      {/* TOP HEADER & ACTIONS */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
               <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Division Archives</span>
            </div>
            {syncLoading && (
              <div className="flex items-center gap-2 px-2 py-0.5 bg-inox-cyan/10 border border-inox-cyan/20 rounded-full animate-pulse">
                <RefreshCw size={10} className="animate-spin text-inox-cyan" />
                <span className="text-[8px] font-black text-inox-cyan uppercase tracking-widest">Syncing WTRL...</span>
              </div>
            )}
          </div>
          <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
            ZRL <span className="text-zinc-800">RESULTS</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Custom Dropdown Filter */}
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-[280px] px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between text-left group hover:border-[#fc6719]/50 transition-all shadow-xl"
            >
              <div className="flex items-center gap-3">
                <Filter size={14} className="text-zinc-500" />
                <span className="text-[10px] font-black uppercase text-white truncate max-w-[180px]">
                  {options.find(o => `${o.round_id}|${o.league_key}` === selectedOption)?.round_name || 'Seleziona Round'}
                </span>
              </div>
              <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 z-[100] bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar"
                >
                   {options.map((opt, i) => (
                     <button
                       key={i}
                       onClick={() => handleFilterChange(opt.round_id, opt.league_key)}
                       className="w-full px-6 py-4 text-left hover:bg-[#fc6719]/10 border-b border-zinc-800/50 last:border-0 transition-colors"
                     >
                       <p className="text-[10px] font-black uppercase text-white">{opt.round_name}</p>
                       <p className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest">{opt.league_key}</p>
                     </button>
                   ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isAdmin && (
            <button 
              onClick={handleSync}
              disabled={syncLoading}
              className="p-3.5 bg-white text-black rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
              title="Sincronizza Classifica"
            >
              <RefreshCw size={18} className={syncLoading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </section>

      {/* QUICK STATS BENTO */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
         <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2 relative overflow-hidden group">
            <Users size={14} className="text-zinc-600 mb-2" />
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Division Riders</p>
            <p className="text-3xl font-black italic text-white">{results.length}</p>
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Hash size={60} />
            </div>
         </div>
         <div className="p-6 rounded-[2rem] bg-orange-500/5 border border-orange-500/10 flex flex-col gap-2 relative overflow-hidden group">
            <Star size={14} className="text-orange-500 mb-2" />
            <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest">Inox Squad</p>
            <p className="text-3xl font-black italic text-orange-500">{inoxRiders.length}</p>
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <Zap size={60} className="text-orange-500" />
            </div>
         </div>
         <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2 relative overflow-hidden group">
            <Award size={14} className="text-zinc-600 mb-2" />
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Best Position</p>
            <p className="text-3xl font-black italic text-white">{bestPosition ? `#${bestPosition}` : 'N/A'}</p>
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Trophy size={60} />
            </div>
         </div>
         <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2 relative overflow-hidden group">
            <Activity size={14} className="text-zinc-600 mb-2" />
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Total Inox Points</p>
            <p className="text-3xl font-black italic text-white">{totalInoxPoints}</p>
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Target size={60} />
            </div>
         </div>
      </section>

      {/* DATA VIEWPORT */}
      <section className="flex-1 bg-zinc-950 border border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <RefreshCw size={40} className="text-orange-500 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Recalculating Ranks...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
             <AlertCircle size={48} className="text-red-500 mb-4" />
             <p className="text-red-500 font-black uppercase italic tracking-widest">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
             <div className="p-8 rounded-full bg-zinc-900/50 border border-zinc-800 mb-6">
                <Database size={48} className="text-zinc-700" />
             </div>
             <p className="text-xl font-black italic text-zinc-500 uppercase tracking-tighter">No Data Synchronized</p>
             <p className="text-zinc-700 text-[10px] font-bold uppercase mt-2 tracking-widest">Please initiate sync from the Command Center</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-black/90 backdrop-blur-md">
                <tr className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 border-b border-zinc-900">
                  <th className="px-8 py-6 text-center w-24">#</th>
                  <th className="px-8 py-6">Rider / Team</th>
                  <th className="px-8 py-6 text-center">Time</th>
                  <th className="px-8 py-6 text-center">FIN</th>
                  <th className="px-8 py-6 text-center">FAL</th>
                  <th className="px-8 py-6 text-center">FTS</th>
                  <th className="px-8 py-6 text-center text-orange-500">POINTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/30">
                {results.map((rider) => {
                  const isFirst = rider.position === 1;
                  return (
                    <motion.tr 
                      key={rider.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`group transition-all ${
                        rider.is_inox 
                          ? 'bg-orange-500/5 hover:bg-orange-500/10' 
                          : 'hover:bg-zinc-900/40'
                      }`}
                    >
                      <td className="px-8 py-6 text-center">
                        <span className={`text-2xl font-black italic ${
                          isFirst ? 'text-orange-500 shadow-orange-500/20 drop-shadow-lg' : 'text-zinc-800 group-hover:text-zinc-600'
                        }`}>
                          {rider.position ? `#${rider.position}` : '-'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className={`font-black uppercase tracking-tight text-lg leading-none ${
                            rider.is_inox ? 'text-orange-400' : 'text-zinc-200'
                          }`}>
                            {rider.rider_name}
                          </span>
                          <span className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2 truncate max-w-xs">
                            {rider.team_name}
                            {rider.is_inox === 1 && (
                              <span className="bg-orange-500 text-black px-1.5 py-0.5 rounded-[4px] text-[7px] font-black">SQUADRON</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center font-mono text-xs text-zinc-500">
                        {formatTime(rider.time)}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-[11px] font-black text-zinc-400">{rider.points_finish}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-[11px] font-black text-zinc-400">{rider.points_fal}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-[11px] font-black text-zinc-400">{rider.points_fts}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900/50 border border-zinc-800 group-hover:border-orange-500/40 transition-all">
                          <span className="text-lg font-black italic text-orange-500 group-hover:scale-110 transition-transform">
                            {rider.points_total}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};

// Simple AlertCircle fallback if lucide-react version is old or missing it
const AlertCircle = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const Database = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export default ZRLDivisionResults;
