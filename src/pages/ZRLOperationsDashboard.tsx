import React, { useState, useEffect } from "react";
import { Activity, History, List, Info, AlertCircle } from "lucide-react";
import { unifiedOps } from "../services/zrlUnifiedOperationsModel";
import type { ZRLOperation } from "@zrl-contract";

const ZRLOperationsDashboard: React.FC = () => {
  const [ops, setOps] = useState<ZRLOperation[]>([]);

  useEffect(() => {
    const refresh = () => {
        const currentOps = unifiedOps.getOperationsList() || [];
        setOps([...currentOps]);
    };
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 p-8">
      <main className="flex-1 overflow-y-auto">
        <h1 className="text-3xl font-black mb-8">ZRL Control</h1>
        
        {(!ops || ops.length === 0) && (
            <div className="p-10 border-2 border-dashed text-center text-gray-500">
                Nessuna pipeline attiva.
            </div>
        )}

        {ops && ops.map(o => (
          <div key={o.id} className="bg-white p-6 rounded-2xl shadow-sm border mb-4">
            <div className="font-bold text-xl">{o.seasonId}</div>
            <div className="text-sm text-gray-500">{o.status}</div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ZRLOperationsDashboard;
