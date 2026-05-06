import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Shield, 
  Trophy, 
  Activity, 
  ArrowUpRight, 
  Zap, 
  Layout, 
  RefreshCw, 
  AlertTriangle, 
  Lightbulb, 
  Database,
  Crosshair,
  TrendingUp,
  MailWarning
} from 'lucide-react';
import { api } from '../../services/api';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    teams: 0,
    series: 0,
    events: 0
  });
  const [insights, setInsights] = useState({
    missingCategory: 0,
    missingEmail: 0,
    pendingRegistration: 0,
    activeRoster: 0,
    teamsNeedingCaptain: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, teams, seriesData, events] = await Promise.all([
          api.listUsers(),
          api.getTeams(),
          api.getSeries(),
          api.getEvents()
        ]);
        
        setStats({
          users: users.length,
          teams: teams.length,
          series: seriesData.length,
          events: events.length
        });

        const res = await fetch('/api/admin/system-insights', {
          headers: { 'Authorization': `Bearer \${localStorage.getItem('inox_token')}` }
        });
        const data = await res.json();
        if (data.success) setInsights(data.insights);

      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const adminModules = [
    {
      title: "ZRL Operations",
      subtitle: "Mission Control",
      desc: "Gestione tattica: roster building, sync WTRL e analisi performance.",
      icon: Crosshair,
      path: "/zrl-operations",
      color: "from-orange-500 to-red-600",
      size: "lg",
      alert: insights.activeRoster > 0 ? `\${insights.activeRoster} RSVP` : null
    },
    {
      title: "Winter Tour",
      subtitle: "Master Management",
      desc: "Amministrazione campionato interno, regolamento e classifiche.",
      icon: Trophy,
      path: "/winter-tour-management",
      color: "from-yellow-400 to-yellow-600",
      size: "md"
    },
    {
      title: "Athlete DB",
      subtitle: "Rider Database",
      desc: "Anagrafica centrale, permessi e integrità dati atleti.",
      icon: Users,
      path: "/admin/users",
      color: "from-blue-500 to-indigo-600",
      size: "md",
      alert: (insights.missingCategory + insights.missingEmail) > 0 ? `${insights.missingCategory + insights.missingEmail} Errors` : null
    },
    {
      title: "Rankings View",
      subtitle: "Live Results",
      desc: "Viewport per la consultazione rapida delle classifiche di divisione.",
      icon: LayoutGrid,
      path: "/zrl-results",
      color: "from-zinc-700 to-zinc-900",
      size: "sm"
    },
    {
      title: "Events Lab",
      subtitle: "Configuration",
      desc: "Gestione calendario corse sociali e allenamenti di gruppo.",
      icon: Layout,
      path: "/admin/events",
      color: "from-emerald-500 to-teal-600",
      size: "sm"
    },
    {
      title: "Optimizer",
      subtitle: "Roster Engine",
      desc: "Algoritmi di suggerimento per la composizione dei team ZRL.",
      icon: Lightbulb,
      path: "/admin/optimizer",
      color: "from-purple-500 to-pink-600",
      size: "sm"
    },
    {
      title: "Maintenance",
      subtitle: "System Sync",
      desc: "Reset database, manutenzione avanzata e log di sistema.",
      icon: RefreshCw,
      path: "/zrl-round-manager",
      color: "from-zinc-700 to-zinc-900",
      size: "sm"
    }
  ];

  if (loading) return null;

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER SECTION */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
              <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Authorized Tactical Access</span>
            </div>
            <div className="px-3 py-1 bg-inox-cyan/10 border border-inox-cyan/20 rounded-full">
               <span className="text-[9px] font-black text-inox-cyan uppercase tracking-[0.2em]">Nodes: Optimal</span>
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">
            COMMAND <span className="text-zinc-800">CENTER</span>
          </h1>
          <p className="text-zinc-500 font-bold italic text-sm uppercase tracking-widest max-w-xl">
             Cockpit di amministrazione globale. Gestisci le missioni e monitora l'integrità del sistema.
          </p>
        </div>
      </section>

      {/* ADMIN PORTAL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((item, i) => (
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
                {item.alert && (
                  <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest animate-pulse">
                      {item.alert}
                  </div>
                )}
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

      {/* SYSTEM INSIGHTS BAR */}
      <footer className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-zinc-900">
         {[
           { label: "Total Riders", value: stats.users, icon: Users, color: "text-blue-500" },
           { label: "Deployed Units", value: stats.teams, icon: Crosshair, color: "text-orange-500" },
           { label: "Data Integrity", value: (insights.missingCategory + insights.missingEmail) === 0 ? "100%" : "Critical", icon: Database, color: (insights.missingCategory + insights.missingEmail) === 0 ? "text-green-500" : "text-red-500" },
           { label: "Active RSVP", value: insights.activeRoster, icon: TrendingUp, color: "text-inox-cyan" }
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

export default AdminDashboard;
