import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Shield, 
  Trophy, 
  Activity, 
  ChevronRight,
  Zap,
  Layout,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Search,
  Menu,
  Database,
  Crosshair
} from 'lucide-react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

type MobileView = 'MISSIONS' | 'INTELLIGENCE' | 'SYSTEMS';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<MobileView>('MISSIONS');
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

  const missionGates = [
    {
      id: 'zrl',
      title: "ZRL MISSION",
      subtitle: "Zwift Racing League",
      desc: "Gestione roster e sync WTRL.",
      icon: Zap,
      path: "/zrl-operations",
      color: "from-[#fc6719] to-orange-600",
      status: series.find(s => s.is_active)?.name || "Nessuna",
      accent: "#fc6719",
      action: "DEPLOY",
      stats: { label: "RSVP", value: insights.activeRoster }
    },
    {
      id: 'winter',
      title: "WINTER LAB",
      subtitle: "Master Winter Tour",
      desc: "Punteggi e Hall of Fame.",
      icon: Trophy,
      path: "/winter-tour-management",
      color: "from-yellow-400 to-yellow-600",
      status: "Config Punti",
      accent: "#facc15",
      action: "MANAGE",
      stats: { label: "Events", value: stats.events }
    }
  ];

  const systemModules = [
    { title: "Database", icon: Users, path: "/admin/users", accent: "text-blue-500" },
    { title: "Events", icon: Layout, path: "/admin/events", accent: "text-purple-500" },
    { title: "Maintenance", icon: RefreshCw, path: "/zrl-round-manager", accent: "text-red-500" }
  ];

  if (loading) return null;

  return (
    <div className="h-[calc(100vh-80px)] lg:h-[calc(100vh-40px)] flex flex-col overflow-hidden bg-black text-white p-2 lg:p-4 gap-4">
      
      {/* HEADER COMPACT */}
      <header className="flex flex-shrink-0 items-center justify-between px-4 py-3 bg-zinc-950/50 border border-zinc-900 rounded-[2rem] lg:rounded-[2.5rem]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
            <Shield size={18} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-xl lg:text-3xl font-black italic tracking-tighter uppercase leading-none">
              COMMAND <span className="text-zinc-700">CENTER</span>
            </h1>
            <p className="hidden lg:block text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">Authorized Tactical Node // Operational Status: Green</p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Global Strength</span>
             <span className="text-sm font-black italic leading-none">{stats.users} Riders</span>
          </div>
          <div className="w-px h-6 bg-zinc-900 hidden md:block" />
          <div className="hidden md:flex flex-col items-end">
             <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Units Deployed</span>
             <span className="text-sm font-black italic text-[#fc6719] leading-none">{stats.teams} Teams</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT: MISSIONS (Desktop: Cols 8, Mobile: Switchable) */}
          <section className={`lg:col-span-8 h-full flex flex-col gap-4 \${activeView !== 'MISSIONS' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex items-center gap-2 px-2">
              <Crosshair size={14} className="text-[#fc6719]" />
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Tactical Missions</h2>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {missionGates.map((gate) => (
                <motion.div
                  key={gate.id}
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(gate.path)}
                  className="group relative rounded-[2.5rem] bg-zinc-950 border border-zinc-900 overflow-hidden cursor-pointer shadow-xl flex flex-col"
                >
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl \${gate.color} opacity-[0.03] blur-3xl`} />
                  <div className="relative z-10 p-6 lg:p-8 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl group-hover:border-[#fc6719]/50 transition-colors">
                        <gate.icon size={28} className="text-white" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                          <span className="text-[7px] font-black text-white uppercase tracking-widest">{gate.status}</span>
                        </div>
                        <div className="text-[10px] font-black italic text-[#fc6719]">{gate.stats.label}: {gate.stats.value}</div>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <span className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.2em] mb-1 block">{gate.subtitle}</span>
                      <h3 className="text-2xl lg:text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{gate.title}</h3>
                      <p className="text-zinc-500 text-[10px] lg:text-xs font-medium italic mt-2 opacity-80">{gate.desc}</p>
                      <button className="mt-4 w-full py-2.5 bg-white text-black font-black italic uppercase rounded-xl text-[9px] tracking-widest group-hover:bg-[#fc6719] group-hover:text-white transition-all">
                        {gate.action}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* RIGHT: INTELLIGENCE & SYSTEMS (Desktop: Cols 4, Mobile: Switchable) */}
          <section className={`lg:col-span-4 h-full flex flex-col gap-4 \${activeView === 'MISSIONS' ? 'hidden lg:flex' : 'flex'}`}>
            
            {/* INTELLIGENCE SECTION */}
            <div className={`flex flex-col gap-4 flex-1 \${activeView === 'SYSTEMS' ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex items-center gap-2 px-2">
                <Lightbulb size={14} className="text-yellow-500" />
                <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Intelligence</h2>
              </div>
              <div className="flex-1 p-6 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 shadow-xl space-y-4 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <AlertTriangle size={18} className="text-red-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Database Anomalies</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-zinc-900/40 rounded-xl border border-zinc-800">
                    <span className="text-[9px] font-black text-zinc-500 uppercase">Missing Category</span>
                    <span className={`text-sm font-black italic \${insights.missingCategory > 0 ? 'text-red-500' : 'text-zinc-700'}`}>{insights.missingCategory}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-900/40 rounded-xl border border-zinc-800">
                    <span className="text-[9px] font-black text-zinc-500 uppercase">Missing Email</span>
                    <span className={`text-sm font-black italic \${insights.missingEmail > 0 ? 'text-red-500' : 'text-zinc-700'}`}>{insights.missingEmail}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 pt-2">
                  <Activity size={18} className="text-inox-cyan" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Roster Health</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-zinc-900/40 rounded-xl border border-zinc-800">
                    <span className="text-[9px] font-black text-zinc-500 uppercase">Weekly RSVP</span>
                    <span className="text-sm font-black italic text-inox-cyan">{insights.activeRoster}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-900/40 rounded-xl border border-zinc-800">
                    <span className="text-[9px] font-black text-zinc-500 uppercase">No Captain</span>
                    <span className={`text-sm font-black italic \${insights.teamsNeedingCaptain > 0 ? 'text-yellow-500' : 'text-zinc-700'}`}>{insights.teamsNeedingCaptain}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SYSTEMS SECTION */}
            <div className={`flex flex-col gap-4 flex-shrink-0 \${activeView === 'INTELLIGENCE' ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex items-center gap-2 px-2">
                <Settings size={14} className="text-zinc-500" />
                <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Core Nodes</h2>
              </div>
              <div className="p-4 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 shadow-xl space-y-2">
                {systemModules.map((sys, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(sys.path)}
                    className="p-3 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 cursor-pointer flex items-center gap-4 transition-all group"
                  >
                    <div className={`p-2 rounded-lg bg-black border border-zinc-800 \${sys.accent} group-hover:scale-110 transition-transform`}>
                      <sys.icon size={14} />
                    </div>
                    <span className="text-[10px] font-black italic text-white uppercase flex-1">{sys.title}</span>
                    <ChevronRight size={12} className="text-zinc-700 group-hover:text-white" />
                  </div>
                ))}
              </div>
            </div>

          </section>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden flex-shrink-0 h-16 bg-zinc-950 border border-zinc-900 rounded-[2rem] flex items-center justify-around px-2 relative z-50">
        {[
          { id: 'MISSIONS', icon: Crosshair, label: 'Missions' },
          { id: 'INTELLIGENCE', icon: Lightbulb, label: 'Intel' },
          { id: 'SYSTEMS', icon: Database, label: 'Systems' }
        ].map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as MobileView)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all \${
                isActive ? 'text-[#fc6719] bg-[#fc6719]/10' : 'text-zinc-600'
              }`}
            >
              <tab.icon size={18} strokeWidth={isActive ? 3 : 2} />
              <span className="text-[7px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
};

export default AdminDashboard;
