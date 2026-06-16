import React, { useState, useEffect } from "react";
import { RefreshCw, Zap, Trophy, MessageSquare, Share2, Send, Activity } from "lucide-react";
import { useSyncZRL } from "../hooks/useSyncZRL";
import AdminTutorPanel from "../components/admin/AdminTutorPanel";
import { unifiedOps } from "../services/zrlUnifiedOperationsModel";
import { AI_FEATURE_REGISTRY as AiFeatureRegistry } from "../services/aiFeatureRegistry";
import { AiFeatureCard } from "../components/AiFeatureCard";
import { AiReportCard } from "../components/AiReportCard";
import type { ZRLOperation } from "@zrl-contract";

const ZRLCommandCenter: React.FC = () => {
  const UI_MODE = "LEGACY_STABLE";
  if (UI_MODE !== "LEGACY_STABLE") {
    throw new Error("AI UI modifications disabled");
  }

  const { isSyncing, status, runSync } = useSyncZRL();
  const [ops, setOps] = useState<ZRLOperation[]>([]);
  const isAdmin = true;

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
      
      {/* LEGACY UI (Stable, Do Not Touch) */}
      <section className="w-full h-80">
        <AdminTutorPanel />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
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

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-gray-400">Sync Controls</h2>
            <button
                onClick={runSync}
                disabled={isSyncing}
                className={`w-full px-6 py-3 rounded-xl font-bold uppercase text-white transition-all ${
                    isSyncing ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
                } flex items-center justify-center gap-2`}
            >
                <RefreshCw className={isSyncing ? "animate-spin" : ""} size={20} />
                {isSyncing ? "Sincronizzazione..." : "Sync WTRL"}
            </button>
        </section>
      </div>

      {/* NEW AI LAYER (Safe Addition) */}
      <div className="mt-8 space-y-10">

        {/* =========================
            AI FEATURES SECTION
        ========================= */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">AI Reporting Engine</h2>
            <span className="text-sm text-slate-400">v2.2 Unified System</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {AiFeatureRegistry.map((feature) => (
              <AiFeatureCard
                key={feature.id}
                feature={feature}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </section>

        {/* =========================
            LIVE AI REPORTS
        ========================= */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Live AI Reports</h2>
          <div className="grid grid-cols-2 gap-4">
            <AiReportCard type="race" />
            <AiReportCard type="season" />
          </div>
        </section>

        {/* =========================
            QUICK AI ACTIONS
        ========================= */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Quick AI Actions</h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-sm">
              Generate Race Report
            </button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-sm">
              Generate Season Report
            </button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-sm">
              View AI Queue
            </button>
          </div>
        </section>

      </div>
      
    </div>
  );
};

export default ZRLCommandCenter;
