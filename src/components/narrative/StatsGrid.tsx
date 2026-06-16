import React from 'react';
import { NarrativeStat } from './types';

export const StatsGrid = ({ stats }: { stats: NarrativeStat[] }) => {
    if (!stats || stats.length === 0) return null;
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 text-center">
                    <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">{stat.label}</p>
                    <p className="text-lg font-black text-white italic">{stat.value}</p>
                </div>
            ))}
        </div>
    );
};
