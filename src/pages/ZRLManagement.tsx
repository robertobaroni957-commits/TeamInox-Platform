import React from "react";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useSyncZRL } from "../hooks/useSyncZRL";

const ZRLManagement: React.FC = () => {
  const { isSyncing, status, runSync } = useSyncZRL();

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Sincronizzazione WTRL</h2>
        <p className="text-gray-600 mb-6">
          Scarica l'elenco aggiornato delle squadre INOX e i relativi roster direttamente da WTRL.
          Questa operazione aggiornerà sia la tabella squadre che quella degli atleti.
        </p>
        
        <button
          onClick={runSync}
          disabled={isSyncing}
          className={`px-6 py-3 rounded-xl font-bold uppercase text-white transition-all ${
            isSyncing 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-orange-500 hover:bg-orange-600 hover:scale-105 active:scale-95 shadow-lg shadow-orange-200"
          } flex items-center gap-2`}
        >
          <RefreshCw className={isSyncing ? "animate-spin" : ""} size={20} />
          {isSyncing ? "Sincronizzazione in corso..." : "Sync WTRL Teams & Rosters"}
        </button>

        {status && (
          <div className={`p-4 mt-6 rounded-xl flex items-start gap-3 border ${
            status.success 
              ? "bg-green-50 border-green-100 text-green-800" 
              : "bg-red-50 border-red-100 text-red-800"
          }`}>
            {status.success ? (
              <CheckCircle2 size={24} className="text-green-500 mt-0.5" />
            ) : (
              <AlertCircle size={24} className="text-red-500 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{status.success ? "Completato" : "Errore"}</p>
              <p className="text-sm opacity-90">{status.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZRLManagement;
