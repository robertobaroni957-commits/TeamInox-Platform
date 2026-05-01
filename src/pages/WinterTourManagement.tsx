import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Trophy, Star, Shield, Layout, Settings, 
  Plus, Save, Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react';

interface PointConfig {
  position: number;
  points: number;
}

interface WinterSeries {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const WinterTourManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [seasons, setSeasons] = useState<WinterSeries[]>([]);
  const [activeSeason, setActiveSeason] = useState<WinterSeries | null>(null);
  const [points, setPoints] = useState<PointConfig[]>([]);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [newSeasonName, setNewSeasonName] = useState('Master Winter Tour 2026/27');

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/admin/winter-tour', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inox_token')}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setSeasons(data);
        const active = data.find(s => s.is_active);
        if (active) {
          setActiveSeason(active);
          fetchSeasonDetails(active.id);
        }
      }
    } catch (err) {
      console.error("Error fetching seasons:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/winter-tour?series_id=${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inox_token')}` }
      });
      const data = await response.json();
      setPoints(data.points || []);
    } catch (err) {
      console.error("Error fetching season details:", err);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  const handleCreateSeason = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/winter-tour', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}` 
        },
        body: JSON.stringify({
          action: 'create_series',
          payload: { name: newSeasonName, start_date: new Date().toISOString() }
        })
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Nuova stagione creata!' });
        fetchSeasons();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore durante la creazione.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePoints = async () => {
    if (!activeSeason) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/winter-tour', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}` 
        },
        body: JSON.stringify({
          action: 'update_points',
          payload: { series_id: activeSeason.id, point_map: points }
        })
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Sistema punti aggiornato!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore durante l\'aggiornamento.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-[#fc6719]" size={48} />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#fc6719] hover:border-[#fc6719]/40 transition-all group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Gestione <span className="text-[#fc6719]">Winter Tour</span></h1>
            <p className="text-zinc-500 font-medium italic text-xs mt-2 uppercase tracking-widest">Pannello di controllo Master Winter Tour</p>
          </div>
        </div>
        <div className="flex gap-3">
           <select 
             value={activeSeason?.id} 
             onChange={(e) => {
               const s = seasons.find(x => x.id === parseInt(e.target.value));
               if (s) {
                 setActiveSeason(s);
                 fetchSeasonDetails(s.id);
               }
             }}
             className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-black uppercase italic outline-none focus:border-[#fc6719]"
           >
             {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
           </select>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-bold uppercase text-[10px] tracking-widest">{message.text}</p>
        </div>
      )}

      {/* Grid di Gestione */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Configurazione Punti */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-[#fc6719]/10 rounded-lg text-[#fc6719]">
                   <Settings size={20} />
                </div>
                <h3 className="text-xl font-black italic uppercase">Regolamento Punteggi</h3>
             </div>
             <button 
               onClick={handleUpdatePoints}
               disabled={actionLoading}
               className="px-6 py-2.5 bg-[#fc6719] text-black font-black italic uppercase rounded-xl text-[10px] tracking-widest hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
             >
               {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salva Schema
             </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
             {(points.length > 0 ? points : Array.from({length: 15}, (_, i) => ({position: i+1, points: 0}))).map((p, idx) => (
               <div key={idx} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 group hover:border-[#fc6719]/30 transition-all">
                  <span className="block text-[8px] font-black text-zinc-600 uppercase mb-2">Posizione {p.position}</span>
                  <input 
                    type="number" 
                    value={p.points} 
                    onChange={(e) => {
                      const newPoints = [...points];
                      if (newPoints[idx]) newPoints[idx].points = parseInt(e.target.value) || 0;
                      else newPoints[idx] = { position: idx + 1, points: parseInt(e.target.value) || 0 };
                      setPoints(newPoints);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-center text-lg font-black italic outline-none focus:border-[#fc6719]" 
                  />
               </div>
             ))}
          </div>
        </div>

        {/* Nuova Stagione */}
        <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col justify-between">
           <div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-[#fc6719] mb-6">
                 <Plus size={24} />
              </div>
              <h3 className="text-xl font-black italic uppercase mb-2">Nuova Edizione</h3>
              <p className="text-zinc-500 text-sm italic mb-8">Archivia la stagione corrente e inizializza un nuovo Master Winter Tour.</p>
              
              <div className="space-y-4 mb-8">
                 <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-zinc-600 ml-2">Nome Competizione</label>
                    <input 
                      type="text" 
                      value={newSeasonName}
                      onChange={(e) => setNewSeasonName(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 font-bold text-white outline-none focus:border-[#fc6719]" 
                    />
                 </div>
              </div>
           </div>
           
           <button 
             onClick={handleCreateSeason}
             disabled={actionLoading}
             className="w-full py-4 bg-white text-black font-black italic rounded-2xl hover:bg-[#fc6719] hover:text-white transition-all uppercase text-xs tracking-[0.2em] shadow-lg flex items-center justify-center gap-3"
           >
             {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Trophy size={18} />} Inizializza Ora
           </button>
        </div>
      </div>

      {/* Sezione Tappe */}
      <div className="p-10 rounded-[3rem] bg-zinc-950 border border-zinc-900 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Layout size={14} className="text-[#fc6719]" /> Gestione Tappe <span className="text-white">{activeSeason?.name}</span>
          </h3>
          <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
             <Plus size={14} /> Aggiungi Tappa
          </button>
        </div>
        
        <div className="p-12 border-2 border-dashed border-zinc-900 rounded-[2rem] text-center">
          <p className="text-zinc-700 font-black italic uppercase tracking-tighter text-xl">Nessuna tappa configurata</p>
          <p className="text-zinc-800 text-xs mt-2 uppercase tracking-widest font-bold">Inizia aggiungendo la prima prova del campionato</p>
        </div>
      </div>
    </div>
  );
};

export default WinterTourManagement;

