import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Copy, Trash2 } from 'lucide-react';
import { LogEntry } from '../../hooks/useLiveLogs';
import { LogRow } from './LogRow';

interface Props {
  logs: LogEntry[];
}

export const LiveLogPanel: React.FC<Props> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'error'>('all');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = filter === 'error' ? logs.filter(l => l.status === 'error') : logs;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
        <div className="flex items-center gap-2 text-zinc-400">
          <Terminal size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Live Operations Log</span>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setFilter(filter === 'all' ? 'error' : 'all')} className="text-[9px] font-black uppercase text-zinc-500 hover:text-white">
                {filter === 'all' ? 'Show Errors' : 'Show All'}
            </button>
            <button onClick={() => navigator.clipboard.writeText(JSON.stringify(logs))} className="text-zinc-500 hover:text-white"><Copy size={12}/></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredLogs.map(log => <LogRow key={log.id} log={log} />)}
      </div>
    </div>
  );
};
