/**
 * NarrativeRenderer.tsx
 * Robust, failure-resistant renderer for AI Narrative.
 */
import React from 'react';
import { NarrativeResponse, NarrativeSection, isNarrativeResponse } from './types';
import { SectionMapper } from './SectionMapper';
import { StatsGrid } from './StatsGrid';
import { AlertTriangle } from 'lucide-react';

export const NarrativeRenderer = ({ data }: { data: any }) => {
    console.debug("[NarrativeRenderer] Data received:", data);
    
    // 1. Strict Contract Validation
    if (!isNarrativeResponse(data)) {
        return (
            <div className="p-8 bg-red-900/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500">
                <AlertTriangle />
                <div>
                    <p className="font-black uppercase tracking-widest text-sm">UI Contract Violation</p>
                    <pre className="text-[10px] mt-2 opacity-70">{JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="border-b border-zinc-800 pb-6">
                <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">{data.title}</h1>
                <p className="text-zinc-400 mt-2 font-medium">{data.summary}</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {data.sections.map((section: NarrativeSection, idx: number) => (
                    <SectionMapper key={idx} type={section.type} content={section.content} />
                ))}
            </div>

            {data.stats && data.stats.length > 0 && <StatsGrid stats={data.stats} />}
        </div>
    );
};
