import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Clock, Zap, CheckCircle2, ChevronRight, AlertCircle, Heart } from 'lucide-react';

interface SuggestedTeam {
  slot_id: string;
  slot_name: string;
  category: string;
  count: number;
  favorite_count: number;
  acceptable_count: number;
  athletes: { zwid: number; name: string; level: number }[];
}

const RosterSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getRosterSuggestions();
        if (data.success) {
          setSuggestions(data.viableTeams);
        } else {
          setError(data.error || 'Errore durante il recupero dei suggerimenti');
        }
      } catch (err: any) {
        setError(err.message || 'Errore di connessione');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-orange-500 font-black italic text-xl animate-pulse uppercase tracking-widest">
        Analisi preferenze in corso...
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-orange-500" size={16} />
            <span className="text-orange-500 font-black text-xs tracking-[0.3em] uppercase italic">Admin Intelligence</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter leading-none text-white uppercase">
            Roster <span className="text-zinc-600">Optimizer</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-xs mt-4 tracking-widest">
            Distribuzione atleti per Categoria e Slot Orario espressi nel CSV / App
          </p>
        </div>
        <div className="bg-zinc-900 px-6 py-4 rounded-2xl border border-zinc-800">
           <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Totale Preferenze</span>
           <span className="text-2xl font-black italic text-orange-500">{(suggestions as any).total_expressed_preferences || 0}</span>
        </div>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {suggestions.length === 0 ? (
        <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 p-20 text-center">
          <Users className="mx-auto text-zinc-800 mb-4" size={48} />
          <p className="text-zinc-600 font-black uppercase italic tracking-widest text-xl">Nessun dato disponibile</p>
          <p className="text-zinc-700 text-sm mt-2 uppercase font-bold tracking-tighter">Gli atleti devono inserire almeno una preferenza positiva (💚 o 💛)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {suggestions.map((team, idx) => (
            <section key={idx} className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden hover:border-orange-500/50 transition-all group">
              <div className="p-6 bg-zinc-800/50 border-b border-zinc-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center border border-zinc-800 group-hover:border-orange-500/30 transition-all">
                    <span className="text-3xl font-black italic text-orange-500">{team.category}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic text-white uppercase leading-tight">Pool Suggerito</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-zinc-500" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{team.slot_name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-black italic text-white leading-none">{team.count}</span>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Atleti Totali</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-2">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <Heart size={10} className="fill-green-500 text-green-500" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase">{team.favorite_count} Favorite</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart size={10} className="fill-yellow-500 text-yellow-500" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase">{team.acceptable_count} Acceptable</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {team.athletes.map(athlete => (
                    <div key={athlete.zwid} className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center text-[8px] font-black text-zinc-500 flex-shrink-0">
                          {athlete.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-bold text-zinc-300 uppercase truncate">{athlete.name}</span>
                      </div>
                      <Heart size={10} className={`${athlete.level === 2 ? 'fill-green-500 text-green-500' : 'fill-yellow-500 text-yellow-500'}`} />
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-4 bg-zinc-800 hover:bg-orange-500 text-zinc-400 hover:text-black rounded-2xl font-black italic uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 group/btn">
                  Configura Team <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default RosterSuggestions;
