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
  const [series, setSeries] = useState<any[]>([]);
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
        
        setSeries(seriesData);
        setStats({
          users: users.length,
          teams: teams.length,
          series: seriesData.length,
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
      desc: "Gestione tattica del campionato: roster building, sincronizzazione WTRL e analisi performance.",
      icon: Zap,
      path: "/zrl-operations",
      color: "from-[#fc6719] to-orange-600",
      status: "Active Season: " + (series.find(s => s.is_active)?.name || "Nessuna"),
      accent: "#fc6719",
      action: "Pianifica Lineup",
      stats: { label: "RSVP", value: insights.activeRoster }
    },
    {
      title: "Winter Tour Lab",
      subtitle: "Master Winter Tour",
      desc: "Amministrazione del campionato interno: regolamento punti, gestione tappe e Hall of Fame.",
      icon: Trophy,
      path: "/winter-tour-management",
      color: "from-yellow-400 to-yellow-600",
      status: "Configurazione Punti",
      accent: "#facc15",
      action: "Gestione Classifica",
      stats: { label: "Events", value: stats.events }
    }
  ];

  const systemModules = [
    {
      title: "Rider Database",
      icon: Users,
      path: "/admin/users",
      desc: "Anagrafica centrale e permessi.",
      accent: "text-blue-500"
    },
    {
      title: "Weekly Events",
      icon: Layout,
      path: "/admin/events",
      desc: "Calendario corse sociali.",
      accent: "text-purple-500"
    },
    {
      title: "System Maintenance",
      icon: RefreshCw,
      path: "/zrl-round-manager",
      desc: "Reset database e sync avanzato.",
      accent: "text-red-500"
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Cockpit */}
      <header className="relative p-10 lg:p-14 rounded-[3.5rem] bg-zinc-950 border border-zinc-900 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
           <Shield size={300} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Authorized Tactical Access</span>
              </div>
              <div className="px-3 py-1 bg-inox-cyan/10 border border-inox-cyan/20 rounded-full flex items-center gap-2">
                <span className="text-[9px] font-black text-inox-cyan uppercase tracking-[0.2em]">System Status: Operational</span>
              </div>
            </div>
            <h1 className="text-6xl lg:text-9xl font-black italic tracking-tighter text-white uppercase leading-none">
              COMMAND <span className="text-zinc-800">CENTER</span>
            </h1>
            <p className="text-zinc-500 font-bold italic text-sm uppercase tracking-widest max-w-xl border-l-2 border-[#fc6719] pl-4">
               Benvenuto nel cockpit di comando InoxTeam. Gestisci le missioni operative e monitora le performance globali.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 w-full md:w-auto min-w-[200px]">
            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Global Strength</p>
               <div className="flex items-baseline gap-2">
                 <p className="text-4xl font-black italic text-white leading-none">{stats.users}</p>
                 <p className="text-xs font-black italic text-zinc-500 uppercase">Riders</p>
               </div>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Deployed Teams</p>
               <div className="flex items-baseline gap-2">
                 <p className="text-4xl font-black italic text-[#fc6719] leading-none">{stats.teams}</p>
                 <p className="text-xs font-black italic text-zinc-500 uppercase">Units</p>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tactical Mission Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
           <div className="flex items-center gap-3">
              <Zap size={20} className="text-[#fc6719]" />
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-[0.4em]">Active Mission Objectives</h2>
           </div>
           <div className="h-px flex-1 mx-8 bg-zinc-900/50" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {missionGates.map((gate, i) => (
             <motion.div
               key={i}
               whileHover={{ scale: 1.01, y: -5 }}
               onClick={() => navigate(gate.path)}
               className="group relative h-[420px] rounded-[4rem] bg-zinc-950 border border-zinc-900 overflow-hidden cursor-pointer shadow-2xl transition-all"
             >
                {/* Background Tactical Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/40 to-transparent" />
                <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl ${gate.color} opacity-[0.02] blur-3xl group-hover:opacity-[0.06] transition-opacity`} />
                
                <div className="relative z-10 p-12 flex flex-col h-full">
                   <div className="flex justify-between items-start mb-auto">
                      <div className="p-6 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 shadow-2xl group-hover:border-[#fc6719]/50 transition-colors">
                         <gate.icon size={36} className="text-white" />
                      </div>
                      <div className="space-y-2">
                         <div className="px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">{gate.status}</span>
                         </div>
                         {gate.stats && (
                           <div className="px-4 py-2 rounded-2xl bg-black/40 border border-zinc-900 flex justify-between items-center gap-4">
                              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{gate.stats.label}</span>
                              <span className="text-sm font-black italic text-[#fc6719]">{gate.stats.value}</span>
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div>
                         <span className="text-[11px] font-black uppercase text-zinc-600 tracking-[0.4em] mb-2 block">{gate.subtitle}</span>
                         <h3 className="text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">{gate.title}</h3>
                      </div>
                      <p className="text-zinc-500 text-sm font-medium italic leading-relaxed max-w-sm">
                         {gate.desc}
                      </p>
                      <div className="pt-4 flex items-center gap-4">
                         <button className="px-10 py-4 bg-white text-black font-black italic uppercase rounded-[1.5rem] text-[11px] tracking-widest group-hover:bg-[#fc6719] group-hover:text-white transition-all shadow-2xl">
                            {gate.action}
                         </button>
                         <div className="w-14 h-14 rounded-[1.5rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:border-zinc-700 transition-all">
                            <ChevronRight size={24} />
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
        <section className="xl:col-span-2 space-y-8">
           <div className="flex items-center gap-3 ml-4">
              <Lightbulb size={20} className="text-yellow-500" />
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em]">Strategic Intelligence</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Database Health */}
              <div className="p-10 rounded-[3.5rem] bg-zinc-950 border border-zinc-900 shadow-2xl space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-[0.02]">
                    <AlertTriangle size={120} />
                 </div>
                 <div className="flex items-center gap-5 relative z-10">
                    <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20">
                       <AlertTriangle size={28} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black italic text-white uppercase leading-none">Integrità Dati</h4>
                       <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Anomalie Database Centrale</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4 relative z-10">
                    <div className="flex justify-between items-center p-5 bg-zinc-900/30 rounded-2xl border border-zinc-800 group hover:border-red-500/30 transition-colors">
                       <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Atleti senza Categoria</span>
                       <span className={`text-2xl font-black italic ${insights.missingCategory > 0 ? 'text-red-500' : 'text-zinc-800'}`}>{insights.missingCategory}</span>
                    </div>
                    <div className="flex justify-between items-center p-5 bg-zinc-900/30 rounded-2xl border border-zinc-800 group hover:border-red-500/30 transition-colors">
                       <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Atleti senza Email</span>
                       <span className={`text-2xl font-black italic ${insights.missingEmail > 0 ? 'text-red-500' : 'text-zinc-800'}`}>{insights.missingEmail}</span>
                    </div>
                 </div>
              </div>

              {/* Roster Health */}
              <div className="p-10 rounded-[3.5rem] bg-zinc-950 border border-zinc-900 shadow-2xl space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-[0.02]">
                    <Activity size={120} />
                 </div>
                 <div className="flex items-center gap-5 relative z-10">
                    <div className="p-4 bg-inox-cyan/10 rounded-2xl text-inox-cyan border border-inox-cyan/20">
                       <Activity size={28} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black italic text-white uppercase leading-none">Roster Status</h4>
                       <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Mobilitazione Forze</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4 relative z-10">
                    <div className="flex justify-between items-center p-5 bg-zinc-900/30 rounded-2xl border border-zinc-800 group hover:border-inox-cyan/30 transition-colors">
                       <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">RSVP Attivi (Settimana)</span>
                       <span className="text-2xl font-black italic text-inox-cyan">{insights.activeRoster}</span>
                    </div>
                    <div className="flex justify-between items-center p-5 bg-zinc-900/30 rounded-2xl border border-zinc-800 group hover:border-yellow-500/30 transition-colors">
                       <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Team senza Capitano</span>
                       <span className={`text-2xl font-black italic ${insights.teamsNeedingCaptain > 0 ? 'text-yellow-500' : 'text-zinc-800'}`}>{insights.teamsNeedingCaptain}</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Global Systems Sidebar */}
        <section className="space-y-8">
           <div className="flex items-center gap-3 ml-4">
              <Settings size={20} className="text-zinc-500" />
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em]">Core Systems</h2>
           </div>
           
           <div className="space-y-4">
              {systemModules.map((sys, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 8 }}
                  onClick={() => navigate(sys.path)}
                  className="p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 hover:border-zinc-800 cursor-pointer flex items-center gap-6 transition-all shadow-xl group"
                >
                   <div className={`p-5 rounded-[1.5rem] bg-zinc-900 border border-zinc-800 ${sys.accent} group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all`}>
                      <sys.icon size={24} />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-sm font-black italic text-white uppercase leading-none tracking-tight">{sys.title}</h4>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1.5 tracking-wider">{sys.desc}</p>
                   </div>
                   <ChevronRight size={18} className="text-zinc-800 group-hover:text-white transition-colors" />
                </motion.div>
              ))}
              
              {/* Platform Status Bar */}
              <div className="p-8 rounded-[2.5rem] bg-zinc-900/10 border border-zinc-900/30 flex items-center gap-5">
                 <div className="w-12 h-12 rounded-full bg-green-500/5 border border-green-500/10 flex items-center justify-center text-green-500/40">
                    <Activity size={20} className="animate-pulse" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-1">Platform Status</p>
                    <p className="text-xs font-black text-zinc-600 uppercase italic">Command Node: Optimal</p>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;

