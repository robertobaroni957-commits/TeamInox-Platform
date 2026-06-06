import React, { useRef, useState } from 'react';
import { Upload, FileJson, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRoundControl } from '../../pages/admin/RoundControlContext';

interface JsonIngestorProps {
  title: string;
  apiEndpoint: string;
  description: string;
  onSuccess?: () => void;
  scraperScript?: string;
  expectedType?: 'teams' | 'roster' | 'races' | 'master';
  extraPayload?: Record<string, any>;
}

export default function JsonIngestor({ 
  title, 
  apiEndpoint, 
  description, 
  onSuccess, 
  scraperScript,
  expectedType,
  extraPayload
}: JsonIngestorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedWtrlId, selectedSeasonCode } = useRoundControl(); 
  const [isValidating, setIsValidating] = useState(false);

  const copyScraper = () => {
    if (scraperScript) {
        navigator.clipboard.writeText(scraperScript);
        toast.success("Script Scraper copiato!");
    }
  };

  const validateJson = (json: any): { valid: boolean; error?: string } => {
    // Estrazione payload per i controlli
    const data = json.payload || (Array.isArray(json) ? json : json.data?.payload || json);
    const sample = Array.isArray(data) ? data[0] : data;

    if (!sample) return { valid: false, error: "Il file JSON sembra vuoto o non valido." };

    switch (expectedType) {
        case 'teams':
            // Cerca campi tipici della lista team (flat o meta)
            const isTeam = sample.teamname || sample.meta?.team || sample.id;
            if (!isTeam) return { valid: false, error: "Questo non sembra un file di Squadre. Verificare lo script usato." };
            break;
        case 'roster':
            // Cerca la presenza di atleti/riders
            const hasRiders = sample.riders || sample.members || sample.data?.riders;
            if (!hasRiders) return { valid: false, error: "Questo non sembra un file Roster. Non sono stati trovati atleti." };
            break;
        case 'races':
            // Cerca campi delle gare
            const isRace = sample.race_number || sample.event_id || sample.A || sample.C;
            if (!isRace) return { valid: false, error: "Questo non sembra un calendario gare." };
            break;
    }

    return { valid: true };
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    setIsValidating(true);
    
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const json = JSON.parse(content);
        
        // Validazione
        const validation = validateJson(json);
        if (!validation.valid) {
            toast.error(validation.error, {
                description: "Assicurati di caricare il file corretto per questa sezione.",
                duration: 5000
            });
            return;
        }

        const toastId = toast.loading(`Caricamento ${title}...`);
        
        // Costruzione payload standardizzato
        const payload = { 
            data: { payload: json }, 
            seasonId: selectedWtrlId, 
            wtrl_id: selectedWtrlId,
            season_code: selectedSeasonCode,
            ...extraPayload
        };
        
        const token = localStorage.getItem('inox_token');

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const resData = await response.json();
        if (resData.success || resData.ok) {
          toast.success(`${title} completato`, { 
              id: toastId,
              description: resData.message || "Dati aggiornati con successo."
          });
          if (onSuccess) onSuccess();
        } else {
          toast.dismiss(toastId);
          throw new Error(resData.error || "Errore importazione");
        }
      } catch (err: any) {
        console.error(err);
        toast.error(`Errore: ${err.message}`);
      } finally {
        setIsValidating(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-[#090a10] border border-zinc-800 p-10 rounded-[2.5rem] flex flex-col gap-8 hover:border-blue-500/30 transition-all shadow-2xl backdrop-blur-sm group">
      <div className="flex items-center gap-6">
        <div className="p-5 bg-zinc-900 rounded-2xl text-blue-500 border border-zinc-800 group-hover:text-blue-400 transition-colors shadow-inner relative">
            <FileJson size={32} />
            {expectedType && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                    <CheckCircle2 size={14} />
                </div>
            )}
        </div>
        <div>
            <h4 className="text-base font-black text-white uppercase tracking-[0.15em] leading-none mb-2">{title}</h4>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-tight leading-relaxed italic">{description}</p>
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={onFileSelected} />
      
      <div className="grid grid-cols-1 gap-4">
          {scraperScript && (
            <button 
                onClick={copyScraper}
                className="w-full py-5 flex items-center justify-center gap-4 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg"
            >
                <Upload size={20} /> Copia Script WTRL
            </button>
          )}
          <button 
            disabled={isValidating}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-5 flex items-center justify-center gap-4 border rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md ${
                isValidating ? 'bg-zinc-900 border-zinc-800 text-zinc-600' : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
            }`}
          >
            {isValidating ? <Upload className="animate-bounce" size={20} /> : <FileJson size={20} />}
            {isValidating ? 'Validazione...' : 'Carica JSON'}
          </button>
      </div>

      {expectedType && (
          <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <AlertTriangle size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest leading-normal">
                  Atteso file: <span className="text-blue-400 underline">{expectedType === 'master' ? 'Full Inox (Meta+Riders)' : `zrl_${expectedType}_s${selectedWtrlId}.json`}</span>
              </p>
          </div>
      )}
    </div>
  );
}

