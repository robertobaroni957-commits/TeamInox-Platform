import React from 'react';
import { TimelineNode, TimelineNodeData } from './TimelineNode';

interface Props {
  steps: TimelineNodeData[];
}

export const SeasonTimeline: React.FC<Props> = ({ steps }) => {
  return (
    <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800">
      <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-8">System Lifecycle</h3>
      <div className="flex flex-col">
        {steps.map((step, idx) => (
          <TimelineNode 
            key={step.id} 
            data={step} 
            isLast={idx === steps.length - 1} 
          />
        ))}
      </div>
    </div>
  );
};
