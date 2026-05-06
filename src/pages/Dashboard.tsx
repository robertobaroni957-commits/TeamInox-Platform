import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Trophy, 
  Activity, 
  ArrowUpRight, 
  Zap, 
  Calendar, 
  Shield, 
  Flag, 
  Star,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Users,
  LayoutGrid,
  MapPin,
  Clock,
  Compass
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{username: string, role: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('inox_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.username, role: payload.role });
      } catch (e) {
        localStorage.removeItem('inox_token');
      }
    }
    setLoading(false);
  }, []);

  const menuItems = [
    {
      title: "War Room",
      subtitle: "Gare & Live Tracking",
      desc: "Monitora le gare in corso e segui i compagni in tempo reale.",
      icon: Zap,
      path: "/racing",
      color: "from-orange-500 to-red-600",
      size: "lg"
    },
    {
      title: "ZRL Hub",
      subtitle: "Zwift Racing League",
      desc: "Disponibilità, roster e timeline della stagione ufficiale.",
      icon: Trophy,
      path: "/availability",
      color: "from-blue-500 to-indigo-600",
      size: "md"
    },
    {
      title: "Master Winter Tour",
      subtitle: "Campionato Interno",
      desc: "Classifiche, punti e tappe del tour invernale InoxTeam.",
      icon: Star,
      path: "/ranking",
      color: "from-yellow-400 to-orange-500",
      size: "md"
    },
    {
      title: "Events",
      subtitle: "Calendario Sociale",
      desc: "Allenamenti, corse di gruppo e appuntamenti settimanali.",
      icon: Calendar,
      path: "/events",
      color: "from-emerald-500 to-teal-600",
      size: "sm"
    },
    {
      title: "Teams",
      subtitle: "Squadre & Roster",
      desc: "Esplora le divisioni e i componenti dei team ufficiali.",
      icon: Users,
      path: "/teams",
      color: "from-purple-500 to-pink-600",
      size: "sm"
    },
    {
      title: "Classifiche ZRL",
      subtitle: "Risultati & Ranking",
      desc: "Consulta i piazzamenti ufficiali di tutte le divisioni InoxTeam.",
      icon: Trophy,
      path: "/zrl-results",
      color: "from-zinc-700 to-zinc-900",
      size: "sm"
    },
    {
      title: "Strat Map",
      subtitle: "Tactical DNA",
      desc: "Analisi avanzata delle performance e Social Cards per i media.",
      icon: BarChart3,
      path: "/zrl-analytics",
      color: "from-cyan-500 to-blue-600",
      size: "sm"
    }
  ];

  if (loading) return null;

  return (
    <div className="space-y-10 pb-20">
      
      {/* WELCOME SECTION */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-inox-cyan/10 border border-inox-cyan/20 rounded-full">
              <span className="text-[9px] font-black text-inox-cyan uppercase tracking-[0.2em]">Operational Deck</span>
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">
            HELLO, <span className="text-zinc-800">{user?.username || 'RIDER'}</span>
          </h1>
          <p className="text-zinc-500 font-bold italic text-sm uppercase tracking-widest max-w-xl">
             Seleziona un modulo operativo per iniziare la tua sessione.
          </p>
        </div>
      </section>

      {/* PORTAL GRID (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.01, y: -5 }}
            onClick={() => navigate(item.path)}
            className={`group relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 cursor-pointer shadow-2xl transition-all \${
              item.size === 'lg' ? 'md:col-span-2' : ''
            }`}
          >
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl \${item.color} opacity-[0.03] blur-3xl group-hover:opacity-[0.08] transition-opacity`} />
            
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
        ))}
      </div>

      {/* QUICK STATUS BAR */}
      <footer className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-zinc-900">
         {[
           { label: "Active Nodes", value: "Optimal", icon: Activity, color: "text-green-500" },
           { label: "Next Race", value: "Tues 19:30", icon: Zap, color: "text-[#fc6719]" },
           { label: "Team Strength", value: "48 Riders", icon: Users, color: "text-inox-cyan" },
           { label: "Season Stage", value: "Round 4", icon: Flag, color: "text-yellow-500" }
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
