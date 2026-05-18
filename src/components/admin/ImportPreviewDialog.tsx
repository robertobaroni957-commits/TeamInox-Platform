import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  stats: { new: number, updated: number, skipped: number };
  preview: any[];
}

export const ImportPreviewDialog: React.FC<Props> = ({ isOpen, onClose, onConfirm, title, stats, preview }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-900/20 p-3 rounded text-green-400 font-bold">New: {stats.new}</div>
            <div className="bg-blue-900/20 p-3 rounded text-blue-400 font-bold">Updated: {stats.updated}</div>
            <div className="bg-zinc-800 p-3 rounded text-zinc-400 font-bold">Skipped: {stats.skipped}</div>
        </div>
        <div className="max-h-60 overflow-y-auto bg-zinc-950 p-4 rounded text-xs font-mono text-zinc-300">
            {JSON.stringify(preview.slice(0, 5), null, 2)}
        </div>
        <div className="flex gap-2 justify-end pt-4">
            <button className="px-4 py-2 rounded bg-zinc-800 text-white" onClick={onClose}>Annulla</button>
            <button className="px-4 py-2 rounded bg-[#fc6719] text-white" onClick={onConfirm}>Conferma Import</button>
        </div>
      </div>
    </div>
  );
};
