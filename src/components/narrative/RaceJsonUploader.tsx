import React, { useState } from 'react';
import { buildRaceAnalysisInputFromUpload } from '../../services/narrative/buildRaceAnalysisInputFromUpload';
import { RaceAnalysisInput } from '../../types/raceNarrative';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  onParsed: (input: RaceAnalysisInput) => void;
}

export const RaceJsonUploader: React.FC<Props> = ({ onParsed }) => {
  console.log("--- RaceJsonUploader component rendered ---");
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'ERROR'>('IDLE');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('LOADING');
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      console.log("[UPLOAD RAW JSON]", json);
      console.log("[UPLOAD TYPE]", typeof json);
      console.log("[UPLOAD IS ARRAY]", Array.isArray(json));
      if (Array.isArray(json)) {
        console.log("[UPLOAD FIRST ITEM]", json[0]);
        console.log("[UPLOAD FIRST ITEM DATA]", json[0]?.data);
        console.log("[UPLOAD FIRST ITEM PAYLOAD]", json[0]?.data?.payload);
      }

      console.log("[BEFORE PARSER]", json);
      const input = buildRaceAnalysisInputFromUpload(json);
      onParsed(input);
      setStatus('IDLE');
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-zinc-700 rounded-2xl text-center bg-zinc-900/30">
      <label className="flex flex-col items-center cursor-pointer gap-2">
        <Upload className="text-purple-500" />
        <span className="text-xs font-bold text-white uppercase tracking-widest">Upload WTRL Results</span>
        <input type="file" accept="application/json" onChange={handleFile} className="hidden" />
      </label>
      {status === 'LOADING' && <Loader2 className="animate-spin mt-2 mx-auto text-purple-500" size={20} />}
      {status === 'ERROR' && <div className="text-red-500 flex items-center justify-center gap-1 mt-2 text-xs"><AlertCircle size={14}/> Invalid JSON</div>}
    </div>
  );
};
