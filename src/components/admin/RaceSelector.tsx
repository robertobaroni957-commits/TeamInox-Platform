import React, { useMemo } from 'react';
import { useActiveRound } from '../../context/ActiveRoundContext';

export default function RaceSelector({ 
    onRaceSelect, 
    selectedRaceId 
}: { 
    onRaceSelect: (race: any) => void,
    selectedRaceId?: number 
}) {
    const { activeRound } = useActiveRound();

    const races = useMemo(() => {
        if (!activeRound || !activeRound.races) return [];
        
        // Pulizia: Filtriamo solo le gare che appartengono chiaramente al round attivo
        // basandoci sul nome del round.
        const activeRoundName = activeRound.name.toLowerCase();
        
        const raceMap = new Map();
        activeRound.races.forEach((race: any) => {
            // Se la gara contiene il nome del round o il round è generico, la includiamo
            if (race.name.toLowerCase().includes(activeRoundName) || activeRoundName.includes('round')) {
                const key = `${race.world}_${race.route}_${race.date}`;
                if (!raceMap.has(key)) {
                    raceMap.set(key, {
                        id: race.id,
                        name: race.name,
                        date: race.date,
                        world: race.world || 'UNK',
                        route: race.route || 'Unknown Route'
                    });
                }
            }
        });
        return Array.from(raceMap.values())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [activeRound]);

    const formatRaceDate = (dateString: string) => {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "N/D" : date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        const race = races.find(r => r.id === id);
        if (race) onRaceSelect(race);
    };

    return (
        <select 
            value={selectedRaceId || ''} 
            onChange={handleChange}
            className="bg-zinc-900 border border-zinc-800 text-white text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 transition-all w-full shadow-lg appearance-none cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23666\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
        >
            <option value="" disabled className="text-zinc-500">-- Scegli Gara --</option>
            {races.map((race: any) => (
                <option key={race.id} value={race.id}>
                    {race.name} ({formatRaceDate(race.date)} • {(race.world || 'UNK').substring(0,3).toUpperCase()})
                </option>
            ))}
            {races.length === 0 && <option disabled>Nessuna gara disponibile</option>}
        </select>
    );
}

