import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { InoxEvent } from '../services/types';
import { Calendar, Clock, ExternalLink, Tag, Loader2, MapPin } from 'lucide-react';

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

const Events: React.FC = () => {
  const [events, setEvents] = useState<InoxEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = selectedDay 
    ? events.filter(e => e.day_of_week === selectedDay)
    : events;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-inox-orange">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black italic uppercase tracking-widest">Loading Weekly Schedule...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-800 pb-8">
        <div>
          <span className="text-inox-orange font-black text-xs tracking-[0.3em] uppercase italic">Official Schedule</span>
          <h1 className="text-6xl font-black italic tracking-tighter leading-none mt-2 text-white uppercase">
            WEEKLY <span className="text-zinc-600">EVENTS</span>
          </h1>
          <p className="text-zinc-500 mt-4 font-medium italic max-w-xl">
            Unisciti ai nostri eventi ufficiali su Zwift. Dalle gare più competitive alle ricognizioni di gruppo.
          </p>
        </div>
      </header>

      {/* Day Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDay(null)}
          className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
            selectedDay === null 
              ? 'bg-white text-black border-white shadow-lg' 
              : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600'
          }`}
        >
          All Days
        </button>
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              selectedDay === day 
                ? 'bg-inox-orange text-black border-inox-orange shadow-lg' 
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="group bg-zinc-900/40 rounded-[2rem] border border-zinc-800 overflow-hidden hover:border-inox-orange/50 transition-all flex flex-col shadow-xl">
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  <span className="text-inox-orange font-black text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Calendar size={12} /> {event.day_of_week}
                  </span>
                  <span className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> {event.time} CET
                  </span>
                </div>
                {event.category && (
                  <span className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase tracking-tighter border border-zinc-700">
                    {event.category}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black italic text-white uppercase mb-3 leading-tight group-hover:text-inox-orange transition-colors">
                {event.name}
              </h3>
              
              <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-6 italic">
                {event.description || 'Nessuna descrizione disponibile per questo evento.'}
              </p>
            </div>

            <div className="p-6 bg-zinc-950/50 border-t border-zinc-800">
              {event.zwift_link ? (
                <a 
                  href={event.zwift_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-black italic rounded-2xl hover:bg-inox-orange transition-all uppercase text-xs tracking-widest group/btn"
                >
                  Join on Zwift
                  <ExternalLink size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </a>
              ) : (
                <button 
                  disabled
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-zinc-800 text-zinc-600 font-black italic rounded-2xl uppercase text-xs tracking-widest cursor-not-allowed"
                >
                  Link Pending
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="py-32 text-center">
          <Calendar size={64} className="text-zinc-800 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-zinc-700 uppercase italic">Nessun evento programmato</h3>
          <p className="text-zinc-800 font-bold uppercase text-xs mt-2">Torna a trovarci presto per nuovi aggiornamenti.</p>
        </div>
      )}
    </div>
  );
};

export default Events;
