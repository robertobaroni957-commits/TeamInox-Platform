import React from 'react';
import { SectionType } from './types';
import { Zap, BarChart2, Quote, AlertTriangle } from 'lucide-react';

// Generic Section Block for fallback
const SectionBlock = ({ type, content }: { type: string, content: string }) => (
    <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
        <div className="flex items-center gap-3 mb-4 text-zinc-400">
            <span className="font-black uppercase tracking-widest text-[10px]">{type}</span>
        </div>
        <p className="text-zinc-300 font-medium italic">{content}</p>
    </div>
);

// Component Registry
const Registry: Record<SectionType, React.FC<{ content: string }>> = {
    performance: ({ content }) => (
        <div className="bg-purple-900/10 p-6 rounded-3xl border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4 text-purple-400"><Zap size={20} /> <span className="font-black uppercase tracking-widest text-[10px]">Performance</span></div>
            <p className="text-white font-medium italic">{content}</p>
        </div>
    ),
    analysis: ({ content }) => (
        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
            <div className="flex items-center gap-3 mb-4 text-zinc-400"><BarChart2 size={20} /> <span className="font-black uppercase tracking-widest text-[10px]">Analysis</span></div>
            <p className="text-zinc-300 font-medium italic">{content}</p>
        </div>
    ),
    highlight: ({ content }) => (
        <div className="bg-orange-900/10 p-6 rounded-3xl border border-orange-500/20">
            <div className="flex items-center gap-3 mb-4 text-orange-400"><Quote size={20} /> <span className="font-black uppercase tracking-widest text-[10px]">Highlight</span></div>
            <p className="text-orange-100 font-bold italic">{content}</p>
        </div>
    )
};

export const SectionMapper = ({ type, content }: { type: string, content: string }) => {
    const Component = Registry[type as SectionType] || SectionBlock;
    return <Component type={type} content={content} />;
};
