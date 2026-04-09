import React, { useState, useEffect } from "react";
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
          adminData.allPreferences
            .filter((p: any) => p.zwid === a.zwid)
            .forEach((p: any) => {
              prefs[p.time_slot_id] = p.preference_level;
            });

          const avails: Record<number, string> = {};
          adminData.allAvailabilities
            .filter((v: any) => v.athlete_id === a.zwid)
            .forEach((v: any) => {
              avails[v.round_id] = v.status;
            });

          return {
            zwid: a.zwid,
            name: a.name,
            team: a.team || "N/A",
            category: a.base_category || "N/A",
            preferences: prefs,
            availabilities: avails,
          };
        });

        setAthletes(mapped);
      } catch (e: any) {
        console.error("API ERROR:", e);

        let errorMessage = "Errore durante il recupero dati";

        if (typeof e?.message === "string") {
          errorMessage = e.message;
        }

        setMessage({
          type: "error",
          text: `Errore: ${errorMessage}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------------------------
  // FILTER
  // ---------------------------
  const filteredAthletes = athletes.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.zwid.toString().includes(searchTerm);

    const matchesCategory =
      filterCategory === "ALL" || a.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // ---------------------------
  // ICON STATUS
  // ---------------------------
  const getStatusIcon = (status?: string) => {
    if (status === "available") {
      return <CheckCircle2 className="text-emerald-500" size={18} />;
    }
    if (status === "unavailable") {
      return <XCircle className="text-rose-500" size={18} />;
    }
    if (status === "tentative") {
      return <HelpCircle className="text-orange-500" size={18} />;
    }
    return <HelpCircle className="text-zinc-700" size={18} />;
  };

  // ---------------------------
  // EXPORT
  // ---------------------------
  const exportData = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      athletes: filteredAthletes,
      rounds,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `inox_export_${new Date()
      .toISOString()
      .split("T")[0]}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  // ---------------------------
  // LOADING
  // ---------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-orange-500 font-black italic text-xl animate-pulse uppercase tracking-widest">
          LOADING DATA...
        </div>
      </div>
    );
  }

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="p-6">
      {/* HEADER */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-orange-500 text-xs uppercase font-black tracking-widest">
            Admin Command
          </span>
          <h1 className="text-4xl font-black italic text-white uppercase mt-1">
            Availability Matrix
          </h1>
        </div>

        <button
          onClick={exportData}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-black font-black italic rounded-xl hover:scale-105 transition-all"
        >
          <Download size={18} />
          Export
        </button>
      </header>

      {/* MESSAGE */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/50 text-green-500"
              : "bg-red-500/10 border-red-500/50 text-red-500"
          }`}
        >
          <AlertCircle size={18} />
          <p>{message.text}</p>
        </div>
      )}

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search rider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white"
          />
        </div>

        <div className="flex gap-2">
          {["ALL", "A", "B", "C", "D"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-1 py-2 rounded-xl font-bold ${
                filterCategory === cat
                  ? "bg-cyan-400 text-black"
                  : "bg-zinc-900 text-zinc-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border border-zinc-800 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-900">
              <th className="p-3 text-left">Rider</th>
              {rounds.map((r) => (
                <th key={r.id} className="p-3 text-center">
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredAthletes.map((a) => (
              <tr key={a.zwid} className="border-t border-zinc-800">
                <td className="p-3">
                  <div className="font-bold text-white">{a.name}</div>
                  <div className="text-xs text-zinc-500">
                    {a.category} • {a.team}
                  </div>
                </td>

                {rounds.map((r) => (
                  <td key={r.id} className="text-center p-3">
                    {getStatusIcon(a.availabilities[r.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMPTY */}
      {filteredAthletes.length === 0 && (
        <div className="mt-6 text-center text-zinc-500">
          Nessun risultato
        </div>
      )}
    </div>
  );
};

export default AvailabilityManagement;