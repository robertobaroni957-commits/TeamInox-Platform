import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, RefreshCw, Zap, ClipboardCheck, 
  Trophy, ChevronRight, AlertCircle, Calendar, CheckCircle2,
  Trash2, Plus, Save, Loader2, MapPin, Activity, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';

// Importazione componenti per gli step
import AvailabilityManagement from './AvailabilityManagement';
import RosterSuggestions from './RosterSuggestions';
import RosterBuilder from '../RosterBuilder';

interface RoundInput {
  id?: number;
  name: string;
  date: string;
  world: string;
  route: string;
  format: string;
  distance: number;
  elevation: number;
}

const ZRLOperations: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Form States
  const [roundName, setRoundName] = useState('ZRL 2025 Round 4');
  const [wtrlId, setWtrlId] = useState('19');
  const [races, setRaces] = useState<RoundInput[]>([]);
  const [htmlImport, setHtmlImport] = useState('');
  const [selectedRace, setSelectedRace] = useState<RoundInput | null>(null);

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
              elevation: r.elevation || 0
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
            elevation: r.elevation || 0
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

  const addRace = () => {
    setRaces([...races, { name: `Race ${races.length + 1}`, date: '', world: '', route: '', format: 'Scratch', distance: 0, elevation: 0 }]);
  };

  const updateRace = (index: number, field: keyof RoundInput, value: any) => {
    const newRaces = [...races];
    (newRaces[index] as any)[field] = value;
    setRaces(newRaces);
  };

  const removeRace = (index: number) => {
    setRaces(races.filter((_, i) => i !== index));
  };

  const steps = [
    { id: 1, title: 'Setup Round', icon: Settings, desc: 'ID Round WTRL' },
    { id: 2, title: 'Disponibilità', icon: ClipboardCheck, desc: 'Monitoraggio RSVP' },
    { id: 3, title: 'Roster Strategy', icon: Zap, desc: 'Optimizer & Teams' },
    { id: 4, title: 'Gare & Lineup', icon: Users, desc: 'Composizione Squadre' },
    { id: 5, title: 'Risultati & Media', icon: Trophy, desc: 'Recap Gara' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <header className="border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-3 mb-2 text-[#fc6719]">
          <Settings size={20} />
          <span className="font-black text-xs tracking-[0.3em] uppercase italic">Inox Admin Command Center</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-white uppercase">
          ZRL <span className="text-zinc-700">Operations</span>
        </h1>
      </header>

      <nav className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex flex-col items-start p-5 rounded-3xl border transition-all text-left ${
                isActive 
                  ? "bg-zinc-900 border-[#fc6719] shadow-[0_0_30px_rgba(252,103,25,0.1)]" 
                  : "bg-zinc-950 border-zinc-800 opacity-50 hover:opacity-100"
              }`}
            >
              <div className={`p-2.5 rounded-xl mb-4 ${isActive ? "bg-[#fc6719] text-black" : "bg-zinc-800 text-zinc-500"}`}>
                <Icon size={18} />
              </div>
              <span className="text-[9px] font-black uppercase text-zinc-500 mb-1 tracking-widest">Step 0{step.id}</span>
              <span className={`text-xs font-black uppercase italic ${isActive ? "text-white" : "text-zinc-600"}`}>{step.title}</span>
            </button>
          );
        })}
      </nav>

      <main className="bg-[#0A0A0A] rounded-[3rem] border border-zinc-800 shadow-2xl min-h-[600px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-8 lg:p-12"
          >
            {message && (
              <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p className="font-bold uppercase text-[10px] tracking-widest">{message.text}</p>
              </div>
            )}

            {/* STEP 1: SETUP */}
            {activeStep === 1 && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Setup Round Corrente</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-[0.2em]">Nome Round</label>
                        <input type="text" value={roundName} onChange={(e) => setRoundName(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-2xl px-6 py-4 outline-none focus:border-[#fc6719]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-[0.2em]">ID Round WTRL (es: 19)</label>
                        <input type="text" value={wtrlId} onChange={(e) => setWtrlId(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-2xl px-6 py-4 outline-none focus:border-[#fc6719]" />
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-4">
                      <div className="flex items-center gap-2 text-[#fc6719]"><RefreshCw size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Sincronizzazione Remota</span></div>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Importa le date e i percorsi delle gare direttamente da WTRL.</p>
                      <div className="flex flex-col gap-2">
                        <button onClick={handleSyncRaces} disabled={loading} className="w-full bg-[#fc6719] hover:bg-[#e55a16] text-black font-black italic uppercase py-3 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 text-xs">
                          <Calendar size={18} /> Sincronizza Gare (Auto)
                        </button>
                        
                        <div className="pt-4 border-t border-zinc-800">
                          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-3 italic">Fallback: Importazione Manuale HTML</p>
                          <textarea 
                            placeholder="Incolla qui il codice HTML della pagina Schedule..."
                            value={htmlImport}
                            onChange={(e) => setHtmlImport(e.target.value)}
                            className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-[10px] text-zinc-400 font-mono focus:border-[#fc6719] outline-none mb-3"
                          />
                          <button 
                            onClick={handleHtmlImport} 
                            disabled={loading || !htmlImport} 
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-black italic uppercase py-3 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 text-[10px]"
                          >
                            <Save size={16} /> Importa da HTML
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-8 rounded-[2rem] border border-zinc-900 flex flex-col justify-center space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-zinc-400"><Activity size={18} /><h4 className="text-xs font-black uppercase tracking-widest">Sincronizzazione Roster</h4></div>
                      <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">1. Scarica i dati da WTRL con lo script.<br/>2. Carica il file JSON qui sotto.</p>
                      <div className="flex flex-col gap-3">
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
                        }} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black italic uppercase py-3 rounded-xl flex items-center justify-center gap-3 border border-zinc-800 text-[10px]"><Zap size={16} /> 1. Copia Script Roster</button>
                        <label className="w-full bg-[#fc6719] hover:bg-[#e55a16] text-black font-black italic uppercase py-4 rounded-2xl flex items-center justify-center gap-3 cursor-pointer text-xs"><Save size={20} /> 2. Carica squadre_inox.json
                          <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setLoading(true);
                            try {
                              const teamsData = JSON.parse(await file.text());
                              for (const team of teamsData) {
                                await fetch('/api/admin/ingest-wtrl-team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(team) });
                              }
                              setMessage({ type: 'success', text: `Sincronizzate ${teamsData.length} squadre!` });
                            } catch (err) { setMessage({ type: 'error', text: 'Errore caricamento.' }); }
                            finally { setLoading(false); }
                          }} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-zinc-900" />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Elenco Gare</h3>
                    <div className="flex gap-2">
                      <button onClick={addRace} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"><Plus size={14} /> Aggiungi Gara</button>
                      <button onClick={handleInitRound} className="bg-white hover:bg-zinc-200 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase italic flex items-center gap-2 transition-all shadow-lg"><Save size={14} /> Salva Configurazione</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {races.map((race, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedRace(race)}
                        className="bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 space-y-4 cursor-pointer hover:border-[#fc6719]/50 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute right-[-10px] top-[-10px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
                          <MapPin size={100} />
                        </div>
                        <div className="flex justify-between items-center relative z-10">
                          <span className="text-[10px] font-black uppercase text-[#fc6719] tracking-widest">Gara {idx + 1}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRace(idx);
                            }} 
                            className="text-zinc-700 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                        <div className="relative z-10">
                          <h4 className="text-white font-black italic uppercase truncate">{race.name}</h4>
                          <p className="text-zinc-500 text-[10px] font-bold uppercase">{race.date || 'TBD'} • {race.world || '---'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 relative z-10">
                          <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                            <p className="text-[8px] text-zinc-600 font-black uppercase">Distanza</p>
                            <p className="text-xs text-zinc-300 font-bold">{race.distance} km</p>
                          </div>
                          <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                            <p className="text-[8px] text-zinc-600 font-black uppercase">Elevazione</p>
                            <p className="text-xs text-zinc-300 font-bold">{race.elevation} m</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2-5 */}
            {activeStep === 2 && <AvailabilityManagement />}
            {activeStep === 3 && <RosterSuggestions />}
            {activeStep === 4 && <RosterBuilder />}
            {activeStep === 5 && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="p-8 bg-zinc-950 rounded-full border border-zinc-900 text-zinc-800"><Trophy size={48} /></div>
                <h3 className="text-2xl font-black italic text-zinc-700 uppercase">Sezione Risultati</h3>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Modulo per la generazione del giornalino e statistiche post-gara.</p>
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
