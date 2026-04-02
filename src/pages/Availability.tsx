import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Save, CheckCircle, AlertCircle, Zap, Calendar, Clock, ChevronRight } from 'lucide-react';
import type { TimeSlot, Round } from '../services/types';

const PREF_LEVELS = [
  { id: 0, label: 'MAI', desc: 'Impossibile', color: 'border-red-900 text-red-500 bg-red-950/20', active: 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' },
  { id: 1, label: 'OK', desc: 'Disponibile', color: 'border-zinc-800 text-zinc-500 bg-zinc-900', active: 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]' },
  { id: 2, label: 'FAV', desc: 'Preferito', color: 'border-zinc-800 text-zinc-500 bg-zinc-900', active: 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]' }
];

const Availability: React.FC = () => {
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

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      // 1. Salviamo le preferenze orarie
      const prefsPayload = Object.entries(userPrefs).map(([slotId, level]) => ({ slotId, level }));
      await api.updateTimePreferences(prefsPayload);

      // 2. Salviamo le presenze per ogni round
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
        Inizializzazione Questionario...
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24">
      <header className="mb-12 border-b border-zinc-800 pb-8">
        <span className="text-[#fc6719] font-black text-xs tracking-[0.4em] uppercase italic">Stagione ZRL 2026</span>
        <h1 className="text-6xl font-black italic tracking-tighter leading-none mt-2 text-white uppercase">
          Questionario <span className="text-zinc-600">Disponibilità</span>
        </h1>
        <p className="text-zinc-500 mt-4 font-medium italic max-w-2xl text-lg">
          Inserisci i tuoi orari preferiti e conferma la tua presenza fisica. I capitani useranno questi dati per formare le squadre.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* PARTE 1: LEAGUE PREFERENCES */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fc6719] text-black flex items-center justify-center font-black italic text-xl shadow-[0_0_20px_rgba(252,103,25,0.3)]">1</div>
            <div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Preferenze Orarie</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">In quali leghe puoi correre?</p>
            </div>
          </div>

          <div className="grid gap-3">
            {timeSlots.map(slot => (
              <div key={slot.id} className="bg-zinc-900/40 p-5 rounded-[2rem] border border-zinc-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-[#fc6719] tracking-widest uppercase opacity-70">{slot.id.replace('T_', '')} SLOT</span>
                    <h3 className="font-bold text-white uppercase tracking-tight text-lg leading-none">{slot.display_name}</h3>
                  </div>
                </div>
                <div className="flex gap-1.5 self-end md:self-center">
                  {PREF_LEVELS.map(lvl => {
                    const isActive = userPrefs[slot.id] === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        onClick={() => setUserPrefs(prev => ({ ...prev, [slot.id]: lvl.id }))}
                        className={`px-4 py-2.5 rounded-xl border font-black text-[10px] transition-all transform active:scale-90 ${isActive ? lvl.active : lvl.color + ' hover:border-zinc-600'}`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PARTE 2: ROUND PRESENCE */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-[#fc6719] flex items-center justify-center font-black italic text-xl shadow-[0_0_20px_rgba(252,103,25,0.1)] border border-[#fc6719]/20">2</div>
            <div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Presenza Round</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Conferma le singole settimane</p>
            </div>
          </div>

          <div className="grid gap-3">
            {races.map(race => {
              const isPresent = presences[race.id] === 'available';
              const raceDate = new Date(race.date);
              
              return (
                <button
                  key={race.id}
                  onClick={() => setPresences(prev => ({ ...prev, [race.id]: isPresent ? 'unavailable' : 'available' }))}
                  className={`p-5 rounded-[2rem] border text-left transition-all relative overflow-hidden group ${isPresent ? 'border-[#fc6719]/50 bg-[#fc6719]/5' : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-lg ${isPresent ? 'border-[#fc6719] text-[#fc6719] bg-black' : 'border-zinc-800 text-zinc-700 bg-zinc-900'}`}>
                        <div className="text-center">
                          <div className="text-[10px] font-black uppercase leading-none">{raceDate.toLocaleDateString('it-IT', { month: 'short' })}</div>
                          <div className="text-xl font-black italic leading-none">{raceDate.getDate()}</div>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase">{raceDate.toLocaleDateString('it-IT', { weekday: 'long' })}</span>
                        <h3 className="text-xl font-black italic text-white uppercase leading-none mt-1">{race.name}</h3>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[#fc6719] text-[9px] font-bold uppercase tracking-widest">{race.world}</span>
                          <span className="text-zinc-700 text-[9px] font-black">•</span>
                          <span className="text-zinc-500 text-[9px] font-bold uppercase truncate max-w-[150px]">{race.route}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isPresent ? 'border-[#fc6719] bg-[#fc6719] text-black' : 'border-zinc-800 text-zinc-700'}`}>
                      <Zap size={18} className={isPresent ? 'fill-current' : ''} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* FOOTER DI SALVATAGGIO FISSO */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/80 backdrop-blur-xl border-t border-zinc-900 z-50 flex justify-center">
        <div className="max-w-6xl w-full flex items-center justify-between gap-8">
          <div className="hidden md:block">
            <p className="text-zinc-500 text-xs font-bold uppercase italic">Controlla bene i dati prima di inviare.</p>
            <p className="text-white text-[10px] font-black uppercase tracking-widest mt-1">Stato: {Object.values(presences).filter(v => v === 'available').length} round confermati</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {error && <span className="text-red-500 font-bold italic text-xs animate-bounce flex items-center gap-2"><AlertCircle size={16}/> {error}</span>}
            {success && <span className="text-emerald-500 font-bold italic text-xs flex items-center gap-2"><CheckCircle size={16}/> Salvataggio completato!</span>}
            
            <button
              onClick={handleSaveAll}
              disabled={saving || success}
              className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-12 py-5 rounded-2xl font-black italic transition-all uppercase text-sm tracking-widest shadow-2xl active:scale-95 ${saving ? 'bg-zinc-800 text-zinc-500 cursor-wait' : 'bg-[#fc6719] text-black hover:bg-orange-500 hover:scale-105'}`}
            >
              {saving ? 'Invio in corso...' : (
                <>
                  <Save size={20} />
                  Salva Disponibilità
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
