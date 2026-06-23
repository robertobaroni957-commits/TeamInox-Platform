import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Activity, 
  ArrowUpRight, 
  Zap, 
  Users,
  Flag,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DASHBOARD_CONFIG } from '../services/dashboardConfig';
import { hasPermission } from '../services/permissions';
import type { Role } from '../services/permissions';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{username: string, role: Role, zwid: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isZRLParticipant, setIsZRLParticipant] = useState(false);
  const [needsQuestionnaire, setNeedsQuestionnaire] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    teams: 0,
    activeSeries: 'N/A',
    nextRace: 'TBD'
  });

  useEffect(() => {
    const token = localStorage.getItem('inox_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userObj = { username: payload.username, role: payload.role as Role, zwid: payload.zwid };
        setUser(userObj);
        
        Promise.all([
            api.checkAvailabilityStatus(),
            api.checkZRLParticipation()
        ]).then(([status, isParticipant]) => {
          setNeedsQuestionnaire(status.missing);
          setIsZRLParticipant(isParticipant);
        }).catch(err => console.error("Error fetching dashboard data:", err));

        Promise.all([
          api.listUsers().catch(() => []),
          api.getTeams().catch(() => []),
          api.getSeries().catch(() => [])
        ]).then(([users, teams, series]) => {
          const active = series.find((s:any) => s.is_active);
          setStats({
            users: users.length,
            teams: teams.length,
            activeSeries: active ? active.name : 'N/A',
            nextRace: 'Tues 19:30'
          });
        });

      } catch (e) {
        localStorage.removeItem('inox_token');
      }
    }
    setLoading(false);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const isCaptain = user?.role === 'captain';

  const allItems = DASHBOARD_CONFIG.filter(item => {
    if (isAdmin && item.id === 'zrl-questionnaire') return false;
    return hasPermission(user?.role, item.permission, isZRLParticipant);
  });

  // Admin: tutto piatto, nessuna sezione ZRL HUB separata
  // Captain/user: split per sezione
  const zrlHubItems = allItems.filter(item => item.section === 'zrl');
  const generalItems = isAdmin
    ? allItems
    : allItems.filter(item => item.section !== 'zrl');

  if (loading) return null;

  const renderCard = (item: typeof DASHBOARD_CONFIG[0]) => (
    <motion.div
      key={item.id}
      whileHover={{ scale: 1.01, y: -5 }}
      onClick={() => navigate(item.path)}
      className={`group relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 cursor-pointer shadow-2xl transition-all ${
        item.size === 'lg' ? 'md:col-span-2' : ''
      }`}
    >
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${item.color} opacity-[0.03] blur-3xl group-hover:opacity-[0.08] transition-opacity`} />
      
      <div className="relative z-10 p-8 lg:p-10 flex flex-col h-full min-h-[280px]">
        <div className="flex justify-between items-start mb-auto">
          <div className="p-5 rounded-3xl bg-black border border-zinc-800 shadow-2xl group-hover:border-white/20 transition-colors">
            <item.icon size={28} className="text-white" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-black/40 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-white transition-all">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] mb-1 block">{item.subtitle}</span>
            <h3 className="text-3xl lg:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{item.title}</h3>
          </div>
          <p className="text-zinc-500 text-xs font-medium italic leading-relaxed max-w-sm">
            {item.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-10 pb-20">
      
      {/* WELCOME SECTION */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-inox-cyan/10 border border-inox-cyan/20 rounded-full">
              <span className="text-[9px] font-black text-inox-cyan uppercase tracking-[0.2em]">Operational Deck</span>
            </div>
            {isAdmin && (
              <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Command Level</span>
              </div>
            )}
            {isCaptain && (
              <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.2em]">Captain</span>
              </div>
            )}
          </div>
          <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">
            HELLO, <span className="text-zinc-800">{user?.username || 'RIDER'}</span>
          </h1>
          <p className="text-zinc-500 font-bold italic text-sm uppercase tracking-widest max-w-xl">
             {isAdmin
               ? "Pannello di controllo globale. Monitora e gestisci l'intera infrastruttura InoxTeam."
               : isCaptain
               ? "Captain Deck. Gestisci la tua squadra e le disponibilità ZRL."
               : "Benvenuto nel Deck Operativo. Seleziona un modulo per iniziare la tua sessione."}
          </p>
        </div>
      </section>

      {/* ALERT QUESTIONARIO */}
      {needsQuestionnaire && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/availability')}
          className="p-6 rounded-[2rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-between cursor-pointer group hover:bg-orange-500/20 transition-all"
        >
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black italic text-white uppercase tracking-tighter">ZRL 2026: Azione Richiesta</h4>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Conferma la tua partecipazione e le tue disponibilità per il prossimo round.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-orange-500 font-black italic uppercase text-sm group-hover:gap-5 transition-all">
            Vai al Questionario <ArrowUpRight size={18} />
          </div>
        </motion.div>
      )}

      {/* ZRL HUB — solo per captain e user (non admin) */}
      {!isAdmin && zrlHubItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 bg-[#fc6719]/10 border border-[#fc6719]/20 rounded-full">
              <span className="text-[9px] font-black text-[#fc6719] uppercase tracking-[0.3em]">ZRL Hub</span>
            </div>
            <div className="flex-1 h-px bg-zinc-900" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zrlHubItems.map(renderCard)}
          </div>
        </section>
      )}

      {/* PORTAL GRID generale */}
      {generalItems.length > 0 && (
        <section className="space-y-4">
          {!isAdmin && (
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-full">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Piattaforma</span>
              </div>
              <div className="flex-1 h-px bg-zinc-900" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalItems.map(renderCard)}
          </div>
        </section>
      )}

      {/* QUICK STATUS BAR */}
      <footer className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-zinc-900">
         {[
           { label: "Nodes Status", value: "Optimal", icon: Activity, color: "text-green-500" },
           { label: "Next Race", value: stats.nextRace, icon: Zap, color: "text-[#fc6719]" },
           { label: "Team Strength", value: `${stats.users} Riders`, icon: Users, color: "text-inox-cyan" },
           { label: "Season Stage", value: stats.activeSeries, icon: Flag, color: "text-yellow-500" }
         ].map((stat, i) => (
           <div key={i} className="p-6 rounded-[2rem] bg-zinc-950 border border-zinc-900 flex flex-col gap-2">
             <stat.icon size={16} className={stat.color} />
             <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
             <p className="text-lg font-black italic text-white uppercase leading-none">{stat.value}</p>
           </div>
         ))}
      </footer>

    </div>
  );
};

export default Dashboard;
