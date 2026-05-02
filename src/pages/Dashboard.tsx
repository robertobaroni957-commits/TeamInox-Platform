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
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      
      {/* Header */}
      <header className="flex justify-between items-center gap-4 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#fc6719] rounded-full" />
          <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">
            {user?.role === 'guest' ? 'GUEST RIDER' : user?.username}
          </h1>
          <span className="text-zinc-600 font-bold text-[9px] uppercase tracking-widest ml-2 hidden sm:block">
            {loading ? 'SYNCING...' : 'OPERATIONAL'}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-lg border font-black text-[9px] uppercase tracking-wider flex items-center gap-2 ${
          user?.role === 'admin' ? 'border-red-500 text-red-500 bg-red-500/10' :
          'border-[#fc6719] text-[#fc6719] bg-[#fc6719]/10'
        }`}>
          <Shield size={10} />
          {user?.role}
        </div>
      </header>

      {/* Availability Alert */}
      {!hasAvailability && user?.role === 'user' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => navigate('/availability')}
          className="p-4 rounded-2xl bg-gradient-to-r from-[#fc6719] to-[#ff8c00] shadow-lg cursor-pointer group relative overflow-hidden"
        >
          <div className="relative z-10 flex items-center justify-between gap-4 text-black">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-xl text-[#fc6719]">
                <AlertCircle size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black italic uppercase tracking-tight leading-tight">Azione Richiesta</h2>
                <p className="text-[9px] font-bold opacity-80 uppercase tracking-tighter">Aggiorna la tua disponibilità ZRL</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-black text-white font-black italic rounded-lg hover:scale-105 transition-all uppercase text-[9px] tracking-widest">
              COMPILA
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ZRL Timeline Card */}
        <div 
          onClick={handleZRLClick}
          className="lg:col-span-2 p-6 rounded-[2rem] bg-[#0A0A0A] border border-zinc-800 hover:border-[#fc6719]/50 transition-all group relative overflow-hidden shadow-2xl flex flex-col justify-between cursor-pointer"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {(allRounds.length > 0 ? allRounds : Array(4).fill(null)).map((round, idx) => {
                const isPast = round ? new Date(round.date) < new Date() : false;
                const isNext = nextRound && round && round.id === nextRound.id;
                
                return (
                  <div 
                    key={round?.id || idx} 
                    className={`relative p-3 rounded-xl border transition-all ${
                      isNext 
                        ? 'bg-[#fc6719]/5 border-[#fc6719]/40 shadow-lg' 
                        : isPast 
                          ? 'bg-zinc-900/40 border-zinc-800/50 opacity-50' 
                          : 'bg-zinc-900/20 border-zinc-800/50'
                    }`}
                  >
                    <div className="mb-2">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className={`text-[8px] font-black uppercase tracking-widest ${isNext ? 'text-[#fc6719]' : 'text-zinc-600'}`}>
                          {round ? round.name : `R${idx + 1}`}
                        </p>
                        {round?.format && (
                           <span className={`text-[6px] px-1 py-0.5 rounded-sm font-black uppercase ${
                             round.format === 'TTT' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                             round.format === 'Points' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                             'bg-green-500/20 text-green-400 border border-green-500/30'
                           }`}>
                             {round.format}
                           </span>
                        )}
                      </div>
                      <p className="text-[9px] font-bold text-white uppercase tracking-tighter">
                        {round ? new Date(round.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : 'TBD'}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black italic uppercase truncate text-zinc-100 leading-tight">{round?.world || '---'}</p>
                      <p className="text-[8px] text-zinc-600 font-medium truncate italic uppercase tracking-tighter leading-tight">{round?.route || '---'}</p>
                      
                      {round?.distance && (
                        <div className="flex items-center gap-1.5 text-[7px] font-black text-zinc-700 uppercase tracking-widest mt-2 border-t border-zinc-800/50 pt-1.5">
                           <TrendingUp size={7} className="text-[#fc6719]" />
                           <span>{round.distance}K/{round.elevation}M</span>
                        </div>
                      )}
                    </div>

                    {isNext && (
                      <div className="mt-2 h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ x: "-100%" }}
                          animate={{ x: "0%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-full bg-[#fc6719] w-full" 
                        />
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
                  navigate(user?.role === 'admin' || user?.role === 'moderator' ? '/admin' : '/zrl-operations');
                }}
                className="px-5 py-2.5 bg-[#fc6719]/10 border border-[#fc6719]/30 text-[#fc6719] font-black italic rounded-xl hover:bg-[#fc6719]/20 transition-all uppercase text-[9px] tracking-widest"
              >
                {user?.role === 'admin' || user?.role === 'moderator' ? 'Command Center' : 'Gestione Operativa'}
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
          className="p-6 rounded-[2rem] bg-gradient-to-br from-[#0e0e0e] to-black border border-zinc-800 hover:border-[#fc6719]/40 transition-all group relative overflow-hidden shadow-2xl flex flex-col justify-between text-white cursor-pointer"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Calendar size={10} className="text-[#fc6719]" /> Weekly Hub
            </h3>
            <button 
              onClick={() => navigate('/events')}
              className="text-[8px] font-black text-[#fc6719] uppercase tracking-widest hover:underline"
            >
              All Events &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A] border border-zinc-900 hover:border-zinc-800 transition-all group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center">
                      <span className="text-[7px] font-black text-zinc-500 uppercase leading-none">{event.day_of_week.substring(0, 3)}</span>
                      <span className="text-[10px] font-black text-white leading-none mt-0.5">{event.time.split(':')[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white italic uppercase truncate">{event.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] font-bold text-[#fc6719] uppercase tracking-tighter">{event.category}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[8px] font-black text-zinc-600 uppercase italic">{event.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {event.zwift_link && (
                      <a href={event.zwift_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-[#fc6719] border border-zinc-800 transition-all">
                        <ArrowUpRight size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-zinc-900 text-center text-zinc-800 text-[9px] font-black uppercase tracking-widest italic">
                Syncing Live Events...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-zinc-900 flex flex-col justify-between">
            <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Trophy size={10} className="text-[#fc6719]" /> History
            </h3>
            <div className="space-y-1.5">
              {(allSeries || []).filter(s => !s.is_active).slice(0, 2).map(s => (
                <div key={s.id} className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/50 flex items-center justify-between group hover:border-[#fc6719]/30 cursor-pointer transition-all">
                  <h3 className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase truncate pr-4">{s.name}</h3>
                  <ChevronRight size={10} className="text-zinc-700" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-900 flex flex-col justify-between">
            <div>
              <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Wind size={10} className="text-[#fc6719]" /> Strava
              </h3>
              <p className="text-[8px] text-zinc-500 font-bold uppercase mb-3">Live Timing & Sync</p>
            </div>
            <button 
              onClick={() => {
                const clientId = "YOUR_STRAVA_CLIENT_ID"; 
                const redirectUri = `${window.location.origin}/strava-callback`;
                const scope = "read,activity:read_all";
                window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
              }}
              className="w-full py-2 bg-[#fc6719] text-black font-black italic rounded-lg hover:scale-[1.02] transition-all uppercase text-[8px] tracking-widest shadow-lg flex items-center justify-center gap-1.5"
            >
              Connect <ArrowUpRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
