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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");

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
            .forEach((p: any) => { prefs[p.time_slot_id] = p.preference_level; });

          const avails: Record<number, string> = {};
          adminData.allAvailabilities
            .filter((v: any) => v.athlete_id === a.zwid)
            .forEach((v: any) => { avails[v.round_id] = v.status; });

          return { zwid: a.zwid, name: a.name, team: a.team || "N/A", category: a.base_category || "N/A", preferences: prefs, availabilities: avails };
        });

        setAthletes(mapped);
      } catch (e: any) {
        let errorMessage = "Errore durante il recupero dati";
        if (typeof e?.message === "string") errorMessage = e.message;
        setMessage({ type: "error", text: `Errore: ${errorMessage}` });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAthletes = athletes.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.zwid.toString().includes(searchTerm);
    const matchesCategory = filterCategory === "ALL" || a.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status?: string) => {
    if (status === "available") return <CheckCircle2 className="text-emerald-500" size={18} />;
    if (status === "unavailable") return <XCircle className="text-rose-500" size={18} />;
    if (status === "tentative") return <HelpCircle className="text-orange-500" size={18} />;
    return <HelpCircle className="text-zinc-700" size={18} />;
  };

  const exportData = () => {
    const payload = { generatedAt: new Date().toISOString(), athletes: filteredAthletes, rounds };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inox_export_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-orange-500 font-black italic text-xl animate-pulse uppercase tracking-widest">LOADING DATA...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER, FILTERS e TABLE */}
      {/* Il resto del render rimane identico al tuo file originale */}
    </div>
  );
};

export default AvailabilityManagement;