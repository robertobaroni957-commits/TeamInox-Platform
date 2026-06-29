import React, { useEffect, useMemo, useState } from 'react';
import { hasPermission } from '../services/permissions';
import {
  buildCumulativeRankingRows,
  buildStageRankingRows,
  formatWinterTourRankingValue,
  sortWinterTourRankingRows,
  winterTourAgeCategoryMap,
  winterTourRepository,
  type WinterTourCategory,
  type WinterTourLanguage,
  type WinterTourRankingMode,
  type WinterTourRankingRow,
  type WinterTourStage,
} from '../services/winterTour';

const readStoredRole = () => {
  const token = localStorage.getItem('inox_token');

  if (!token) {
    return 'guest';
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'athlete' ? 'user' : payload.role || 'guest';
  } catch {
    return 'guest';
  }
};

const Ranking: React.FC = () => {
  const [role, setRole] = useState<string>('guest');
  useEffect(() => {
    setRole(readStoredRole());
  }, []);

  const [language, setLanguage] = useState<WinterTourLanguage>('it');
  const [stages, setStages] = useState<WinterTourStage[]>([]);
  const [selectedRace, setSelectedRace] = useState('cumulative');
  const [selectedCategory, setSelectedCategory] = useState<WinterTourCategory>('A');
  const [selectedType, setSelectedType] = useState<WinterTourRankingMode>('punti');
  const [riders, setRiders] = useState<WinterTourRankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string) => {
    const translations: Record<string, Record<WinterTourLanguage, string>> = {
      'hub': { it: 'Winter Tour Hub', en: 'Winter Tour Hub' },
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
      'team': { it: 'Squadra', en: 'Team' },
      'coverage': { it: 'Snapshot disponibili', en: 'Available snapshots' }
    };
    return translations[key]?.[language] || key;
  };

  const raceSnapshots = useMemo(() => winterTourRepository.listAvailableRaceSnapshots(), [stages]);

  const raceOptions = useMemo(
    () => [
      { text: t('cumulative'), value: 'cumulative' },
      ...raceSnapshots.map((snapshot) => {
        const stage = stages.find((entry) => entry.id === snapshot.stageId);
        const routeLabel = stage ? stage.route[language] : `Stage ${snapshot.stageId}`;

        return {
          text: `${t('race')} ${snapshot.stageId} · ${routeLabel}`,
          value: `stage:${snapshot.stageId}`,
        };
      }),
    ],
    [language, raceSnapshots, stages],
  );

  useEffect(() => {
    let isMounted = true;

    const loadRanking = async () => {
      setLoading(true);
      setError(null);

      try {
        const loadedStages = stages.length > 0 ? stages : await winterTourRepository.loadStages();

        if (isMounted && stages.length === 0) {
          setStages(loadedStages);
        }

        let nextRows: WinterTourRankingRow[] = [];

        if (selectedRace === 'cumulative') {
          const cumulativeResults = await winterTourRepository.loadCumulativeResults();
          nextRows = buildCumulativeRankingRows(cumulativeResults, selectedCategory);
        } else {
          const selectedStageId = Number(selectedRace.replace('stage:', ''));
          const stageResults = await winterTourRepository.loadStageResults(selectedStageId);
          nextRows = buildStageRankingRows(stageResults, selectedCategory);
        }

        if (isMounted) {
          setRiders(sortWinterTourRankingRows(nextRows, selectedType));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load Winter Tour ranking.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRanking();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedRace, selectedType, stages]);

  return (
    <div className="p-6 min-h-screen bg-zinc-950 text-white">
      <header className="mb-8 border-b border-zinc-800 pb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black italic tracking-tighter uppercase">
              {t('title')} <span className="text-inox-orange">2025/26</span>
            </h1>
            <a href="/winter-tour" className="px-4 py-2 bg-zinc-900 text-white font-black italic uppercase rounded-lg text-[10px] hover:border-inox-cyan border border-zinc-800 transition-all">
              {t('hub')}
            </a>
            {hasPermission(role, 'wt.manage') && (
              <a href="/winter-tour-management" className="px-4 py-2 bg-yellow-600 text-white font-black italic uppercase rounded-lg text-[10px] hover:bg-yellow-700 transition-all">
                Amministrazione Tour
              </a>
            )}
          </div>
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
            {raceOptions.map(r => <option key={r.value} value={r.value}>{r.text}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{t('category')}</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:border-inox-orange outline-none"
          >
            {Object.entries(winterTourAgeCategoryMap).map(([cat, label]) => <option key={cat} value={cat}>{label}</option>)}
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
        <div className="ml-auto rounded-2xl border border-zinc-800 bg-black/20 px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{t('coverage')}</div>
          <div className="mt-1 text-lg font-black italic text-white">{raceSnapshots.length}</div>
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
                    <tr key={`${rider.zwid}-${selectedRace}-${selectedCategory}-${selectedType}`} className="hover:bg-zinc-800/20 transition-all group">
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
                        {formatWinterTourRankingValue(rider, selectedType)}
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
