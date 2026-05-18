import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Loader2, Lock } from 'lucide-react';

export type NodeStatus = 'pending' | 'active' | 'completed' | 'failed' | 'blocked';

export interface TimelineNodeData {
  id: string;
  title: string;
  status: NodeStatus;
  timestamp?: string;
  duration?: string;
  error?: string;
}

const getStatusStyles = (status: NodeStatus) => {
  switch (status) {
    case 'completed': return 'text-green-500 bg-green-500/10';
    case 'active': return 'text-orange-500 bg-orange-500/10 animate-pulse';
    case 'failed': return 'text-red-500 bg-red-500/10';
    case 'blocked': return 'text-zinc-500 bg-zinc-800';
    default: return 'text-zinc-600';
  }
};

export const TimelineNode: React.FC<{ data: TimelineNodeData; isLast: boolean }> = ({ data, isLast }) => {
  const Icon = {
    completed: CheckCircle2,
    active: Loader2,
    failed: AlertCircle,
    blocked: Lock,
    pending: Circle
  }[data.status];

  return (
    <div className="relative flex gap-4 pb-8">
      {!isLast && <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-zinc-800" />}
      
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-zinc-800 bg-zinc-950 z-10 ${getStatusStyles(data.status)}`}>
        <Icon size={20} className={data.status === 'active' ? 'animate-spin' : ''} />
      </div>
      
      <div className="flex-1 pt-1">
        <h4 className="text-xs font-black uppercase tracking-widest text-white">{data.title}</h4>
        {data.timestamp && <p className="text-[9px] text-zinc-500 font-bold uppercase">{data.timestamp} {data.duration && `(${data.duration})`}</p>}
        {data.error && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{data.error}</p>}
      </div>
    </div>
  );
};
