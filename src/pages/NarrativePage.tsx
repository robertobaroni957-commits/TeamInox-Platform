import React, { useState, useCallback } from 'react';
import { buildRaceAnalysisInputFromUpload } from '../services/narrative/buildRaceAnalysisInputFromUpload';
import { generateRaceNarrative } from '../services/narrative/generateRaceNarrative';
import { formatRaceNarrative } from '../services/narrative/formatRaceNarrative';
import { RaceAnalysisInput } from '../types/raceNarrative';
import { RaceJsonUploader } from '../components/narrative/RaceJsonUploader';
import { Zap, Loader2, AlertCircle, FileJson } from 'lucide-react';

const NarrativePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const runPipeline = useCallback(async (input: RaceAnalysisInput) => {
    // DIAGNOSTIC LOGGING
    console.log("[UPLOAD PARSED]", input);

    // PRE-FLIGHT VALIDATION
    if (!input.metadata.race_id || input.metadata.race_name === 'Unknown Race' || !input.results.length) {
        setError("Upload parsing failed: Data incomplete.");
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const rawResult = await generateRaceNarrative(input);
      const formatted = formatRaceNarrative(rawResult, {
        raceName: input.metadata.race_name,
        date: input.metadata.date,
        trackName: input.metadata.track_name,
        teamName: input.context.team_name
      });
      setResult(formatted);
    } catch (err: any) {
      setError(err.message || 'Errore nella pipeline narrativa.');
    } finally {
      setLoading(false);
    }
  }, []);

  const processFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const rawJson = JSON.parse(text);
      
      const input = buildRaceAnalysisInputFromUpload(rawJson);
      await runPipeline(input);
    } catch (err: any) {
      setError(err.message || 'Errore di parsing.');
      setLoading(false);
    }
  }, [runPipeline]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/json') processFile(file);
    else setError('Per favore trascina un file JSON valido.');
  };

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto p-6">
      <header className="border-b border-zinc-900 pb-10 space-y-4">
        <div className="flex items-center gap-2">
            <Zap className="text-purple-500" size={16} />
            <span className="text-[10px] font-black uppercase text-purple-500 tracking-[0.3em]">AI Tactical Engine v2</span>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Narrative Processor</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div 
                className={`border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer ${
                    isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 bg-zinc-900/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <FileJson size={48} className="mx-auto text-zinc-600 mb-4" />
                <p className="text-zinc-400 font-bold tracking-widest uppercase text-sm">Trascina qui il file JSON</p>
            </div>
            <div className="flex items-center justify-center">
                <RaceJsonUploader onParsed={runPipeline} />
            </div>
        </div>
      </header>

      <main className="min-h-[500px]">
        {loading && (
            <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
                <Loader2 className="animate-spin mb-4 text-purple-500" size={48} />
                <p className="font-black uppercase tracking-[0.2em] text-xs">Elaborazione narrativa in corso...</p>
            </div>
        )}

        {error && (
            <div className="p-10 bg-red-950/20 border border-red-500/20 rounded-[2.5rem] text-center">
                <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
                <h3 className="text-xl font-black text-white uppercase italic mb-2">Errore</h3>
                <p className="text-zinc-400 text-sm">{error}</p>
            </div>
        )}

        {result && !loading && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800">
                    <h2 className="text-xs font-black uppercase text-purple-500 tracking-[0.2em] mb-2">{result.header}</h2>
                    <h1 className="text-4xl font-black text-white mb-4">{result.title}</h1>
                    <p className="text-zinc-300 text-lg">{result.summary}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-black uppercase tracking-widest text-xs text-zinc-500">Highlights</h3>
                        <ul className="space-y-2">
                            {result.highlights.map((h: string, i: number) => <li key={i} className="text-white p-4 bg-zinc-900 rounded-xl text-sm font-medium">{h}</li>)}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-black uppercase tracking-widest text-xs text-zinc-500">Insights</h3>
                        <ul className="space-y-2">
                            {result.insights.map((i: string, idx: number) => <li key={idx} className="text-zinc-300 p-4 bg-zinc-900/50 rounded-xl text-sm italic">{i}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default NarrativePage;
