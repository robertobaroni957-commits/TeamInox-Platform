import React, { useState, useEffect } from 'react';
import { Shield, Zap, Trophy, RefreshCw, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
  history: Record<number, RoundResult>;
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
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Inox Season Tracker</h2>
            <p className="text-inox-orange text-[10px] font-black uppercase tracking-[0.3em]">Official Round-by-Round Performance</p>
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
              
              <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                 {[1, 2, 3, 4].map(rIdx => {
                   const res = team.history[rIdx];
                   return (
                     <div key={rIdx} className="p-8 flex flex-col space-y-6 group hover:bg-white/5 transition-all">
                        <div className="flex flex-col items-center justify-center text-center space-y-2">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Round {rIdx}</p>
                          {res ? (
                            <>
                               <div className="text-4xl font-black italic leading-none text-white tracking-tighter">
                                  {res.pts}
                               </div>
                               <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Total Round Pts</p>
                            </>
                          ) : (
                            <div className="py-4">
                               <span className="text-zinc-800 font-black text-3xl">-</span>
                            </div>
                          )}
                        </div>

                        {res && (
                          <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                             <div className="flex justify-between items-center">
                               <span className="text-[8px] font-black text-zinc-500 uppercase">Finish</span>
                               <span className="text-[10px] font-black text-white italic">{res.details.finish}</span>
                             </div>
                             <div className="flex justify-between items-center">
                               <span className="text-[8px] font-black text-zinc-500 uppercase">FAL</span>
                               <span className="text-[10px] font-black text-inox-cyan italic">{res.details.fal}</span>
                             </div>
                             <div className="flex justify-between items-center">
                               <span className="text-[8px] font-black text-zinc-500 uppercase">FTS</span>
                               <span className="text-[10px] font-black text-inox-orange italic">{res.details.fts}</span>
                             </div>
                          </div>
                        )}
                     </div>
                   );
                 })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ZRLSeasonStats;
