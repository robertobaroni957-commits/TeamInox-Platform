import { useState, useEffect } from 'react';
import { 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Search,
  Loader2,
  Shield,
  ArrowUpRight
} from 'lucide-react';

interface Athlete {
  zwid: number;
  name: string;
  category: string;
  status: 'confirmed' | 'pending' | 'rejected';
  role: string;
}

interface Team {
  id: number;
  wtrl_team_id: string;
  name: string;
  category: 'A' | 'B' | 'C' | 'D';
  division: string;
  captain_name: string;
  roster: Athlete[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentSeason, setCurrentSeason] = useState('19');
  const [currentRound, setCurrentRound] = useState('1');

  useEffect(() => {
    async function fetchTeams() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/teams?roundId=${currentRound}`);
        if (!response.ok) throw new Error('Errore nel caricamento dati');
        const data = await response.json();
        setTeams(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch Teams Error:", err);
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTeams();
  }, [currentRound]);

  const handleSync = async (teamId: string) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync-wtrl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seasonId: currentSeason, teamId })
      });
      if (response.ok) {
        const updatedResponse = await fetch(`/api/teams?roundId=${currentRound}`);
        const data = await updatedResponse.json();
        setTeams(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Errore sincronizzazione WTRL:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredTeams = (teams || []).filter(t => 
    t?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t?.roster?.some(a => a?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      
      {/* Header & Control Panel */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
            Gestione <span className="text-[#fc6719]">Team ZRL</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-400">
              <span className="text-[10px] font-black uppercase tracking-widest">Stagione</span>
              <select 
                value={currentSeason} 
                onChange={(e) => setCurrentSeason(e.target.value)}
                className="bg-transparent text-xs font-black text-[#fc6719] focus:outline-none cursor-pointer"
              >
                <option value="19">WTRL 19</option>
                <option value="20">WTRL 20</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-400">
              <span className="text-[10px] font-black uppercase tracking-widest">Round</span>
              <select 
                value={currentRound} 
                onChange={(e) => setCurrentRound(e.target.value)}
                className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer font-mono"
              >
                {[1,2,3,4,5,6].map(r => (
                  <option key={r} value={r}>R_{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-zinc-900 p-5 rounded-[2rem] border border-zinc-800 flex items-center gap-4 shadow-xl">
            <div className="w-12 h-12 bg-[#fc6719]/10 rounded-2xl flex items-center justify-center text-[#fc6719] border border-[#fc6719]/20">
              <Users size={22} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Active Teams</p>
              <p className="text-2xl font-black italic text-white leading-none">{(teams || []).length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search Toolbar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#fc6719] transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Cerca squadra o atleta..."
          className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-[#fc6719]/50 transition-all font-medium text-zinc-300 placeholder:text-zinc-700 backdrop-blur-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
          <Loader2 className="animate-spin mb-4 text-[#fc6719]" size={48} />
          <p className="font-black italic uppercase tracking-widest text-xs">Sincronizzazione Roster...</p>
        </div>
      ) : filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-zinc-700 transition-all group flex flex-col shadow-2xl">
              <div className="p-8 border-b border-zinc-800 flex justify-between items-start bg-gradient-to-br from-zinc-800/30 to-transparent">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      team.category === 'A' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      team.category === 'B' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      'bg-[#fc6719]/10 text-[#fc6719] border-[#fc6719]/20'
                    }`}>
                      Cat {team.category}
                    </span>
                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-tighter">{team.division}</span>
                  </div>
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter group-hover:text-[#fc6719] transition-colors">{team.name}</h3>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Shield size={12} className="text-zinc-600" />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Captain: {team.captain_name || 'TBD'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleSync(team.wtrl_team_id)}
                  disabled={isSyncing}
                  className={`p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 transition-all text-zinc-400 hover:text-white border border-zinc-700 shadow-lg ${isSyncing ? 'opacity-50 cursor-wait' : 'active:scale-90'}`}
                >
                  <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Lineup R_{currentRound}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#fc6719] transition-all duration-1000 shadow-[0_0_10px_rgba(252,103,25,0.5)]" 
                        style={{ width: `${(team.roster?.length || 0) / 6 * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-black text-white italic">{(team.roster?.length || 0)}/6</span>
                  </div>
                </div>
                
                <div className="space-y-3 flex-1">
                  {(team.roster || []).length > 0 ? (
                    team.roster.map((athlete) => (
                      <div key={athlete.zwid} className="flex justify-between items-center bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-all group/rider">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-[10px] font-black text-zinc-400 border border-zinc-700 group-hover/rider:border-[#fc6719]/30 transition-all uppercase italic">
                            {athlete.name?.split(' ').map(n => n[0]).slice(0,2).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-black text-zinc-200 uppercase italic leading-none">{athlete.name}</p>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter mt-1">{athlete.role} • ZWID: {athlete.zwid}</p>
                          </div>
                        </div>
                        <div className={`p-1.5 rounded-lg border ${
                          athlete.status === 'confirmed' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-[#fc6719] border-[#fc6719]/20 bg-[#fc6719]/5'
                        }`}>
                          {athlete.status === 'confirmed' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-zinc-800 rounded-[2rem] bg-zinc-950/20 text-zinc-600">
                      <p className="text-[10px] font-black uppercase tracking-widest italic">Nessun Rider assegnato</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center">
                  <a 
                    href={`https://www.wtrl.racing/zrl-team-results/?team=${team.wtrl_team_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-zinc-500 hover:text-[#fc6719] flex items-center gap-2 transition-all uppercase tracking-widest group/link"
                  >
                    <ExternalLink size={14} className="group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" /> WTRL Portal
                  </a>
                  <button className="text-[10px] font-black text-[#fc6719] hover:text-white transition-all uppercase tracking-widest italic flex items-center gap-1">
                    Details <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[3rem]">
          <Users size={64} className="text-zinc-800 mb-6" />
          <h2 className="text-2xl font-black italic text-zinc-500 uppercase tracking-tighter text-center">Nessun Team assegnato</h2>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-2 max-w-xs text-center px-6">
            Non sei ancora stato inserito in nessuna squadra ZRL per questa stagione.
          </p>
        </div>
      )}
    </div>
  );
}
