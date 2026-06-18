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
import type { TimeSlot } from '../services/types';

const PREF_LEVELS = [
  { id: 0, label: 'MAI', desc: 'Impossibile', color: 'border-zinc-800 text-zinc-600 bg-transparent', active: 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' },
  { id: 1, label: 'OK', desc: 'Disponibile', color: 'border-zinc-800 text-zinc-600 bg-transparent', active: 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]' },
  { id: 2, label: 'FAV', desc: 'Preferito', color: 'border-zinc-800 text-zinc-600 bg-transparent', active: 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]' }
];

const STEPS = [
  { id: 'intent', title: 'Partecipazione', icon: Trophy },
  { id: 'preferences', title: 'Orari', icon: Clock },
  { id: 'races', title: 'Calendario', icon: CalendarCheck }
];

const Availability: React.FC = () => { // force-cache-invalidation
  const [currentStep, setCurrentStep] = useState(0);
  const [intent, setIntent] = useState<boolean | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [userPrefs, setUserPrefs] = useState<Record<string, number>>({});
  const [races, setRaces] = useState<any[]>([]); // Gara singole
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
      
      if (data.error) throw new Error(data.error);

      // CORREZIONE: Gestione flessibile della risposta API
      // Se data è un array, è la lista dei round. Se è un oggetto, cerchiamo 'rounds'
      const roundList = Array.isArray(data) ? data : (data.rounds || []);
      
      // Flatten: Trasforma i round con gare annidate in una lista piatta di gare
      const allRaces = roundList.reduce((acc: any[], round: any) => {
          const roundRaces = (round.races || []).map((race: any) => ({
              ...race,
              roundId: round.id,
              roundName: round.name,
              syncState: round.lifecycle?.sync_state // Assumiamo sync_state nel lifecycle
          }));
          return [...acc, ...roundRaces];
      }, []);

      // Filtriamo le gare: escludiamo ARCHIVED e manteniamo solo round con sync_state valido per l'utente (non solo CREATED)
      const filteredRaces = allRaces.filter(r => 
        r.name && 
        !r.name.toLowerCase().includes('archived') && 
        (r.syncState === 'CREATED' || r.syncState === 'COMPLETED' || r.syncState === 'PENDING')
      );

      setRaces(filteredRaces);
      setTimeSlots(data.timeSlots || []);

      if (data.intent !== undefined) setIntent(data.intent);

      // Inizializziamo le preferenze
      const prefs: Record<string, number | null> = {};
      (data.timeSlots || []).forEach((slot: any) => {
        const existing = data.preferences?.find((p: any) => p.time_slot_id === slot.id);
        prefs[slot.id] = existing ? existing.preference_level : null;
      });
      setUserPrefs(prefs as Record<string, number>);

      // Inizializziamo le presenze
      const currentPresences: Record<number, string> = {};
      filteredRaces.forEach((r: any) => {
        currentPresences[r.id] = r.status || 'unavailable';
      });
      setPresences(currentPresences);
      setPresences(currentPresences);

    } catch (e: any) {
      console.error('Error loading data:', e);
      setError(e.message || 'Errore nel caricamento del questionario.');
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
      // Se ci sono gare ma non slot orari, salta direttamente al calendario
      if (timeSlots.length === 0 && races.length > 0) {
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }
    }
  };

  const handleSavePreferences = async (goToNext: boolean) => {
    setSaving(true);
    setError(null);
    try {
      await api.updateIntent(true);
      const prefsPayload = Object.entries(userPrefs).map(([slotId, level]) => ({ slotId, level }));
      await api.updateTimePreferences(prefsPayload);

      if (goToNext) {
        setCurrentStep(2); // Passa allo step delle gare
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (e: any) {
      setError('Errore durante il salvataggio delle preferenze.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.updateIntent(true);
      
      const prefsPayload = Object.entries(userPrefs).map(([slotId, level]) => ({ slotId, level }));
      await api.updateTimePreferences(prefsPayload);

      // Invia la disponibilità per ogni gara
      const presencePromises = Object.entries(presences).map(([raceId, status]) => {
        const id = parseInt(raceId, 10);
        return api.updateRaceAvailability(id, status);
      });
      await Promise.all(presencePromises);

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (e: any) {
      setError('Errore durante il salvataggio finale.');
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
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 py-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">
                Vuoi correre la <span className="text-[#fc6719]">ZRL</span>?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <button onClick={() => handleIntentSelection(true)} className="group relative p-10 rounded-[3rem] bg-zinc-900 border-2 border-zinc-800 hover:border-[#fc6719] transition-all overflow-hidden">
                <h3 className="text-3xl font-black italic text-white uppercase mb-2">SI, PARTECIPO</h3>
              </button>
              <button onClick={() => handleIntentSelection(false)} className="group relative p-10 rounded-[3rem] bg-zinc-900/50 border-2 border-zinc-800 hover:border-red-900 transition-all overflow-hidden">
                <h3 className="text-3xl font-black italic text-zinc-400 uppercase mb-2">NO, PASSO</h3>
              </button>
            </div>
          </motion.div>
        );

      case 1: // PREFERENCES
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 py-10">
            <h2 className="text-4xl font-black italic text-white uppercase">Preferenze Orarie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeSlots.map(slot => (
                <div key={slot.id} className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800">
                  <h3 className="font-bold text-white uppercase text-xl">{slot.display_name}</h3>
                  <div className="flex gap-2 mt-4">
                    {PREF_LEVELS.map(lvl => {
                      const isActive = userPrefs[slot.id] === lvl.id;
                      return (
                        <button key={lvl.id} onClick={() => setUserPrefs(prev => ({ ...prev, [slot.id]: lvl.id }))} className={`flex-1 py-4 rounded-2xl border font-black text-xs md:text-sm transition-all ${isActive ? lvl.active : lvl.color}`}>
                          {lvl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-10">
               <button onClick={() => setCurrentStep(0)} className="text-zinc-500 font-black uppercase italic">Indietro</button>
               <button onClick={() => handleSavePreferences(true)} disabled={saving} className="bg-white text-black px-10 py-4 rounded-2xl font-black italic uppercase">Salva e Prosegui</button>
            </div>
          </motion.div>
        );

      case 2: // RACES
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 py-10">
            <h2 className="text-4xl font-black italic text-white uppercase">Calendario Gare</h2>
            <div className="grid gap-4">
              {races.map(race => {
                const isPresent = presences[race.id] === 'available';
                const raceDate = new Date(race.date);
                return (
                  <button key={race.id} onClick={() => setPresences(prev => ({ ...prev, [race.id]: isPresent ? 'unavailable' : 'available' }))} className={`p-6 rounded-[2.5rem] border text-left transition-all ${isPresent ? 'border-[#fc6719] bg-[#fc6719]/5' : 'border-zinc-800 bg-zinc-900/40'}`}>
                    <div className="flex justify-between items-center">
                        <div className="text-xl font-black italic text-white">{race.name}</div>
                        <div className={isPresent ? 'text-[#fc6719]' : 'text-zinc-600'}><Zap /></div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center pt-10">
               <button onClick={() => setCurrentStep(1)} className="text-zinc-500 font-black uppercase italic">Indietro</button>
               <button onClick={handleSaveAll} disabled={saving || success} className="bg-[#fc6719] text-black px-12 py-5 rounded-2xl font-black italic uppercase">Conferma</button>
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <main className="min-h-[400px]">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </main>
    </div>
  );
};

export default Availability;
