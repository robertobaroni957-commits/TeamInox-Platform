import React from 'react';
import { LogEntry } from '../../hooks/useLiveLogs';

const getStatusColor = (status: LogEntry['status']) => {
  switch (status) {
    case 'success': return 'text-green-400';
    case 'warning': return 'text-yellow-400';
    case 'error': return 'text-red-400';
    default: return 'text-blue-400';
  }
};

export const LogRow: React.FC<{ log: LogEntry }> = ({ log }) => (
  <div className="font-mono text-[10px] py-1 border-b border-zinc-800/50 flex gap-3 hover:bg-zinc-800/20 transition-colors">
    <span className="text-zinc-500 shrink-0">{log.timestamp.split('T')[1]?.split('.')[0]}</span>
    <span className={`uppercase font-bold shrink-0 w-16 ${getStatusColor(log.status)}`}>{log.status}</span>
    <span className="text-white font-bold shrink-0 w-24">{log.action}</span>
    <span className="text-zinc-300 break-all">{log.message}</span>
    {log.error && <span className="text-red-600 font-bold">ERR: {log.error}</span>}
  </div>
);
