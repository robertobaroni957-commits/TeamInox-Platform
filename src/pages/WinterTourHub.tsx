import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, ExternalLink, Shield, Star, Timer, Trophy } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { hasPermission } from '../services/permissions';
import {
  buildCumulativeRankingRows,
  formatWinterTourDate,
  formatWinterTourRankingValue,
  getLocalizedValue,
  getWinterTourNextStage,
  sortWinterTourRankingRows,
  winterTourAgeCategoryMap,
  winterTourRepository,
  type WinterTourCategory,
  type WinterTourLanguage,
  type WinterTourRankingMode,
  type WinterTourStage,
} from '../services/winterTour';

const chartColors = ['#fc6719', '#00f0ff', '#f59e0b', '#10b981', '#a855f7', '#ef4444'];

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

const getCountdownParts = (targetDate?: string) => {
  if (!targetDate) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  const distance = new Date(targetDate).getTime() - Date.now();

  if (distance <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

const WinterTourHub: React.FC = () => {
  const [role, setRole] = useState('guest');
  const [language, setLanguage] = useState<WinterTourLanguage>('it');
  const [stages, setStages] = useState<WinterTourStage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WinterTourCategory>('A');
  const [selectedRankingMode, setSelectedRankingMode] = useState<WinterTourRankingMode>('punti');
  const [selectedWorld, setSelectedWorld] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedStageId, setExpandedStageId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(getCountdownParts());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<ReturnType<typeof sortWinterTourRankingRows>>([]);
  const [processedRaces, setProcessedRaces] = useState(0);

  useEffect(() => {
    setRole(readStoredRole());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadHubData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [loadedStages, cumulativeResults] = await Promise.all([
          winterTourRepository.loadStages(),
          winterTourRepository.loadCumulativeResults(),
        ]);

        if (!isMounted) {
          return;
        }

        setStages(loadedStages);
        setProcessedRaces(cumulativeResults.races_processed || winterTourRepository.listAvailableRaceSnapshots().length);
        setPreviewRows(
          sortWinterTourRankingRows(
            buildCumulativeRankingRows(cumulativeResults, selectedCategory),
            selectedRankingMode,
          ).slice(0, 5),
        );
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Errore nel caricamento Winter Tour.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHubData();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedRankingMode]);

  const nextStage = useMemo(() => getWinterTourNextStage(stages), [stages]);
  const canManage = hasPermission(role, 'wt.manage');

  useEffect(() => {
    setCountdown(getCountdownParts(nextStage?.date));

    const intervalId = window.setInterval(() => {
      setCountdown(getCountdownParts(nextStage?.date));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [nextStage]);

  const worldOptions = useMemo(
    () => [...new Set(stages.map((stage) => getLocalizedValue(stage.world, language)))].sort(),
    [language, stages],
  );

  const typeOptions = useMemo(
    () => [...new Set(stages.map((stage) => getLocalizedValue(stage.type, language)))].sort(),
    [language, stages],
  );

  const filteredStages = useMemo(
    () =>
      stages.filter((stage) => {
        const world = getLocalizedValue(stage.world, language);
        const type = getLocalizedValue(stage.type, language);

        return (selectedWorld === 'all' || world === selectedWorld) && (selectedType === 'all' || type === selectedType);
      }),
    [language, selectedType, selectedWorld, stages],
  );

  const chartData = useMemo(() => {
    const counts = stages.reduce<Record<string, number>>((accumulator, stage) => {
      const typeLabel = getLocalizedValue(stage.type, language);
      accumulator[typeLabel] = (accumulator[typeLabel] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [language, stages]);

  const stats = useMemo(() => {
    const worlds = new Set(stages.map((stage) => getLocalizedValue(stage.world, language)));
    const mountainStages = stages.filter((stage) =>
      getLocalizedValue(stage.type, language).toLowerCase().includes('mountain'),
    ).length;

    return {
      totalStages: stages.length,
      raceWindows: new Set(stages.map((stage) => `${new Date(stage.date).getFullYear()}-${new Date(stage.date).getMonth()}`)).size,
      worlds: worlds.size,
      mountainStages,
    };
  }, [language, stages]);

  const t = (key: string) => {
    const translations: Record<string, Record<WinterTourLanguage, string>> = {
      title: { it: 'MASTER WINTER TOUR HUB', en: 'MASTER WINTER TOUR HUB' },
      subtitle: {
        it: 'Calendario, countdown, classifiche e snapshot ufficiali integrati direttamente dentro INOXTEAM PLATFORM.',
        en: 'Calendar, countdown, rankings and official snapshots integrated directly into INOXTEAM PLATFORM.',
      },
      rankings: { it: 'Classifiche complete', en: 'Full rankings' },
      operations: { it: 'Pannello operativo', en: 'Operations panel' },
      nextRace: { it: 'Prossima gara', en: 'Next race' },
      noNextRace: { it: 'Tour completato o senza nuove tappe pianificate.', en: 'Tour completed or no upcoming stages planned.' },
      analytics: { it: 'Analisi del tour', en: 'Tour analysis' },
      stages: { it: 'Calendario tappe', en: 'Stage calendar' },
      filtersWorld: { it: 'Mondo', en: 'World' },
      filtersType: { it: 'Tipo', en: 'Type' },
      allWorlds: { it: 'Tutti i mondi', en: 'All worlds' },
      allTypes: { it: 'Tutti i tipi', en: 'All types' },
      stageDetails: { it: 'Dettagli tappa', en: 'Stage details' },
      routeDetails: { it: 'Dettagli percorso', en: 'Route details' },
      register: { it: 'Iscriviti', en: 'Register' },
      noStages: { it: 'Nessuna tappa trovata con questi filtri.', en: 'No stages found with the selected filters.' },
      rankingsPreview: { it: 'Preview classifica generale', en: 'General standings preview' },
      externalPipeline: { it: 'Pipeline dati esterna', en: 'External data pipeline' },
      externalPipelineDesc: {
        it: 'Le classifiche restano file-based, ma ora sono consumate dal frontend unico della piattaforma.',
        en: 'Rankings stay file-based, but are now consumed by the unified platform frontend.',
      },
      stagesLoaded: { it: 'Tappe integrate', en: 'Integrated stages' },
      raceSnapshots: { it: 'Snapshot classifiche', en: 'Ranking snapshots' },
      category: { it: 'Categoria', en: 'Category' },
      ranking: { it: 'Ranking', en: 'Ranking' },
      athlete: { it: 'Atleta', en: 'Athlete' },
      team: { it: 'Squadra', en: 'Team' },
      score: { it: 'Valore', en: 'Value' },
      points: { it: 'Punti', en: 'Points' },
      time: { it: 'Tempo', en: 'Time' },
      sprinter: { it: 'Sprinter', en: 'Sprinter' },
      climber: { it: 'Scalatore', en: 'Climber' },
      days: { it: 'Giorni', en: 'Days' },
      hours: { it: 'Ore', en: 'Hours' },
      minutes: { it: 'Minuti', en: 'Minutes' },
      seconds: { it: 'Secondi', en: 'Seconds' },
      tourCoverage: { it: 'Copertura dati', en: 'Data coverage' },
      sourceOne: { it: 'Calendar & route metadata', en: 'Calendar & route metadata' },
      sourceTwo: { it: 'General classification snapshots', en: 'General classification snapshots' },
      sourceThree: { it: 'Single-stage imported snapshots', en: 'Single-stage imported snapshots' },
      sourceFour: { it: 'Python calculator / external tools ready to connect', en: 'Python calculator / external tools ready to connect' },
    };

    return translations[key]?.[language] || key;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-inox-orange">
        <div className="text-xl font-black italic uppercase tracking-[0.2em]">Loading Winter Tour...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-red-300">
        <h1 className="text-2xl font-black uppercase">Winter Tour unavailable</h1>
        <p className="mt-3 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 text-white">
      <section className="overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900">
        <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-300">
                Winter Tour
              </span>
              <button
                onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-300 transition hover:border-inox-orange hover:text-white"
              >
                {language === 'it' ? '🇮🇹 IT' : '🇬🇧 EN'}
              </button>
            </div>

            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white md:text-6xl">
                {t('title')}
              </h1>
              <p className="mt-4 max-w-3xl text-sm text-zinc-400 md:text-base">{t('subtitle')}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/ranking"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#fc6719] px-5 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-black transition hover:scale-[1.02]"
              >
                <Trophy size={15} />
                {t('rankings')}
              </Link>
              {canManage && (
                <Link
                  to="/winter-tour-management"
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-100 transition hover:border-inox-orange"
                >
                  <Shield size={15} />
                  {t('operations')}
                </Link>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: t('days'), value: countdown.days },
                { label: t('hours'), value: countdown.hours },
                { label: t('minutes'), value: countdown.minutes },
                { label: t('seconds'), value: countdown.seconds },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-zinc-800 bg-black/30 p-4 text-center">
                  <div className="text-4xl font-black italic text-[#00f0ff]">{item.value}</div>
                  <div className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5 rounded-[2rem] border border-zinc-800 bg-black/30 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-inox-cyan/10 p-3 text-inox-cyan">
                <Timer size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t('nextRace')}</p>
                <p className="text-lg font-black italic uppercase text-white">
                  {nextStage ? getLocalizedValue(nextStage.route, language) : t('noNextRace')}
                </p>
              </div>
            </div>

            {nextStage && (
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#fc6719]" />
                  <span>{formatWinterTourDate(nextStage.date, language)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-[#fc6719]" />
                  <span>{getLocalizedValue(nextStage.world, language)}</span>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{t('tourCoverage')}</div>
                  <div className="mt-2 text-xl font-black italic text-white">
                    {processedRaces}/{stages.length}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">{t('raceSnapshots')}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        {[
          { label: t('stagesLoaded'), value: stats.totalStages, icon: CalendarDays },
          { label: 'Worlds', value: stats.worlds, icon: Star },
          { label: 'Windows', value: stats.raceWindows, icon: Timer },
          { label: 'Mountain', value: stats.mountainStages, icon: Trophy },
        ].map((item) => (
          <div key={item.label} className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-4 inline-flex rounded-2xl bg-[#fc6719]/10 p-3 text-[#fc6719]">
              <item.icon size={18} />
            </div>
            <div className="text-4xl font-black italic text-white">{item.value}</div>
            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-black italic uppercase">{t('analytics')}</h2>
            <p className="mt-2 text-sm text-zinc-500">{t('externalPipelineDesc')}</p>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '1rem',
                    color: '#fff',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black italic uppercase">{t('rankingsPreview')}</h2>
              <p className="mt-2 text-sm text-zinc-500">{winterTourAgeCategoryMap[selectedCategory]}</p>
            </div>
            <Link
              to="/ranking"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-200 transition hover:border-inox-orange"
            >
              {t('rankings')}
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="mb-5 flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as WinterTourCategory)}
              className="rounded-xl border border-zinc-800 bg-black px-4 py-2 text-sm text-white outline-none focus:border-[#fc6719]"
            >
              {Object.entries(winterTourAgeCategoryMap).map(([categoryKey, label]) => (
                <option key={categoryKey} value={categoryKey}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={selectedRankingMode}
              onChange={(event) => setSelectedRankingMode(event.target.value as WinterTourRankingMode)}
              className="rounded-xl border border-zinc-800 bg-black px-4 py-2 text-sm text-white outline-none focus:border-[#fc6719]"
            >
              <option value="punti">{t('points')}</option>
              <option value="tempo">{t('time')}</option>
              <option value="sprinter">{t('sprinter')}</option>
              <option value="scalatore">{t('climber')}</option>
            </select>
          </div>

          <div className="space-y-3">
            {previewRows.map((row, index) => (
              <div
                key={`${row.zwid}-${selectedRankingMode}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-zinc-800 bg-black/20 px-4 py-3"
              >
                <div className="text-lg font-black italic text-zinc-500">#{index + 1}</div>
                <div>
                  <div className="font-black uppercase tracking-tight text-white">{row.name}</div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    {row.tname || 'Individual'}
                  </div>
                </div>
                <div className="text-right text-sm font-black italic text-[#fc6719]">
                  {formatWinterTourRankingValue(row, selectedRankingMode)}
                </div>
              </div>
            ))}
            {previewRows.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
                No ranking snapshot available for this view.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black italic uppercase">{t('stages')}</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Il calendario del progetto Master Winter Tour è ora letto direttamente dal modulo integrato.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedWorld}
              onChange={(event) => setSelectedWorld(event.target.value)}
              className="rounded-xl border border-zinc-800 bg-black px-4 py-2 text-sm text-white outline-none focus:border-[#fc6719]"
            >
              <option value="all">{t('allWorlds')}</option>
              {worldOptions.map((world) => (
                <option key={world} value={world}>
                  {world}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="rounded-xl border border-zinc-800 bg-black px-4 py-2 text-sm text-white outline-none focus:border-[#fc6719]"
            >
              <option value="all">{t('allTypes')}</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredStages.map((stage) => {
            const isExpanded = expandedStageId === stage.id;

            return (
              <div key={stage.id} className="rounded-[2rem] border border-zinc-800 bg-black/20 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <button
                    onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                    className="text-left"
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Stage {stage.id}</div>
                    <h3 className="mt-2 text-2xl font-black italic text-white">{getLocalizedValue(stage.route, language)}</h3>
                    <div className="mt-2 text-sm text-zinc-400">
                      {formatWinterTourDate(stage.date, language)} · {getLocalizedValue(stage.world, language)} ·{' '}
                      {getLocalizedValue(stage.type, language)}
                    </div>
                  </button>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={stage.routeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-100 transition hover:border-inox-cyan"
                    >
                      {t('routeDetails')}
                      <ExternalLink size={14} />
                    </a>
                    <a
                      href={stage.registerLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#fc6719] px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-black transition hover:scale-[1.02]"
                    >
                      {t('register')}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {isExpanded && stage.segments.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                    <div className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                      {t('stageDetails')}
                    </div>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      {stage.segments.map((segment, index) => (
                        <li key={`${stage.id}-${index}`} className="flex gap-3">
                          <span className="mt-1 h-2 w-2 rounded-full bg-[#fc6719]" />
                          <span>{getLocalizedValue(segment, language)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {filteredStages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
              {t('noStages')}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-black italic uppercase">{t('externalPipeline')}</h2>
          <p className="mt-2 text-sm text-zinc-500">{t('externalPipelineDesc')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[t('sourceOne'), t('sourceTwo'), t('sourceThree'), t('sourceFour')].map((label, index) => (
            <div key={label} className="rounded-[1.75rem] border border-zinc-800 bg-black/20 p-5">
              <div className="mb-3 inline-flex rounded-2xl bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                Source {index + 1}
              </div>
              <p className="text-sm font-bold text-zinc-200">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WinterTourHub;