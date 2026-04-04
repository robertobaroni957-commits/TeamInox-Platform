// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Series, InoxEvent, Round } from '../services/types';
import { 
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
  Star,
  ChevronRight
} from 'lucide-react';

interface UserInfo {
  username: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSeries, setActiveSeries] = useState<Series | null>(null);
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [nextRound, setNextRound] = useState<Round | null>(null);
  const [events, setEvents] = useState<InoxEvent[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [hasAvailability, setHasAvailability] = useState<boolean>(true);
  const [allRounds, setAllRounds] = useState<Round[]>([]);
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

        // 2. Carichiamo tutti i round della serie
        if (zrlSeries) {
          try {
            const rounds = await api.getRounds(zrlSeries.id);
            
            // Filtro anti-duplicati rigoroso nel frontend:
            // Usiamo una Map per tenere solo l'ID più alto per ogni nome di round
            const uniqueRoundsMap = new Map();
            (rounds || []).forEach(r => {
              const existing = uniqueRoundsMap.get(r.name);
              if (!existing || r.id > existing.id) {
                uniqueRoundsMap.set(r.name, r);
              }
            });

            const sorted = Array.from(uniqueRoundsMap.values()).sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            
            setAllRounds(sorted);
            
            const now = new Date();
            const next = sorted.find(r => new Date(r.date) >= now);
            setNextRound(next || sorted[sorted.length - 1] || null);
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
        <div 
          onClick={() => navigate('/availability')}
          className="p-8 rounded-[2rem] bg-gradient-to-r from-[#fc6719] to-[#ff8c00] shadow-[0_0_50px_rgba(252,103,25,0.3)] animate-pulse relative overflow-hidden group cursor-pointer"
          aria-label="Avviso disponibilità mancante. Clicca per compilare."
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
            <Zap size={120} className="text-white rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-black font-black text-center md:text-left">
            <div>
              <h2 className="text-3xl italic uppercase tracking-tighter leading-none">ATTENZIONE RIDER!</h2>
              <p className="italic text-sm opacity-90 mt-1 uppercase tracking-tight">Il tuo profilo disponibilità è vuoto. Compila il form ora!</p>
            </div>
            <button className="px-10 py-4 bg-black text-white italic rounded-2xl hover:scale-105 transition-all uppercase text-xs tracking-[0.2em] shadow-2xl">
              COMPILA ORA
            </button>
          </div>
        </div>
      )}

      {/* Main Strategic Area */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ZRL Season Timeline Card */}
        <div 
          onClick={() => {
            if (user?.role === 'admin' || user?.role === 'captain') {
              navigate('/zrl-management');
            } else {
              navigate('/racing');
            }
          }}
          className="lg:col-span-2 p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900 to-black border-2 border-zinc-800 hover:border-[#fc6719]/40 transition-all group relative overflow-hidden shadow-2xl min-h-[450px] flex flex-col justify-between text-white cursor-pointer"
          role="button"
          aria-label="Calendario ZRL. Clicca per i dettagli o la gestione."
        >
          <Flag size={250} className="absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12" />
          
          <div className="relative z-10 w-full">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="px-4 py-1.5 rounded-full bg-[#fc6719]/10 border border-[#fc6719]/30 text-[#fc6719] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-2 w-fit">
                  <div className="w-2 h-2 bg-[#fc6719] rounded-full animate-ping" />
                  {activeSeries?.name || 'ZRL Season 19'}
                </div>
                <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-none">
                  Season <span className="text-[#fc6719]">Timeline</span>
                </h2>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-[#fc6719] group-hover:scale-110 transition-transform">
                <Trophy size={24} />
              </div>
            </div>

            {/* Timeline Rounds */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-10">
              {(allRounds.length > 0 ? allRounds : Array(4).fill(null)).map((round, idx) => {
                const isPast = round ? new Date(round.date) < new Date() : false;
                const isNext = nextRound && round && round.id === nextRound.id;
                
                return (
                  <div 
                    key={round?.id || idx} 
                    className={`relative p-5 rounded-2xl border transition-all ${
                      isNext 
                        ? 'bg-[#fc6719]/10 border-[#fc6719] shadow-[0_0_20px_rgba(252,103,25,0.2)]' 
                        : isPast 
                          ? 'bg-zinc-900/40 border-zinc-800 opacity-60' 
                          : 'bg-zinc-900/20 border-zinc-800'
                    }`}
                  >
                    {isPast && (
                      <div className="absolute top-3 right-3 text-[#fc6719]">
                        <Shield size={14} fill="currentColor" fillOpacity={0.2} />
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isNext ? 'text-[#fc6719]' : 'text-zinc-500'}`}>
                        {round ? round.name : `Round ${idx + 1}`}
                      </p>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase">
                        {round ? new Date(round.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : 'TBD'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-black italic uppercase truncate">{round?.world || '---'}</p>
                      <p className="text-[10px] text-zinc-500 font-medium truncate italic">{round?.route || '---'}</p>
                    </div>

                    {isNext && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#fc6719] w-full animate-pulse" />
                        </div>
                        <span className="text-[8px] font-black text-[#fc6719] uppercase tracking-tighter">UPCOMING</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-4 mt-10">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.open("https://www.wtrl.racing/zwift-racing-league/#schedule", "_blank");
              }}
              className="px-6 py-3 bg-white text-black font-black italic rounded-xl hover:bg-[#fc6719] hover:text-white transition-all uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2"
            >
              WTRL Schedule <ExternalLink size={12} />
            </button>
            {(user?.role === 'captain' || user?.role === 'admin') && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/zrl-management');
                }}
                className="px-6 py-3 bg-[#fc6719]/10 border border-[#fc6719]/30 text-[#fc6719] font-black italic rounded-xl hover:bg-[#fc6719]/20 transition-all uppercase text-[10px] tracking-widest"
              >
                Gestione Roster
              </button>
            )}
          </div>
        </div>

        {/* Master Winter Tour Reminder Card */}
        <div 
          onClick={() => {
            if (user?.role === 'admin' || user?.role === 'moderator') {
              navigate('/winter-tour-management');
            } else {
              navigate('/ranking');
            }
          }}
          className="p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900/50 to-black border-2 border-zinc-800 hover:border-[#fc6719]/40 transition-all group relative overflow-hidden shadow-2xl min-h-[400px] flex flex-col justify-between text-white cursor-pointer"
          role="button"
          aria-label="Master Winter Tour. Clicca per vedere le classifiche o gestire la stagione."
        >
          <Trophy size={200} className="absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity -rotate-12" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div className="px-4 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Season Reminder
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-[#fc6719] group-hover:scale-110 transition-transform">
                <Star size={24} />
              </div>
            </div>
            <h2 className="text-5xl font-black italic text-white tracking-tighter leading-tight mb-4 uppercase group-hover:text-[#fc6719] transition-colors">
              MASTER <span className="text-[#fc6719]">WINTER TOUR</span>
            </h2>
            <p className="text-zinc-500 text-lg font-medium italic mb-8">
              {user?.role === 'admin' || user?.role === 'moderator' ? 'Pannello di Gestione Stagione' : 'La nostra arena invernale tornerà presto. Preparati per la prossima stagione.'}
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate('/ranking');
              }}
              className="w-full px-8 py-4 bg-white text-black font-black italic rounded-2xl hover:bg-[#fc6719] hover:text-white transition-all uppercase text-xs tracking-widest shadow-xl text-center"
            >
              Hall of Fame
            </button>
            {(user?.role === 'admin' || user?.role === 'moderator') && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/winter-tour-management');
                }}
                className="w-full px-8 py-4 bg-zinc-800 text-[#fc6719] font-black italic rounded-2xl hover:bg-zinc-700 transition-all uppercase text-[10px] tracking-widest border border-[#fc6719]/20 text-center"
              >
                Gestione Stagione
              </button>
            )}
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
            <button 
              onClick={() => navigate('/events')}
              className="text-[10px] font-black text-[#fc6719] uppercase tracking-widest hover:underline transition-all"
            >
              Full Calendar &rarr;
            </button>
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
