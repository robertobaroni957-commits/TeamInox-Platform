import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeString } from '../utils/stringUtils';
import type { TimeSlot, Round } from '../services/types';

const PREF_LEVELS = [
  { id: 0, label: 'MAI', desc: 'Impossibile', color: 'border-red-900 text-red-500 bg-red-950/20', active: 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' },
  { id: 1, label: 'OK', desc: 'Disponibile', color: 'border-zinc-800 text-zinc-500 bg-zinc-900', active: 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]' },
  { id: 2, label: 'FAV', desc: 'Preferito', color: 'border-zinc-800 text-zinc-500 bg-zinc-900', active: 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]' }
];

const STEPS = [
  { id: 'intent', title: 'Partecipazione', icon: Trophy },
  { id: 'preferences', title: 'Orari', icon: Clock },
  { id: 'races', title: 'Calendario', icon: CalendarCheck }
];

const Availability: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [intent, setIntent] = useState<boolean | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [userPrefs, setUserPrefs] = useState<Record<string, number>>({});
  const [races, setRaces] = useState<Round[]>([]);
  const [presences, setPresences] = useState<Record<number, string>>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUserAvailability();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const slots = data.timeSlots || [];
      const roundList = data.rounds || [];

      setTimeSlots(slots);
      setRaces(roundList);
      
      // Intent salvato
      if (data.intent !== undefined) {
        setIntent(data.intent);
      }

      // Inizializziamo le preferenze in modo sicuro
      const prefs: Record<string, number> = {};
      slots.forEach(slot => {
        const existing = data.preferences?.find(p => p.time_slot_id === slot.id);
        prefs[slot.id] = existing ? existing.preference_level : 1;
      });
      setUserPrefs(prefs);

      // Inizializziamo le presenze in modo sicuro
      const currentPresences: Record<number, string> = {};
      roundList.forEach(r => {
        currentPresences[r.id] = r.status || 'unavailable';
      });
      setPresences(currentPresences);

    } catch (e: any) {
      console.error('Error loading data:', e);
      if (e.message?.includes('401') || e.message?.includes('Unauthorized')) {
        localStorage.removeItem('inox_token');
        navigate('/login');
      } else {
        setError(e.message || 'Errore nel caricamento del questionario.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleIntentSelection = async (value: boolean) => {
    setIntent(value);
    if (!value) {
      // Se sceglie di NON partecipare, salviamo subito e usciamo
      setSaving(true);
      try {
        await api.updateIntent(false);
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
        setError("Errore nel salvataggio dell'intento.");
      } finally {
        setSaving(false);
      }
    } else {
      // Se sceglie di SI, andiamo al prossimo step
      setCurrentStep(1);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      // 1. Salviamo l'intento
      await api.updateIntent(true);

      // 2. Salviamo le preferenze orarie
      const prefsPayload = Object.entries(userPrefs).map(([slotId, level]) => ({ slotId, level }));
      await api.updateTimePreferences(prefsPayload);

      // 3. Salviamo le presenze per ogni round
      const presencePromises = Object.entries(presences).map(([roundId, status]) => 
        api.updateRaceAvailability(parseInt(roundId), status)
      );
      await Promise.all(presencePromises);

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (e: any) {
      setError('Errore durante il salvataggio dei dati.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-[#fc6719] font-black italic text-xl animate-pulse uppercase tracking-[0.2em]">
        Caricamento Deck Operativo...
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: // INTENT
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12 py-10"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">
                Vuoi correre la <span className="text-[#fc6719]">ZRL</span>?
              </h2>
              <p className="text-zinc-500 font-bold italic uppercase tracking-widest text-sm max-w-xl mx-auto leading-relaxed">
                La Zwift Racing League è la competizione a squadre più importante. 
                Seleziona la tua intenzione per questo round.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <button
                onClick={() => handleIntentSelection(true)}
                className="group relative p-10 rounded-[3rem] bg-zinc-900 border-2 border-zinc-800 hover:border-[#fc6719] transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                   <ThumbsUp size={80} className="text-[#fc6719]" />
                </div>
                <div className="relative z-10 text-left">
                  <h3 className="text-3xl font-black italic text-white uppercase mb-2">SI, PARTECIPO</h3>
                  <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Voglio essere inserito in una squadra InoxTeam.</p>
                </div>
              </button>

              <button
                onClick={() => handleIntentSelection(false)}
                className="group relative p-10 rounded-[3rem] bg-zinc-900/50 border-2 border-zinc-800 hover:border-red-900 transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-50 transition-opacity">
                   <ThumbsDown size={80} className="text-red-500" />
                </div>
                <div className="relative z-10 text-left">
                  <h3 className="text-3xl font-black italic text-zinc-400 uppercase mb-2">NO, PASSO</h3>
                  <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest">Non sono disponibile per questo round della stagione.</p>
                </div>
              </button>
            </div>
          </motion.div>
        );

      case 1: // PREFERENCES
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 py-10"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[2rem] bg-[#fc6719] text-black flex items-center justify-center font-black italic text-3xl shadow-[0_0_30px_rgba(252,103,25,0.3)]">1</div>
              <div>
                <h2 className="text-4xl font-black italic text-white uppercase tracking-tight leading-none">Preferenze Orarie</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">In quali leghe e orari saresti disponibile?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeSlots.map(slot => (
                <div key={slot.id} className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 flex flex-col justify-between gap-6 group hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-[#fc6719] transition-colors">
                      <Clock size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-[#fc6719] tracking-widest uppercase opacity-70">SLOT {safeString(slot.id).replace('T_', '')}</span>
                      <h3 className="font-bold text-white uppercase tracking-tight text-xl leading-none">{slot.display_name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {PREF_LEVELS.map(lvl => {
                      const isActive = userPrefs[slot.id] === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          onClick={() => setUserPrefs(prev => ({ ...prev, [slot.id]: lvl.id }))}
                          className={`flex-1 py-3.5 rounded-2xl border font-black text-[10px] transition-all transform active:scale-95 ${isActive ? lvl.active : lvl.color + ' hover:border-zinc-600'}`}
                        >
                          {lvl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-10">
               <button onClick={() => setCurrentStep(0)} className="flex items-center gap-2 text-zinc-500 font-black uppercase italic text-sm hover:text-white transition-colors">
                  <ChevronLeft size={20} /> Indietro
               </button>
               <button onClick={() => setCurrentStep(2)} className="bg-white text-black px-10 py-4 rounded-2xl font-black italic uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  Avanti <ChevronRight size={20} />
               </button>
            </div>
          </motion.div>
        );

      case 2: // RACES
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 py-10"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[2rem] bg-zinc-800 text-[#fc6719] border border-[#fc6719]/30 flex items-center justify-center font-black italic text-3xl shadow-[0_0_30px_rgba(252,103,25,0.1)]">2</div>
              <div>
                <h2 className="text-4xl font-black italic text-white uppercase tracking-tight leading-none">Calendario Gare</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Conferma la tua presenza effettiva per ogni data.</p>
              </div>
            </div>

            <div className="grid gap-4">
              {races.length > 0 ? races.map(race => {
                const isPresent = presences[race.id] === 'available';
                const raceDate = new Date(race.date);
                
                return (
                  <button
                    key={race.id}
                    onClick={() => setPresences(prev => ({ ...prev, [race.id]: isPresent ? 'unavailable' : 'available' }))}
                    className={`p-6 rounded-[2.5rem] border text-left transition-all relative overflow-hidden group ${isPresent ? 'border-[#fc6719] bg-[#fc6719]/5' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xl ${isPresent ? 'border-[#fc6719] text-[#fc6719] bg-black' : 'border-zinc-800 text-zinc-700 bg-zinc-950'}`}>
                          <div className="text-center">
                            <div className="text-[10px] font-black uppercase leading-none">{raceDate.toLocaleDateString('it-IT', { month: 'short' })}</div>
                            <div className="text-2xl font-black italic leading-none">{raceDate.getDate()}</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase">{raceDate.toLocaleDateString('it-IT', { weekday: 'long' })}</span>
                          <h3 className="text-2xl font-black italic text-white uppercase leading-none mt-1">{race.name}</h3>
                          <div className="flex gap-3 items-center mt-2">
                            <span className="bg-black/40 px-2 py-0.5 rounded text-[#fc6719] text-[9px] font-black uppercase tracking-widest border border-[#fc6719]/20">{race.world}</span>
                            <span className="text-zinc-500 text-[10px] font-bold uppercase truncate max-w-[200px]">{race.route}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isPresent ? 'border-[#fc6719] bg-[#fc6719] text-black shadow-[0_0_20px_rgba(252,103,25,0.4)]' : 'border-zinc-800 text-zinc-700'}`}>
                        <Zap size={20} className={isPresent ? 'fill-current' : ''} />
                      </div>
                    </div>
                  </button>
                );
              }) : (
                <div className="p-12 text-center rounded-[3rem] border border-zinc-800 bg-zinc-900/20">
                   <p className="text-zinc-600 font-black italic uppercase tracking-widest">Il calendario non è ancora disponibile.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-10">
               <button onClick={() => setCurrentStep(1)} className="flex items-center gap-2 text-zinc-500 font-black uppercase italic text-sm hover:text-white transition-colors">
                  <ChevronLeft size={20} /> Indietro
               </button>
               <button 
                onClick={handleSaveAll} 
                disabled={saving || success}
                className={`px-12 py-5 rounded-2xl font-black italic uppercase text-sm tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-4 ${saving ? 'bg-zinc-800 text-zinc-500 cursor-wait' : 'bg-[#fc6719] text-black hover:bg-orange-500 hover:scale-105'}`}
               >
                  {saving ? 'Salvataggio...' : (
                    <>
                      <Save size={20} />
                      Conferma e Invia
                    </>
                  )}
               </button>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      
      {/* HEADER & STEPPER */}
      <header className="mb-12 border-b border-zinc-900 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <span className="text-[#fc6719] font-black text-[10px] tracking-[0.5em] uppercase italic opacity-70">InoxTeam Operation Deck</span>
            <h1 className="text-6xl font-black italic tracking-tighter leading-none text-white uppercase">
              ZRL <span className="text-zinc-800">2026</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === idx;
              const isCompleted = currentStep > idx;
              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div 
                    className={`flex flex-col items-center gap-2 transition-all ${isActive ? 'opacity-100 scale-110' : 'opacity-30'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${isActive ? 'border-[#fc6719] bg-black text-[#fc6719]' : isCompleted ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-zinc-800 text-zinc-600'}`}>
                       <step.icon size={20} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{step.title}</span>
                  </div>
                  {idx < STEPS.length - 1 && <div className="w-8 h-[2px] bg-zinc-900 mb-4" />}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* ERROR / SUCCESS ALERTS */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8 p-6 rounded-3xl bg-red-950/20 border border-red-900/50 flex items-center gap-4 text-red-500 font-bold italic">
            <AlertCircle size={24} />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8 p-6 rounded-3xl bg-emerald-950/20 border border-emerald-900/50 flex items-center gap-4 text-emerald-500 font-bold italic">
            <CheckCircle size={24} />
            Dati salvati correttamente. Reindirizzamento...
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>

      {/* FOOTER INFO */}
      <footer className="mt-20 pt-10 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
         <div className="text-center md:text-left">
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">Status Sincronizzazione</p>
           <p className="text-white text-xs font-bold italic mt-1 uppercase">WTRL API Engine Online</p>
         </div>
         <div className="flex gap-10">
            <div className="text-center">
              <p className="text-[#fc6719] text-xl font-black italic leading-none">{races.length}</p>
              <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-1">Gare Round</p>
            </div>
            <div className="text-center">
              <p className="text-white text-xl font-black italic leading-none">{Object.values(presences).filter(v => v === 'available').length}</p>
              <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-1">Confermate</p>
            </div>
         </div>
      </footer>

    </div>
  );
};

export default Availability;
