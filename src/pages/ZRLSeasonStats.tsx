import React, { useState, useEffect } from 'react';
import { Shield, Zap, Trophy, RefreshCw, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoundResult {
  pts: number;
}

interface InoxTeamPerformance {
  team_name: string;
  overall_rank: number | null;
  league_points: number | null;
  history: Record<number, RoundResult>;
  totals: {
    finish: number;
    fal: number;
    fts: number;
    total: number;
  };
}

interface ZRLSeasonStatsProps {
  leagueKey?: string;
}

const ZRLSeasonStats: React.FC<ZRLSeasonStatsProps> = ({ leagueKey }) => {
  const [data, setData] = useState<InoxTeamPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [leagueKey]);

  const fetchStats = async () => {
    if (!leagueKey) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/season-stats?league_key=${leagueKey}`);
      const json = await res.json();
      if (json.success) {
        setData(json.inox_performance);
      }
    } catch (err) {
      console.error("Error fetching simplified stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <RefreshCw size={32} className="text-inox-orange animate-spin" />
    </div>
  );

  if (data.length === 0) return (
    <div className="p-10 text-center bg-zinc-900/50 border border-zinc-800 rounded-[2rem]">
      <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Nessun team Inox rilevato per la divisione {leagueKey}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 px-6">
         <div className="w-12 h-12 bg-inox-orange rounded-2xl flex items-center justify-center shadow-lg">
            <Trophy size={24} className="text-black" />
         </div>
         <div>
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Inox Team Tracker</h2>
            <p className="text-inox-orange text-[10px] font-black uppercase tracking-[0.3em]">Official Race-by-Race Performance</p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-12 px-6 pb-12">
        {data.map((team, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* TEAM HEADER & RANK */}
            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-gradient-to-r from-zinc-800/50 to-transparent">
                 <div className="space-y-1">
                   <h3 className="text-3xl font-black italic text-white uppercase leading-none">{team.team_name}</h3>
                   <div className="flex items-center gap-4 mt-2">
                     {team.overall_rank && (
                       <p className="text-[10px] font-black text-inox-orange uppercase tracking-widest">Official Rank: #{team.overall_rank}</p>
                     )}
                     {team.league_points && (
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-l border-zinc-800 pl-4">League Points: {team.league_points}</p>
                     )}
                   </div>
                 </div>
                 <div className="px-5 py-2 bg-inox-orange text-black text-[10px] font-black uppercase rounded-2xl shadow-lg">Inox Squadron</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-800">
                 {[1, 2, 3, 4].map(rIdx => {
                   const res = team.history[rIdx];
                   return (
                     <div key={rIdx} className="p-8 flex flex-col items-center justify-center text-center space-y-3 group hover:bg-white/5 transition-all">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Race {rIdx}</p>
                        {res ? (
                          <>
                             <div className="text-4xl font-black italic leading-none text-white tracking-tighter">
                                {res.pts}
                             </div>
                             <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Total Pts</p>
                          </>
                        ) : (
                          <div className="py-4">
                             <span className="text-zinc-800 font-black text-3xl">-</span>
                          </div>
                        )}
                     </div>
                   );
                 })}
              </div>
            </div>

            {/* ROUND POINT DISTRIBUTION BENTO */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-zinc-700 transition-all">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Finish Points</p>
                  <p className="text-4xl font-black italic text-white">{team.totals.finish}</p>
                  <div className="w-8 h-1 bg-zinc-800 mt-4 group-hover:bg-inox-orange transition-all" />
               </div>
               <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-zinc-700 transition-all">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">FAL Segments</p>
                  <p className="text-4xl font-black italic text-white">{team.totals.fal}</p>
                  <div className="w-8 h-1 bg-zinc-800 mt-4 group-hover:bg-inox-cyan transition-all" />
               </div>
               <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-zinc-700 transition-all">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">FTS Segments</p>
                  <p className="text-4xl font-black italic text-white">{team.totals.fts}</p>
                  <div className="w-8 h-1 bg-zinc-800 mt-4 group-hover:bg-inox-orange transition-all" />
               </div>
               <div className="bg-inox-orange/10 border border-inox-orange/20 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-inox-orange/40 transition-all shadow-xl">
                  <p className="text-[9px] font-black text-inox-orange uppercase tracking-[0.2em] mb-2">Round Aggregate</p>
                  <p className="text-4xl font-black italic text-inox-orange">{team.totals.total}</p>
                  <p className="text-[8px] font-bold text-inox-orange/50 uppercase mt-4 tracking-widest">Cumulative Season Impact</p>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ZRLSeasonStats;
