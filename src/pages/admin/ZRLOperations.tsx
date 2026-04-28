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
  const [seasonName, setSeasonName] = useState('ZRL Spring 2026');
  const [wtrlId, setWtrlId] = useState('19');
  const [rounds, setRounds] = useState<RoundInput[]>([]);

  // Caricamento dati iniziali dal database
  useEffect(() => {
    const fetchCurrentSeason = async () => {
      setLoading(true);
      try {
        const seriesData = await api.getSeries();
        const active = seriesData.find((s: any) => s.is_active);
        
        if (active) {
          setSeasonName(active.name);
          setWtrlId(active.external_season_id?.toString() || '19');
          
          const roundsData = await api.getRounds(active.id);
          if (roundsData && roundsData.length > 0) {
            setRounds(roundsData.map((r: any) => ({
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
        console.error("Errore caricamento stagione:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSeason();
  }, []);

  const handleInitSeason = async () => {
    if (!window.confirm("Attenzione: Questa operazione archivierà la stagione attuale e creerà una nuova serie nel database. Procedere?")) return;
    
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
          name: seasonName,
          external_id: parseInt(wtrlId),
          rounds: rounds
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
      setMessage({ type: 'error', text: 'Inserire un ID Stagione WTRL valido.' });
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

  const handleSyncRounds = async () => {
    if (!wtrlId) {
      setMessage({ type: 'error', text: 'Inserire un ID Stagione WTRL valido.' });
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
          const roundsData = await api.getRounds(active.id);
          setRounds(roundsData.map((r: any) => ({
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
        setMessage({ type: 'error', text: data.error || "Errore durante la sincronizzazione round." });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore di connessione al server.' });
    } finally {
      setLoading(false);
    }
  };

  const addRound = () => {
    setRounds([...rounds, { name: `Race ${rounds.length + 1}`, date: '', world: '', route: '', format: 'Scratch', distance: 0, elevation: 0 }]);
  };

  const updateRound = (index: number, field: keyof RoundInput, value: any) => {
    const newRounds = [...rounds];
    (newRounds[index] as any)[field] = value;
    setRounds(newRounds);
  };

  const removeRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  const steps = [
    { id: 1, title: 'Setup Stagione', icon: Settings, desc: 'ID Stagione e Date' },
    { id: 2, title: 'Disponibilità', icon: ClipboardCheck, desc: 'Monitoraggio RSVP' },
    { id: 3, title: 'Roster Strategy', icon: Zap, desc: 'Optimizer & Teams' },
    { id: 4, title: 'Gare & Lineup', icon: Users, desc: 'Composizione Squadre' },
    { id: 5, title: 'Risultati & Media', icon: Trophy, desc: 'Giornalino & Bilanci' },
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
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Setup Stagione</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-[0.2em]">Nome Stagione</label>
                        <input type="text" value={seasonName} onChange={(e) => setSeasonName(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-2xl px-6 py-4 outline-none focus:border-[#fc6719]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-[0.2em]">ID Stagione WTRL</label>
                        <input type="text" value={wtrlId} onChange={(e) => setWtrlId(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white font-bold rounded-2xl px-6 py-4 outline-none focus:border-[#fc6719]" />
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-4">
                      <div className="flex items-center gap-2 text-[#fc6719]"><RefreshCw size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Sincronizzazione Remota</span></div>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Importa le date e i percorsi della stagione direttamente da WTRL.</p>
                      <button onClick={handleSyncRounds} disabled={loading} className="w-full bg-[#fc6719] hover:bg-[#e55a16] text-black font-black italic uppercase py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Calendar size={20} />} Sincronizza Round
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-8 rounded-[2rem] border border-zinc-900 flex flex-col justify-center space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-zinc-400"><Activity size={18} /><h4 className="text-xs font-black uppercase tracking-widest">Ultra-Sync Rosters</h4></div>
                      <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">1. Scarica il JSON da WTRL con lo script.<br/>2. Carica il file qui sotto.</p>
                      <div className="flex flex-col gap-3">
                        <button onClick={() => {
                          const script = `(async () => {
                            const panels = document.querySelectorAll('.panel-body[data-trc]');
                            const allTeams = [];
                            console.log("🚀 Inizio recupero...");
                            for (const panel of panels) {
                                const trc = panel.getAttribute('data-trc');
                                const season = panel.getAttribute('data-season') || document.body.getAttribute('wtrl-season');
                                try {
                                    const data = await callApi('team.load', {}, { season, trc });
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
                        }} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black italic uppercase py-3 rounded-xl flex items-center justify-center gap-3 border border-zinc-800 text-[10px]"><Zap size={16} /> 1. Copia Script WTRL</button>
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
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Gare & Percorsi</h3>
                    <div className="flex gap-2">
                      <button onClick={addRound} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"><Plus size={14} /> Aggiungi Round</button>
                      <button onClick={handleInitSeason} className="bg-white hover:bg-zinc-200 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase italic flex items-center gap-2 transition-all shadow-lg"><Save size={14} /> Salva Tutto</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {rounds.map((round, idx) => (
                      <div key={idx} className="bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 space-y-4">
                        <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-[#fc6719] tracking-widest">Gara {idx + 1}</span><button onClick={() => removeRound(idx)} className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={16}/></button></div>
                        <input type="text" placeholder="Nome Gara" value={round.name} onChange={(e) => updateRound(idx, 'name', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-[#fc6719]" />
                        <input type="date" value={round.date} onChange={(e) => updateRound(idx, 'date', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-[#fc6719]" />
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="World" value={round.world} onChange={(e) => updateRound(idx, 'world', e.target.value)} className="bg-zinc-950 border border-zinc-800 text-white text-[10px] font-bold rounded-xl px-4 py-3 outline-none focus:border-[#fc6719]" />
                          <input placeholder="Route" value={round.route} onChange={(e) => updateRound(idx, 'route', e.target.value)} className="bg-zinc-950 border border-zinc-800 text-white text-[10px] font-bold rounded-xl px-4 py-3 outline-none focus:border-[#fc6719]" />
                        </div>
                      </div>
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
    </div>
  );
};

export default ZRLOperations;
