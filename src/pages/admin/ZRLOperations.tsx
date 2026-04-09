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
        const active = seriesData.find(s => s.is_active);
        
        if (active) {
          setSeasonName(active.name);
          setWtrlId(active.external_season_id?.toString() || '19');
          
          const roundsData = await api.getRounds(active.id);
          if (roundsData && roundsData.length > 0) {
            setRounds(roundsData.map(r => ({
              id: r.id,
              name: r.name,
              date: r.date.split('T')[0],
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
        setMessage({ type: 'success', text: `Stagione '${seasonName}' inizializzata con successo!` });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Errore durante l\'inizializzazione.' });
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
      {/* Header */}
      <header className="border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-3 mb-2 text-[#fc6719]">
          <Settings size={20} />
          <span className="font-black text-xs tracking-[0.3em] uppercase italic">Inox Admin Command Center</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-white uppercase">
          ZRL <span className="text-zinc-700">Operations</span>
        </h1>
      </header>

      {/* Stepper */}
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black italic text-white uppercase flex items-center gap-3">
                      <Settings className="text-[#fc6719]" /> System Init
                    </h3>
                    <p className="text-zinc-500 text-xs font-bold uppercase leading-relaxed">
                      Configura la stagione attiva. Inizializzando una nuova stagione, il sistema archivierà automaticamente i dati precedenti.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="seasonName" className="text-[9px] font-black uppercase text-zinc-600 ml-2 mb-1 block">Season Name</label>
                        <input 
                          id="seasonName"
                          name="seasonName"
                          type="text" 
                          value={seasonName}
                          onChange={(e) => setSeasonName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-white font-bold outline-none focus:border-[#fc6719]" 
                        />
                      </div>
                      <div>
                        <label htmlFor="wtrlId" className="text-[9px] font-black uppercase text-zinc-600 ml-2 mb-1 block">WTRL ID</label>
                        <input 
                          id="wtrlId"
                          name="wtrlId"
                          type="text" 
                          value={wtrlId}
                          onChange={(e) => setWtrlId(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-white font-bold outline-none focus:border-[#fc6719]" 
                        />
                      </div>
                      <button 
                        onClick={handleInitSeason}
                        disabled={loading}
                        className="w-full py-5 bg-[#fc6719] text-black font-black uppercase italic rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#fc6719]/20 flex items-center justify-center gap-3"
                      >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Applica Configurazione
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-zinc-950/50 p-8 rounded-[2.5rem] border border-zinc-900 space-y-6">
                    <div className="flex justify-between items-center px-2">
                      <h3 className="text-lg font-black italic text-white uppercase flex items-center gap-2">
                        <Calendar className="text-[#fc6719]" size={18} /> Season Calendar
                      </h3>
                      <button onClick={addRound} className="p-2 bg-zinc-900 text-[#fc6719] rounded-lg hover:bg-zinc-800">
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                      {rounds.map((round, idx) => (
                        <div key={idx} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 group hover:border-zinc-700 transition-all">
                          <div className="grid grid-cols-12 gap-3 mb-3">
                            <input 
                              type="text" 
                              value={round.name}
                              onChange={(e) => updateRound(idx, 'name', e.target.value)}
                              className="col-span-3 bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-[10px] text-white font-black uppercase italic"
                            />
                            <input 
                              type="date" 
                              value={round.date}
                              onChange={(e) => updateRound(idx, 'date', e.target.value)}
                              className="col-span-3 bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-[10px] text-zinc-400 font-bold"
                            />
                            <select 
                              value={round.format}
                              onChange={(e) => updateRound(idx, 'format', e.target.value)}
                              className="col-span-3 bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-[10px] text-[#fc6719] font-black uppercase"
                            >
                              <option value="Points">Points Race</option>
                              <option value="Scratch">Scratch Race</option>
                              <option value="TTT">TTT Race</option>
                            </select>
                            <button onClick={() => removeRound(idx)} className="col-span-3 text-right pr-2 text-zinc-700 hover:text-red-500">
                              <Trash2 size={16} className="inline" />
                            </button>
                          </div>
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4 relative">
                              <MapPin size={10} className="absolute left-2 top-3 text-zinc-600" />
                              <input 
                                type="text" 
                                placeholder="World"
                                value={round.world}
                                onChange={(e) => updateRound(idx, 'world', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 pl-6 text-[10px] text-zinc-300"
                              />
                            </div>
                            <div className="col-span-4 relative">
                              <Activity size={10} className="absolute left-2 top-3 text-zinc-600" />
                              <input 
                                type="text" 
                                placeholder="Route"
                                value={round.route}
                                onChange={(e) => updateRound(idx, 'route', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 pl-6 text-[10px] text-zinc-300"
                              />
                            </div>
                            <div className="col-span-2 relative">
                              <TrendingUp size={10} className="absolute left-2 top-3 text-zinc-600" />
                              <input 
                                type="number" 
                                placeholder="Km"
                                value={round.distance}
                                onChange={(e) => updateRound(idx, 'distance', parseFloat(e.target.value))}
                                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 pl-6 text-[10px] text-zinc-300"
                              />
                            </div>
                            <div className="col-span-2">
                              <input 
                                type="number" 
                                placeholder="Hm"
                                value={round.elevation}
                                onChange={(e) => updateRound(idx, 'elevation', parseFloat(e.target.value))}
                                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-[10px] text-zinc-300"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DISPONIBILITÀ */}
            {activeStep === 2 && (
              <AvailabilityManagement />
            )}

            {/* STEP 3: ROSTER STRATEGY */}
            {activeStep === 3 && (
              <RosterSuggestions />
            )}

            {/* STEP 4: LINEUP */}
            {activeStep === 4 && (
              <RosterBuilder />
            )}

            {/* STEP 5: RISULTATI */}
            {activeStep === 5 && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="p-8 bg-zinc-950 rounded-full border border-zinc-900 text-zinc-800">
                  <Trophy size={48} />
                </div>
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
