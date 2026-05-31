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
        
        // Check questionnaire status and ZRL participation
        Promise.all([
            api.checkAvailabilityStatus(),
            api.getRoster(0) // Fetching with 0 to get all memberships potentially
        ]).then(([status, rosters]) => {
          setNeedsQuestionnaire(status.missing);
          // Check if user is in any ZRL roster
          setIsZRLParticipant(rosters.some(r => r.zwid === userObj.zwid));
        }).catch(err => console.error("Error fetching dashboard data:", err));

        // Fetch Stats
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

  const filteredMenuItems = DASHBOARD_CONFIG.filter(item => {
    // Permission check with participant context
    const hasPerm = hasPermission(user?.role, item.permission, isZRLParticipant);
    
    console.log(`[DEBUG] Item: ${item.id}, Permission: ${item.permission}, HasPerm: ${hasPerm}, Role: ${user?.role}, IsParticipant: ${isZRLParticipant}`);
    
    // Admin specific exclusion
    if (user?.role === 'admin' && item.id === 'zrl-questionnaire') {
      return false;
    }
    
    return hasPerm;
  });

  useEffect(() => {
    console.log("[DEBUG] Dashboard state:", { user, isZRLParticipant, needsQuestionnaire });
  }, [user, isZRLParticipant, needsQuestionnaire]);

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
            {user?.role === 'admin' && (
              <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Command Level</span>
              </div>
            )}
          </div>
          <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">
            HELLO, <span className="text-zinc-800">{user?.username || 'RIDER'}</span>
          </h1>
          <p className="text-zinc-500 font-bold italic text-sm uppercase tracking-widest max-w-xl">
             {user?.role === 'admin' 
               ? "Pannello di controllo globale. Monitora e gestisci l'intera infrastruttura InoxTeam."
               : "Benvenuto nel Deck Operativo. Seleziona un modulo per iniziare la tua sessione."}
          </p>
        </div>
      </section>

      {/* GLOBAL ALERTS (ZRL Questionnaire) */}
      {needsQuestionnaire && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/availability')}
          className="p-6 rounded-[2rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-orange-500 text-white shadow-xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black italic text-white uppercase tracking-tighter">Azione Richiesta: ZRL RSVP</h4>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Non hai ancora completato il questionario di disponibilità per il prossimo round.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-orange-500 font-black italic uppercase text-sm group-hover:gap-5 transition-all">
            Completa Ora <ArrowUpRight size={18} />
          </div>
        </motion.div>
      )}

      {/* PORTAL GRID (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenuItems.map((item) => (
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
        ))}
      </div>

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
