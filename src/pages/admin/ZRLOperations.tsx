import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, RefreshCw, Zap, ClipboardCheck, 
  Trophy, ChevronRight, AlertCircle, Calendar, CheckCircle2,
  Trash2, Plus, Save, Loader2, MapPin, Activity, TrendingUp,
  LayoutGrid, BarChart3, Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';

// Importazione componenti per gli step
import AvailabilityManagement from './AvailabilityManagement';
import RosterSuggestions from './RosterSuggestions';
import RosterBuilder from '../RosterBuilder';
import ZRLDivisionResults from '../ZRLDivisionResults';
import ZRLAnalytics from '../ZRLAnalytics';
import ZRLSeasonStats from './ZRLSeasonStats';

interface RoundInput {
  id?: number;
  name: string;
  date: string;
  world: string;
  route: string;
  format: string;
  distance: number;
  elevation: number;
  category: string;
  powerups?: string;
}

const ZRLOperations: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Form States
  const [roundName, setRoundName] = useState('ZRL 2025 Round 4');
  const [wtrlId, setWtrlId] = useState('19');
  const [races, setRaces] = useState<RoundInput[]>([]);
  const [htmlImport, setHtmlImport] = useState('');
  const [selectedRace, setSelectedRace] = useState<RoundInput | null>(null);
  const [teams, setTeams] = useState<any[]>([]);

  // Caricamento dati iniziali dal database
  useEffect(() => {
    const fetchCurrentRound = async () => {
      setLoading(true);
      try {
        const seriesData = await api.getSeries();
        const active = seriesData.find((s: any) => s.is_active);
        
        if (active) {
          setRoundName(active.name);
          setWtrlId(active.external_season_id?.toString() || '19');
          
          const racesData = await api.getRounds(active.id);
          if (racesData && racesData.length > 0) {
            setRaces(racesData.map((r: any) => ({
              id: r.id,
              name: r.name,
              date: r.date ? r.date.split('T')[0] : '',
              world: r.world,
              route: r.route,
              format: r.format || 'Scratch',
              distance: r.distance || 0,
              elevation: r.elevation || 0,
              category: r.category || 'ALL'
            })));
          }
        }
      } catch (err) {
        console.error("Errore caricamento round:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentRound();
  }, []);

  // Refetch teams when entering Step 5 or Step 1
  useEffect(() => {
    if (activeStep === 1 || activeStep === 5) {
       const loadTeams = async () => {
         try {
           const teamsData = await api.getTeams();
           console.log("Teams Loaded:", teamsData);
           setTeams(teamsData);
         } catch (e) {
           console.error("Error loading teams:", e);
         }
       };
       loadTeams();
    }
  }, [activeStep]);

  const handleSyncAvatars = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/sync-avatars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: "Errore Sync Avatar: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleHtmlImport = async () => {
    if (!htmlImport) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/import-wtrl-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        },
        body: JSON.stringify({ html: htmlImport, seasonId: wtrlId })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: "Errore Import: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInitRound = async () => {
    if (!window.confirm("Attenzione: Questa operazione archivierà il round attuale e creerà un nuovo round nel database. Procedere?")) return;
    
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/init-season', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        },
        body: JSON.stringify({
          name: roundName,
          external_id: parseInt(wtrlId),
          rounds: races
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || "Errore durante l'inizializzazione." });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore di connessione al server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTeams = async () => {
    if (!wtrlId) {
      setMessage({ type: 'error', text: 'Inserire un ID Round WTRL valido.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/sync-all-teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        },
        body: JSON.stringify({ seasonId: parseInt(wtrlId) })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.error || "Errore durante la sincronizzazione." });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Timeout o errore di connessione al server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncRaces = async () => {
    if (!wtrlId) {
      setMessage({ type: 'error', text: 'Inserire un ID Round WTRL valido.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/sync-rounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        },
        body: JSON.stringify({ seasonId: parseInt(wtrlId) })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        const seriesData = await api.getSeries();
        const active = seriesData.find((s: any) => s.is_active);
        if (active) {
          const racesData = await api.getRounds(active.id);
          setRaces(racesData.map((r: any) => ({
            id: r.id,
            name: r.name,
            date: r.date ? r.date.split('T')[0] : '',
            world: r.world,
            route: r.route,
            format: r.format || 'Scratch',
            distance: r.distance || 0,
            elevation: r.elevation || 0,
            category: r.category || 'ALL'
          })));
        }
      } else {
        setMessage({ type: 'error', text: data.error || "Errore durante la sincronizzazione gare." });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore di connessione al server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncResults = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/sync-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        },
        body: JSON.stringify({ round_id: races.find(r => highlightedIndices.includes(races.indexOf(r)))?.id })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: "Risultati sincronizzati con successo!" });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: "Errore Sync: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResultsUpload = async (file: File) => {
    setLoading(true);
    setMessage(null);
    try {
      const text = await file.text();
      const resultsData = JSON.parse(text); // Corretto: rimosso JSON.JSON
      
      // Rilevamento se è un file Classifica Generale (GC) o Gara Singola
      const isGC = (resultsData.leagues && resultsData.externalSeasonId) || 
                   (resultsData.payload && resultsData.externalSeasonId && resultsData.leagueKey);
      
      const endpoint = isGC ? '/api/admin/ingest-wtrl-standings' : '/api/admin/import-results';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        },
        body: JSON.stringify(resultsData)
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: isGC ? `Classifica GC Squadre aggiornata!` : `Risultati importati con successo!` 
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error("Errore upload:", err);
      setMessage({ type: 'error', text: "Errore: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const copyGCExtractor = () => {
    // Generiamo l'elenco delle chiavi lega uniche dai team caricati
    const leagueKeys = [...new Set(teams
      .filter(t => t.zrldivision && t.category && t.division_number !== null)
      .map(t => `${t.league}0${t.zrldivision}${t.division_number}0`)
    )];

    const script = `(async () => {
  const season = "${wtrlId || '19'}";
  const keys = ${JSON.stringify(leagueKeys)};
  console.log("%c🚀 INIZIO ESTRAZIONE MASSIVA GC SQUADRE", "color: #fc6719; font-weight: bold; font-size: 14px;");
  
  const multiGC = {
    externalSeasonId: parseInt(season),
    timestamp: new Date().toISOString(),
    leagues: []
  };

  for (const key of keys) {
    try {
      console.log("Fetching GC for: " + key);
      const res = await fetch('https://www.wtrl.racing/api/zrl/league/' + season + '/' + key);
      const data = await res.json();
      if (data.success && data.payload) {
        multiGC.leagues.push({ leagueKey: key, payload: data.payload });
        console.log("%c✅ Scaricata lega: " + key, "color: #4caf50");
      }
    } catch (e) { console.error("❌ Errore per " + key, e); }
  }

  if (multiGC.leagues.length > 0) {
    const blob = new Blob([JSON.stringify(multiGC, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'zrl_multi_gc_full.json';
    a.click();
    alert("Scaricate " + multiGC.leagues.length + " classifiche in un unico file!");
  } else {
    alert("Nessuna classifica scaricata. Controlla la console.");
  }
})();`;
    navigator.clipboard.writeText(script);
    setMessage({ type: 'success', text: "Script GC MASSIVO copiato!" });
  };

  const addRace = () => {
    setRaces([...races, { name: `Race ${races.length + 1}`, date: '', world: '', route: '', format: 'Scratch', distance: 0, elevation: 0, category: 'ALL' }]);
  };

  const updateRace = (index: number, field: keyof RoundInput, value: any) => {
    const newRaces = [...races];
    (newRaces[index] as any)[field] = value;
    setRaces(newRaces);
  };

  const removeRace = (index: number) => {
    setRaces(races.filter((_, i) => i !== index));
  };

  // Calcolo della prossima gara per ogni categoria presente
  const categoriesPresent = [...new Set(races.map(r => r.category))];
  const highlightedIndices = categoriesPresent.map(cat => {
    const nextIdx = races.findIndex(r => r.category === cat && r.date && new Date(r.date + 'T23:59:59') >= new Date());
    if (nextIdx !== -1) return nextIdx;
    
    let lastIdx = -1;
    for (let i = races.length - 1; i >= 0; i--) {
      if (races[i].category === cat) {
        lastIdx = i;
        break;
      }
    }
    return lastIdx;
  }).filter(idx => idx !== -1);

  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    { 
      id: 1, 
      title: 'Setup Round', 
      icon: Settings, 
      desc: 'ID Round WTRL',
      help: 'Configura i parametri fondamentali del round. Inserisci l\'ID stagione WTRL (es. 19) e sincronizza il calendario gare e le squadre per inizializzare il sistema.'
    },
    { 
      id: 2, 
      title: 'Disponibilità', 
      icon: ClipboardCheck, 
      desc: 'Monitoraggio RSVP',
      help: 'Analizza la matrice delle disponibilità in tempo reale. Visualizza chi ha confermato la presenza per i prossimi round e filtra per categoria per valutare la forza d\'attacco.'
    },
    { 
      id: 3, 
      title: 'Roster Strategy', 
      icon: Zap, 
      desc: 'Optimizer & Teams',
      help: 'L\'intelligenza artificiale suggerisce la distribuzione ottimale degli atleti nei pool basandosi sulle preferenze orarie e sulla validazione automatica del regolamento ZRL.'
    },
    { 
      id: 4, 
      title: 'Gare & Lineup', 
      icon: Users, 
      desc: 'Composizione Squadre',
      help: 'La War Room tattica. Seleziona un team e schiera i 6 titolari scegliendo tra gli atleti disponibili. Una volta pronti, puoi generare la card grafica per i social.'
    },
    { 
      id: 5, 
      title: 'Risultati & Media', 
      icon: Trophy, 
      desc: 'Recap Gara',
      help: 'Importa i file JSON estratti dal sito WTRL. Questa fase aggiorna i punti individuali (FAL/FTS/Finish) e alimenta le classifiche globali della piattaforma.'
    },
    { 
      id: 6, 
      title: 'Rankings View', 
      icon: LayoutGrid, 
      desc: 'Classifiche Live',
      help: 'Viewport di monitoraggio della classifica generale (GC). Controlla il posizionamento degli Inox Squadron rispetto ai rivali e analizza i distacchi in tempo reale.'
    },
    { 
      id: 7, 
      title: 'Strat Map', 
      icon: BarChart3, 
      desc: 'Analisi Tattica',
      help: 'Deep Analytics Engine: confronta il DNA tattico delle squadre tramite grafici radar e identifica i top performer (MVPs) della divisione per ottimizzare le strategie future.'
    },
  ];

  const activeHelp = hoveredStep ? steps.find(s => s.id === hoveredStep)?.help : (activeStep !== 0 ? steps.find(s => s.id === activeStep)?.help : null);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      <header className="border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2 mb-1 text-[#fc6719]">
          <Settings size={16} />
          <span className="font-black text-[9px] tracking-[0.2em] uppercase italic">Admin Command Center</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-white uppercase">
          ZRL <span className="text-zinc-700">Operations</span>
        </h1>
      </header>

      <nav className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isHovered = hoveredStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
              className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left group ${
                isActive 
                  ? "bg-zinc-800 border-[#fc6719] shadow-[0_0_25px_rgba(252,103,25,0.2)]" 
                  : (isHovered ? "bg-zinc-800 border-zinc-500 shadow-xl" : "bg-zinc-900/80 border-zinc-700 opacity-90 shadow-lg")
              }`}
            >
              <div className={`p-2 rounded-xl mb-3 transition-all ${isActive ? "bg-[#fc6719] text-black shadow-[0_0_15px_rgba(252,103,25,0.4)]" : "bg-zinc-800 text-zinc-300 group-hover:text-white border border-zinc-700"}`}>
                <Icon size={16} />
              </div>
              <span className={`text-[8px] font-black uppercase mb-1 tracking-widest ${isActive ? "text-zinc-400" : "text-zinc-500"}`}>Step 0{step.id}</span>
              <span className={`text-xs font-black uppercase italic tracking-tight ${isActive ? "text-white" : "text-zinc-400 group-hover:text-white"}`}>{step.title}</span>
            </button>
          );
        })}
      </nav>

      {/* INTELLIGENCE HUD (ONLINE GUIDE) */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={hoveredStep || activeStep}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl flex items-start gap-4 shadow-inner min-h-[80px]"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 border border-zinc-700">
             <Brain size={18} className={hoveredStep ? "text-inox-orange animate-pulse" : "text-zinc-600"} />
          </div>
          <div>
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">Strategic Intelligence Briefing</p>
            <p className="text-[11px] font-bold text-zinc-300 leading-relaxed uppercase tracking-tight italic">
              {activeHelp || "Passa il mouse sopra un modulo operativo per ricevere istruzioni tattiche."}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <main className="bg-zinc-900/60 rounded-[2.5rem] border-2 border-zinc-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[600px] relative overflow-hidden backdrop-blur-md group/main hover:border-zinc-600 transition-all">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-8 lg:p-12 h-full relative z-10"
          >
            {message && (
              <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p className="font-bold uppercase text-[10px] tracking-widest">{message.text}</p>
              </div>
            )}

            {/* STEP 0: WELCOME/SELECTION */}
            {activeStep === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-6">
                <div className="p-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 shadow-[0_0_40px_rgba(252,103,25,0.05)]">
                  <Activity size={56} className="animate-pulse text-inox-orange" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">Mission Selection Required</h3>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed italic">
                    Inizia la gestione tattica del round selezionando un modulo operativo dal centro di comando.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 1: SETUP */}
            {activeStep === 1 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-inox-orange/10 border border-inox-orange/20 flex items-center justify-center text-inox-orange">
                          <Settings size={20} />
                       </div>
                       <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Round Configuration</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Nome Round</label>
                        <input type="text" value={roundName} onChange={(e) => setRoundName(e.target.value)} className="bg-zinc-900/50 border border-zinc-800 text-white font-bold rounded-xl px-5 py-3.5 text-xs outline-none focus:border-[#fc6719] focus:bg-zinc-900 transition-all shadow-inner" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">ID WTRL</label>
                        <input type="text" value={wtrlId} onChange={(e) => setWtrlId(e.target.value)} className="bg-zinc-900/50 border border-zinc-800 text-white font-bold rounded-xl px-5 py-3.5 text-xs outline-none focus:border-[#fc6719] focus:bg-zinc-900 transition-all shadow-inner" />
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50">
                       <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                         <Zap size={10} className="text-inox-orange" /> Real-time System Sync
                       </p>
                       <div className="flex gap-3">
                          <button onClick={handleSyncRaces} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                            <RefreshCw size={12} className="text-inox-orange" /> Sync Rounds
                          </button>
                          <button onClick={handleSyncTeams} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                            <Users size={12} className="text-inox-orange" /> Sync Teams (D1)
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                    {/* Roster Management */}
                    <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-900 flex flex-col justify-center space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-zinc-500"><Activity size={14} /><h4 className="text-[10px] font-black uppercase tracking-widest">Roster Management</h4></div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => {
                            const script = `(async () => {
                              const panels = document.querySelectorAll('.panel-body[data-trc]');
                              const allTeams = [];
                              const season = document.body.getAttribute('wtrl-season') || "19";
                              console.log("🚀 Inizio recupero...");
                              for (const panel of panels) {
                                  const trc = panel.getAttribute('data-trc');
                                  try {
                                      const response = await fetch("https://www.wtrl.racing/api/zrl/" + season + "/teams/" + trc);
                                      const data = await response.json();
                                      if (data && data.meta) {
                                          allTeams.push(data);
                                          console.log("✅ Recuperato: " + data.meta.team.name);
                                      }
                                  } catch (e) { console.error("❌ Errore: " + trc, e); }
                              }
                              if (allTeams.length > 0) {
                                  const blob = new Blob([JSON.stringify(allTeams)], { type: 'application/json' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url; a.download = 'squadre_inox.json'; a.click();
                                  alert("File scaricato con " + allTeams.length + " squadre!");
                              } else { alert("Nessun dato recuperato. Controlla la console."); }
                            })();`;
                            navigator.clipboard.writeText(script);
                            alert("Script copiato!");
                          }} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black italic uppercase py-2 rounded-lg flex items-center justify-center gap-2 border border-zinc-800 text-[9px]"><Zap size={14} /> 1. Copy Extractor</button>
                          <label className="w-full bg-white hover:bg-zinc-200 text-black font-black italic uppercase py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-[10px] shadow-lg"><Save size={16} /> 2. Upload squadre_inox.json
                            <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setLoading(true);
                              try {
                                const teamsData = JSON.parse(await file.text());
                                for (const team of teamsData) {
                                  await fetch('/api/admin/ingest-wtrl-team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(team) });
                                }
                                setMessage({ type: 'success', text: `Sync: ${teamsData.length} teams` });
                              } catch (err) { setMessage({ type: 'error', text: 'Upload failed' }); }
                              finally { setLoading(false); }
                            }} />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Management */}
                    <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-900 flex flex-col justify-center space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-zinc-500"><Calendar size={14} /><h4 className="text-[10px] font-black uppercase tracking-widest">Schedule Management</h4></div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => {
                            const script = `(async () => {
    const season = "${wtrlId || '19'}";
    const categories = ['A', 'C'];
    const result = { categories: {} };
    console.log("%c🚀 STARTING SCHEDULE EXTRACTION", "color: #fc6719; font-weight: bold; font-size: 14px;");
    for (const cat of categories) {
      try {
        console.log("Fetching schedule for category: " + cat);
        const res = await fetch("https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=" + season + "&category=" + cat + "&action=schedule");
        const data = await res.json();
        result.categories[cat] = data.payload || (Array.isArray(data) ? data : []);
        console.log("%c✅ Downloaded category: " + cat, "color: #4caf50");
      } catch (e) {
        console.error("❌ Error for " + cat, e);
      }
    }
    if (Object.keys(result.categories).length > 0) {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = "zrl_schedule_S" + season + ".json";
      a.click();
      alert("Downloaded schedule for " + Object.keys(result.categories).join(", ") + " categories!");
    } else {
      alert("No data downloaded. Check console.");
    }
  })();`;
                            navigator.clipboard.writeText(script);
                            alert("Script Schedule Copiato!");
                          }} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black italic uppercase py-2 rounded-lg flex items-center justify-center gap-2 border border-zinc-800 text-[9px]"><Zap size={14} /> 1. Copy Extractor</button>
                          <label className="w-full bg-[#fc6719] hover:bg-zinc-200 text-black font-black italic uppercase py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-[10px] shadow-lg"><Save size={16} /> 2. Upload zrl_schedule.json
                            <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setLoading(true);
                              try {
                                const content = await file.text();
                                const response = await fetch('/api/admin/import-wtrl-schedule', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
                                  },
                                  body: JSON.stringify({ html: content, seasonId: wtrlId })
                                });
                                const data = await response.json();
                                if (data.success) {
                                  setMessage({ type: 'success', text: data.message });
                                  setTimeout(() => window.location.reload(), 1500);
                                } else {
                                  throw new Error(data.error);
                                }
                              } catch (err: any) { setMessage({ type: 'error', text: 'Upload failed: ' + err.message }); }
                              finally { setLoading(false); }
                            }} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-zinc-900" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black italic text-white uppercase tracking-tighter">Race List</h3>
                    <div className="flex gap-2">
                      <button onClick={addRace} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"><Plus size={12} /> Add Race</button>
                      <button onClick={handleInitRound} className="bg-[#fc6719] text-black px-4 py-1.5 rounded-lg text-[8px] font-black uppercase italic flex items-center gap-2 transition-all shadow-md"><Save size={12} /> Save Season</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {races.map((race, idx) => {
                      const isNext = highlightedIndices.includes(idx);
                      return (
                        <motion.div 
                          key={idx} 
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setSelectedRace(race)}
                          className={`p-4 rounded-2xl border transition-all group relative overflow-hidden cursor-pointer ${
                            isNext 
                              ? "bg-zinc-900 border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.15)] ring-1 ring-[#22c55e]/50" 
                              : "bg-zinc-900/40 border-zinc-800/60 hover:border-[#fc6719]/40"
                          }`}
                        >
                          {isNext && (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/10 to-transparent pointer-events-none" />
                          )}

                          <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-black uppercase tracking-widest ${isNext ? "text-white" : "text-[#fc6719]"}`}>G{idx + 1}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border-2 shadow-md ${
                                isNext ? "bg-white text-black border-white" : "bg-[#fc6719] text-black border-[#fc6719]"
                              }`}>Cat {race.category}</span>
                              {isNext && (
                                <motion.span 
                                  animate={{ opacity: [0.7, 1, 0.7] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="bg-white text-black px-2 py-0.5 rounded-md text-[9px] font-black uppercase shadow-lg border-2 border-[#22c55e]"
                                >
                                  Next
                                </motion.span>
                              )}
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRace(idx);
                              }} 
                              className="text-zinc-700 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={12}/>
                            </button>
                          </div>
                          <div className="relative z-10 mt-3">
                            <h4 className="text-sm font-black italic uppercase truncate text-white leading-tight">{race.name}</h4>
                            <p className="text-zinc-500 text-[9px] font-bold uppercase mt-1">{race.date || 'TBD'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 relative z-10 mt-4">
                            <div className={`p-2 rounded-lg border ${isNext ? "bg-black/40 border-[#22c55e]/20" : "bg-black/20 border-zinc-800/40"}`}>
                              <p className={`text-[7px] font-black uppercase ${isNext ? "text-zinc-500" : "text-zinc-700"}`}>Dist</p>
                              <p className={`text-[11px] font-bold ${isNext ? "text-white" : "text-zinc-400"}`}>{race.distance}k</p>
                            </div>
                            <div className={`p-2 rounded-lg border ${isNext ? "bg-black/40 border-[#22c55e]/20" : "bg-black/20 border-zinc-800/40"}`}>
                              <p className={`text-[7px] font-black uppercase ${isNext ? "text-zinc-500" : "text-zinc-700"}`}>Elev</p>
                              <p className={`text-[11px] font-bold ${isNext ? "text-white" : "text-zinc-400"}`}>{race.elevation}m</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2-4 */}
            {activeStep === 2 && <AvailabilityManagement />}
            {activeStep === 3 && <RosterSuggestions />}
            {activeStep === 4 && <RosterBuilder isEmbedded={true} />}
            
            {/* STEP 5: RESULTS */}
            {activeStep === 5 && (
              <div className="space-y-10 py-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-900/30 p-8 rounded-[2.5rem] border border-zinc-800">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Trophy size={20} className="text-[#fc6719]" />
                      <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Results Engine</h3>
                    </div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest max-w-md">
                      Sincronizzazione classifiche WTRL tramite estrazione client-side (Console) e caricamento JSON unificato.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/zrl-results')}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-zinc-700"
                  >
                    <LayoutGrid size={14} /> Open Viewport
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Step A: Extractor */}
                  <div className="p-8 rounded-[3rem] bg-zinc-950 border border-zinc-900 space-y-6 flex flex-col justify-between group hover:border-[#fc6719]/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                       <RefreshCw size={120} />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-3">
                         <div className="p-3 bg-[#fc6719]/10 rounded-2xl text-[#fc6719]">
                            <RefreshCw size={24} />
                         </div>
                         <h4 className="text-xl font-black italic text-white uppercase">1. Get Results Script</h4>
                      </div>
                      <p className="text-zinc-500 text-xs font-medium italic leading-relaxed">
                        Copia lo script estrattore. Incollalo nella console della pagina classifiche WTRL per scaricare il file <span className="text-white font-bold">zrl_unified_results.json</span>.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => {
                          const nextRace = races.find(r => highlightedIndices.includes(races.indexOf(r)));
                          const raceNum = nextRace ? races.indexOf(nextRace) + 1 : 1;
                          
                          // DIAGNOSTICA: Vediamo cosa arriva dal DB
                          console.log("Teams in state:", teams);
                          
                          // Generiamo i codici lega unici
                          const leagueKeys = [...new Set(teams
                            .filter(t => {
                              const l = t.league ? String(t.league).trim() : "";
                              const d = t.zrldivision ? String(t.zrldivision).trim() : (t.category ? String(t.category).trim() : "");
                              const n = t.division_number !== undefined && t.division_number !== null ? String(t.division_number).trim() : "";
                              
                              const isValid = l !== "" && l !== "NULL" && d !== "" && d !== "NULL" && n !== "" && n !== "NULL";
                              
                              if (!isValid) {
                                console.warn(`Team scartato (${t.name}):`, { league: l, zrldivision: d, division_number: n });
                              }
                              return isValid;
                            })
                            .map(t => {
                              const l = String(t.league).trim();
                              const d = t.zrldivision ? String(t.zrldivision).trim() : String(t.category).trim();
                              const n = String(t.division_number).trim();
                              return `${l}0${d}${n}0`;
                            })
                          )];

                          console.log("Calculated League Keys:", leagueKeys);

                          if (leagueKeys.length === 0) {
                            alert("⚠️ ATTENZIONE: Nessuna chiave di divisione generata. Controlla i log in console (F12).");
                            return;
                          }

                          const script = `(async () => {
    const season = "${wtrlId || '19'}";
    const race = prompt("Inserisci il Numero Gara (1-6):", "${raceNum}");
    const keys = ${JSON.stringify(leagueKeys)};
    
    if (!race) return;

    console.log("%c🚀 INIZIO ESTRAZIONE RISULTATI ZRL - SEASON " + season + " RACE " + race, "color: #fc6719; font-weight: bold; font-size: 14px;");
    console.log("Divisioni da elaborare (" + keys.length + "):", keys);
    
    const unifiedData = {
      seasonId: season,
      raceNumber: race,
      timestamp: new Date().toISOString(),
      divisions: []
    };

    for (const divKey of keys) {
      try {
        const directUrl = "https://www.wtrl.racing/api/zrl/results/" + season + "/" + divKey + "/" + race;
        console.log("%cFetching division: " + divKey, "color: #00bcd4");
        
        const res = await fetch(directUrl);
        const data = await res.json();
        
        const resultsArray = data.payload || (Array.isArray(data) ? data : null);
        
        if (resultsArray && resultsArray.length > 0) {
          unifiedData.divisions.push({
            league_key: divKey,
            payload: resultsArray
          });
          console.log("%c✅ Risultati scaricati: " + resultsArray.length + " squadre.", "color: #4caf50");
        }
      } catch (e) {
        console.error("❌ Errore critico per " + divKey + ":", e);
      }
    }

    if (unifiedData.divisions.length === 0) {
      alert("ERRORE: Nessun dato scaricato. Controlla la console.");
    } else {
      const blob = new Blob([JSON.stringify(unifiedData, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = "zrl_results_R" + race + ".json";
      a.click();
      alert("File scaricato!");
    }
  })();`;
                          navigator.clipboard.writeText(script);
                          setMessage({ type: 'success', text: "Script Rider Estrattore Copiato!" });
                        }}
                        className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-black italic rounded-xl border border-zinc-800 transition-all uppercase text-[9px] tracking-[0.2em]"
                      >
                        Copy Rider Extractor
                      </button>

                      <button 
                        onClick={copyGCExtractor}
                        className="w-full py-3 bg-inox-orange text-black font-black italic rounded-xl hover:bg-white transition-all uppercase text-[9px] tracking-[0.2em] shadow-lg"
                      >
                        Copy GC (Teams) Extractor
                      </button>
                    </div>
                  </div>

                  {/* Step B: Ingest */}
                  <div className="p-8 rounded-[3rem] bg-zinc-950 border border-zinc-900 space-y-6 flex flex-col justify-between group hover:border-inox-cyan/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                       <Save size={120} />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-3">
                         <div className="p-3 bg-inox-cyan/10 rounded-2xl text-inox-cyan">
                            <Save size={24} />
                         </div>
                         <h4 className="text-xl font-black italic text-white uppercase">2. Upload Unified JSON</h4>
                      </div>
                      <p className="text-zinc-500 text-xs font-medium italic leading-relaxed">
                        Seleziona il file scaricato da WTRL. Il sistema analizzerà i dati e aggiornerà le classifiche di tutte le divisioni interessate.
                      </p>
                    </div>
                    <label className="w-full py-4 bg-white text-black font-black italic rounded-2xl hover:bg-inox-cyan hover:text-black transition-all uppercase text-[10px] tracking-[0.2em] shadow-xl cursor-pointer text-center">
                      {loading ? 'Processing...' : 'Upload Results'}
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleResultsUpload(file);
                        }} 
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-zinc-900/10 border border-zinc-900/50 p-6 rounded-3xl flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                      <AlertCircle size={20} />
                   </div>
                   <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
                      Nota: Lo script richiede che tu sia autenticato su WTRL. Assicurati di caricare il file relativo al <span className="text-white">Round Corretto</span> per non sovrascrivere dati storici.
                   </p>
                </div>
              </div>
            )}

            {/* STEP 6: RANKINGS */}
            {activeStep === 6 && (
              <div className="-m-8 lg:-m-12">
                <ZRLDivisionResults />
              </div>
            )}

            {/* STEP 7: ANALYTICS */}
            {activeStep === 7 && (
              <div className="-m-8 lg:-m-12">
                <ZRLAnalytics />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* RACE DETAIL MODAL */}
      <AnimatePresence>
        {selectedRace && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRace(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#fc6719]/10 rounded-lg text-[#fc6719]">
                        <Zap size={20} />
                      </div>
                      <span className="text-[#fc6719] font-black text-xs tracking-[0.3em] uppercase italic">Dettaglio Gara</span>
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
                      {selectedRace.name}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setSelectedRace(null)}
                    className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Data', value: selectedRace.date || 'TBD', icon: Calendar },
                    { label: 'Mondo', value: selectedRace.world, icon: MapPin },
                    { label: 'Formato', value: selectedRace.format, icon: Activity },
                    { label: 'Percorso', value: selectedRace.route, icon: TrendingUp },
                  ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800">
                      <stat.icon size={16} className="text-zinc-600 mb-3" />
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-xs font-bold text-white uppercase truncate">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-900/30 p-8 rounded-[2rem] border border-zinc-900 space-y-6">
                  <h4 className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2">
                    <Settings size={14} /> Parametri Tecnici
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-zinc-600 ml-1">Distanza</p>
                      <p className="text-xl font-black italic text-white">{selectedRace.distance} <span className="text-zinc-500 text-xs uppercase not-italic">km</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-zinc-600 ml-1">Dislivello</p>
                      <p className="text-xl font-black italic text-white">{selectedRace.elevation} <span className="text-zinc-500 text-xs uppercase not-italic">m</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-zinc-600 ml-1">Powerups</p>
                      <p className="text-sm font-bold text-[#fc6719] uppercase italic">{selectedRace.powerups || 'Standard'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setSelectedRace(null)}
                    className="flex-1 py-4 bg-[#fc6719] text-black font-black italic rounded-2xl hover:scale-[1.02] transition-all uppercase text-xs tracking-widest shadow-lg"
                  >
                    Chiudi Dettaglio
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZRLOperations;
