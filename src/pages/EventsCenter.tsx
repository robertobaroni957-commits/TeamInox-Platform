import React, { useMemo, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { InoxEvent } from '../services/types';
import { Calendar, Clock, ExternalLink, Loader2, Plus, Edit2, Trash2, X, Users, Radio } from 'lucide-react';
import { getPermissionsByRole } from '../services/permissions';

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const CATEGORIES = ['Race', 'Recon', 'Social', 'Phenotypes Cup', 'MWT', 'Trilogy'];

const categoryBadgeClass: Record<string, string> = {
  Race: 'bg-red-500/10 text-red-300 border-red-500/20',
  Recon: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  Social: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Trilogy: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  MWT: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  'Phenotypes Cup': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
};

const EventsCenter: React.FC = () => {
  const [canManage, setCanManage] = useState(false);
  const [events, setEvents] = useState<InoxEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Admin CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<InoxEvent, 'id'>>({
    name: '', day_of_week: 'Lunedì', time: '18:30', description: '', zwift_link: '', strava_segment_id: '', category: 'Race', is_active: true
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Setup Permissions
    const token = localStorage.getItem('inox_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const permissions = getPermissionsByRole(payload.role);
        setCanManage(permissions.includes("events.manage"));
      } catch (e) {
        console.error("Token invalid", e);
      }
    }
    fetchEvents();
  }, []);

  const openModal = (event?: InoxEvent) => {
    if (event) {
      setEditingId(event.id);
      setFormData({
        name: event.name, day_of_week: event.day_of_week, time: event.time, description: event.description || '',
        zwift_link: event.zwift_link || '', strava_segment_id: event.strava_segment_id || '', category: event.category || 'Race', is_active: event.is_active ?? true
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', day_of_week: 'Lunedì', time: '18:30', description: '', zwift_link: '', strava_segment_id: '', category: 'Race', is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) await api.updateEvent({ ...formData, id: editingId });
      else await api.createEvent(formData);
      await fetchEvents();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo evento?')) return;
    try {
      await api.deleteEvent(id);
      fetchEvents();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const filteredEvents = selectedDay ? events.filter(e => e.day_of_week === selectedDay) : events;
  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce<Record<string, InoxEvent[]>>((accumulator, event) => {
      const groupKey = event.date_label || event.day_of_week || 'Altri eventi';
      if (!accumulator[groupKey]) {
        accumulator[groupKey] = [];
      }
      accumulator[groupKey].push(event);
      return accumulator;
    }, {});
  }, [filteredEvents]);

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
          <span className="text-inox-orange font-black text-xs tracking-[0.3em] uppercase italic">
            {canManage ? 'Admin Management' : 'Official Schedule'}
          </span>
          <h1 className="text-6xl font-black italic tracking-tighter leading-none mt-2 text-white uppercase">
            WEEKLY <span className="text-zinc-600">EVENTS</span>
          </h1>
          <p className="mt-4 text-sm text-zinc-500 max-w-3xl">
            Gli eventi con tag <span className="text-inox-orange font-black">#inox</span> vengono recuperati automaticamente da Zwift e combinati con gli eventuali eventi manuali interni.
          </p>
        </div>
        {canManage && (
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-inox-orange text-black px-6 py-3 rounded-xl font-black uppercase italic text-xs tracking-widest hover:bg-white transition-all">
            <Plus size={16} /> Create Event
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-[10px] uppercase tracking-[0.25em] font-black text-zinc-500">Eventi caricati</div>
          <div className="mt-2 text-4xl font-black italic text-white">{events.length}</div>
        </div>
        <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-[10px] uppercase tracking-[0.25em] font-black text-zinc-500">Sorgente Zwift</div>
          <div className="mt-2 text-4xl font-black italic text-white">{events.filter(event => event.source === 'zwift').length}</div>
        </div>
        <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-[10px] uppercase tracking-[0.25em] font-black text-zinc-500">Sorgente manuale</div>
          <div className="mt-2 text-4xl font-black italic text-white">{events.filter(event => event.source !== 'zwift').length}</div>
        </div>
      </div>

      {/* Filter & Grid (User UI maintained) */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSelectedDay(null)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedDay === null ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>All Days</button>
        {DAYS.map(day => (
          <button key={day} onClick={() => setSelectedDay(day)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedDay === day ? 'bg-inox-orange text-black' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>{day}</button>
        ))}
      </div>

      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([groupLabel, groupItems]) => (
          <section key={groupLabel} className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div>
                <h2 className="text-2xl font-black italic uppercase text-white">{groupLabel}</h2>
                <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 font-black">{groupItems.length} eventi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupItems.map((event) => (
                <div key={`${event.source || 'manual'}-${event.id}`} className="group bg-zinc-900/40 rounded-[2rem] border border-zinc-800 overflow-hidden hover:border-inox-orange/50 transition-all flex flex-col shadow-xl">
                  {event.image_url ? (
                    <div className="h-40 overflow-hidden border-b border-zinc-800">
                      <img src={event.image_url} alt={event.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                  ) : null}
                  <div className="p-8 flex-1">
                    <div className="flex justify-between items-start mb-6 gap-3">
                      <div>
                        <span className="text-inox-orange font-black text-[10px] uppercase flex items-center gap-2"><Calendar size={12} /> {event.day_of_week}</span>
                        <span className="text-white font-black text-xs uppercase flex items-center gap-2 mt-1"><Clock size={12} /> {event.time} CET</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${categoryBadgeClass[event.category || 'Race'] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                          {event.category || 'Race'}
                        </span>
                        {canManage && event.source !== 'zwift' && (
                          <div className="flex gap-2">
                            <button onClick={() => openModal(event)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(event.id)} className="p-2 bg-red-500/10 rounded-lg text-red-500"><Trash2 size={14} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-2xl font-black italic text-white uppercase mb-3">{event.name}</h3>
                    <p className="text-zinc-500 text-sm italic whitespace-pre-line line-clamp-6">{event.description || 'Nessuna descrizione.'}</p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {event.source === 'zwift' ? 'Zwift Auto' : 'Manual'}
                      </span>
                      {event.sport ? (
                        <span className="px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          <Radio size={11} className="inline mr-1" /> {event.sport}
                        </span>
                      ) : null}
                      {typeof event.total_signed_up === 'number' ? (
                        <span className="px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          <Users size={11} className="inline mr-1" /> {event.total_signed_up} signed
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="p-6 bg-zinc-950/50 border-t border-zinc-800">
                    {event.zwift_link ? (
                      <a href={event.zwift_link} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-black italic rounded-2xl hover:bg-inox-orange transition-all uppercase text-xs">Join on Zwift <ExternalLink size={16} /></a>
                    ) : (
                      <button disabled className="w-full px-6 py-4 bg-zinc-800 text-zinc-600 rounded-2xl uppercase text-xs cursor-not-allowed">Link Pending</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] max-w-lg w-full">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-black text-white">{editingId ? 'Edit Event' : 'Create Event'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}><X className="text-zinc-500" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 p-3 rounded-lg text-white" required />
              <select value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: e.target.value})} className="w-full bg-zinc-950 p-3 rounded-lg text-white">
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="text" placeholder="Time (e.g. 18:30)" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-zinc-950 p-3 rounded-lg text-white" />
              <button disabled={saving} className="w-full bg-inox-orange p-3 rounded-lg text-black font-bold uppercase">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EventsCenter;
