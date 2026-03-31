import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { InoxEvent } from '../../services/types';
import { Plus, Edit2, Trash2, Save, X, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const CATEGORIES = ['Race', 'Recon', 'Social', 'Phenotypes Cup', 'MWT', 'Trilogy'];

const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<InoxEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<InoxEvent, 'id'>>({
    name: '',
    day_of_week: 'Lunedì',
    time: '18:30',
    description: '',
    zwift_link: '',
    category: 'Race',
    is_active: true
  });

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err: any) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEdit = (event: InoxEvent) => {
    setEditingId(event.id);
    setFormData({
      name: event.name,
      day_of_week: event.day_of_week,
      time: event.time,
      description: event.description || '',
      zwift_link: event.zwift_link || '',
      category: event.category || 'Race',
      is_active: event.is_active ?? true
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      day_of_week: 'Lunedì',
      time: '18:30',
      description: '',
      zwift_link: '',
      category: 'Race',
      is_active: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await api.updateEvent({ ...formData, id: editingId });
      } else {
        await api.createEvent(formData);
      }
      await fetchEvents();
      handleCancel();
    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo evento?')) return;
    
    try {
      await api.deleteEvent(id);
      await fetchEvents();
    } catch (err: any) {
      setError('Errore durante l\'eliminazione');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-inox-orange">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black italic uppercase tracking-widest">Loading Event Manager...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-800 pb-8">
        <div>
          <span className="text-inox-orange font-black text-xs tracking-[0.3em] uppercase italic">Admin Operations</span>
          <h1 className="text-6xl font-black italic tracking-tighter leading-none mt-2 text-white uppercase">
            EVENT <span className="text-zinc-600">MANAGER</span>
          </h1>
        </div>
      </header>

      {/* Form Section */}
      <section className="bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 p-8 shadow-2xl">
        <h2 className="text-2xl font-black italic text-white uppercase mb-8 flex items-center gap-3">
          {editingId ? <Edit2 className="text-inox-orange" /> : <Plus className="text-inox-orange" />}
          {editingId ? 'Edit Event' : 'Add New Event'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Event Name</label>
              <input 
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Es: Inox Masters Winter Tour"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white focus:border-inox-orange outline-none transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Day</label>
                <select 
                  value={formData.day_of_week}
                  onChange={e => setFormData({...formData, day_of_week: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white focus:border-inox-orange outline-none transition-all"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Time (CET)</label>
                <input 
                  type="text"
                  required
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  placeholder="19:30"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white focus:border-inox-orange outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white focus:border-inox-orange outline-none transition-all"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Zwift Link</label>
              <input 
                type="url"
                value={formData.zwift_link}
                onChange={e => setFormData({...formData, zwift_link: e.target.value})}
                placeholder="https://zwift.com/events/..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white focus:border-inox-orange outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Short Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Briefly describe the event format..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white focus:border-inox-orange outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            {editingId && (
              <button 
                type="button"
                onClick={handleCancel}
                className="px-8 py-4 rounded-2xl border border-zinc-800 text-zinc-500 font-black italic uppercase text-xs hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <X size={16} /> Cancel
              </button>
            )}
            <button 
              type="submit"
              disabled={saving}
              className="px-10 py-4 rounded-2xl bg-white text-black font-black italic uppercase text-xs hover:bg-inox-orange transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {editingId ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </section>

      {/* List Section */}
      <div className="grid grid-cols-1 gap-4">
        <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] ml-4 mb-2">Active Schedule</h2>
        {events.map((event) => (
          <div key={event.id} className="bg-zinc-900/30 border border-zinc-800 rounded-[1.5rem] p-6 flex flex-col md:flex-row justify-between items-center group hover:border-zinc-700 transition-all">
            <div className="flex items-center gap-6 mb-4 md:mb-0 w-full">
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-inox-orange">
                <span className="text-[8px] font-black uppercase leading-none">{event.day_of_week.substring(0, 3)}</span>
                <span className="text-sm font-black italic">{event.time}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-white uppercase italic truncate">{event.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase bg-zinc-800 px-2 py-0.5 rounded">{event.category}</span>
                  {event.zwift_link && <span className="text-[10px] text-inox-cyan flex items-center gap-1 font-black italic uppercase tracking-tighter"><ExternalLink size={10} /> Link OK</span>}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => handleEdit(event)}
                className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                title="Edit"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(event.id)}
                className="p-3 rounded-xl bg-zinc-800 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="p-12 border-2 border-dashed border-zinc-800 rounded-[2rem] text-center">
            <AlertCircle size={32} className="text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-700 font-black uppercase italic text-sm">No events found in schedule</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;
