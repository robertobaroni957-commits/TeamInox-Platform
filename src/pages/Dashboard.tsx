// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Series } from '../services/types';
import { Layout, Users, Trophy, Activity, ArrowUpRight, Zap, Calendar, Shield, Flag, Star } from 'lucide-react';

interface UserInfo {
  username: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [activeSeries, setActiveSeries] = useState<Series | null>(null);
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [hasAvailability, setHasAvailability] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('inox_token');
    let userRole = '';
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.username, role: payload.role });
        userRole = payload.role;
      } catch (e) {
        console.error('Invalid token format');
        localStorage.removeItem('inox_token');
        return;
      }
    }

    const loadData = async () => {
      try {
        // Carichiamo le serie (comune a tutti)
        const seriesData = await api.getSeries();
        setAllSeries(seriesData);
        setActiveSeries(seriesData.find(s => s.is_active && s.name.toUpperCase().includes('ZRL')) || seriesData.find(s => s.is_active) || null);

        // Se l'utente è ADMIN, saltiamo il controllo disponibilità e usciamo
        if (userRole === 'admin') {
          setHasAvailability(true);
          return;
        }

        // Carichiamo la disponibilità solo per i Rider (Athlete/Captain)
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
          console.error('Availability API Error:', apiErr);
          setHasAvailability(false);
        }

      } catch (err) {
        console.error('Dashboard Data Error:', err);
        // In caso di errore critico, se admin non blocchiamo la dashboard
        setHasAvailability(userRole === 'admin');
      }
    };
    loadData();
  }, []);

  const stats = [
    { label: 'Atleti Attivi', value: '124', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Gare Completate', value: '42', icon: Trophy, color: 'text-[#fc6719]', bg: 'bg-[#fc6719]/10' },
    { label: 'Team ZRL', value: '18', icon: Layout, color: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]/10' },
    { label: 'Live Sessions', value: '3', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
            BENTORNATO, <span className="text-inox-orange">{user?.username || 'Rider'}</span>
          </h1>
          <p className="text-zinc-500 font-medium italic text-sm mt-1">Status Operativo: Ottimale. Controllo dei sistemi in corso...</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 ${
          user?.role === 'admin' ? 'border-red-500 text-red-500 bg-red-500/10' :
          user?.role === 'captain' ? 'border-inox-orange text-inox-orange bg-inox-orange/10' :
          'border-inox-cyan text-inox-cyan bg-inox-cyan/10'
        }`}>
          <Shield size={14} />
          {user?.role} Level Access
        </div>
      </header>

      {/* MISSING AVAILABILITY ALERT */}
      {!hasAvailability && user?.role !== 'admin' && (
        <div className="p-8 rounded-[2rem] bg-gradient-to-r from-inox-orange to-red-600 shadow-[0_0_50px_rgba(252,103,25,0.3)] animate-pulse relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Zap size={120} className="text-white rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-black">
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">ATTENZIONE RIDER!</h2>
              <p className="font-bold italic text-sm opacity-90 max-w-xl">
                Il tuo profilo disponibilità per la ZRL Spring 2026 è vuoto. Senza i tuoi dati, l'IA non potrà assegnarti a nessuna squadra. Compila il form ora!
              </p>
            </div>
            <a href="/availability" className="px-10 py-4 bg-black text-white font-black italic rounded-2xl hover:scale-105 transition-all uppercase text-xs tracking-[0.2em] shadow-2xl whitespace-nowrap">
              COMPILA DISPONIBILITÀ ORA
            </a>
          </div>
        </div>
      )}

      {/* STRATEGIC HUB - ZRL & MWT (PRIORITY) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ZRL CARD - ALWAYS PROMINENT */}
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900 to-black border-2 border-zinc-800 hover:border-inox-orange/40 transition-all group relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <Flag size={200} className="rotate-12" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-start mb-12">
              <div className="px-4 py-1.5 rounded-full bg-inox-orange/10 border border-inox-orange/30 text-inox-orange text-[10px] font-black uppercase tracking-widest">
                Strategic Priority: Active
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-inox-orange">
                <Layout size={24} />
              </div>
            </div>

            <div className="mt-auto">
              <h2 className="text-6xl font-black italic text-white tracking-tighter leading-none mb-4 uppercase">
                ZRL <span className="text-inox-orange">SPRING 2026</span>
              </h2>
              <p className="text-zinc-400 text-lg font-medium italic mb-8 max-w-sm">
                La competizione regina. 18 team INOX schierati in tutte le divisioni WTRL.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a href="/roster" className="px-8 py-4 bg-white text-black font-black italic rounded-2xl hover:bg-inox-orange transition-all uppercase text-xs tracking-widest shadow-xl active:scale-95">
                  Gestione Roster
                </a>
                <a href="/racing" className="px-8 py-4 bg-zinc-800 text-zinc-300 font-black italic rounded-2xl hover:bg-zinc-700 transition-all uppercase text-xs tracking-widest border border-zinc-700">
                  Classifiche Live
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* MWT CARD - FINISHED BUT IMPORTANT */}
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900/50 to-black border-2 border-zinc-800 hover:border-inox-cyan/40 transition-all group relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <Trophy size={200} className="-rotate-12" />
          </div>

          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-start mb-12">
              <div className="px-4 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Season Concluded
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-inox-cyan">
                <Star size={24} />
              </div>
            </div>

            <div className="mt-auto">
              <h2 className="text-6xl font-black italic text-white tracking-tighter leading-none mb-4 uppercase">
                MASTER <span className="text-inox-cyan">WINTER TOUR</span>
              </h2>
              <p className="text-zinc-500 text-lg font-medium italic mb-8 max-w-sm">
                Stagione 2025/26 terminata. Consulta la Hall of Fame e i risultati storici del tour.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a href="/ranking" className="px-8 py-4 bg-inox-cyan text-black font-black italic rounded-2xl hover:bg-cyan-400 transition-all uppercase text-xs tracking-widest shadow-xl active:scale-95">
                  Hall of Fame
                </a>
                <button className="px-8 py-4 bg-zinc-800 text-zinc-500 font-black italic rounded-2xl uppercase text-xs tracking-widest border border-zinc-700 cursor-not-allowed">
                  Next Season: TBD
                </button>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-3xl bg-[#1a1d20] border border-zinc-800 shadow-xl hover:border-zinc-700 transition-all group cursor-pointer overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3.5 rounded-2xl bg-zinc-800/80 group-hover:scale-110 transition-transform ${stat.color} border border-zinc-700/50`}>
                <stat.icon size={22} />
              </div>
              <ArrowUpRight size={16} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
            <div className="text-4xl font-black text-white mb-1 tracking-tighter">{stat.value}</div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ACTION COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Action Banner by Role */}
          {user?.role === 'admin' && (
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-red-950/40 to-zinc-900 border border-red-900/30 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white italic uppercase mb-2">Controllo Sistemi</h3>
                <p className="text-zinc-400 text-sm mb-6 max-w-md">Accesso completo alla gestione utenti e configurazione. Verifica i permessi dei nuovi iscritti.</p>
                <div className="flex gap-4">
                  <a href="/admin/users" className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-all uppercase text-[10px] tracking-widest shadow-lg">Gestisci Utenti</a>
                  <a href="/admin/events" className="px-6 py-3 bg-zinc-800 text-zinc-300 font-black rounded-xl hover:bg-zinc-700 transition-all uppercase text-[10px] tracking-widest border border-zinc-700">Editor Eventi</a>
                </div>
              </div>
              <Shield size={120} className="absolute -right-8 -bottom-8 text-red-500/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </div>
          )}

          {user?.role === 'captain' && (
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-orange-950/40 to-zinc-900 border border-inox-orange/30 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white italic uppercase mb-2">Roster Management</h3>
                <p className="text-zinc-400 text-sm mb-6 max-w-md">Controlla le disponibilità per il prossimo round ZRL e conferma la lineup finale.</p>
                <div className="flex gap-4">
                  <a href="/roster" className="px-6 py-3 bg-inox-orange text-black font-black rounded-xl hover:bg-orange-500 transition-all uppercase text-[10px] tracking-widest shadow-lg">Aggiorna Lineup</a>
                  <a href="/availability" className="px-6 py-3 bg-zinc-800 text-zinc-300 font-black rounded-xl hover:bg-zinc-700 transition-all uppercase text-[10px] tracking-widest border border-zinc-700">Check RSVP</a>
                </div>
              </div>
              <Users size={120} className="absolute -right-8 -bottom-8 text-inox-orange/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </div>
          )}

          {user?.role === 'athlete' && (
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-950/40 to-zinc-900 border border-inox-cyan/30 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white italic uppercase mb-2">Pronto per correre?</h3>
                <p className="text-zinc-400 text-sm mb-6 max-w-md">La tua disponibilità permette ai capitani di organizzare i team. Conferma la tua presenza ZRL.</p>
                <div className="flex gap-4">
                  <a href="/availability" className="px-6 py-3 bg-inox-cyan text-black font-black rounded-xl hover:bg-cyan-400 transition-all uppercase text-[10px] tracking-widest shadow-lg">Dai Disponibilità</a>
                  <a href="/events" className="px-6 py-3 bg-zinc-800 text-zinc-300 font-black rounded-xl hover:bg-zinc-700 transition-all uppercase text-[10px] tracking-widest border border-zinc-700">Prossime Gare</a>
                </div>
              </div>
              <Zap size={120} className="absolute -right-8 -bottom-8 text-inox-cyan/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2rem] bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Prossimo Round ZRL</h4>
                <p className="text-lg font-bold text-white italic">Week 4 - Makuri Islands</p>
              </div>
              <div className="flex items-center gap-2 text-inox-orange mt-4">
                <Calendar size={16} />
                <span className="text-xs font-black uppercase tracking-tight">Martedì 7 Aprile, 20:00 CET</span>
              </div>
            </div>
            
            <div className="p-8 rounded-[2rem] bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Weekly Events</h4>
                <p className="text-lg font-bold text-white italic">Discovery Recon</p>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 mt-4">
                <Calendar size={16} />
                <span className="text-xs font-black uppercase tracking-tight">Lunedì, 18:50 CET</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR COLUMN */}
        <div className="space-y-6">
          <div className="p-6 rounded-[2rem] bg-[#1a1d20] border border-zinc-800">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Star size={14} className="text-inox-cyan" /> Historical Seasons
            </h3>
            <div className="space-y-3">
              {allSeries.filter(s => !s.is_active).map(s => (
                <div key={s.id} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between group hover:border-zinc-600 transition-all cursor-pointer">
                  <div>
                    <h3 className="text-sm font-bold text-white italic uppercase">{s.name}</h3>
                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{s.total_rounds} Round</p>
                  </div>
                  <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-inox-orange transition-all" />
                </div>
              ))}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-inox-cyan/20 flex items-center justify-between border-dashed">
                <div>
                  <h3 className="text-sm font-bold text-inox-cyan italic uppercase">MWT 2025/26</h3>
                  <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Season Recap Available</p>
                </div>
                <Trophy size={14} className="text-inox-cyan" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-gradient-to-b from-inox-orange/5 to-transparent border border-zinc-800">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Official Links</h3>
            <ul className="space-y-3">
              <li><a href="https://www.teaminox.it" target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-bold uppercase tracking-wide">/ Inoxteam Website</a></li>
              <li><a href="https://www.wtrl.racing/zwift-racing-league/" target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-bold uppercase tracking-wide">/ WTRL ZRL Portal</a></li>
              <li><a href="https://discord.gg/cpr3rBGaZy" target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-bold uppercase tracking-wide">/ Discord Community</a></li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
