import React, { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

const ZRLManagement: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleFullSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/sync-all-teams", { method: "POST" });
      const data = await res.json();
      if (data.success) setSyncStatus({ success: true, message: data.message });
      else setSyncStatus({ success: false, message: data.error || "Errore durante la sincronizzazione" });
    } catch (err) {
      setSyncStatus({ success: false, message: "Errore di rete o server non raggiungibile" });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <button
        onClick={handleFullSync}
        disabled={isSyncing}
        className={`px-6 py-3 rounded-xl font-bold uppercase text-white ${isSyncing ? "bg-gray-500 cursor-not-allowed" : "bg-orange-500 hover:scale-105"}`}
      >
        <RefreshCw className={isSyncing ? "animate-spin inline mr-2" : "inline mr-2"} size={18} />
        {isSyncing ? "Sincronizzazione in corso..." : "Sync WTRL Teams & Rosters"}
      </button>

      {syncStatus && (
        <div className={`p-4 mt-4 rounded-lg ${syncStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} flex items-center gap-2`}>
          {syncStatus.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{syncStatus.message}</span>
        </div>
      )}
    </div>
  );
};

export default ZRLManagement;