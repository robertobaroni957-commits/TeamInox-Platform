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
    return athletes.filter((a) => {
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
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Athletes</div>
          <div className="text-3xl font-black italic text-white leading-none">{stats.total}</div>
          <div className="w-full bg-zinc-800 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-inox-orange h-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Category A/B</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black italic text-red-500 leading-none">{stats.catA}</span>
            <span className="text-zinc-700 font-bold">/</span>
            <span className="text-2xl font-black italic text-emerald-500 leading-none">{stats.catB}</span>
          </div>
          <div className="flex gap-1 mt-4">
            <div className="bg-red-600 h-1 rounded-full" style={{ width: `${(stats.catA/stats.total)*100}%` }} />
            <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${(stats.catB/stats.total)*100}%` }} />
          </div>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Category C/D</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black italic text-inox-cyan leading-none">{stats.catC}</span>
            <span className="text-zinc-700 font-bold">/</span>
            <span className="text-2xl font-black italic text-yellow-500 leading-none">{stats.catD}</span>
          </div>
          <div className="flex gap-1 mt-4">
            <div className="bg-inox-cyan h-1 rounded-full" style={{ width: `${(stats.catC/stats.total)*100}%` }} />
            <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${(stats.catD/stats.total)*100}%` }} />
          </div>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Active RSVPs</div>
          <div className="text-3xl font-black italic text-emerald-500 leading-none">{stats.availableNow}</div>
          <p className="text-[8px] text-zinc-600 font-bold uppercase mt-3 italic">Atleti con almeno una disponibilità data</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-bold ${message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-red-500/10 border-red-500/30 text-red-500"}`}>
          <AlertCircle size={16} /> {message.text}
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input
            type="text"
            placeholder="Search by name or ZWID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-[#fc6719] outline-none transition-all"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-zinc-950 border border-zinc-900 rounded-xl">
          {["ALL", "A", "B", "C", "D"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                filterCategory === cat 
                  ? (cat === 'A' ? 'bg-red-600 text-white shadow-lg' :
                     cat === 'B' ? 'bg-emerald-600 text-white shadow-lg' :
                     cat === 'C' ? 'bg-inox-cyan text-black shadow-lg' :
                     cat === 'D' ? 'bg-yellow-500 text-black shadow-lg' :
                     'bg-[#fc6719] text-black shadow-lg')
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-900/50">
                <th className="p-3 text-left border-b border-zinc-800 sticky left-0 bg-zinc-900 z-10 min-w-[200px]">
                   <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Rider / Category</span>
                </th>
                {rounds.map((r) => (
                  <th key={r.id} className="p-3 text-center border-b border-zinc-800 min-w-[100px]">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter leading-tight block">{r.name.replace('ZRL 2025 ', '')}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredAthletes.map((a) => (
                <tr key={a.zwid} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="p-3 sticky left-0 bg-zinc-950 group-hover:bg-zinc-900/50 z-10 transition-colors">
                    <div className="font-bold text-xs text-white truncate">{a.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                        a.category === 'A' || a.category === 'APLUS' ? 'bg-red-500/10 text-red-500' :
                        a.category === 'B' ? 'bg-emerald-500/10 text-emerald-500' :
                        a.category === 'C' ? 'bg-inox-cyan/10 text-inox-cyan' :
                        a.category === 'D' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-zinc-800 text-zinc-500'
                      }`}>Cat {a.category}</span>
                      <span className="text-[8px] text-zinc-600 font-bold uppercase truncate max-w-[100px]">{a.team}</span>
                    </div>
                  </td>
                  {rounds.map((r) => (
                    <td key={r.id} className="p-3 text-center">
                      {getStatusIcon(a.availabilities[r.id])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAthletes.length === 0 && (
        <div className="py-20 text-center bg-zinc-950 border border-zinc-900 border-dashed rounded-2xl">
          <p className="text-zinc-700 text-xs font-black uppercase tracking-widest">No riders match the current filters</p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManagement;
