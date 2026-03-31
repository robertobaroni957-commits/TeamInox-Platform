import React, { useState, useEffect, useCallback } from 'react';

interface Rider {
  zwid: number;
  name: string;
  tname?: string;
  flag?: string;
  category: string;
  total?: number;
  time?: number;
  tempo_time?: number;
  pts_sprint?: number;
  pts_kom?: number;
  fin?: number;
  [key: string]: any;
}

const ageCategoryMap: Record<string, string> = { 'A': '0-29', 'B': '30-39', 'C': '40-49', 'D': '50-59', 'E': '60+' };

const Ranking: React.FC = () => {
  const [language, setLanguage] = useState<'it' | 'en'>('it');
  const [races, setRaces] = useState<{ text: string; value: string }[]>([]);
  const [selectedRace, setSelectedRace] = useState('cumulative');
  const [selectedCategory, setSelectedCategory] = useState('A');
  const [selectedType, setSelectedType] = useState('punti');
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string) => {
    const translations: any = {
      'title': { it: 'CLASSIFICHE TOUR', en: 'TOUR RANKINGS' },
      'subtitle': { it: 'Seleziona una gara, la classifica e un gruppo di età.', en: 'Select a race, ranking, and age group.' },
      'race': { it: 'Gara:', en: 'Race:' },
      'category': { it: 'Categoria:', en: 'Category:' },
      'ranking': { it: 'Classifica:', en: 'Ranking:' },
      'loading': { it: 'Caricamento classifica...', en: 'Loading ranking...' },
      'no_data': { it: 'Nessun dato disponibile.', en: 'No data available.' },
      'individual': { it: 'Individuale', en: 'Individual' },
      'cumulative': { it: 'Generale (Cumulata)', en: 'General (Cumulative)' },
      'time': { it: 'Tempo', en: 'Time' },
      'points': { it: 'Punti', en: 'Points' },
      'sprinter': { it: 'Punti Sprinter', en: 'Sprinter Points' },
      'climber': { it: 'Punti Scalatore', en: 'Climber Points' },
      'pos': { it: 'Pos', en: 'Pos' },
      'athlete': { it: 'Atleta', en: 'Athlete' },
      'team': { it: 'Squadra', en: 'Team' }
    };
    return translations[key]?.[language] || key;
  };

  const secondsToHms = (d: number | undefined) => {
    if (d === undefined || d === null || isNaN(d) || d === 0) return "--:--:--.---";
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor(d % 60);
    const ms = Math.round((d - Math.floor(d)) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  const loadRaces = useCallback(async () => {
    const availableRaces = [
      { text: t('cumulative'), value: 'cumulative' },
      ...Array.from({ length: 17 }, (_, i) => ({
        text: `Gara ${i + 1}`,
        value: `Gara_Masters_Winter_Tour_-_Stage_${i + 1}_risultati.json`
      }))
    ];
    setRaces(availableRaces);
  }, [language]);

  const loadRanking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = selectedRace === 'cumulative' ? '/cumulative_results.json' : `/${selectedRace}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('File not found');
      const jsonData = await response.json();
      
      let data: Rider[] = [];
      if (selectedRace === 'cumulative') {
        data = jsonData.results[selectedCategory] || [];
      } else {
        data = (jsonData.race_results || []).filter((r: any) => r.category === selectedCategory);
      }

      const isTime = selectedType === 'tempo';
      const scoreKey = selectedRace === 'cumulative' 
        ? (isTime ? 'time' : (selectedType === 'punti' ? 'total' : (selectedType === 'sprinter' ? 'pts_sprint' : 'pts_kom')))
        : (isTime ? 'tempo_time' : (selectedType === 'punti' ? 'tempo_time' : (selectedType === 'sprinter' ? 'pts_sprint' : 'pts_kom')));

      const sorted = [...data].sort((a, b) => {
        const valA = a[scoreKey] || (isTime ? Infinity : 0);
        const valB = b[scoreKey] || (isTime ? Infinity : 0);
        return isTime ? valA - valB : valB - valA;
      });

      setRiders(sorted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedRace, selectedCategory, selectedType]);

  useEffect(() => { loadRaces(); }, [loadRaces]);
  useEffect(() => { loadRanking(); }, [loadRanking]);

  return (
    <div className="p-6 min-h-screen bg-zinc-950 text-white">
      <header className="mb-8 border-b border-zinc-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase">
            {t('title')} <span className="text-inox-orange">2025/26</span>
          </h1>
          <p className="text-zinc-500 font-medium italic">{t('subtitle')}</p>
        </div>
        <button 
          onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-bold hover:border-inox-orange transition-all uppercase"
        >
          {language === 'it' ? '🇮🇹 Italian' : '🇬🇧 English'}
        </button>
      </header>

      <div className="flex flex-wrap gap-4 mb-8 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{t('race')}</label>
          <select 
            value={selectedRace} 
            onChange={(e) => setSelectedRace(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:border-inox-orange outline-none"
          >
            {races.map(r => <option key={r.value} value={r.value}>{r.text}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{t('category')}</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:border-inox-orange outline-none"
          >
            {Object.keys(ageCategoryMap).map(cat => <option key={cat} value={cat}>{ageCategoryMap[cat]}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{t('ranking')}</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:border-inox-orange outline-none"
          >
            <option value="punti">{t('points')}</option>
            <option value="tempo">{t('time')}</option>
            <option value="sprinter">{t('sprinter')}</option>
            <option value="scalatore">{t('climber')}</option>
          </select>
        </div>
      </div>

      <div className="bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-20 text-center text-inox-orange font-black italic animate-pulse">{t('loading')}</div>
        ) : error ? (
          <div className="p-20 text-center text-red-500 font-bold italic">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">{t('pos')}</th>
                  <th className="px-6 py-4">{t('athlete')}</th>
                  <th className="px-6 py-4">{t('team')}</th>
                  <th className="px-6 py-4">{selectedType.toUpperCase()}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {riders.map((rider, index) => {
                  const rank = index + 1;
                  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                  
                  return (
                    <tr key={rider.zwid} className="hover:bg-zinc-800/20 transition-all group">
                      <td className="px-6 py-5 font-black text-xl italic">
                        {medal ? <span className="text-2xl">{medal}</span> : <span className="text-zinc-700">#{rank}</span>}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {rider.flag && <img src={`https://flagcdn.com/w20/${rider.flag.toLowerCase()}.png`} alt="" className="h-3" />}
                          <span className="font-bold text-white uppercase tracking-tight group-hover:text-inox-orange transition-colors">{rider.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                        {rider.tname || t('individual')}
                      </td>
                      <td className="px-6 py-5 font-black text-inox-orange italic text-lg">
                        {selectedType === 'tempo' ? secondsToHms(rider.time || rider.tempo_time) : `${rider.total || rider.pts_sprint || rider.pts_kom || 0} PTS`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {riders.length === 0 && <div className="p-20 text-center text-zinc-700 font-black italic">{t('no_data')}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;
