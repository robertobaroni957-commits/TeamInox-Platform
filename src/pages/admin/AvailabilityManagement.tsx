import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Round, Team, LineupEntry, Athlete } from '../../services/types';
import { 
  LayoutDashboard, Users, Download, Filter, Search, CheckCircle, XCircle, HelpCircle 
} from 'lucide-react';

interface AthleteAvail {
  zwid: number;
  name: string;
  team: string;
  category: string;
  preferences: Record<string, number>;
  availabilities: Record<number, string>;
}

const AvailabilityManagement: React.FC = () => {
  const [rounds, setRaces] = useState<Round[]>([]);
  const [athletes, setAthletes] = useState<AthleteAvail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Carichiamo i round attivi per le intestazioni della tabella
        const roundsData = await api.getRounds();
        setRaces(roundsData);

        // Carichiamo tutte le disponibilità e preferenze per la visualizzazione admin
        const adminData = await api.getAllAvailabilities();
        
        // Trasformiamo i dati in una struttura piatta per la tabella
        const mappedAthletes: AthleteAvail[] = adminData.athletes.map((a: any) => {
          const prefs: Record<string, number> = {};
          adminData.allPreferences
            .filter((p: any) => p.zwid === a.zwid)
            .forEach((p: any) => prefs[p.time_slot_id] = p.preference_level);

          const avails: Record<number, string> = {};
          adminData.allAvailabilities
            .filter((v: any) => v.athlete_id === a.zwid)
            .forEach((v: any) => avails[v.round_id] = v.status);

          return {
            zwid: a.zwid,
            name: a.name,
            team: a.team || 'N/A', // Assicurati che 'team' sia gestito, se non presente dall'API
            category: a.base_category || 'N/A',
            preferences: prefs,
            availabilities: avails
          };
        });

        setAthletes(mappedAthletes);
      } catch (e: any) {
        console.error("Errore nel caricamento dati Availability:", e);
        // Gestione robusta dell'errore per evitare problemi di sintassi durante la build
        let errorMessage = 'Errore nel caricamento dati';
        if (e.message) {
            if (typeof e.message === 'string') {
                errorMessage = e.message;
            } else if (typeof e.message === 'object' && e.message !== null) {
                try {
                    errorMessage = JSON.stringify(e.message);
                } catch {
                    errorMessage = 'Errore sconosciuto durante la serializzazione dell'errore.';
                }
            } else {
                errorMessage = 'Errore generico durante l'elaborazione.';
            }
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAthletes = athletes.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.zwid.toString().includes(searchTerm);
    const matchesCategory = filterCategory === 'ALL' || a.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string | undefined) => {
    if (status === 'available') return <CheckCircle2 className="text-emerald-500" size={18} />;
    if (status === 'unavailable') return <XCircle className="text-rose-500" size={18} />;
    if (status === 'tentative') return <HelpCircle className="text-orange-500" size={18} />;
    return <HelpCircle className="text-zinc-700" size={18} />;
  };

  const exportData = () => {
    const dataString = JSON.stringify({
        generatedAt: new Date().toISOString(),
        athletes: filteredAthletes,
        rounds: rounds
    }, null, 2);
    
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inox_availability_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link); // Necessario per Firefox
    link.click();
    link.remove(); // Pulizia
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-orange-500 font-black italic text-xl animate-pulse uppercase tracking-widest">
        ANALYZING ROSTER DATA...
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-inox-orange font-black text-xs tracking-[0.3em] uppercase italic">Admin Command</span>
          <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase mt-1">
            ZRL <span className="text-zinc-600">AVAILABILITY MATRIX</span>
          </h1>
        </div>
        <button 
          onClick={exportData}
          className="flex items-center gap-2 px-6 py-3 bg-inox-orange text-black font-black italic rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(252,103,25,0.3)] uppercase text-sm"
        >
          <Download size={18} />
          Esporta per AI
        </button>
      </header>

      {error && (
        <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 ${
          'error' === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'
        }`}>
          {'error' === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* FILTRI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Cerca Rider o ZWID..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-inox-orange transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'A', 'B', 'C', 'D'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-1 py-3 rounded-xl font-black italic transition-all border ${filterCategory === cat ? 'bg-inox-cyan text-black border-inox-cyan' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TABELLA MATRICE */}
      <div className="bg-black border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest sticky left-0 bg-black/90 backdrop-blur z-10 w-64">Rider / Info</th>
                {rounds.map(r => (
                  <th key={r.id} className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest text-center min-w-[100px]">
                    <div className="text-inox-cyan">{r.name}</div>
                    <div className="text-[8px] opacity-50 font-medium">{new Date(r.date).toLocaleDateString('it-IT', {day:'2-digit', month:'2-digit'})}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAthletes.map((athlete) => (
                <tr key={athlete.zwid} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-all">
                  <td className="p-4 sticky left-0 bg-black/90 backdrop-blur z-10 border-r border-zinc-900/50">
                    <div className="font-black italic text-white uppercase truncate">{athlete.name}</div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[8px] font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase">{athlete.category}</span>
                      <span className="text-[8px] font-bold bg-zinc-800 text-inox-orange px-1.5 py-0.5 rounded uppercase">{athlete.team}</span>
                    </div>
                  </td>
                  {rounds.map(r => (
                    <td key={r.id} className="p-4 text-center">
                      <div className="flex justify-center">
                        {getStatusIcon(athlete.availabilities[r.id])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAthletes.length === 0 && (
        <div className="p-12 text-center text-zinc-600 font-bold italic uppercase tracking-widest">
          Nessun rider trovato con i filtri attuali.
        </div>
      )}
    </div>
  );
};

export default AvailabilityManagement;
