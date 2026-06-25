import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileJson2, Layers3, Link2, ShieldAlert, Timer, Trophy } from 'lucide-react';
import { hasPermission } from '../services/permissions';
import { getWinterTourNextStage, winterTourRepository, type WinterTourStage } from '../services/winterTour';

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

const WinterTourManagement: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('guest');
  const [stages, setStages] = useState<WinterTourStage[]>([]);
  const [cumulativeLoaded, setCumulativeLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRole(readStoredRole());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadOperations = async () => {
      setLoading(true);
      setError(null);

      try {
        const [loadedStages] = await Promise.all([
          winterTourRepository.loadStages(),
          winterTourRepository.loadCumulativeResults().then(() => {
            if (isMounted) {
              setCumulativeLoaded(true);
            }
          }),
        ]);

        if (isMounted) {
          setStages(loadedStages);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Impossibile leggere i dati Winter Tour.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOperations();

    return () => {
      isMounted = false;
    };
  }, []);

  const canManage = hasPermission(role, 'wt.manage');
  const raceSnapshots = useMemo(() => winterTourRepository.listAvailableRaceSnapshots(), []);
  const nextStage = useMemo(() => getWinterTourNextStage(stages), [stages]);
  const seasonLabel = useMemo(() => {
    if (stages.length === 0) {
      return 'Winter Tour';
    }

    const firstYear = new Date(stages[0].date).getFullYear();
    const lastYear = new Date(stages[stages.length - 1].date).getFullYear();

    return `${firstYear}/${String(lastYear).slice(-2)}`;
  }, [stages]);

  if (!canManage) {
    return (
      <div className="rounded-[2.5rem] border border-red-500/30 bg-red-500/10 p-8 text-red-200">
        <div className="mb-4 inline-flex rounded-2xl bg-red-500/10 p-3 text-red-400">
          <ShieldAlert size={22} />
        </div>
        <h1 className="text-3xl font-black italic uppercase">Accesso riservato</h1>
        <p className="mt-3 text-sm text-red-100/80">Questo pannello operativo è disponibile solo per i ruoli con permesso `wt.manage`.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-xl font-black italic uppercase tracking-[0.2em] text-[#fc6719]">Loading Winter Operations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2.5rem] border border-red-500/30 bg-red-500/10 p-8 text-red-300">
        <h1 className="text-2xl font-black uppercase">Winter Tour operations unavailable</h1>
        <p className="mt-3 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 text-white">
      <header className="flex flex-col gap-5 border-b border-zinc-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate('/winter-tour')}
            className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-3 text-zinc-400 transition hover:border-[#fc6719]/40 hover:text-[#fc6719]"
          >
            <ChevronLeft size={22} className="transition group-hover:-translate-x-1" />
          </button>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Winter Tour <span className="text-[#fc6719]">Operations</span>
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
              File-based integration inside INOXTEAM PLATFORM
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/winter-tour"
            className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-100 transition hover:border-inox-cyan"
          >
            Apri Hub
          </Link>
          <Link
            to="/ranking"
            className="rounded-2xl bg-[#fc6719] px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-black transition hover:scale-[1.02]"
          >
            Apri Classifiche
          </Link>
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Season', value: seasonLabel, icon: Trophy },
          { label: 'Stages', value: stages.length, icon: Layers3 },
          { label: 'Snapshots', value: raceSnapshots.length, icon: FileJson2 },
          { label: 'Cumulative', value: cumulativeLoaded ? 'READY' : 'MISSING', icon: Timer },
        ].map((item) => (
          <div key={item.label} className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-4 inline-flex rounded-2xl bg-[#fc6719]/10 p-3 text-[#fc6719]">
              <item.icon size={18} />
            </div>
            <div className="text-3xl font-black italic text-white">{item.value}</div>
            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black italic uppercase">Stato integrazione</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Il modulo MWT è stato portato dentro la piattaforma come sorgente file-based, senza dipendenze da database.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Hub front-end unificato', status: 'OK', desc: 'Dashboard card e pagina dedicata Winter Tour dentro il layout principale.' },
              { title: 'Calendario ufficiale', status: 'OK', desc: 'Tappe e metadati route lette direttamente dal dataset MWT integrato.' },
              { title: 'Classifica generale', status: cumulativeLoaded ? 'OK' : 'CHECK', desc: 'Snapshot cumulato consumato direttamente dalla piattaforma.' },
              { title: 'Tool esterni Python', status: 'READY', desc: 'Contratto file pronto per essere collegato a un ingest automatizzato successivo.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-zinc-800 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black uppercase tracking-tight text-white">{item.title}</h3>
                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-300">
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black italic uppercase">Manifest sorgenti</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Queste sono le sorgenti che oggi il frontend utilizza come base dell&apos;integrazione MWT.
            </p>
          </div>

          <div className="space-y-4">
            {[
              'modules/MWT-main1/stages.json',
              'modules/MWT-main1/cumulative_results.json',
              ...raceSnapshots.map((snapshot) => `modules/MWT-main1/${snapshot.fileName}`),
            ].map((source) => (
              <div key={source} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black/20 px-4 py-3">
                <div className="rounded-xl bg-white/5 p-2 text-inox-cyan">
                  <Link2 size={16} />
                </div>
                <span className="text-sm font-medium text-zinc-300">{source}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black italic uppercase">Copertura risultati</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Snapshot di tappa già disponibili per il frontend integrato.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {raceSnapshots.map((snapshot) => (
            <div key={snapshot.stageId} className="rounded-2xl border border-zinc-800 bg-black/20 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Stage {snapshot.stageId}</div>
              <div className="mt-1 text-sm font-bold text-white">{snapshot.fileName}</div>
            </div>
          ))}
          {raceSnapshots.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-sm text-zinc-500">
              Nessuno snapshot di tappa disponibile.
            </div>
          )}
        </div>

        {nextStage && (
          <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-black/20 p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Next scheduled stage</div>
            <div className="mt-2 text-xl font-black italic text-white">{nextStage.route.it}</div>
            <div className="mt-1 text-sm text-zinc-400">{new Date(nextStage.date).toLocaleString('it-IT')}</div>
          </div>
        )}
      </section>

      <section className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black italic uppercase">Contratto per tool esterni</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Per completare il prodotto, il prossimo step naturale è collegare i generatori esterni a questo contratto dati.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            'Input raw per tappa: fin.json, fal_<cat>.json, fts_<cat>.json',
            'Output per snapshot tappa: gara_<n>_results.json',
            'Output cumulato: cumulative_results.json',
            'Fase successiva: endpoint/API o upload admin che aggiorni queste sorgenti',
          ].map((item) => (
            <div key={item} className="rounded-[1.75rem] border border-zinc-800 bg-black/20 p-5 text-sm text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WinterTourManagement;

