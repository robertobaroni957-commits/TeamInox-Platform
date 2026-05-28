import React, { useRef } from 'react';
import { Upload, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { useRoundControl } from '../../pages/admin/RoundControlContext';

interface JsonIngestorProps {
  title: string;
  apiEndpoint: string;
  description: string;
  onSuccess?: () => void;
  scraperScript?: string;
}

export default function JsonIngestor({ title, apiEndpoint, description, onSuccess, scraperScript }: JsonIngestorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedWtrlId } = useRoundControl(); 

  const copyScraper = () => {
    if (scraperScript) {
        navigator.clipboard.writeText(scraperScript);
        toast.success("Script Scraper copiato!");
    }
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(`Caricamento ${title}...`);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const json = JSON.parse(content);
        
        // CORREZIONE: Avvolgiamo il json in un oggetto con chiave 'payload' 
        // per soddisfare il controllo `if (!data || !data.payload)` del backend
        const payload = { 
            data: { payload: json }, 
            seasonId: selectedWtrlId, 
            wtrl_id: selectedWtrlId
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

        const data = await response.json();
        if (data.success || data.ok) {
          toast.success(`${title} completato`, { id: toastId });
          if (onSuccess) onSuccess();
        } else {
          throw new Error(data.error || "Errore importazione");
        }
      } catch (err: any) {
        console.error(err);
        toast.error(`Errore: ${err.message}`, { id: toastId });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-[#090a10] border border-zinc-800 p-10 rounded-[2.5rem] flex flex-col gap-8 hover:border-blue-500/30 transition-all shadow-2xl backdrop-blur-sm group">
      <div className="flex items-center gap-6">
        <div className="p-5 bg-zinc-900 rounded-2xl text-blue-500 border border-zinc-800 group-hover:text-blue-400 transition-colors shadow-inner">
            <FileJson size={32} />
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
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-5 flex items-center justify-center gap-4 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md"
          >
            <FileJson size={20} /> Carica JSON Risultato
          </button>
      </div>
    </div>
  );
}
