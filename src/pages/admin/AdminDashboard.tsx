import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Shield, 
  Trophy, 
  Activity, 
  Database, 
  Lock, 
  ExternalLink,
  ChevronRight,
  Zap,
  Layout,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  UserPlus,
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
        const [users, teams, series, events] = await Promise.all([
          api.listUsers(),
          api.getTeams(),
          api.getSeries(),
          api.getEvents()
        ]);
        setStats({
          users: users.length,
          teams: teams.length,
          series: series.length,
          events: events.length
        });

        const res = await fetch('/api/admin/system-insights', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('inox_token')}` }
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

  const missionGates = [
    {
      title: "ZRL Mission Control",
      subtitle: "Zwift Racing League",
      desc: "Gestione completa del campionato: calendario, RSVP, roster builder e risultati ufficiali WTRL.",
      icon: Zap,
      path: "/zrl-operations",
      color: "from-[#fc6719] to-orange-600",
      status: "Active Season: " + (series.find(s => s.is_active)?.name || "Nessuna"),
      accent: "#fc6719"
    },
    {
      title: "Winter Tour Lab",
      subtitle: "Master Winter Tour",
      desc: "Amministrazione del campionato interno: regolamento punti, gestione tappe e Hall of Fame.",
      icon: Trophy,
      path: "/winter-tour-management",
      color: "from-yellow-400 to-yellow-600",
      status: "Configurazione Punti",
      accent: "#facc15"
    }
  ];

  const systemModules = [
    {
      title: "Rider Database",
      icon: Users,
      path: "/admin/users",
      desc: "Anagrafica centrale atleti e permessi.",
      accent: "text-blue-500"
    },
    {
      title: "Weekly Events",
      icon: Layout,
      path: "/admin/events",
      desc: "Calendario corse sociali e allenamenti.",
      accent: "text-purple-500"
    },
    {
      title: "Global Sync",
      icon: RefreshCw,
      path: "/zrl-round-manager",
      desc: "Manutenzione avanzata e reset database.",
      accent: "text-red-500"
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Cockpit */}
      <header className="relative p-10 rounded-[3rem] bg-zinc-950 border border-zinc-900 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Shield size={200} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Authorized Admin Access Only</span>
              </div>
            </div>
            <h1 className="text-5xl lg:text-8xl font-black italic tracking-tighter text-white uppercase leading-tight">
              COMMAND <span className="text-zinc-800">CENTER</span>
            </h1>
            <p className="text-zinc-500 font-bold italic text-sm mt-2 uppercase tracking-widest max-w-xl">
               Benvenuto nel cockpit di comando InoxTeam. Monitora le performance e gestisci le missioni operative da un unico hub centrale.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
               <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Riders</p>
               <p className="text-2xl font-black italic text-white leading-none">{stats.users}</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
               <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Official Teams</p>
               <p className="text-2xl font-black italic text-[#fc6719] leading-none">{stats.teams}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Mission Gates */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 ml-4">
           <Zap size={18} className="text-[#fc6719]" />
           <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em]">Active Missions</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {missionGates.map((gate, i) => (
             <motion.div
               key={i}
               whileHover={{ scale: 1.01, y: -5 }}
               onClick={() => navigate(gate.path)}
               className="group relative h-[380px] rounded-[3.5rem] bg-zinc-950 border border-zinc-900 overflow-hidden cursor-pointer shadow-2xl transition-all"
             >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-transparent" />
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${gate.color} opacity-[0.03] blur-3xl group-hover:opacity-[0.08] transition-opacity`} />
                
                <div className="relative z-10 p-10 flex flex-col h-full">
                   <div className="flex justify-between items-start mb-auto">
                      <div className="p-5 rounded-[2rem] bg-zinc-900 border border-zinc-800 shadow-xl group-hover:border-[#fc6719]/40 transition-colors">
                         <gate.icon size={32} className="text-white" />
                      </div>
                      <div className="flex flex-col items-end">
                         <div className="px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">{gate.status}</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div>
                         <span className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] mb-1 block">{gate.subtitle}</span>
                         <h3 className="text-4xl lg:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">{gate.title}</h3>
                      </div>
                      <p className="text-zinc-500 text-sm font-medium italic leading-relaxed max-w-sm">
                         {gate.desc}
                      </p>
                      <div className="pt-6 flex items-center gap-4">
                         <button className="px-8 py-3 bg-white text-black font-black italic uppercase rounded-2xl text-[10px] tracking-widest group-hover:bg-[#fc6719] group-hover:text-white transition-all shadow-xl">
                            Entra nel Modulo
                         </button>
                         <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-white transition-all">
                            <ChevronRight size={20} />
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Grid: Intelligent Systems & Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Intelligent Insights */}
        <section className="xl:col-span-2 space-y-6">
           <div className="flex items-center gap-3 ml-4">
              <Lightbulb size={18} className="text-yellow-500" />
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em]">Command Insights</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Database Health */}
              <div className="p-8 rounded-[3rem] bg-zinc-950 border border-zinc-900 shadow-xl space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                       <AlertTriangle size={24} />
                    </div>
                    <div>
                       <h4 className="font-black italic text-white uppercase leading-none">Integrità Dati</h4>
                       <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Status database centrale</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                       <span className="text-[10px] font-black text-zinc-500 uppercase">Atleti senza Categoria</span>
                       <span className={`text-lg font-black italic ${insights.missingCategory > 0 ? 'text-red-500' : 'text-zinc-700'}`}>{insights.missingCategory}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                       <span className="text-[10px] font-black text-zinc-500 uppercase">Atleti senza Email</span>
                       <span className={`text-lg font-black italic ${insights.missingEmail > 0 ? 'text-red-500' : 'text-zinc-700'}`}>{insights.missingEmail}</span>
                    </div>
                 </div>
              </div>

              {/* Roster Health */}
              <div className="p-8 rounded-[3rem] bg-zinc-950 border border-zinc-900 shadow-xl space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-inox-cyan/10 rounded-2xl text-inox-cyan">
                       <Activity size={24} />
                    </div>
                    <div>
                       <h4 className="font-black italic text-white uppercase leading-none">Roster Status</h4>
                       <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Partecipazione & RSVP</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                       <span className="text-[10px] font-black text-zinc-500 uppercase">RSVP Attivi (Settimana)</span>
                       <span className="text-lg font-black italic text-inox-cyan">{insights.activeRoster}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                       <span className="text-[10px] font-black text-zinc-500 uppercase">Team senza Capitano</span>
                       <span className={`text-lg font-black italic ${insights.teamsNeedingCaptain > 0 ? 'text-yellow-500' : 'text-zinc-700'}`}>{insights.teamsNeedingCaptain}</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Global Systems Sidebar */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 ml-4">
              <Settings size={18} className="text-zinc-500" />
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em]">Global Systems</h2>
           </div>
           
           <div className="space-y-4">
              {systemModules.map((sys, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 5 }}
                  onClick={() => navigate(sys.path)}
                  className="p-6 rounded-[2rem] bg-zinc-950 border border-zinc-900 hover:border-zinc-800 cursor-pointer flex items-center gap-6 transition-all shadow-lg group"
                >
                   <div className={`p-4 rounded-2xl bg-zinc-900 border border-zinc-800 ${sys.accent} group-hover:scale-110 transition-transform`}>
                      <sys.icon size={20} />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-sm font-black italic text-white uppercase leading-none">{sys.title}</h4>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">{sys.desc}</p>
                   </div>
                   <ChevronRight size={16} className="text-zinc-800 group-hover:text-white transition-colors" />
                </motion.div>
              ))}
              
              {/* Platform Status Bar */}
              <div className="p-6 rounded-[2rem] bg-zinc-900/20 border border-zinc-900/50 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-green-500/5 border border-green-500/10 flex items-center justify-center text-green-500/50">
                    <Activity size={18} />
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">Platform Sync Status</p>
                    <p className="text-[10px] font-black text-zinc-600 uppercase italic">All Nodes Operational</p>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
