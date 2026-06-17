import { useState, useEffect } from 'react';
import { 
  Users, 
  Search,
  Loader2,
  Trophy,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  QrCode,
  Shield
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
  const [currentSeason, setCurrentSeason] = useState('19');
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

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

  useEffect(() => {
    fetchTeamsAndRosters();
  }, []);

  const toggleTeam = (teamId: number) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.roster.some(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
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
                TEAMS <span className="text-black">ROSTER</span>
              </h1>
              <p className="text-sm md:text-base font-medium opacity-90 max-w-xl">
                Quartier generale InoxTeam. Vista consultiva dei roster attivi e disponibilità per la stagione in corso.
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#fc6719] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Cerca squadra o atleta..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-16 pr-6 focus:outline-none focus:border-[#fc6719]/50 transition-all font-bold text-white placeholder:text-zinc-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-zinc-600">
          <Loader2 className="animate-spin mb-6 text-[#fc6719]" size={64} />
          <p className="font-black italic uppercase tracking-[0.3em] text-sm animate-pulse">Caricamento in corso...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-xl transition-all hover:border-zinc-700">
              
              <div 
                onClick={() => toggleTeam(team.id)}
                className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${
                  expandedTeam === team.id ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-6 flex-1">
                    <img src="https://cdn.zwift.com/static/zc/JERSEYS/INOX2025_thumb.png" alt="Jersey" className="w-14 h-14 md:w-16 md:h-16 object-contain shrink-0" />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-[#fc6719] uppercase tracking-[0.2em]">{team.category} • {team.division}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{team.name}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-8 md:gap-12">
                    {(team.captain_name || team.captain_id) && (
                        <div className="text-right hidden sm:block">
                            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">Team Captain</span>
                            <span className="text-xl md:text-3xl font-black italic text-inox-cyan uppercase tracking-tighter leading-none block">
                                {team.captain_name || team.roster.find(a => a.zwid === team.captain_id)?.name || 'Pending'}
                            </span>
                        </div>
                    )}
                    
                    <div className="text-zinc-500 shrink-0">
                        {expandedTeam === team.id ? <ChevronUp size={32} /> : <ChevronDown size={32} />}
                    </div>
                </div>
              </div>

              {expandedTeam === team.id && (
                <div className="p-8 bg-zinc-950/50 border-t border-zinc-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from(new Map(team.roster.map(a => [a.zwid, a])).values()).map((athlete) => (
                        <div key={athlete.zwid} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 hover:border-[#fc6719]/30 transition-all group/card">
                            <div className="relative">
                                {athlete.avatar_url ? (
                                    <img src={athlete.avatar_url} alt={athlete.name} className="w-14 h-14 rounded-2xl border-2 border-zinc-700 bg-zinc-800 object-cover shadow-lg group-hover/card:border-[#fc6719]/50 transition-colors" />
                                ) : (
                                    <div className="w-14 h-14 rounded-2xl border-2 border-zinc-700 bg-zinc-800 flex items-center justify-center text-sm font-black text-zinc-500 uppercase group-hover/card:border-[#fc6719]/50 transition-colors">
                                        {athlete.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </div>
                                )}
                                {athlete.role === 'captain' && (
                                    <div className="absolute -top-2 -right-2 bg-[#fc6719] text-white p-1 rounded-lg shadow-lg border border-white/20" title="Team Captain">
                                        <Trophy size={10} className="fill-white" />
                                    </div>
                                )}
                                {athlete.role === 'moderator' && (
                                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-lg shadow-lg border border-white/20" title="Team Manager / Moderator">
                                        <Shield size={10} className="fill-white" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover/card:text-[#fc6719] transition-colors">{athlete.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${
                                        athlete.category === 'A' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        athlete.category === 'B' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        athlete.category === 'C' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' :
                                        'bg-zinc-800 text-zinc-500 border-zinc-700'
                                    }`}>
                                        CAT {athlete.category}
                                    </span>
                                    
                                    {athlete.role === 'captain' && (
                                        <span className="text-[9px] font-black bg-[#fc6719]/10 text-[#fc6719] px-2 py-0.5 rounded uppercase border border-[#fc6719]/20 italic">
                                            Captain
                                        </span>
                                    )}
                                    {athlete.role === 'moderator' && (
                                        <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded uppercase border border-emerald-500/20 italic">
                                            Moderator
                                        </span>
                                    )}
                                    {athlete.role === 'admin' && (
                                        <span className="text-[9px] font-black bg-red-500/10 text-red-500 px-2 py-0.5 rounded uppercase border border-red-500/20 italic">
                                            Admin
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
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
