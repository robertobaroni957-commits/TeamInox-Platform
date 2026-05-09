import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import type { Round } from "../../services/types";
import {
  Download,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

interface AthleteAvail {
  zwid: number;
  name: string;
  team: string;
  category: string;
  preferences: Record<string, number>;
  availabilities: Record<number, string>;
}

const AvailabilityManagement: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [athletes, setAthletes] = useState<AthleteAvail[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");

  // ---------------------------
  // FETCH DATA
  // ---------------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const roundsData = await api.getRounds();
        setRounds(roundsData);

        const adminData = await api.getAllAvailabilities();

        const mapped: AthleteAvail[] = adminData.athletes.map((a: any) => {
          const prefs: Record<string, number> = {};
          (adminData.allPreferences || [])
            .filter((p: any) => p.zwid === a.zwid)
            .forEach((p: any) => {
              prefs[p.time_slot_id] = p.preference_level;
            });

          const avails: Record<number, string> = {};
          (adminData.allAvailabilities || [])
            .filter((v: any) => v.athlete_id === a.zwid)
            .forEach((v: any) => {
              avails[v.round_id] = v.status;
            });

          return {
            zwid: a.zwid,
            name: a.name,
            team: a.team || "N/A",
            category: (a.base_category || "N/A").trim().toUpperCase(),
            preferences: prefs,
            availabilities: avails,
          };
        });

        setAthletes(mapped);
      } catch (e: any) {
        console.error("API ERROR:", e);
        setMessage({
          type: "error",
          text: `Errore: ${e.message || "Errore nel caricamento dei dati"}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------------------------
  // FILTER LOGIC (Memoized)
  // ---------------------------
  const filteredAthletes = useMemo(() => {
    const filtered = athletes.filter((a) => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = searchLower === "" || 
                           a.name.toLowerCase().includes(searchLower) ||
                           a.zwid.toString().includes(searchLower);

      if (filterCategory === "ALL") return matchesSearch;

      const matchesCategory = (filterCategory === "A") 
        ? (a.category === "A" || a.category === "APLUS")
        : (a.category === filterCategory);

      return matchesSearch && matchesCategory;
    });

    // Sort alphabetically by name
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [athletes, searchTerm, filterCategory]);

  // ---------------------------
  // ICON STATUS
  // ---------------------------
  const getStatusIcon = (status?: string) => {
    if (status === "available") return <CheckCircle2 className="text-emerald-500" size={16} />;
    if (status === "unavailable") return <XCircle className="text-rose-500" size={16} />;
    if (status === "tentative") return <HelpCircle className="text-orange-500" size={16} />;
    return <HelpCircle className="text-zinc-800" size={16} />;
  };

  // ---------------------------
  // EXPORT
  // ---------------------------
  const exportData = () => {
    const payload = { generatedAt: new Date().toISOString(), athletes: filteredAthletes, rounds };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inox_avail_report_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-[#fc6719] font-black italic animate-pulse uppercase tracking-widest">Loading availability matrix...</div>
    </div>
  );

  // Stats Calculations
  const stats = {
    total: athletes.length,
    catA: athletes.filter(a => a.category === 'A' || a.category === 'APLUS').length,
    catB: athletes.filter(a => a.category === 'B').length,
    catC: athletes.filter(a => a.category === 'C').length,
    catD: athletes.filter(a => a.category === 'D').length,
    availableNow: athletes.filter(a => Object.values(a.availabilities).some(v => v === 'available')).length
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black italic text-white uppercase tracking-tight">Availability Matrix</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            Gestione disponibilità e reportistica ZRL
          </p>
        </div>
        <button onClick={exportData} className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
          <Download size={14} /> Export JSON
        </button>
      </header>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 p-5 rounded-[2rem] border border-zinc-800 hover:border-zinc-700 transition-all shadow-2xl">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Total Athletes</div>
          <div className="text-4xl font-black italic text-white leading-none">{stats.total}</div>
          <div className="w-full bg-zinc-800/50 h-1.5 rounded-full mt-5 overflow-hidden">
            <div className="bg-inox-orange h-full shadow-[0_0_10px_rgba(252,103,25,0.4)]" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-zinc-900/60 p-5 rounded-[2rem] border border-zinc-800 hover:border-zinc-700 transition-all shadow-2xl">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Category A/B</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black italic text-red-500 leading-none">{stats.catA}</span>
            <span className="text-zinc-600 font-bold">/</span>
            <span className="text-3xl font-black italic text-emerald-400 leading-none">{stats.catB}</span>
          </div>
          <div className="flex gap-1.5 mt-5">
            <div className="bg-red-600 h-1.5 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.3)]" style={{ width: `${(stats.catA/stats.total)*100}%` }} />
            <div className="bg-emerald-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${(stats.catB/stats.total)*100}%` }} />
          </div>
        </div>

        <div className="bg-zinc-900/60 p-5 rounded-[2rem] border border-zinc-800 hover:border-zinc-700 transition-all shadow-2xl">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Category C/D</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black italic text-inox-cyan leading-none">{stats.catC}</span>
            <span className="text-zinc-600 font-bold">/</span>
            <span className="text-3xl font-black italic text-yellow-400 leading-none">{stats.catD}</span>
          </div>
          <div className="flex gap-1.5 mt-5">
            <div className="bg-inox-cyan h-1.5 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.3)]" style={{ width: `${(stats.catC/stats.total)*100}%` }} />
            <div className="bg-yellow-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.3)]" style={{ width: `${(stats.catD/stats.total)*100}%` }} />
          </div>
        </div>

        <div className="bg-zinc-900/60 p-5 rounded-[2rem] border border-zinc-800 hover:border-zinc-700 transition-all shadow-2xl">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Active RSVPs</div>
          <div className="text-4xl font-black italic text-emerald-400 leading-none">{stats.availableNow}</div>
          <p className="text-[9px] text-zinc-500 font-bold uppercase mt-4 italic tracking-widest leading-relaxed">Atleti con feedback operativo rilevato</p>
        </div>
      </div>

      {message && (
        <div className={`p-5 rounded-2xl border flex items-center gap-4 text-xs font-black uppercase tracking-widest ${message.type === "success" ? "bg-green-500/10 border-green-500/40 text-green-400" : "bg-red-500/10 border-red-500/40 text-red-400"}`}>
          <AlertCircle size={18} /> {message.text}
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search by name or ZWID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-white focus:border-inox-orange focus:bg-zinc-900 outline-none transition-all shadow-inner"
          />
        </div>

        <div className="flex gap-2 p-1.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-inner">
          {["ALL", "A", "B", "C", "D"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterCategory === cat 
                  ? (cat === 'A' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' :
                     cat === 'B' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                     cat === 'C' ? 'bg-inox-cyan text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]' :
                     cat === 'D' ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' :
                     'bg-[#fc6719] text-black shadow-[0_0_15px_rgba(252,103,25,0.4)]')
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-800/40">
                <th className="p-4 text-left border-b border-zinc-700 sticky left-0 bg-zinc-800 z-10 min-w-[220px]">
                   <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Rider Intelligence</span>
                </th>
                {rounds.map((r) => (
                  <th key={r.id} className="p-4 text-center border-b border-zinc-700 min-w-[120px]">
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tighter leading-tight block">{r.name.replace('ZRL 2025 ', '')}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredAthletes.map((a) => (
                <tr key={a.zwid} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="p-4 sticky left-0 bg-zinc-900/80 group-hover:bg-zinc-800/60 z-10 transition-colors backdrop-blur-md">
                    <div className="font-black text-sm text-white uppercase italic tracking-tighter leading-tight">{a.name}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${
                        a.category === 'A' || a.category === 'APLUS' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        a.category === 'B' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        a.category === 'C' ? 'bg-inox-cyan/10 text-inox-cyan border-inox-cyan/20' :
                        a.category === 'D' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>CAT {a.category}</span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase truncate max-w-[120px] tracking-widest">{a.team}</span>
                    </div>
                  </td>
                  {rounds.map((r) => (
                    <td key={r.id} className="p-4 text-center">
                      <div className="flex justify-center transform group-hover:scale-110 transition-transform">
                        {getStatusIcon(a.availabilities[r.id])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAthletes.length === 0 && (
        <div className="py-24 text-center bg-zinc-900/30 border border-zinc-800 border-dashed rounded-[2.5rem]">
          <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">No riders match the current operational filters</p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManagement;
