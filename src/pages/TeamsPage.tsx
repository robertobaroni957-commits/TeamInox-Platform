import { useState, useEffect } from 'react';
import { 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Search,
  Loader2
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

  // Recupero dati reali dal Database D1 tramite il Worker
  useEffect(() => {
    async function fetchTeams() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/teams?roundId=${currentRound}`);
        if (!response.ok) throw new Error('Errore nel caricamento dati');
        const data = await response.json();
        setTeams(data);
      } catch (err) {
        console.error(err);
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
        // Ricarichiamo i dati per vedere le modifiche
        const updatedResponse = await fetch(`/api/teams?roundId=${currentRound}`);
        const data = await updatedResponse.json();
        setTeams(data);
      }
    } catch (err) {
      console.error("Errore sincronizzazione WTRL:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.roster.some(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 text-white max-w-7xl mx-auto">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold font-display uppercase tracking-tight">
            Gestione Team <span className="text-zwift-orange">ZRL</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-sm">Stagione:</p>
              <select 
                value={currentSeason} 
                onChange={(e) => setCurrentSeason(e.target.value)}
                className="bg-zwift-dark border border-gray-800 rounded px-2 py-0.5 text-xs font-bold text-zwift-orange focus:outline-none"
              >
                <option value="19">Stagione 19</option>
                <option value="20">Stagione 20</option>
              </select>
            </div>
            <div className="flex items-center gap-2 border-l border-gray-800 pl-4">
              <p className="text-gray-400 text-sm">Gara (Round):</p>
              <select 
                value={currentRound} 
                onChange={(e) => setCurrentRound(e.target.value)}
                className="bg-zwift-dark border border-gray-800 rounded px-2 py-0.5 text-xs font-bold text-white focus:outline-none"
              >
                {[1,2,3,4,5,6].map(r => (
                  <option key={r} value={r}>Round {r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-zwift-dark p-4 rounded-xl border border-gray-800 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Squadre</p>
              <p className="text-xl font-bold">{teams.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Cerca squadra o atleta..."
            className="w-full bg-zwift-dark border border-gray-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-zwift-orange transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-medium">Caricamento roster in corso...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-zwift-dark rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all group">
              <div className="p-5 border-b border-gray-800 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      team.category === 'A' ? 'bg-red-500 text-white' : 
                      team.category === 'B' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      Cat {team.category}
                    </span>
                    <span className="text-gray-500 text-xs font-medium">{team.division}</span>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-zwift-orange transition-colors">{team.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase">Capitano: {team.captain_name || 'Non assegnato'}</p>
                </div>
                <button 
                  onClick={() => handleSync(team.wtrl_team_id)}
                  disabled={isSyncing}
                  className={`p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Sincronizza con WTRL"
                >
                  <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="p-5">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-400 font-medium">Lineup Round {currentRound}</span>
                  <span className="font-bold">{team.roster.length} / 6</span>
                </div>
                
                <div className="space-y-2">
                  {team.roster.length > 0 ? (
                    team.roster.map((athlete) => (
                      <div key={athlete.zwid} className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-transparent hover:border-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {athlete.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-semibold leading-tight">{athlete.name}</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-tighter">ZWID: {athlete.zwid} • {athlete.role}</p>
                          </div>
                        </div>
                        {athlete.status === 'confirmed' ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : (
                          <AlertCircle size={14} className="text-yellow-500" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 italic">Nessun atleta in lineup</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center text-xs">
                  <a 
                    href={`https://www.wtrl.racing/zrl-team-results/?team=${team.wtrl_team_id}`} 
                    target="_blank" 
                    className="text-gray-500 hover:text-zwift-orange flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={14} /> WTRL
                  </a>
                  <button className="text-zwift-orange font-bold hover:underline">
                    Dettagli
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
