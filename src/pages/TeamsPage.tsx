import { useState, useEffect } from 'react';
import { 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  QrCode,
  Trophy,
  Calendar,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import type { Team, Athlete } from '../services/types';

interface TeamRoster extends Team {
  roster: Athlete[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamRoster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState<number | null>(null);
  const [currentSeason, setCurrentSeason] = useState('19');
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTeamsAndRosters() {
      setIsLoading(true);
      try {
        const teamsData = await api.getTeams();
        const teamsWithRosters = await Promise.all(
          teamsData.map(async (team) => {
            try {
              const roster = await api.getRoster(team.id);
              return { ...team, roster };
            } catch (err) {
              return { ...team, roster: [] };
            }
          })
        );
        setTeams(teamsWithRosters);
      } catch (err) {
        console.error("Fetch Teams Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTeamsAndRosters();
  }, []);

  const handleSync = async (teamId: number, wtrlId?: number) => {
    if (!wtrlId) return;
    setIsSyncing(teamId);
    try {
      await fetch('/api/sync-wtrl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seasonId: parseInt(currentSeason), teamId: wtrlId })
      });
      // Refresh roster for this team
      const updatedRoster = await api.getRoster(teamId);
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, roster: updatedRoster } : t));
    } catch (err) {
      console.error("Errore sincronizzazione WTRL:", err);
    } finally {
      setIsSyncing(null);
    }
  };

  const toggleTeam = (teamId: number) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.roster.some(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      
      {/* WTRL STYLE HERO */}
      <div className="relative overflow-hidden bg-[#fc6719] rounded-[3rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-4">
              <img 
                src="https://www.wtrl.racing/assets/images/zwift/zrl/logos/zrl-logo-r4.png" 
                alt="ZRL Logo" 
                className="h-16 md:h-24 w-auto"
              />
              <div className="h-12 w-px bg-white/20 hidden md:block"></div>
              <div>
                <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter">Legends Route</h2>
                <p className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest">Season {currentSeason} • Round 4</p>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              MY <span className="text-black">TEAMS</span>
            </h1>
            <p className="text-sm md:text-base font-medium opacity-90 max-w-xl">
              Benvenuto nel quartier generale InoxTeam. Qui puoi gestire le tue squadre, 
              verificare i roster e accedere ai RacePass ufficiali per le gare ZRL.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
               <div className="bg-black/20 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                  <Calendar size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Apr 7 - Apr 28, 2026</span>
               </div>
               <div className="bg-black/20 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                  <Trophy size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">12 Active Teams</span>
               </div>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <img 
              src="https://www.wtrl.racing/assets/images/zwift/zrl/zrl-hero-r4.jpg" 
              className="w-[450px] rounded-[2rem] shadow-2xl border-4 border-white/10 rotate-2 hover:rotate-0 transition-transform duration-500"
              alt="ZRL Hero"
            />
            <div className="absolute -bottom-6 -left-6 bg-black p-6 rounded-[2rem] border border-white/10 shadow-2xl animate-bounce">
              <Zap className="text-[#fc6719]" size={32} />
            </div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#fc6719] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Cerca squadra o atleta Inox..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-16 pr-6 focus:outline-none focus:border-[#fc6719]/50 transition-all font-bold text-white placeholder:text-zinc-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <div className="bg-zinc-900 border border-zinc-800 px-6 py-2 rounded-2xl flex flex-col justify-center">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Select Season</span>
              <select 
                value={currentSeason} 
                onChange={(e) => setCurrentSeason(e.target.value)}
                className="bg-transparent text-sm font-black text-[#fc6719] focus:outline-none cursor-pointer"
              >
                <option value="19">WTRL 19</option>
                <option value="20">WTRL 20</option>
              </select>
           </div>
           <button className="bg-[#fc6719] hover:bg-[#e65a15] text-black px-6 rounded-2xl font-black italic uppercase transition-all flex items-center gap-2">
              <RefreshCw size={18} /> Sync All
           </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-zinc-600">
          <Loader2 className="animate-spin mb-6 text-[#fc6719]" size={64} />
          <p className="font-black italic uppercase tracking-[0.3em] text-sm animate-pulse">Caricamento Squadre Inox...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-xl transition-all hover:border-zinc-700">
              
              {/* TEAM HEADER (WTRL ACCORDION STYLE) */}
              <div 
                onClick={() => toggleTeam(team.id)}
                className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${
                  expandedTeam === team.id ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className="relative group/jersey">
                    <img 
                      src="https://cdn.zwift.com/static/zc/JERSEYS/INOX2025_thumb.png" 
                      alt="Jersey" 
                      className="w-12 h-12 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] group-hover/jersey:scale-110 transition-transform"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 bg-[#fc6719]"></div>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tighter leading-none">{team.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                         team.category === 'A' ? 'bg-red-500 text-white' : 
                         team.category === 'B' ? 'bg-emerald-500 text-white' : 
                         team.category === 'C' ? 'bg-[#ffa81c] text-black' : 
                         'bg-[#ff57ff] text-white'
                       }`}>
                         Cat {team.category}
                       </span>
                       <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{team.division || 'Division TBD'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {team.race_pass_url && (
                    <a 
                      href={team.race_pass_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                      <QrCode size={14} /> RacePass™
                    </a>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleSync(team.id, team.wtrl_team_id); }}
                    disabled={isSyncing === team.id}
                    className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-700 text-zinc-500 hover:text-white transition-all active:scale-90"
                  >
                    <RefreshCw size={18} className={isSyncing === team.id ? 'animate-spin text-[#fc6719]' : ''} />
                  </button>
                  <div className="text-zinc-500 ml-2">
                    {expandedTeam === team.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
              </div>

              {/* TEAM CONTENT */}
              {expandedTeam === team.id && (
                <div className="p-8 bg-zinc-950/50 border-t border-zinc-800 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-zinc-800/50">
                     <div className="flex items-center gap-6">
                        <div className="bg-zinc-900 px-5 py-3 rounded-2xl border border-zinc-800">
                           <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Roster Count</p>
                           <p className="text-2xl font-black italic text-white leading-none">{team.roster.length} <span className="text-xs text-zinc-700 font-bold uppercase tracking-widest ml-1">Riders</span></p>
                        </div>
                        <div className="bg-zinc-900 px-5 py-3 rounded-2xl border border-zinc-800">
                           <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">WTRL ID</p>
                           <p className="text-2xl font-black italic text-[#fc6719] leading-none">{team.wtrl_team_id || '---'}</p>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <a 
                          href={`https://www.wtrl.racing/zrl-team-results/?team=${team.wtrl_team_id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all bg-zinc-900 px-5 py-3 rounded-2xl border border-zinc-800"
                        >
                          <ExternalLink size={14} /> WTRL Profile
                        </a>
                     </div>
                  </div>

                  {/* RIDERS GRID (WTRL CARD STYLE) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {team.roster.length > 0 ? (
                      team.roster.map((athlete) => (
                        <div key={athlete.zwid} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex gap-4 hover:border-zinc-600 transition-all group/card relative overflow-hidden">
                          {/* Rider Info */}
                          <div className="w-16 h-16 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center shrink-0">
                            <span className="text-lg font-black italic text-zinc-700 uppercase">{athlete.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                athlete.category === 'A' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 
                                athlete.category === 'B' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 
                                athlete.category === 'C' ? 'bg-[#ffa81c]/20 text-[#ffa81c] border border-[#ffa81c]/30' : 
                                'bg-[#ff57ff]/20 text-[#ff57ff] border border-[#ff57ff]/30'
                              }`}>
                                {athlete.category}
                              </span>
                              <div className="text-zinc-700">
                                <CheckCircle2 size={16} className="text-emerald-500/40" />
                              </div>
                            </div>
                            <h4 className="text-base font-black italic text-zinc-100 uppercase mt-1 truncate group-hover/card:text-[#fc6719] transition-colors">{athlete.name}</h4>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-0.5">ZWID: {athlete.zwid}</p>
                          </div>

                          {/* Decorative elements */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none"></div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-[2rem] text-zinc-700">
                        <Users size={48} className="mb-4 opacity-20" />
                        <p className="font-black italic uppercase tracking-widest text-xs">Nessun Rider assegnato a questo team</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
