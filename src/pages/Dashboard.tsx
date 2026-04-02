// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Series, InoxEvent, Round } from '../services/types';
import { 
  Layout, 
  Trophy, 
  Activity, 
  ArrowUpRight, 
  Zap, 
  Calendar, 
  Shield, 
  Flag, 
  MapPin, 
  Clock,
  ExternalLink,
  Star
} from 'lucide-react';

interface UserInfo {
  username: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [activeSeries, setActiveSeries] = useState<Series | null>(null);
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [nextRound, setNextRound] = useState<Round | null>(null);
  const [events, setEvents] = useState<InoxEvent[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [hasAvailability, setHasAvailability] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('inox_token');
    let userRole = 'guest';
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.username, role: payload.role });
        userRole = payload.role;
      } catch (e) {
        localStorage.removeItem('inox_token');
        setUser({ username: 'GUEST RIDER', role: 'guest' });
      }
    } else {
        setUser({ username: 'GUEST RIDER', role: 'guest' });
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Carichiamo le serie
        const seriesData = await api.getSeries();
        setAllSeries(seriesData);
        const zrlSeries = seriesData.find(s => s.is_active && s.name.toUpperCase().includes('ZRL')) || seriesData.find(s => s.is_active);
        setActiveSeries(zrlSeries || null);

        // 2. Se c'è una serie attiva, carichiamo il prossimo round
        if (zrlSeries) {
          try {
            const rounds = await api.getRounds(zrlSeries.id);
            const now = new Date();
            const next = (rounds || [])
              .filter(r => new Date(r.date) >= now)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
            setNextRound(next || (rounds ? rounds[rounds.length - 1] : null));
          } catch (err) {
            console.error('Rounds load error:', err);
          }
        }

        // 3. Carichiamo gli eventi settimanali
        try {
          const eventsData = await api.getEvents();
          setEvents((eventsData || []).slice(0, 4));
        } catch (err) {
          console.error('Events load error:', err);
        }

        // 4. Controllo disponibilità
        if (userRole !== 'admin' && userRole !== 'moderator' && userRole !== 'guest') {
          try {
            const availabilityData = await api.getUserAvailability();
            if (availabilityData && !availabilityData.error) {
              const hasPrefs = (availabilityData.preferences || []).length > 0;
              const hasRounds = (availabilityData.rounds || []).some((r: any) => r.status === 'available' || r.status === 'unavailable');
              setHasAvailability(hasPrefs || hasRounds);
            } else {
              setHasAvailability(false);
            }
          } catch (apiErr) {
            setHasAvailability(false);
          }
        } else {
          setHasAvailability(true);
        }

      } catch (err) {
        console.error('Dashboard Data Error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Helper per generare il link Zwift Insider dinamico
  const getZwiftInsiderLink = () => {
    if (!activeSeries || !nextRound) return "https://zwiftinsider.com/zrl-guide/";
    
    const season = activeSeries.external_season_id || 19;
    // Estraiamo il numero della settimana dal nome (es: "Week 4" o "Round 4" -> 4)
    const weekMatch = nextRound.name.match(/\d+/);
    const week = weekMatch ? weekMatch[0] : "1";
    
    return `https://zwiftinsider.com/zrl-r${season}-w${week}/`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">
            {user?.role === 'guest' ? 'BENVENUTO RIDER' : `BENTORNATO, ${user?.username}`}
          </h1>
          <p className="text-zinc-500 font-medium italic text-sm mt-1">
            Status Operativo: {loading ? 'Sincronizzazione...' : 'Sistemi Online'}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 ${
          user?.role === 'admin' ? 'border-red-500 text-red-500 bg-red-500/10' :
          user?.role === 'captain' ? 'border-[#fc6719] text-[#fc6719] bg-[#fc6719]/10' :
          'border-[#fc6719] text-[#fc6719] bg-[#fc6719]/10'
        }`}>
          <Shield size={14} />
          {user?.role} Level Access
        </div>
      </header>

      {/* Availability Alert */}
      {!hasAvailability && user?.role === 'user' && (
        <div className="p-8 rounded-[2rem] bg-gradient-to-r from-[#fc6719] to-[#ff8c00] shadow-[0_0_50px_rgba(252,103,25,0.3)] animate-pulse relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Zap size={120} className="text-white rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-black font-black text-center md:text-left">
            <div>
              <h2 className="text-3xl italic uppercase tracking-tighter leading-none">ATTENZIONE RIDER!</h2>
              <p className="italic text-sm opacity-90 mt-1 uppercase tracking-tight">Il tuo profilo disponibilità è vuoto. Compila il form ora!</p>
            </div>
            <a href="/availability" className="px-10 py-4 bg-black text-white italic rounded-2xl hover:scale-105 transition-all uppercase text-xs tracking-[0.2em] shadow-2xl">
              COMPILA ORA
            </a>
          </div>
        </div>
      )}

      {/* Main Strategic Area */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Next Race Briefing Card (ZRL) */}
        <div className="lg:col-span-2 p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900 to-black border-2 border-zinc-800 hover:border-[#fc6719]/40 transition-all group relative overflow-hidden shadow-2xl min-h-[400px] flex flex-col justify-between text-white">
          <Flag size={250} className="absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div className="px-4 py-1.5 rounded-full bg-[#fc6719]/10 border border-[#fc6719]/30 text-[#fc6719] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-[#fc6719] rounded-full animate-ping" />
                Active Competition: {activeSeries?.name || 'ZRL Spring 2026'}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-[#fc6719]">
                <Activity size={24} />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em]">Prossima Gara Ufficiale</h2>
              <h3 className="text-6xl font-black italic text-white tracking-tighter leading-none uppercase">
                {nextRound?.name || 'In attesa del prossimo round...'}
              </h3>
            </div>

            {nextRound && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-zinc-800 text-[#fc6719]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">World / Route</p>
                    <p className="text-sm font-bold text-white uppercase italic">{nextRound.world} / {nextRound.route}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-zinc-800 text-[#fc6719]">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Date</p>
                    <p className="text-sm font-bold text-white uppercase italic">{new Date(nextRound.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-zinc-800 text-[#fc6719]">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Race Time</p>
                    <p className="text-sm font-bold text-white uppercase italic">20:00 CET</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 flex flex-wrap gap-4 mt-12">
            <a 
              href="https://zwiftinsider.com/zrl-guide/" 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-4 bg-white text-black font-black italic rounded-2xl hover:bg-[#fc6719] transition-all uppercase text-xs tracking-widest shadow-xl flex items-center gap-2"
            >
              Info Percorso <ExternalLink size={14} />
            </a>
            <a href="/racing" className="px-8 py-4 bg-zinc-800 text-zinc-300 font-black italic rounded-2xl hover:bg-zinc-700 transition-all uppercase text-xs tracking-widest border border-zinc-700">
              Classifica Team
            </a>
            {(user?.role === 'captain' || user?.role === 'admin') && (
              <a href="/roster" className="px-8 py-4 bg-[#fc6719]/10 border border-[#fc6719]/30 text-[#fc6719] font-black italic rounded-2xl hover:bg-[#fc6719]/20 transition-all uppercase text-xs tracking-widest">
                Gestione Roster
              </a>
            )}
          </div>
        </div>

        {/* Master Winter Tour Reminder Card */}
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900/50 to-black border-2 border-zinc-800 hover:border-[#fc6719]/40 transition-all group relative overflow-hidden shadow-2xl min-h-[400px] flex flex-col justify-between text-white">
          <Trophy size={200} className="absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity -rotate-12" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div className="px-4 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Season Reminder
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-[#fc6719]">
                <Star size={24} />
              </div>
            </div>
            <h2 className="text-5xl font-black italic text-white tracking-tighter leading-tight mb-4 uppercase">
              MASTER <span className="text-[#fc6719]">WINTER TOUR</span>
            </h2>
            <p className="text-zinc-500 text-lg font-medium italic mb-8">
              La nostra arena invernale tornerà presto. Preparati per la prossima stagione.
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-3">
            <a href="/ranking" className="w-full px-8 py-4 bg-white text-black font-black italic rounded-2xl hover:bg-[#fc6719] transition-all uppercase text-xs tracking-widest shadow-xl text-center">
              Hall of Fame
            </a>
            <button className="w-full px-8 py-4 bg-zinc-800 text-zinc-500 font-black italic rounded-2xl uppercase text-[10px] tracking-widest border border-zinc-700 cursor-not-allowed text-center">
              Coming Back: Winter 2026
            </button>
          </div>
        </div>
      </section>

      {/* Weekly Schedule Hub & Archivio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Calendar size={14} className="text-[#fc6719]" /> Weekly Schedule Hub
            </h3>
            <a href="/events" className="text-[10px] font-black text-[#fc6719] uppercase tracking-widest hover:underline transition-all">
              Full Calendar &rarr;
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="p-6 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all group flex flex-col justify-between h-full shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-[9px] font-black text-[#fc6719] uppercase tracking-widest mb-1">{event.day_of_week}</h4>
                      <p className="text-lg font-bold text-white italic leading-tight uppercase truncate max-w-[180px]">{event.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter block font-mono">{event.time}</span>
                      <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{event.category || 'All Cat'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Zap size={12} className={event.zwift_link ? 'text-[#fc6719]' : ''} />
                      <span className="text-[9px] font-black uppercase tracking-tight text-white">Status: Ready</span>
                    </div>
                    {event.zwift_link ? (
                      <a href={event.zwift_link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-zinc-800 hover:bg-[#fc6719] text-zinc-300 hover:text-black font-black text-[9px] uppercase tracking-widest rounded-lg transition-all flex items-center gap-2">
                        Join Event <ArrowUpRight size={10} />
                      </a>
                    ) : (
                      <span className="text-[9px] font-black text-zinc-700 uppercase italic">TBD</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-12 rounded-[3rem] border border-dashed border-zinc-800 text-center text-zinc-600 font-bold uppercase text-[10px] tracking-[0.3em]">
                Sincronizzazione Eventi...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Historical & Links */}
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-[#1a1d20] border border-zinc-800 shadow-2xl h-fit">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Trophy size={14} className="text-[#fc6719]" /> Seasons Archive
            </h3>
            <div className="space-y-3">
              {(allSeries || []).filter(s => !s.is_active).map(s => (
                <div key={s.id} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between group hover:border-[#fc6719]/30 transition-all cursor-pointer text-white">
                  <div>
                    <h3 className="text-sm font-bold italic uppercase">{s.name}</h3>
                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{s.total_rounds || 0} Rounds</p>
                  </div>
                  <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-[#fc6719] transition-all" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-gradient-to-b from-[#fc6719]/5 to-transparent border border-zinc-800 h-fit">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Official Hubs</h3>
            <ul className="space-y-4">
              <li><a href="https://www.teaminox.it" target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-[#fc6719] transition-colors flex items-center gap-2 font-bold uppercase tracking-wide">/ Inoxteam Website</a></li>
              <li><a href="https://www.wtrl.racing/zwift-racing-league/" target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-[#fc6719] transition-colors flex items-center gap-2 font-bold uppercase tracking-wide">/ WTRL ZRL Portal</a></li>
              <li><a href="https://discord.gg/cpr3rBGaZy" target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-[#fc6719] transition-colors flex items-center gap-2 font-bold uppercase tracking-wide">/ Discord Community</a></li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
