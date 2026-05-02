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

  const adminModules = [
    {
      title: "User Management",
      desc: "Gestisci ruoli, permessi e importazione atleti dal database centrale.",
      icon: Users,
      path: "/admin/users",
      color: "from-blue-500/10 to-blue-600/5",
      iconColor: "text-blue-500"
    },
    {
      title: "ZRL Operations",
      desc: "Configurazione stagioni, sincronizzazione WTRL e gestione lineup operativa.",
      icon: Zap,
      path: "/zrl-operations",
      color: "from-[#fc6719]/10 to-[#fc6719]/5",
      iconColor: "text-[#fc6719]"
    },
    {
      title: "Event Config",
      desc: "Gestisci il calendario eventi settimanali, inclusi link Zwift e categorie.",
      icon: Settings,
      path: "/admin/events",
      color: "from-purple-500/10 to-purple-600/5",
      iconColor: "text-purple-500"
    },
    {
      title: "Winter Tour",
      desc: "Amministrazione del campionato interno Master Winter Tour e Hall of Fame.",
      icon: Trophy,
      path: "/winter-tour-management",
      color: "from-yellow-500/10 to-yellow-600/5",
      iconColor: "text-yellow-500"
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-800 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <Shield size={20} />
            </div>
            <span className="text-red-500 font-black text-xs tracking-[0.3em] uppercase italic">System Administration</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
            COMMAND <span className="text-zinc-700">CENTER</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">D1 Database: Connected</span>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Riders", value: stats.users, icon: Users },
          { label: "Official Teams", value: stats.teams, icon: Activity },
          { label: "Race Series", value: stats.series, icon: Trophy },
          { label: "Weekly Events", value: stats.events, icon: Layout }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-[2rem] bg-zinc-900/50 border border-zinc-800/50 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <stat.icon size={16} className="text-zinc-600" />
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Real-time</span>
            </div>
            <div>
              <p className="text-3xl font-black italic text-white leading-none">{loading ? "---" : stat.value}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Admin Modules Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminModules.map((module, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.01 }}
            onClick={() => navigate(module.path)}
            className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${module.color} border border-zinc-800 hover:border-zinc-700 cursor-pointer group transition-all relative overflow-hidden`}
          >
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
              <module.icon size={200} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl bg-zinc-950 border border-zinc-800 ${module.iconColor}`}>
                  <module.icon size={24} />
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:bg-[#fc6719] group-hover:border-[#fc6719] transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
              
              <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-2">{module.title}</h3>
              <p className="text-zinc-500 text-sm font-medium italic leading-relaxed max-w-[80%]">{module.desc}</p>
              
              <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Operational</span>
                <span className="text-[9px] font-bold text-[#fc6719] uppercase tracking-widest flex items-center gap-2">
                   Access Module <ExternalLink size={10} />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Smart Insights & Suggestions */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Lightbulb size={20} className="text-orange-500" />
          <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Admin Intelligence</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Missing Data Card */}
          <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-black italic text-white uppercase leading-none">Dati Mancanti</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Check database integrity</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-xs font-bold text-zinc-400">Atleti senza Categoria</span>
                <span className={`text-sm font-black ${insights.missingCategory > 0 ? 'text-red-500' : 'text-zinc-600'}`}>{insights.missingCategory}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-xs font-bold text-zinc-400">Atleti senza Email</span>
                <span className={`text-sm font-black ${insights.missingEmail > 0 ? 'text-red-500' : 'text-zinc-600'}`}>{insights.missingEmail}</span>
              </div>
            </div>
            
            {insights.missingCategory > 0 && (
              <button 
                onClick={() => navigate('/admin/users')}
                className="w-full py-3 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Vai alla gestione utenti
              </button>
            )}
          </div>

          {/* Registration Status */}
          <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-inox-cyan/10 rounded-2xl text-inox-cyan">
                <UserPlus size={24} />
              </div>
              <div>
                <h4 className="font-black italic text-white uppercase leading-none">Onboarding</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Registrazioni pendenti</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-xs font-bold text-zinc-400">Profili da Completare</span>
                <span className="text-sm font-black text-inox-cyan">{insights.pendingRegistration}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-xs font-bold text-zinc-400">Roster Attivo (RSVP)</span>
                <span className="text-sm font-black text-emerald-500">{insights.activeRoster}</span>
              </div>
            </div>

            <p className="text-[9px] text-zinc-600 font-medium italic leading-tight">
               Suggerimento: Invia una mail agli atleti "importati" per invitarli a completare il profilo.
            </p>
          </div>

          {/* Team Health */}
          <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500">
                <Zap size={24} />
              </div>
              <div>
                <h4 className="font-black italic text-white uppercase leading-none">Team Health</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Struttura squadre</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-xs font-bold text-zinc-400">Squadre senza Capitano</span>
                <span className={`text-sm font-black ${insights.teamsNeedingCaptain > 0 ? 'text-yellow-500' : 'text-zinc-600'}`}>{insights.teamsNeedingCaptain}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-xs font-bold text-zinc-400">Totale Squadre ZRL</span>
                <span className="text-sm font-black text-white">{stats.teams}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/zrl-operations')}
              className="w-full py-3 bg-zinc-800 hover:bg-yellow-500/20 text-zinc-400 hover:text-yellow-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Configura Squadre
            </button>
          </div>
        </div>
      </section>

      {/* Advanced Maintenance */}
      <section className="p-8 rounded-[3rem] bg-zinc-950 border border-zinc-900">
        <div className="flex items-center gap-3 mb-8">
          <Database size={16} className="text-zinc-600" />
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Advanced Maintenance</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/zrl-round-manager')}
            className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-red-500/30 transition-all text-left group"
          >
            <RefreshCw size={18} className="text-zinc-700 group-hover:text-red-500 mb-4 transition-colors" />
            <p className="text-xs font-black text-white uppercase italic">Hard Reset Rounds</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Svuota lineup e RSVP</p>
          </button>
          
          <button className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 opacity-40 cursor-not-allowed text-left">
            <Lock size={18} className="text-zinc-700 mb-4" />
            <p className="text-xs font-black text-white uppercase italic">System Logs</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Audit trail (Coming soon)</p>
          </button>

          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                <Activity size={18} />
             </div>
             <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Platform Status</p>
                <p className="text-xs font-black text-green-500 uppercase italic">All Systems Nominal</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
