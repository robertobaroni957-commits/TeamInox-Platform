import React, { useEffect, useState, useMemo } from "react";
import { 
  Calendar, 
  RefreshCw, 
  Trash2, 
  PlusCircle, 
  Info, 
  AlertTriangle, 
  CheckCircle2,
  MapPin,
  Clock,
  ExternalLink
} from "lucide-react";
import { roundService } from "../services/roundService";
import type { Round, Series } from "../services/roundService";

const ZRLRoundManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [series, setSeries] = useState<Series | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [totalSystemTeams, setTotalSystemTeams] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(1);

  const wtrlScheduleLink = useMemo(() => {
    if (!series?.name) return null;
    const yearMatch = series.name.match(/\d{4}/);
    const roundMatch = series.name.match(/Round\s+(\d+)/);
    const year = yearMatch ? yearMatch[0] : '2026';
    const round = roundMatch ? roundMatch[1] : '1';
    return `https://www.wtrl.racing/zwift-racing-league/schedule/${year}/r${round}/`;
  }, [series?.name]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await roundService.getStatus();
      console.log("DEBUG: Data fetched from API:", data);

      if (data.success) {
        setSeries(data.series);
        setRounds(data.rounds || []);
        setTotalSystemTeams(data.total_system_teams || 0);
      } else {
        setMessage({ type: 'error', text: data.error || "Errore nel caricamento dati" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Errore di connessione al server" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInitSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await roundService.initSeason(selectedYear, selectedRoundIndex);
      console.log("DEBUG: Sync response:", res);

      if (res.success) {
        setMessage({ type: 'success', text: res.message || "Stagione inizializzata con successo!" });
        await loadData();
      } else {
        setMessage({
          type: 'error',
          text: res.error || "Errore durante l'inizializzazione."
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Errore durante la richiesta" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetRound = async (roundId: number, roundName: string) => {
    const confirmed = window.confirm(`SEI SICURO? Questo cancellerà TUTTE le lineup, le disponibilità e le associazioni squadre per la gara "${roundName}". Questa operazione NON può essere annullata.`);
    if (!confirmed) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await roundService.resetRound(roundId, true);
      if (res.success) {
        setMessage({ type: 'success', text: res.message || "Gara resettata correttamente." });
        await loadData();
      } else {
        setMessage({ type: 'error', text: res.error || "Errore durante il reset" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Errore durante la richiesta" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Calendar className="text-orange-500" />
            ZRL SEASON MANAGER
          </h1>
          <p className="text-gray-500">Inizializza stagioni intere importando i dati ufficiali WTRL.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
            <p className="text-xs text-orange-600 font-bold uppercase">Stagione Attiva</p>
            <p className="font-bold text-orange-900">{series?.name || "Nessuna"}</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-bold uppercase">ID WTRL</p>
            <p className="font-bold text-blue-900">{series?.external_season_id || "-"}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Initialization Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PlusCircle className="text-blue-500" size={20} />
              Inizializza Nuova Stagione
            </h2>
            
            <form onSubmit={handleInitSeason} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Seleziona Anno</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 font-medium"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Seleziona Round (Stagione)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(idx => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedRoundIndex(idx)}
                      className={`py-3 rounded-xl font-bold border transition-all ${
                        selectedRoundIndex === idx 
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100' 
                        : 'bg-white border-gray-200 text-gray-400 hover:border-orange-200'
                      }`}
                    >
                      r{idx}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:bg-gray-300"
                >
                  {actionLoading ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                  Importa Schedule da WTRL
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Weeks List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Gare Settimanali - {series?.name || "Nessuna"}</h2>
              {wtrlScheduleLink && (
                <a 
                  href={wtrlScheduleLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-blue-500 flex items-center gap-1 hover:underline"
                >
                  Vedi su WTRL <ExternalLink size={12} />
                </a>
              )}
            </div>
            
            {rounds.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nessuna gara trovata per questa stagione.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rounds.map((round) => (
                  <div key={round.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-gray-800">{round.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                          <Clock size={12} />
                          {round.date ? new Date(round.date).toLocaleDateString() : 'TBD'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleResetRound(round.id, round.name)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Reset Gara"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin size={12} className="text-orange-500" />
                        <span className="font-bold">{round.world || 'TBD'}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 ml-5">
                        {round.route || 'TBD'}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                        <p className="text-[9px] text-gray-400 font-bold">LINEUP</p>
                        <p className="font-bold text-gray-700">{round.lineup_count}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                        <p className="text-[9px] text-gray-400 font-bold">DISPO</p>
                        <p className="font-bold text-gray-700">{round.availability_count}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                        <p className="text-[9px] text-gray-400 font-bold">TEAMS</p>
                        <p className="font-bold text-gray-700">{round.team_count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZRLRoundManager;