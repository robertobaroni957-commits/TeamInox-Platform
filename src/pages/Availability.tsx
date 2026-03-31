import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { TimeSlot, Round } from '../services/types';

const PREF_LEVELS = [
  { id: 0, label: 'NO', color: 'border-red-900 text-red-500 bg-red-950/20', active: 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' },
  { id: 1, label: 'OK', color: 'border-zinc-800 text-zinc-500 bg-zinc-900', active: 'bg-zinc-700 text-white border-zinc-500 shadow-lg' },
  { id: 2, label: 'FAV', color: 'border-inox-orange/30 text-inox-orange bg-inox-orange/5', active: 'bg-inox-orange text-black border-orange-400 shadow-[0_0_20px_rgba(252,103,25,0.5)]' }
];

const Availability: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [userPrefs, setUserPrefs] = useState<Record<string, number>>({});
  const [races, setRaces] = useState<Round[]>([]);
  const [presences, setPresences] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUserAvailability();
      
      setTimeSlots(data.timeSlots || []);
      
      const prefs: Record<string, number> = {};
      (data.preferences || []).forEach(p => prefs[p.time_slot_id] = p.preference_level);
      setUserPrefs(prefs);

      const currentPresences: Record<number, string> = {};
      (data.rounds || []).forEach(r => currentPresences[r.id] = r.status || 'unavailable');
      setPresences(currentPresences);
      setRaces(data.rounds || []);
    } catch (e: any) {
      console.error('Error loading data:', e);
      setError(e.message || 'Failed to load availability data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updatePref = async (slotId: string, level: number) => {
    setSaving(true);
    setError(null);
    try {
      await api.updateTimePreferences([{ slotId, level }]);
      setUserPrefs(prev => ({ ...prev, [slotId]: level }));
    } catch (e: any) {
      setError(e.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const togglePresence = async (raceId: number, currentStatus: string) => {
    setSaving(true);
    setError(null);
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    setPresences(prev => ({ ...prev, [raceId]: newStatus }));

    try {
      await api.updateRaceAvailability(raceId, newStatus);
    } catch (e: any) {
      setError(e.message || 'Failed to update race availability');
      setPresences(prev => ({ ...prev, [raceId]: currentStatus })); // Rollback
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-inox-orange font-black italic text-xl animate-pulse uppercase tracking-[0.2em]">
        Synchronizing Bio-Data...
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end border-b border-zinc-800 pb-6">
        <div>
          <span className="text-inox-orange font-black text-xs tracking-[0.3em] uppercase italic">Rider Profile</span>
          <h1 className="text-6xl font-black italic tracking-tighter leading-none mt-2 text-white">
            AVAILABILITY <span className="text-zinc-600">CENTER</span>
          </h1>
        </div>
        {saving && <span className="text-inox-cyan font-black italic text-xs animate-pulse mb-2 tracking-widest uppercase">Saving changes...</span>}
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold italic text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* 1. Global Time Preferences */}
        <section>
          <h2 className="text-2xl font-black italic mb-8 flex items-center gap-3 uppercase text-white">
            <span className="w-8 h-8 rounded bg-inox-orange text-black flex items-center justify-center not-italic">1</span>
            Preferenze Orarie Globali
          </h2>
          <p className="text-zinc-500 text-sm mb-8 font-medium italic">Definisci in quali slot orari preferisci correre solitamente.</p>
          
          <div className="space-y-4">
            {timeSlots.map(slot => (
              <div key={slot.id} className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition-all">
                <div className="font-bold text-white uppercase tracking-tight">{slot.display_name}</div>
                <div className="flex gap-2">
                  {PREF_LEVELS.map(lvl => {
                    const isActive = (userPrefs[slot.id] ?? 1) === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        disabled={saving}
                        onClick={() => updatePref(slot.id, lvl.id)}
                        className={`w-12 h-10 rounded-lg border font-black text-[10px] transition-all transform active:scale-95 ${isActive ? lvl.active : lvl.color}`}
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

        {/* 2. Race Availability */}
        <section>
          <h2 className="text-2xl font-black italic mb-8 flex items-center gap-3 uppercase text-white">
            <span className="w-8 h-8 rounded bg-inox-cyan text-black flex items-center justify-center not-italic">2</span>
            Calendario Gare
          </h2>
          <p className="text-zinc-500 text-sm mb-8 font-medium italic">Conferma la tua presenza fisica per le singole date.</p>

          <div className="grid gap-4">
            {races.map(race => {
              const currentStatus = presences[race.id] || 'unavailable';
              const isPresent = currentStatus === 'available';
              const raceDate = race.date ? new Date(race.date) : null;
              
              return (
                <button
                  key={race.id}
                  disabled={saving}
                  onClick={() => togglePresence(race.id, currentStatus)}
                  className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden group ${isPresent ? 'border-inox-cyan/50 bg-inox-cyan/5 shadow-[0_0_30px_rgba(30,242,242,0.1)]' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black text-inox-cyan tracking-widest uppercase">
                        {raceDate ? raceDate.toLocaleDateString('it-IT', { weekday: 'short', month: 'short', day: 'numeric' }) : 'DATA TBD'}
                      </span>
                      <h3 className="text-xl font-black italic text-white uppercase mt-1">{race.name}</h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase mt-1">{race.route}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all transform group-hover:scale-110 ${isPresent ? 'border-inox-cyan text-inox-cyan shadow-[0_0_15px_rgba(30,242,242,0.3)]' : 'border-zinc-700 text-zinc-700'}`}>
                      <span className="font-black italic text-sm">{isPresent ? 'YES' : 'NO'}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Availability;
