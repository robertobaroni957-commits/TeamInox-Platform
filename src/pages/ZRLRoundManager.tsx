import React, { useEffect, useState } from "react";
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

  const wtrlScheduleLink = React.useMemo(() => {
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
      if (data.success) {
        setSeries(data.series);
        setRounds(data.rounds);
        setTotalSystemTeams(data.total_system_teams);
      } else {
        setMessage({ type: 'error', text: data.error || "Errore nel caricamento dati" });
      }
    } catch {
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

      if (res.success) {
        setMessage({ type: 'success', text: res.message || "Stagione inizializzata con successo!" });
        await loadData();
      } else {
        setMessage({
          type: 'error',
          text: res.error || `Errore durante l'inizializzazione.`,
        });
      }
    } catch {
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
    } catch {
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
      {/* Header */}
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

      {/* Resto UI ... */}
      {/* Form e lista gare qui (come nel tuo file originale) */}

    </div>
  );
};

export default ZRLRoundManager;