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
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Wind
} from 'lucide-react';
import { motion } from 'framer-motion';

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
        const seriesData = await api.getSeries();
        setAllSeries(seriesData);
        const zrlSeries = seriesData.find(s => s.is_active && s.name.toUpperCase().includes('ZRL')) || seriesData.find(s => s.is_active);
        setActiveSeries(zrlSeries || null);

        if (zrlSeries) {
          try {
            const rounds = await api.getRounds(zrlSeries.id);
            const sorted = (rounds || []).sort((a, b) => 
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

        try {
          const eventsData = await api.getEvents();
          setEvents((eventsData || []).slice(0, 4));
        } catch (err) {
          console.error('Events load error:', err);
        }

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

  const handleZRLClick = () => {
    if (user?.role === 'admin' || user?.role === 'captain' || user?.role === 'moderator') {
      navigate('/zrl-operations');
    } else {
      navigate('/racing');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-[#fc6719] rounded-full" />
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">
              {user?.role === 'guest' ? 'GUEST RIDER' : user?.username}
            </h1>
          </div>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest ml-5">
            {loading ? 'Sincronizzazione Sistemi...' : 'Operational Status: Online'}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 ${
          user?.role === 'admin' ? 'border-red-500 text-red-500 bg-red-500/10' :
          'border-[#fc6719] text-[#fc6719] bg-[#fc6719]/10'
        }`}>
          <Shield size={12} />
          {user?.role} ACCESS
        </div>
      </header>

      {/* Availability Alert */}
      {!hasAvailability && user?.role === 'user' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => navigate('/availability')}
          className="p-6 rounded-3xl bg-gradient-to-r from-[#fc6719] to-[#ff8c00] shadow-xl cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12 group-hover:scale-110 transition-transform">
            <Zap size={140} className="text-white" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-black">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black rounded-2xl text-[#fc6719]">
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tight leading-tight">Profilo Incompleto</h2>
                <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">Aggiorna la tua disponibilità per le prossime gare</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-black text-white font-black italic rounded-xl hover:scale-105 transition-all uppercase text-[10px] tracking-widest shadow-2xl">
              COMPILA ORA
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ZRL Timeline Card */}
        <div 
          onClick={handleZRLClick}
          className="lg:col-span-2 p-8 rounded-[2.5rem] bg-[#0A0A0A] border border-zinc-800 hover:border-[#fc6719]/50 transition-all group relative overflow-hidden shadow-2xl flex flex-col justify-between cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <Flag size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#fc6719] mb-1 block">
                  {activeSeries?.name || 'Zwift Racing League'}
                </span>
                <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-none">
                  Season <span className="text-[#fc6719]">Timeline</span>
                </h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#fc6719] group-hover:bg-[#fc6719] group-hover:text-black transition-all">
                <Trophy size={20} />
              </div>
            </div>

            {/* Timeline Rounds */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              {(allRounds.length > 0 ? allRounds : Array(4).fill(null)).map((round, idx) => {
                const isPast = round ? new Date(round.date) < new Date() : false;
                const isNext = nextRound && round && round.id === nextRound.id;
                
                return (
                  <div 
                    key={round?.id || idx} 
                    className={`relative p-5 rounded-2xl border transition-all ${
                      isNext 
                        ? 'bg-[#fc6719]/5 border-[#fc6719]/50 shadow-[0_0_20px_rgba(252,103,25,0.1)]' 
                        : isPast 
                          ? 'bg-zinc-900/40 border-zinc-800 opacity-40' 
                          : 'bg-zinc-900/20 border-zinc-800'
                    }`}
                  >
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-[9px] font-black uppercase tracking-widest ${isNext ? 'text-[#fc6719]' : 'text-zinc-500'}`}>
                          {round ? round.name : `Round ${idx + 1}`}
                        </p>
                        {round?.format && (
                           <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase ${
                             round.format === 'TTT' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                             round.format === 'Points' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                             'bg-green-500/20 text-green-400 border border-green-500/30'
                           }`}>
                             {round.format}
                           </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-tighter">
                        {round ? new Date(round.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : 'TBD'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-black italic uppercase truncate text-zinc-100 leading-none">{round?.world || '---'}</p>
                      <p className="text-[9px] text-zinc-500 font-medium truncate italic uppercase tracking-tighter mb-2">{round?.route || '---'}</p>
                      
                      {round?.distance && (
                        <div className="flex items-center gap-2 text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-2 border-t border-zinc-800 pt-2">
                           <TrendingUp size={8} className="text-[#fc6719]" />
                           <span>{round.distance}km / {round.elevation}m</span>
                        </div>
                      )}
                    </div>

                    {isNext && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-0.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-full bg-[#fc6719] w-full" 
                          />
                        </div>
                        <span className="text-[7px] font-black text-[#fc6719] uppercase tracking-tighter">ACTIVE</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 mt-8 pt-6 border-t border-zinc-900">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.open("https://www.wtrl.racing/zwift-racing-league/#schedule", "_blank");
              }}
              className="px-5 py-2.5 bg-zinc-950 text-zinc-500 font-bold border border-zinc-800 rounded-xl hover:bg-[#fc6719] hover:text-black hover:border-[#fc6719] transition-all uppercase text-[9px] tracking-widest flex items-center gap-2"
            >
              WTRL Schedule <ExternalLink size={10} />
            </button>
            {(user?.role === 'captain' || user?.role === 'admin' || user?.role === 'moderator') && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/zrl-operations');
                }}
                className="px-5 py-2.5 bg-[#fc6719]/10 border border-[#fc6719]/30 text-[#fc6719] font-black italic rounded-xl hover:bg-[#fc6719]/20 transition-all uppercase text-[9px] tracking-widest"
              >
                Gestione Operativa
              </button>
            )}
          </div>
        </div>

        {/* Master Winter Tour Card */}
        <div 
          onClick={() => {
            if (user?.role === 'admin' || user?.role === 'moderator') {
              navigate('/winter-tour-management');
            } else {
              navigate('/ranking');
            }
          }}
          className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#0e0e0e] to-black border border-zinc-800 hover:border-[#fc6719]/40 transition-all group relative overflow-hidden shadow-2xl flex flex-col justify-between text-white cursor-pointer"
        >
          <div className="absolute -right-10 -top-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12">
            <Trophy size={180} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600 text-[8px] font-black uppercase tracking-widest">
                Internal League
              </span>
              <Star size={18} className="text-[#fc6719]" />
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter leading-tight mb-2 uppercase">
              MASTER <span className="text-[#fc6719]">WINTER TOUR</span>
            </h2>
            <p className="text-zinc-500 text-sm font-medium italic">
              {user?.role === 'admin' || user?.role === 'moderator' ? 'Dashboard di Gestione' : 'La gloria invernale ti aspetta.'}
            </p>
          </div>
          <div className="relative z-10 space-y-2 mt-8">
            <button className="w-full px-6 py-3 bg-white text-black font-black italic rounded-xl hover:bg-[#fc6719] hover:text-white transition-all uppercase text-[10px] tracking-widest shadow-lg">
              Classifiche & Risultati
            </button>
          </div>
        </div>
      </section>

      {/* Events Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Calendar size={12} className="text-[#fc6719]" /> Weekly Schedule
            </h3>
            <button 
              onClick={() => navigate('/events')}
              className="text-[9px] font-black text-[#fc6719] uppercase tracking-widest hover:underline"
            >
              Vedi tutto &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="p-5 rounded-3xl bg-[#0A0A0A] border border-zinc-900 hover:border-zinc-800 transition-all group flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">{event.day_of_week}</h4>
                      <p className="text-base font-bold text-white italic leading-tight uppercase truncate">{event.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-black text-white block">{event.time}</span>
                      <span className="text-[8px] font-bold text-[#fc6719] uppercase">{event.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-900/50">
                    <span className="text-[9px] font-black uppercase text-zinc-700">Status: Active</span>
                    {event.zwift_link ? (
                      <a href={event.zwift_link} target="_blank" rel="noopener noreferrer" className="text-[#fc6719] hover:text-white transition-colors">
                        <ArrowUpRight size={14} />
                      </a>
                    ) : (
                      <span className="text-[9px] font-bold text-zinc-900 uppercase italic">TBD</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 rounded-3xl border border-dashed border-zinc-800 text-center text-zinc-700 text-[10px] font-black uppercase tracking-widest italic">
                Sincronizzazione Eventi Hub...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-zinc-800 shadow-xl">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Trophy size={12} className="text-[#fc6719]" /> Archivio Stagioni
            </h3>
            <div className="space-y-2">
              {(allSeries || []).filter(s => !s.is_active).slice(0, 3).map(s => (
                <div key={s.id} className="p-3 rounded-xl bg-zinc-900/20 border border-zinc-900 flex items-center justify-between group hover:border-zinc-700 cursor-pointer">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase">{s.name}</h3>
                  </div>
                  <ChevronRight size={12} className="text-zinc-700" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#fc6719]/5 to-transparent border border-zinc-900">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Official Links</h3>
            <ul className="space-y-3">
              <li><a href="https://www.teaminox.it" target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 hover:text-[#fc6719] font-bold uppercase tracking-wide flex items-center gap-2 transition-colors italic">/ Website</a></li>
              <li><a href="https://discord.gg/cpr3rBGaZy" target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 hover:text-[#fc6719] font-bold uppercase tracking-wide flex items-center gap-2 transition-colors italic">/ Discord Community</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
