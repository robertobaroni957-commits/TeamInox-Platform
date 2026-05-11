import React, { useState, useEffect } from 'react';
import { Shield, Zap, Trophy, RefreshCw, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoundResult {
  pts: number;
}

interface InoxTeamPerformance {
  team_name: string;
  overall_rank: number | null;
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
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Inox Team Tracker</h2>
            <p className="text-inox-orange text-[10px] font-black uppercase tracking-[0.3em]">Official Race-by-Race Performance</p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6">
        {data.map((team, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-900 border-2 border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-gradient-to-r from-zinc-800/50 to-transparent">
               <div className="space-y-1">
                 <h3 className="text-2xl font-black italic text-white uppercase">{team.team_name}</h3>
                 {team.overall_rank && (
                   <p className="text-[10px] font-black text-inox-orange uppercase tracking-widest">Official Round Rank: #{team.overall_rank}</p>
                 )}
               </div>
               <div className="px-4 py-1 bg-inox-orange text-black text-[9px] font-black uppercase rounded-full">Inox Squadron</div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-800">
               {[1, 2, 3, 4].map(rIdx => {
                 const res = team.history[rIdx];
                 return (
                   <div key={rIdx} className="p-6 flex flex-col items-center justify-center text-center space-y-2 group hover:bg-white/5 transition-all">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Race {rIdx}</p>
                      {res ? (
                        <>
                           <div className="text-3xl font-black italic leading-none text-white">
                              {res.pts}
                           </div>
                           <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Total Race Points</p>
                        </>
                      ) : (
                        <div className="py-4">
                           <span className="text-zinc-800 font-black text-2xl">-</span>
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ZRLSeasonStats;
