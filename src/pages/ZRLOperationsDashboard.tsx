import React, { useState, useEffect } from "react";
import AdminTutorPanel from "../components/admin/AdminTutorPanel";
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
    <div className="flex flex-col h-full bg-gray-50 p-8 gap-8 overflow-y-auto">
      {/* 1. Hero: Round-Centric Tutor */}
      <section className="w-full h-80">
        <AdminTutorPanel />
      </section>

      {/* 2. Main Operational Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Active Pipelines (2/3 width) */}
        <section className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-gray-400">Round Pipelines</h2>
            {(!ops || ops.length === 0) ? (
                <div className="p-10 border-2 border-dashed rounded-2xl text-center text-gray-400 font-bold">
                    Nessuna pipeline attiva nel sistema.
                </div>
            ) : (
                <div className="space-y-4">
                    {ops.map(o => (
                    <div key={o.id} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex justify-between items-center hover:border-blue-200 transition-colors">
                        <div>
                            <div className="font-black text-lg text-gray-900">{o.seasonId}</div>
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">{o.status}</div>
                        </div>
                    </div>
                    ))}
                </div>
            )}
        </section>

        {/* Quick Access / Stats (1/3 width) */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-gray-400">Round Context</h2>
            <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-900 text-white font-bold">
                    Monitoraggio in tempo reale attivo
                </div>
                <div className="text-[10px] text-gray-400 font-black uppercase italic">
                    Dati sincronizzati con il workflow round-centrico attivo.
                </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default ZRLOperationsDashboard;
