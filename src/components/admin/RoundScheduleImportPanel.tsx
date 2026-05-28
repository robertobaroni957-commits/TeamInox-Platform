import React, { useState } from 'react';
import { useRoundControl } from '../../pages/admin/RoundControlContext';
import { RoundScheduleParserService } from '../../services/RoundScheduleParserService';
import { RoundDraft } from '../../services/types';
import { Calendar, Clipboard, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RoundScheduleImportPanel() {
  const { bootstrapRounds, isProcessing } = useRoundControl();
  
  const [rawText, setRawText] = useState('');
  const [baseYear, setBaseYear] = useState(new Date().getFullYear());
  const [seasonCode, setSeasonCode] = useState('');
  const [previewRounds, setPreviewRounds] = useState<RoundDraft[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleParse = () => {
    try {
      setParseError(null);
      const rounds = RoundScheduleParserService.parse(rawText, baseYear, seasonCode || undefined);
      setPreviewRounds(rounds);
      toast.success(`Parsed ${rounds.length} rounds successfully.`);
    } catch (err: any) {
      setParseError(err.message);
      setPreviewRounds([]);
      toast.error(`Parsing failed: ${err.message}`);
    }
  };

  const handleBootstrap = async () => {
    if (previewRounds.length === 0) return;

    const toastId = toast.loading("Bootstrapping rounds into database...");
    try {
      const result = await bootstrapRounds({
        rawText,
        baseYear,
        season_code: seasonCode || undefined
      });

      if (result.success) {
        toast.success(`Successfully bootstrapped rounds. Created: ${result.rounds_created.length}, Updated: ${result.rounds_updated.length}`, { id: toastId });
        setPreviewRounds([]);
        setRawText('');
      } else {
        toast.error(`Bootstrap failed: ${result.error}`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: toastId });
    }
  };

  return (
    <div className="bg-[#11131a] border border-gray-800 p-10 rounded-[2.5rem] shadow-xl h-full backdrop-blur-sm relative overflow-hidden flex flex-col text-left">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500 border border-blue-500/20 shadow-inner">
          <Calendar size={24} />
        </div>
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-[0.2em] mb-1 leading-none">Round Schedule Import</h3>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic leading-none opacity-70">Bootstrap operational rounds</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* INPUTS */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Base Year</label>
            <input 
              type="number" 
              value={baseYear}
              onChange={(e) => setBaseYear(parseInt(e.target.value))}
              className="w-full bg-[#090a10] border border-gray-800 text-gray-200 text-sm p-4 rounded-xl outline-none focus:border-blue-500/50 transition-all font-black shadow-inner"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Season Code (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. zrl_2026_27"
              value={seasonCode}
              onChange={(e) => setSeasonCode(e.target.value)}
              className="w-full bg-[#090a10] border border-gray-800 text-gray-200 text-sm p-4 rounded-xl outline-none focus:border-blue-500/50 transition-all font-black shadow-inner placeholder:text-zinc-700"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-3 pl-1">
            <Clipboard size={16} className="text-zinc-600" />
            Paste Round Schedule
          </label>
          <textarea 
            rows={6}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Round 1&#10;16th Sep - 7th Oct..."
            className="w-full bg-[#090a10] border border-gray-800 text-gray-200 text-xs p-5 rounded-2xl outline-none focus:border-blue-500/50 transition-all font-mono custom-scrollbar shadow-inner leading-relaxed"
          />
        </div>

        <button 
          onClick={handleParse}
          disabled={isProcessing || !rawText}
          className="w-full py-5 bg-blue-600/10 border border-blue-500/30 text-blue-500 hover:bg-blue-600 hover:text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 shadow-lg active:scale-95"
        >
          Parse Preview
        </button>

        {/* ERROR */}
        {parseError && (
          <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl flex items-center gap-4 animate-shake">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-xs text-red-400 font-bold uppercase tracking-tight">{parseError}</p>
          </div>
        )}

        {/* PREVIEW TABLE */}
        {previewRounds.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-3 duration-500">
            <div className="flex items-center gap-3 pl-1">
              <CheckCircle2 size={18} className="text-green-500" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Parsed Preview ({previewRounds.length} Rounds)</span>
            </div>
            <div className="bg-black/40 border border-gray-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left text-xs uppercase font-bold">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50">
                    <th className="px-5 py-4 text-gray-500 tracking-widest text-[10px]">R#</th>
                    <th className="px-5 py-4 text-gray-500 tracking-widest text-[10px]">Name</th>
                    <th className="px-5 py-4 text-gray-500 tracking-widest text-[10px]">Dates</th>
                    <th className="px-5 py-4 text-gray-500 tracking-widest text-[10px] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {previewRounds.map((r, i) => (
                    <tr key={i} className="hover:bg-blue-500/5 transition-colors group">
                      <td className="px-5 py-4 text-blue-500 font-black">{r.round_number}</td>
                      <td className="px-5 py-4 text-gray-200 italic">{r.name}</td>
                      <td className="px-5 py-4 text-gray-500 font-mono text-[11px] tracking-tighter">{r.starts_at} / {r.ends_at}</td>
                      <td className="px-5 py-4 text-right">
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 text-[9px] font-black">{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              onClick={handleBootstrap}
              disabled={isProcessing}
              className="w-full py-5 bg-green-600 text-white hover:bg-green-500 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-3 active:scale-95"
            >
              <Play size={18} fill="currentColor" />
              Bootstrap Rounds into Database
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
