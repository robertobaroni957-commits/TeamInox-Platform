import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, FileJson2, Layers3, Link2, ShieldAlert, Timer, Trophy, 
  CalendarDays, Plus, Trash2, Edit2, Save, Download, Upload, Check, 
  AlertCircle, Settings, Play, Database
} from 'lucide-react';
import { hasPermission } from '../services/permissions';
import { getWinterTourNextStage, winterTourRepository, type WinterTourStage } from '../services/winterTour';

const readStoredRole = () => {
  const token = localStorage.getItem('inox_token');
  if (!token) return 'guest';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'athlete' ? 'user' : payload.role || 'guest';
  } catch {
    return 'guest';
  }
};

interface ScoringRule {
  type: 'FIN' | 'FTS' | 'FAL';
  position: number;
  points: number;
}

const WinterTourManagement: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('guest');
  const [stages, setStages] = useState<WinterTourStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tabs: 'stages' | 'scoring' | 'import'
  const [activeTab, setActiveTab] = useState<'stages' | 'scoring' | 'import'>('stages');

  // Authorization check
  useEffect(() => {
    setRole(readStoredRole());
  }, []);

  // Fetch Stages
  const fetchStages = async () => {
    try {
      const loadedStages = await winterTourRepository.loadStages();
      setStages(loadedStages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossibile leggere i dati delle tappe.');
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchStages(), fetchScoringRules()]);
      if (isMounted) setLoading(false);
    };
    init();
    return () => { isMounted = false; };
  }, []);

  const canManage = hasPermission(role, 'wt.manage');
  const nextStage = useMemo(() => getWinterTourNextStage(stages), [stages]);

  // ==========================================
  // TAB 1: CALENDAR / STAGES CRUD
  // ==========================================
  const [isEditing, setIsEditing] = useState(false);
  const [formStageId, setFormStageId] = useState<number | null>(null);
  const [formStageNumber, setFormStageNumber] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formWorldIt, setFormWorldIt] = useState('');
  const [formWorldEn, setFormWorldEn] = useState('');
  const [formRouteIt, setFormRouteIt] = useState('');
  const [formRouteEn, setFormRouteEn] = useState('');
  const [formTypeIt, setFormTypeIt] = useState('');
  const [formTypeEn, setFormTypeEn] = useState('');
  const [formRouteLink, setFormRouteLink] = useState('');
  const [formRegisterLink, setFormRegisterLink] = useState('');
  const [formZwiftEventId, setFormZwiftEventId] = useState('');
  const [formSegmentsJson, setFormSegmentsJson] = useState('');
  const [formStatus, setFormStatus] = useState<'scheduled' | 'published'>('scheduled');

  const handleEditStage = (stage: WinterTourStage) => {
    setFormStageId(stage.id);
    setFormStageNumber(stage.stage_number?.toString() || stage.id.toString());
    setFormDate(stage.date ? stage.date.substring(0, 16) : '');
    setFormWorldIt(stage.world.it);
    setFormWorldEn(stage.world.en);
    setFormRouteIt(stage.route.it);
    setFormRouteEn(stage.route.en);
    setFormTypeIt(stage.type.it);
    setFormTypeEn(stage.type.en);
    setFormRouteLink(stage.routeLink || '');
    setFormRegisterLink(stage.registerLink || '');
    setFormZwiftEventId(stage.zwift_event_id?.toString() || '');
    setFormSegmentsJson(JSON.stringify(stage.segments, null, 2));
    setFormStatus(stage.status || 'scheduled');
    setIsEditing(true);
  };

  const handleNewStage = () => {
    setFormStageId(null);
    setFormStageNumber((stages.length + 1).toString());
    setFormDate(new Date().toISOString().substring(0, 16));
    setFormWorldIt('');
    setFormWorldEn('');
    setFormRouteIt('');
    setFormRouteEn('');
    setFormTypeIt('');
    setFormTypeEn('');
    setFormRouteLink('');
    setFormRegisterLink('');
    setFormZwiftEventId('');
    setFormSegmentsJson('[\n  { "it": "Segmento 1", "en": "Segment 1" }\n]');
    setFormStatus('scheduled');
    setIsEditing(true);
  };

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    let parsedSegments = [];
    try {
      parsedSegments = JSON.parse(formSegmentsJson || '[]');
    } catch {
      setError("Errore formato JSON nei Segmenti. Verifica le parentesi e virgole.");
      return;
    }

    try {
      const token = localStorage.getItem('inox_token');
      const payload = {
        action: formStageId ? 'update' : 'create',
        id: formStageId,
        stage_number: parseInt(formStageNumber),
        date: formDate,
        world_it: formWorldIt,
        world_en: formWorldEn,
        route_it: formRouteIt,
        route_en: formRouteEn,
        type_it: formTypeIt,
        type_en: formTypeEn,
        route_link: formRouteLink,
        register_link: formRegisterLink,
        zwift_event_id: parseInt(formZwiftEventId),
        segments: parsedSegments,
        status: formStatus
      };

      const resp = await fetch('/api/admin/winter-tour/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      if (!resp.ok) throw new Error(res.error || "Impossibile salvare la tappa.");

      setSuccess(formStageId ? "Tappa aggiornata con successo!" : "Nuova tappa creata con successo!");
      setIsEditing(false);
      await fetchStages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvare la tappa.');
    }
  };

  const handleDeleteStage = async (id: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa tappa? Questa azione eliminerà anche tutti i risultati associati!")) return;
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('inox_token');
      const resp = await fetch(`/api/admin/winter-tour/stages?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const res = await resp.json();
      if (!resp.ok) throw new Error(res.error || "Errore nella cancellazione.");

      setSuccess("Tappa eliminata con successo!");
      await fetchStages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella cancellazione della tappa.');
    }
  };

  // ==========================================
  // TAB 2: SCORING SYSTEM CONFIG
  // ==========================================
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [finRulesForm, setFinRulesForm] = useState<number[]>([]);
  const [falRulesForm, setFalRulesForm] = useState<number[]>([]);
  const [ftsRulesForm, setFtsRulesForm] = useState<number[]>([]);

  const fetchScoringRules = async () => {
    try {
      const resp = await fetch('/api/winter-tour/scoring-rules');
      if (resp.ok) {
        const data: ScoringRule[] = await resp.json();
        setScoringRules(data);

        // Populate forms
        const fin = Array(20).fill(0);
        const fal = Array(10).fill(0);
        const fts = Array(10).fill(0);

        data.forEach(r => {
          if (r.type === 'FIN' && r.position <= 20) fin[r.position - 1] = r.points;
          if (r.type === 'FAL' && r.position <= 10) fal[r.position - 1] = r.points;
          if (r.type === 'FTS' && r.position <= 10) fts[r.position - 1] = r.points;
        });

        setFinRulesForm(fin);
        setFalRulesForm(fal);
        setFtsRulesForm(fts);
      }
    } catch (err) {
      console.error("Errore lettura punteggi:", err);
    }
  };

  const handleSaveScoring = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const rulesToPayload: ScoringRule[] = [];
    finRulesForm.forEach((pts, idx) => {
      rulesToPayload.push({ type: 'FIN', position: idx + 1, points: pts });
    });
    falRulesForm.forEach((pts, idx) => {
      rulesToPayload.push({ type: 'FAL', position: idx + 1, points: pts });
    });
    ftsRulesForm.forEach((pts, idx) => {
      rulesToPayload.push({ type: 'FTS', position: idx + 1, points: pts });
    });

    try {
      const token = localStorage.getItem('inox_token');
      const resp = await fetch('/api/admin/winter-tour/scoring-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rulesToPayload)
      });

      const res = await resp.json();
      if (!resp.ok) throw new Error(res.error || "Impossibile salvare i punteggi.");

      setSuccess("Sistema di punteggio aggiornato con successo!");
      await fetchScoringRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvare i punteggi.');
    }
  };

  // ==========================================
  // TAB 3: RESULTS INGESTION / IMPORT TOOL
  // ==========================================
  const [importStageId, setImportStageId] = useState('');
  const [importMethod, setImportMethod] = useState<'scrape' | 'manual'>('manual');
  const [zpUsername, setZpUsername] = useState('');
  const [zpPassword, setZpPassword] = useState('');
  const [zpEventId, setZpEventId] = useState('');
  const [manualFinJson, setManualFinJson] = useState('');
  const [manualPrimesJson, setManualPrimesJson] = useState('');

  // Importer Steps: 1: form, 2: segment mapping, 3: preview results
  const [importStep, setImportStep] = useState(1);
  const [importSegments, setImportSegments] = useState<string[]>([]);
  const [segmentMappings, setSegmentMappings] = useState<Record<string, { SPRINT: boolean; KOM: boolean; FAL: boolean; FTS: boolean }>>({});
  const [previewStandings, setPreviewStandings] = useState<any>(null);
  
  const [statusImportMessage, setStatusImportMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const [rawDataLoaded, setRawDataLoaded] = useState<any>(null);

  // Import: auto-populate zwift_event_id from selected stage
  const selectedStageData = stages.find(s => s.id.toString() === importStageId);
  const autoEventId = selectedStageData?.zwift_event_id?.toString() || '';

  // Show optional credentials section
  const [showCredentials, setShowCredentials] = useState(false);
  const resetImportFlow = () => {
    setImportStep(1);
    setImportSegments([]);
    setSegmentMappings({});
    setPreviewStandings(null);
    setStatusImportMessage('');
    setRawDataLoaded(null);
  };

  // Step 1: Load data from ZwiftPower using the stage's zwift_event_id
  const handleLoadImportData = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setStatusImportMessage('Connessione a ZwiftPower in corso...');
    setImporting(true);

    try {
      const token = localStorage.getItem('inox_token');
      const payload: any = {
        stage_id: parseInt(importStageId),
        download_only: true,
        // zwift_event_id comes from the stage record automatically in the backend
        // but we can pass it explicitly as override
        zwift_event_id: parseInt(autoEventId)
      };

      // If credentials provided, attach them (authenticated scraper)
      if (showCredentials && zpUsername && zpPassword) {
        payload.zwift_username = zpUsername;
        payload.zwift_password = zpPassword;
      }

      const resp = await fetch('/api/admin/winter-tour/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      if (!resp.ok) throw new Error(res.error || 'Impossibile caricare i dati.');

      setRawDataLoaded(res.fetchedData);
      setImportSegments(res.segments || []);
      
      // Smart auto-map segments based on name keywords
      const initialMappings: typeof segmentMappings = {};
      (res.segments as string[]).forEach((seg: string) => {
        const lower = seg.toLowerCase();
        const isKom = lower.includes('kom') || lower.includes('climb') || lower.includes('salita') || lower.includes('brae') || lower.includes('kicker') || lower.includes('hill');
        const isSprint = lower.includes('sprint') || lower.includes('volt') || lower.includes('traguardo') || lower.includes('champion');
        initialMappings[seg] = { SPRINT: isSprint, KOM: isKom, FAL: true, FTS: true };
      });

      setSegmentMappings(initialMappings);
      setImportStep(2);
      setStatusImportMessage(`✅ Dati caricati. ${res.segments?.length || 0} segmenti rilevati.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati di gara.');
      setStatusImportMessage('');
    } finally {
      setImporting(false);
    }
  };

  // Step 2: Calculate Standings Preview
  const handleCalculatePreview = async () => {
    setError(null);
    setSuccess(null);
    setStatusImportMessage("Calcolo classifiche in corso...");
    setImporting(true);

    try {
      const token = localStorage.getItem('inox_token');
      const payload = {
        stage_id: parseInt(importStageId),
        calculate_only: true,
        manual_fin_data: rawDataLoaded.fin,
        manual_primes_data: rawDataLoaded,
        segment_mapping: segmentMappings
      };

      const resp = await fetch('/api/admin/winter-tour/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      if (!resp.ok) throw new Error(res.error || "Impossibile calcolare le classifiche.");

      setPreviewStandings(res.preview_results);
      setImportStep(3);
      setStatusImportMessage("Anteprima pronta. Verifica i risultati prima di pubblicare.");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel calcolo dei punteggi.');
    } finally {
      setImporting(false);
    }
  };

  // Step 3: Publish Standings to Database
  const handlePublishResults = async () => {
    if (!window.confirm("Sei pronto a pubblicare questi risultati ufficialmente? Questo sovrascriverà eventuali risultati esistenti per questa tappa.")) return;
    setError(null);
    setSuccess(null);
    setStatusImportMessage("Pubblicazione in corso...");
    setImporting(true);

    try {
      const token = localStorage.getItem('inox_token');
      const payload = {
        stage_id: parseInt(importStageId),
        publish: true,
        manual_fin_data: rawDataLoaded.fin,
        manual_primes_data: rawDataLoaded,
        segment_mapping: segmentMappings
      };

      const resp = await fetch('/api/admin/winter-tour/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      if (!resp.ok) throw new Error(res.error || "Impossibile pubblicare le classifiche.");

      setSuccess("Classifiche importate e pubblicate con successo nel database!");
      resetImportFlow();
      setActiveTab('stages');
      await fetchStages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la pubblicazione delle classifiche.');
    } finally {
      setImporting(false);
    }
  };

  const updateMappingField = (seg: string, field: 'SPRINT' | 'KOM' | 'FAL' | 'FTS', value: boolean) => {
    setSegmentMappings(prev => ({
      ...prev,
      [seg]: {
        ...prev[seg],
        [field]: value
      }
    }));
  };

  if (!canManage) {
    return (
      <div className="rounded-[2.5rem] border border-red-500/30 bg-red-500/10 p-8 text-red-200">
        <div className="mb-4 inline-flex rounded-2xl bg-red-500/10 p-3 text-red-400">
          <ShieldAlert size={22} />
        </div>
        <h1 className="text-3xl font-black italic uppercase">Accesso riservato</h1>
        <p className="mt-3 text-sm text-red-100/80">Questo pannello operativo è disponibile solo per i ruoli amministrativi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 text-white">
      {/* HEADER */}
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
              Database management panel (Isolated separate database)
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

      {/* STATUS BANNER */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <div>{error}</div>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          <Check className="mt-0.5 shrink-0" size={18} />
          <div>{success}</div>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: 'stages', label: 'Calendario & Tappe', icon: Layers3 },
          { id: 'scoring', label: 'Sistema Punteggio', icon: Settings },
          { id: 'import', label: 'Importa Risultati', icon: Database }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); resetImportFlow(); setIsEditing(false); }}
            className={`flex items-center gap-2 border-b-2 px-6 py-4 text-xs font-black uppercase tracking-wider transition ${
              activeTab === tab.id
                ? 'border-[#fc6719] text-[#fc6719]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT: TAB 1 (CALENDAR / STAGES) */}
      {activeTab === 'stages' && (
        <div className="space-y-6">
          {!isEditing ? (
            <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black italic uppercase">Tappe Configurate</h2>
                  <p className="mt-1 text-sm text-zinc-500">Gestisci il calendario del Masters Winter Tour.</p>
                </div>
                <button
                  onClick={handleNewStage}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#fc6719] px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-black transition hover:scale-[1.02]"
                >
                  <Plus size={14} />
                  Nuova Tappa
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-zinc-500 animate-pulse uppercase tracking-widest font-black italic">Caricamento tappe...</div>
              ) : stages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">
                  Nessuna tappa inserita nel database. Clicca su &quot;Nuova Tappa&quot; per iniziare.
                </div>
              ) : (
                <div className="space-y-4">
                  {stages.map(stage => (
                    <div key={stage.id} className="rounded-[1.75rem] border border-zinc-800 bg-black/20 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-zinc-800 px-3 py-0.5 text-[10px] font-black uppercase text-zinc-300">
                            Stage {stage.stage_number}
                          </span>
                          <span className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase ${
                            stage.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {stage.status}
                          </span>
                        </div>
                        <h3 className="mt-2 text-xl font-black italic uppercase text-white">
                          {stage.route.it || stage.route.en}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          {new Date(stage.date).toLocaleString('it-IT')} · ID ZwiftPower: {stage.zwift_event_id}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditStage(stage)}
                          className="rounded-xl border border-zinc-700 bg-zinc-900 p-2.5 text-zinc-300 hover:border-inox-cyan transition"
                          title="Modifica"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteStage(stage.id)}
                          className="rounded-xl border border-zinc-700 bg-zinc-900 p-2.5 text-red-400 hover:border-red-500/40 transition"
                          title="Elimina"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-black italic uppercase mb-6">
                {formStageId ? 'Modifica Tappa' : 'Nuova Tappa'}
              </h2>

              <form onSubmit={handleSaveStage} className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Numero Gara Interno</label>
                  <input
                    type="number"
                    value={formStageNumber}
                    onChange={e => setFormStageNumber(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Data e Ora di Partenza</label>
                  <input
                    type="datetime-local"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Mondo (Italiano)</label>
                  <input
                    type="text"
                    value={formWorldIt}
                    onChange={e => setFormWorldIt(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">World (Inglese)</label>
                  <input
                    type="text"
                    value={formWorldEn}
                    onChange={e => setFormWorldEn(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Percorso (Italiano)</label>
                  <input
                    type="text"
                    value={formRouteIt}
                    onChange={e => setFormRouteIt(e.target.value)}
                    required
                    placeholder="es. Outer Scotland (2 giri - 22.4 km)"
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Route (Inglese)</label>
                  <input
                    type="text"
                    value={formRouteEn}
                    onChange={e => setFormRouteEn(e.target.value)}
                    required
                    placeholder="es. Outer Scotland (2 laps - 22.4 km)"
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Tipo (Italiano)</label>
                  <input
                    type="text"
                    value={formTypeIt}
                    onChange={e => setFormTypeIt(e.target.value)}
                    required
                    placeholder="es. Gara a punti / ITT / Hilly"
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Type (Inglese)</label>
                  <input
                    type="text"
                    value={formTypeEn}
                    onChange={e => setFormTypeEn(e.target.value)}
                    required
                    placeholder="es. Points Race / ITT / Hilly"
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Link Dettagli Percorso (Zwift Insider / What on Zwift)</label>
                  <input
                    type="url"
                    value={formRouteLink}
                    onChange={e => setFormRouteLink(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Link Iscrizione (Zwift.com)</label>
                  <input
                    type="url"
                    value={formRegisterLink}
                    onChange={e => setFormRegisterLink(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">ID Evento ZwiftPower / Zwift</label>
                  <input
                    type="number"
                    value={formZwiftEventId}
                    onChange={e => setFormZwiftEventId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Stato Tappa</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                  >
                    <option value="scheduled">Scheduled (In calendario, no risultati)</option>
                    <option value="published">Published (Risultati caricati)</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Dettagli Segmenti (JSON Array)</label>
                  <textarea
                    value={formSegmentsJson}
                    onChange={e => setFormSegmentsJson(e.target.value)}
                    rows={6}
                    className="w-full rounded-xl border border-zinc-800 bg-black font-mono px-4 py-2.5 text-xs text-white focus:border-[#fc6719] outline-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-300 transition hover:border-[#fc6719]/40 hover:text-white"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#fc6719] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:scale-[1.02]"
                  >
                    <Save size={16} />
                    Salva Tappa
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* CONTENT: TAB 2 (SCORING RULES) */}
      {activeTab === 'scoring' && (
        <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
          <h2 className="text-2xl font-black italic uppercase mb-2">Configura Tabella Punti</h2>
          <p className="text-sm text-zinc-500 mb-6">Determina quanti punti vengono assegnati per le posizioni di arrivo e nei traguardi volanti.</p>

          <form onSubmit={handleSaveScoring} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              {/* FIN (Finish Points) */}
              <div className="space-y-4 rounded-3xl border border-zinc-800 bg-black/20 p-5">
                <h3 className="text-md font-black uppercase text-[#fc6719] border-b border-zinc-800 pb-2">FIN - Punti Arrivo</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {finRulesForm.map((pts, idx) => (
                    <div key={`fin-${idx}`} className="flex items-center gap-3">
                      <span className="w-10 text-xs font-bold text-zinc-500">{idx + 1}° Pos</span>
                      <input
                        type="number"
                        value={pts}
                        onChange={e => {
                          const newForm = [...finRulesForm];
                          newForm[idx] = parseInt(e.target.value) || 0;
                          setFinRulesForm(newForm);
                        }}
                        className="w-full rounded-lg border border-zinc-800 bg-black px-2 py-1 text-xs text-white focus:border-[#fc6719] outline-none text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* FAL (First Across Line) */}
              <div className="space-y-4 rounded-3xl border border-zinc-800 bg-black/20 p-5">
                <h3 className="text-md font-black uppercase text-inox-cyan border-b border-zinc-800 pb-2">FAL - Primi al Traguardo</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {falRulesForm.map((pts, idx) => (
                    <div key={`fal-${idx}`} className="flex items-center gap-3">
                      <span className="w-10 text-xs font-bold text-zinc-500">{idx + 1}° Pos</span>
                      <input
                        type="number"
                        value={pts}
                        onChange={e => {
                          const newForm = [...falRulesForm];
                          newForm[idx] = parseInt(e.target.value) || 0;
                          setFalRulesForm(newForm);
                        }}
                        className="w-full rounded-lg border border-zinc-800 bg-black px-2 py-1 text-xs text-white focus:border-[#fc6719] outline-none text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* FTS (Fastest Through Segment) */}
              <div className="space-y-4 rounded-3xl border border-zinc-800 bg-black/20 p-5">
                <h3 className="text-md font-black uppercase text-yellow-500 border-b border-zinc-800 pb-2">FTS - Giro più Veloce</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {ftsRulesForm.map((pts, idx) => (
                    <div key={`fts-${idx}`} className="flex items-center gap-3">
                      <span className="w-10 text-xs font-bold text-zinc-500">{idx + 1}° Pos</span>
                      <input
                        type="number"
                        value={pts}
                        onChange={e => {
                          const newForm = [...ftsRulesForm];
                          newForm[idx] = parseInt(e.target.value) || 0;
                          setFtsRulesForm(newForm);
                        }}
                        className="w-full rounded-lg border border-zinc-800 bg-black px-2 py-1 text-xs text-white focus:border-[#fc6719] outline-none text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-800">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#fc6719] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:scale-[1.02]"
              >
                <Save size={16} />
                Salva Regole Punteggio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTENT: TAB 3 (IMPORT STANDINGS) */}
      {activeTab === 'import' && (
        <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
          <h2 className="text-2xl font-black italic uppercase mb-2">Ingestor Risultati ZwiftPower</h2>
          <p className="text-sm text-zinc-500 mb-6">Carica, associa i segmenti intermedi, calcola i punteggi in base al regolamento e pubblica le classifiche.</p>

          {/* STEP 1: SELEZIONE TAPPA */}
          {importStep === 1 && (
            <form onSubmit={handleLoadImportData} className="space-y-6">

              {/* Selezione tappa */}
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Seleziona Tappa</label>
                <select
                  value={importStageId}
                  onChange={e => setImportStageId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                >
                  <option value="">-- Scegli tappa --</option>
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>
                      Stage {s.stage_number} · {s.route.it || s.route.en} · ZP ID: {s.zwift_event_id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info tappa selezionata */}
              {selectedStageData && (
                <div className="rounded-2xl border border-zinc-800 bg-black/20 px-5 py-4 flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Evento ZwiftPower</div>
                    <div className="mt-1 font-mono text-lg font-bold text-white">{autoEventId}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Stato</div>
                    <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-[10px] font-black uppercase ${
                      selectedStageData.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {selectedStageData.status}
                    </span>
                  </div>
                  <div className="ml-auto flex gap-3">
                    <a
                      href={`https://zwiftpower.com/events.php?zid=${autoEventId}`}
                      target="_blank" rel="noreferrer"
                      className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-300 hover:text-white transition"
                    >
                      Apri su ZwiftPower ↗
                    </a>
                  </div>
                </div>
              )}

              {/* Credenziali opzionali */}
              <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-4">
                <button
                  type="button"
                  onClick={() => setShowCredentials(v => !v)}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white transition"
                >
                  <span className={`transition-transform ${showCredentials ? 'rotate-90' : ''}`}>▶</span>
                  Credenziali ZwiftPower (opzionale — solo se il fetch anonimo fallisce)
                </button>

                {showCredentials && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Username ZwiftPower</label>
                      <input
                        type="text"
                        value={zpUsername}
                        onChange={e => setZpUsername(e.target.value)}
                        placeholder="Username / Email"
                        className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Password ZwiftPower</label>
                      <input
                        type="password"
                        value={zpPassword}
                        onChange={e => setZpPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white focus:border-[#fc6719] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={importing || !importStageId}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#fc6719] px-8 py-3 text-sm font-black uppercase tracking-wider text-black transition hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download size={16} />
                  {importing ? 'Caricamento da ZwiftPower...' : 'Carica Risultati da ZwiftPower'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SEGMENT MAPPING */}
          {importStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-lg font-black uppercase text-[#fc6719]">Associa i Traguardi Volanti</h3>
                <button
                  onClick={resetImportFlow}
                  className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white"
                >
                  Annulla
                </button>
              </div>

              {importSegments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-850 p-8 text-center text-zinc-500">
                  Nessun segmento intermedio trovato in questa gara. Puoi calcolare direttamente l&apos;anteprima.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/40 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="px-6 py-4">Nome Segmento</th>
                        <th className="px-6 py-4 text-center">FAL (Primo al passaggio)</th>
                        <th className="px-6 py-4 text-center">FTS (Tempo migliore)</th>
                        <th className="px-6 py-4 text-center">Classifica Assegnata</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {importSegments.map(seg => {
                        const mapping = segmentMappings[seg] || { SPRINT: false, KOM: false, FAL: false, FTS: false };
                        return (
                          <tr key={seg} className="hover:bg-zinc-800/10">
                            <td className="px-6 py-4 text-sm font-bold text-white">{seg}</td>
                            <td className="px-6 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={mapping.FAL}
                                onChange={e => updateMappingField(seg, 'FAL', e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-700 bg-black text-[#fc6719] focus:ring-0"
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={mapping.FTS}
                                onChange={e => updateMappingField(seg, 'FTS', e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-700 bg-black text-[#fc6719] focus:ring-0"
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-4">
                                <label className="flex items-center gap-1.5 text-xs text-zinc-300">
                                  <input
                                    type="checkbox"
                                    checked={mapping.SPRINT}
                                    onChange={e => {
                                      updateMappingField(seg, 'SPRINT', e.target.checked);
                                      if (e.target.checked) updateMappingField(seg, 'KOM', false);
                                    }}
                                    className="h-3.5 w-3.5 rounded border-zinc-700 bg-black text-[#fc6719]"
                                  />
                                  Sprint
                                </label>
                                <label className="flex items-center gap-1.5 text-xs text-zinc-300">
                                  <input
                                    type="checkbox"
                                    checked={mapping.KOM}
                                    onChange={e => {
                                      updateMappingField(seg, 'KOM', e.target.checked);
                                      if (e.target.checked) updateMappingField(seg, 'SPRINT', false);
                                    }}
                                    className="h-3.5 w-3.5 rounded border-zinc-700 bg-black text-[#fc6719]"
                                  />
                                  Scalatore (KOM)
                                </label>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                <span className="text-xs text-zinc-500">{statusImportMessage}</span>
                <button
                  onClick={handleCalculatePreview}
                  disabled={importing}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#fc6719] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:scale-[1.02]"
                >
                  Calcola Classifiche Gara
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW RESULTS & PUBLISH */}
          {importStep === 3 && previewStandings && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-4 gap-4">
                <div>
                  <h3 className="text-lg font-black uppercase text-[#fc6719]">Anteprima Classifiche Calcolate</h3>
                  <p className="text-xs text-zinc-500">Verifica che i punteggi siano corretti prima di salvare sul database.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setImportStep(2)}
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white"
                  >
                    Indietro (Mappatura)
                  </button>
                  <button
                    onClick={resetImportFlow}
                    className="rounded-xl border border-zinc-700 bg-red-950/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-950/40"
                  >
                    Annulla
                  </button>
                </div>
              </div>

              {/* RENDER CATEGORY TABS FOR PREVIEW */}
              <div className="space-y-8">
                {['A', 'B', 'C', 'D', 'E'].map(cat => {
                  const catRiders = previewStandings[cat] || [];
                  return (
                    <div key={`preview-cat-${cat}`} className="rounded-[1.75rem] border border-zinc-800 bg-black/20 p-5">
                      <h4 className="text-md font-black uppercase text-[#fc6719] mb-3">Categoria {cat}</h4>
                      
                      {catRiders.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic">Nessun partente in questa categoria.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-black/30 text-zinc-500 font-black uppercase tracking-widest border-b border-zinc-800">
                                <th className="px-4 py-2">Pos</th>
                                <th className="px-4 py-2">Zwift ID</th>
                                <th className="px-4 py-2">Atleta</th>
                                <th className="px-4 py-2">Fin</th>
                                <th className="px-4 py-2">FAL</th>
                                <th className="px-4 py-2">FTS</th>
                                <th className="px-4 py-2">Sprint pts</th>
                                <th className="px-4 py-2">KOM pts</th>
                                <th className="px-4 py-2">Tempo (sec)</th>
                                <th className="px-4 py-2 text-right">Totale</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                              {catRiders.map((r: any, idx: number) => (
                                <tr key={r.zwid} className="hover:bg-zinc-800/10">
                                  <td className="px-4 py-2 font-bold text-[#fc6719]">{idx + 1}°</td>
                                  <td className="px-4 py-2 text-zinc-500">{r.zwid}</td>
                                  <td className="px-4 py-2 font-bold text-white">{r.name}</td>
                                  <td className="px-4 py-2">{r.fin}</td>
                                  <td className="px-4 py-2">{r.fal}</td>
                                  <td className="px-4 py-2">{r.fts}</td>
                                  <td className="px-4 py-2 text-zinc-400">{r.pts_sprint}</td>
                                  <td className="px-4 py-2 text-zinc-400">{r.pts_kom}</td>
                                  <td className="px-4 py-2">{r.time > 0 ? r.time.toFixed(3) : 'DNF'}</td>
                                  <td className="px-4 py-2 text-right font-black text-white">{r.total} PTS</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
                <span className="text-xs text-zinc-500">{statusImportMessage}</span>
                <button
                  onClick={handlePublishResults}
                  disabled={importing}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#fc6719] px-6 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:scale-[1.02] disabled:opacity-50"
                >
                  <Check size={16} />
                  {importing ? "Pubblicazione in corso..." : "Conferma e Pubblica Classifiche"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WinterTourManagement;
