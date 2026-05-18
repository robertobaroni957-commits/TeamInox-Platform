import React, { useState, useEffect } from "react";
import { Play, Pause, Square, List } from "lucide-react";
import { unifiedOps } from "../services/zrlUnifiedOperationsModel";
import type { ZRLOperation } from "@zrl-contract";
import { pipelineOrchestrator } from "../services/zrlPipelineOrchestrator";

const ZRLRoundManagerWizard: React.FC = () => {
  const [ops, setOps] = useState<ZRLOperation[]>(unifiedOps.getOperationsList());
  const [activeOp, setActiveOp] = useState<ZRLOperation | null>(null);

  const refresh = () => {
    setOps(unifiedOps.getOperationsList());
    if (activeOp) setActiveOp(unifiedOps.getActiveOperation());
  };

  const startNew = (year: number) => {
    pipelineOrchestrator.createInstance(year);
    refresh();
  };

  const selectOp = (id: string) => {
    unifiedOps.switchOperation(id);
    setActiveOp(unifiedOps.getActiveOperation());
  };

  // Poll for UI updates (minimale)
  useEffect(() => { const i = setInterval(refresh, 1000); return () => clearInterval(i); }, [activeOp]);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-72 bg-white border-r p-4">
        <h2 className="font-bold mb-4">Operations</h2>
        <button onClick={() => startNew(2026)} className="w-full bg-black text-white p-2 rounded mb-4 text-sm font-bold">New Operation</button>
        {ops.map(o => (
            <div key={o.id} onClick={() => selectOp(o.id)} className={`p-3 rounded cursor-pointer ${activeOp?.id === o.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                <div className="font-bold">Season {o.seasonId}</div>
                <div className="text-xs">{o.status}</div>
            </div>
        ))}
      </div>
      <div className="flex-1 p-8">
        {activeOp ? (
            <div>
                <h1 className="text-2xl font-black mb-4">Operation: {activeOp.id}</h1>
                <div className="flex gap-2 mb-6">
                    <button onClick={() => {}} className="bg-green-500 text-white px-4 py-2 rounded">Command Center</button>
                </div>
                <div className="bg-gray-900 text-white p-4 font-mono text-xs rounded-lg h-64 overflow-y-auto">
                    {activeOp.timeline.map((t, i) => <div key={i}>{t.message}</div>)}
                </div>
            </div>
        ) : <div>Select an operation</div>}
      </div>
    </div>
  );
};
export default ZRLRoundManagerWizard;