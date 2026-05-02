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

      <nav className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex flex-col items-start p-3 rounded-2xl border transition-all text-left ${
                isActive 
                  ? "bg-zinc-900 border-[#fc6719] shadow-lg" 
                  : "bg-zinc-950 border-zinc-900 opacity-60 hover:opacity-100"
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-2 ${isActive ? "bg-[#fc6719] text-black" : "bg-zinc-800 text-zinc-500"}`}>
                <Icon size={14} />
              </div>
              <span className="text-[7px] font-black uppercase text-zinc-600 mb-0.5 tracking-widest">Step 0{step.id}</span>
              <span className={`text-[10px] font-black uppercase italic ${isActive ? "text-white" : "text-zinc-700"}`}>{step.title}</span>
            </button>
          );
        })}
      </nav>

      <main className="bg-[#0A0A0A] rounded-[2rem] border border-zinc-900 shadow-2xl min-h-[500px] relative overflow-hidden">
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black italic text-white uppercase tracking-tighter">Round Configuration</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase text-zinc-600 ml-1 tracking-widest">Nome Round</label>
                        <input type="text" value={roundName} onChange={(e) => setRoundName(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl px-4 py-3 text-xs outline-none focus:border-[#fc6719]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase text-zinc-600 ml-1 tracking-widest">ID WTRL</label>
                        <input type="text" value={wtrlId} onChange={(e) => setWtrlId(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl px-4 py-3 text-xs outline-none focus:border-[#fc6719]" />
                      </div>
                    </div>
                    <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800 space-y-3">
                      <div className="flex items-center gap-2 text-[#fc6719]"><RefreshCw size={14} /><span className="text-[9px] font-black uppercase tracking-widest">Remote Sync</span></div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleSyncRaces} disabled={loading} className="bg-[#fc6719] hover:bg-[#e55a16] text-black font-black italic uppercase py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-[9px]">
                          <Calendar size={14} /> Auto Sync
                        </button>
                        <button 
                            onClick={() => setHtmlImport('')} // Simple way to clear or toggle
                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-black italic uppercase py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-[9px]"
                          >
                            <ClipboardCheck size={14} /> Manual HTML
                        </button>
                      </div>
                      {htmlImport !== undefined && (
                        <div className="pt-2">
                          <textarea 
                            placeholder="Paste HTML here..."
                            value={htmlImport}
                            onChange={(e) => setHtmlImport(e.target.value)}
                            className="w-full h-16 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-[9px] text-zinc-500 font-mono focus:border-[#fc6719] outline-none mb-2"
                          />
                          <button 
                            onClick={handleHtmlImport} 
                            disabled={loading || !htmlImport} 
                            className="w-full bg-zinc-700 text-white font-black italic uppercase py-2 rounded-lg text-[9px]"
                          >
                            Execute Import
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

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
                    {races.map((race, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedRace(race)}
                        className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 space-y-3 cursor-pointer hover:border-[#fc6719]/40 transition-all group relative overflow-hidden"
                      >
                        <div className="flex justify-between items-center relative z-10">
                          <span className="text-[8px] font-black uppercase text-[#fc6719] tracking-widest">G{idx + 1}</span>
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
                        <div className="relative z-10">
                          <h4 className="text-xs font-black italic uppercase truncate text-white leading-tight">{race.name}</h4>
                          <p className="text-zinc-600 text-[8px] font-bold uppercase mt-0.5">{race.date || 'TBD'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 relative z-10">
                          <div className="bg-black/20 p-1.5 rounded-lg border border-zinc-800/40">
                            <p className="text-[6px] text-zinc-700 font-black uppercase">Dist</p>
                            <p className="text-[10px] text-zinc-400 font-bold">{race.distance}k</p>
                          </div>
                          <div className="bg-black/20 p-1.5 rounded-lg border border-zinc-800/40">
                            <p className="text-[6px] text-zinc-700 font-black uppercase">Elev</p>
                            <p className="text-[10px] text-zinc-400 font-bold">{race.elevation}m</p>
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
