import React, { useEffect, useState, useRef } from "react";
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
  ExternalLink,
  Zap,
  Upload,
  Trophy,
  Code,
  HelpCircle,
  Copy,
  Terminal
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
  const [showScraperHelp, setShowScraperHelp] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentRoundForImport, setCurrentRoundForImport] = useState<number | null>(null);

  const copyScraperScript = (roundId: number, roundName: string) => {
    const season = series?.external_season_id || 19;
    const match = roundName.match(/\d+/);
    const raceNum = match ? parseInt(match[0]) : 1;

    const script = `(async () => {
  const season = ${season};
  const race = ${raceNum};
  const round_id = ${roundId};

  console.log("%c INOX RESULTS SCRAPER ", "background: #fc6719; color: white; font-weight: bold; padding: 2px 5px;");
  
  const teamListRes = await fetch(\`https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=\${season}&action=teamlist\`);
  const teamListData = await teamListRes.json();
  const inoxTeams = teamListData.payload.filter(t => 
    t.teamname.toUpperCase().includes("INOX") || 
    t.clubId === "cef70cde-9149-43a2-b3ae-187643a44703"
  );
  
  const leagueKeys = inoxTeams.map(t => {
     const divLetter = t.division || 'A';
     const divNum = t.divnum || 0;
     return \`\${t.league}0\${divLetter}\${divNum}0\`;
  });

  const uniqueKeys = [...new Set(leagueKeys)];
  const finalResults = [];
  for (const key of uniqueKeys) {
    try {
      const res = await fetch(\`https://www.wtrl.racing/api/zrl/results/\${season}/\${key}/\${race}\`);
      const data = await res.json();
      if (data.success) finalResults.push({ key, data });
    } catch (e) { console.error(\`Errore su \${key}:\`, e); }
  }

  const output = { round_id, results: finalResults };
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`zrl_results_s\${season}_r\${race}.json\`;
  a.click();
  console.log("%c FATTO! Carica il file scaricato.", "background: #22c55e; color: white; font-weight: bold; padding: 2px 5px;");
})();`;

    navigator.clipboard.writeText(script);
    alert("Script copiato! Incollalo nella console di WTRL.");
  };

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(1);
  
  // ... resto delle funzioni ...

  const handleImportResults = (roundId: number) => {
    setCurrentRoundForImport(roundId);
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentRoundForImport) return;

    setActionLoading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const response = await fetch('/api/admin/import-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            round_id: currentRoundForImport,
            results: json.results
          })
        });
        const data = await response.json();
        if (data.success) {
          setMessage({ type: 'success', text: data.message });
          await loadData();
        } else {
          setMessage({ type: 'error', text: data.error || "Errore importazione" });
        }
      } catch {
        setMessage({ type: 'error', text: "File non valido" });
      } finally {
        setActionLoading(false);
        e.target.value = '';
        setCurrentRoundForImport(null);
      }
    };
    reader.readAsText(file);
  };

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
          text: res.error || "Errore durante l\'inizializzazione.",
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
      {/* Hidden File Input per Import Risultati */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileSelected} 
        accept=".json" 
        className="hidden" 
      />

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
          <button 
            onClick={() => setShowScraperHelp(!showScraperHelp)}
            className="bg-zinc-900 text-white px-4 py-2 rounded-xl border border-zinc-800 flex items-center gap-2 hover:bg-black transition-all text-xs font-bold uppercase"
          >
            <HelpCircle size={16} className="text-orange-500" />
            Guida Scraper
          </button>
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

      {/* Scraper Help Section */}
      {showScraperHelp && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-white space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
                <Terminal size={24} />
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tight">Guida Rapida Scraper WTRL</h2>
            </div>
            <button onClick={() => setShowScraperHelp(false)} className="text-zinc-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">Chiudi</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-orange-500 font-black italic text-2xl">01</span>
              <p className="text-sm font-bold uppercase tracking-tight">Vai su WTRL</p>
              <p className="text-xs text-zinc-400">Apri <a href="https://www.wtrl.racing" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">wtrl.racing</a> e assicurati di aver effettuato l'accesso.</p>
            </div>
            <div className="space-y-2">
              <span className="text-orange-500 font-black italic text-2xl">02</span>
              <p className="text-sm font-bold uppercase tracking-tight">Copia lo Script</p>
              <p className="text-xs text-zinc-400">Clicca sul tasto <Code size={12} className="inline mx-1" /> <strong>Copia Script</strong> della gara che ti interessa qui sotto.</p>
            </div>
            <div className="space-y-2">
              <span className="text-orange-500 font-black italic text-2xl">03</span>
              <p className="text-sm font-bold uppercase tracking-tight">Esegui in Console</p>
              <p className="text-xs text-zinc-400">Premi F12, vai in Console, incolla lo script e premi Invio. Scaricherai un file .json da importare qui.</p>
            </div>
          </div>
        </div>
      )}

      {/* Init Form */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
            <PlusCircle size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800">INIZIALIZZA NUOVO ROUND</h2>
            <p className="text-sm text-gray-500">Crea un nuovo round (campionato) e importa automaticamente le gare e le mappe da WTRL.</p>
          </div>
        </div>

        <form onSubmit={handleInitSeason} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Anno Solare</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Numero Round Inox (1-4)</label>
            <select 
              value={selectedRoundIndex}
              onChange={(e) => setSelectedRoundIndex(parseInt(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value={1}>Round 1</option>
              <option value={2}>Round 2</option>
              <option value={3}>Round 3</option>
              <option value={4}>Round 4</option>
            </select>
          </div>
          <button 
            type="submit"
            disabled={actionLoading}
            className="bg-gray-900 hover:bg-black text-white font-black italic uppercase py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {actionLoading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} className="text-orange-500" />}
            GENERA ROUND
          </button>
        </form>
      </div>

      {/* Rounds List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Gestione Gare del Round</h2>
          {wtrlScheduleLink && (
            <a href={wtrlScheduleLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1">
              WTRL Official Schedule <ExternalLink size={12} />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {rounds.map((round) => (
            <div key={round.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-orange-200 transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-orange-500 border border-gray-100 group-hover:bg-orange-50 transition-colors">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-black text-gray-800 uppercase italic tracking-tight">{round.name}</h3>
                      <span className="px-3 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">
                        {round.date ? new Date(round.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : 'TBD'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">
                      {round.world || '---'} • <span className="text-gray-600">{round.route || '---'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Squadre</p>
                    <p className="text-lg font-black text-gray-800">{round.team_count} / {totalSystemTeams}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lineup</p>
                    <p className="text-lg font-black text-gray-800">{round.lineup_count}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">RSVP</p>
                    <p className="text-lg font-black text-orange-500">{round.availability_count}</p>
                  </div>
                  <div className="h-10 w-px bg-gray-100 hidden lg:block" />
                  
                  <button 
                    onClick={() => copyScraperScript(round.id, round.name)}
                    className="flex items-center gap-2 px-4 py-3 bg-zinc-900 text-zinc-400 font-black uppercase text-[10px] tracking-widest rounded-xl border border-zinc-800 hover:text-orange-500 hover:border-orange-500/50 transition-all"
                    title="Copia Script Scraper per Console"
                  >
                    <Code size={14} />
                    Copia Script
                  </button>

                  <button 
                    onClick={() => handleImportResults(round.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-50 text-orange-600 font-black uppercase text-[10px] tracking-widest rounded-xl border border-orange-100 hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Trophy size={14} />
                    Importa Risultati
                  </button>

                  <button 
                    onClick={() => handleResetRound(round.id, round.name)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-black uppercase text-[10px] tracking-widest rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Hard Reset
                  </button>
                </div>
              </div>
            </div>
          ))}

          {rounds.length === 0 && (
            <div className="p-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
              <Info className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-400 font-black italic uppercase tracking-widest text-xl">Nessun dato trovato</p>
              <p className="text-gray-500 text-xs mt-2 uppercase font-bold">Usa il modulo sopra per inizializzare la stagione.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZRLRoundManager;
