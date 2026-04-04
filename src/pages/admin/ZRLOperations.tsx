import React, { useState } from 'react';
import { 
  Settings, Users, RefreshCw, Zap, ClipboardCheck, 
  Trophy, BookOpen, BarChart3, ChevronRight, AlertCircle, Calendar, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ZRLOperations: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { id: 1, title: 'Setup Stagione', icon: Settings, desc: 'ID Stagione e Date' },
    { id: 2, title: 'Disponibilità', icon: ClipboardCheck, desc: 'Monitoraggio RSVP' },
    { id: 3, title: 'Roster Strategy', icon: Zap, desc: 'Optimizer & Teams' },
    { id: 4, title: 'Gare & Lineup', icon: Users, desc: 'Composizione Squadre' },
    { id: 5, title: 'Risultati & Media', icon: Trophy, desc: 'Giornalino & Bilanci' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-10 border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-3 mb-2 text-orange-500">
          <Settings size={20} />
          <span className="font-black text-xs tracking-[0.3em] uppercase italic">Admin Command Center</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-white uppercase">
          ZRL <span className="text-zinc-600">Operations</span>
        </h1>
      </header>

      {/* Workflow Stepper */}
      <nav className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${
                isActive 
                  ? "bg-zinc-900 border-orange-500 shadow-lg shadow-orange-500/10" 
                  : "bg-zinc-950 border-zinc-800 opacity-50 hover:opacity-100 hover:border-zinc-600"
              }`}
            >
              <div className={`p-2 rounded-lg mb-3 ${isActive ? "bg-orange-500 text-black" : "bg-zinc-800 text-zinc-400"}`}>
                <Icon size={20} />
              </div>
              <span className="text-[10px] font-black uppercase text-zinc-500 mb-1">Step 0{step.id}</span>
              <span className={`text-sm font-black uppercase italic ${isActive ? "text-white" : "text-zinc-400"}`}>{step.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Step Content */}
      <main className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl min-h-[500px]">
        {/* STEP 1: SETUP */}
        {activeStep === 1 && (
          <div className="p-10 space-y-10">
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-black italic text-white uppercase">Configurazione Stagione</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">ID Stagione WTRL</label>
                    <input type="text" placeholder="Es: 19" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white font-bold outline-none focus:border-orange-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Data Inizio</label>
                      <input type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white font-bold outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Data Fine</label>
                      <input type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white font-bold outline-none focus:border-orange-500" />
                    </div>
                  </div>
                  <button className="w-full py-4 bg-orange-500 text-black font-black uppercase italic rounded-xl hover:scale-[1.02] transition-transform">
                    Salva Parametri Stagione
                  </button>
                </div>
              </div>

              <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black italic text-white uppercase flex items-center gap-2 mb-4">
                    <RefreshCw className="text-orange-500" size={20} /> Sincronizzazione Dati
                  </h3>
                  <p className="text-xs text-zinc-500 uppercase font-bold leading-relaxed">
                    Importa le squadre iscritte dal sito WTRL per la stagione corrente. Questa operazione popolerà i team locali.
                  </p>
                </div>
                <Link to="/zrl-management" className="mt-8 flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all group">
                  <span className="text-xs font-black uppercase text-white">Vai al Tool di Sincronizzazione</span>
                  <ChevronRight size={18} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>
          </div>
        )}

        {/* STEP 2: AVAILABILITY */}
        {activeStep === 2 && (
          <div className="p-10">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-2xl font-black italic text-white uppercase">Reclutamento & RSVP</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase mt-1 tracking-widest">Monitoraggio compilazione form disponibilità</p>
              </div>
              <button className="px-6 py-3 bg-zinc-800 text-white font-black text-[10px] uppercase rounded-xl hover:bg-zinc-700">
                Invia Sollecitazione Discord
              </button>
            </div>

            <div className="bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden">
              <div className="p-6 border-b border-zinc-800 grid grid-cols-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <span>Atleta</span>
                <span>Categoria</span>
                <span>Stato Form</span>
                <span className="text-right">Azione</span>
              </div>
              <div className="p-4 space-y-2 text-zinc-400 font-bold uppercase text-[11px]">
                <div className="grid grid-cols-4 items-center p-4 border-b border-zinc-900/50">
                  <span className="text-white">Andrea Cerri</span>
                  <span>Cat A</span>
                  <span className="text-green-500 flex items-center gap-2"><CheckCircle2 size={14}/> Compilato</span>
                  <span className="text-right text-zinc-600">---</span>
                </div>
                <div className="grid grid-cols-4 items-center p-4 border-b border-zinc-900/50">
                  <span className="text-white">Cristian Collesei</span>
                  <span>Cat A</span>
                  <span className="text-red-500 flex items-center gap-2"><AlertCircle size={14}/> Mancante</span>
                  <button className="text-right text-orange-500 hover:underline">Invia Avviso</button>
                </div>
                {/* Mock data for visualization */}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ROSTER STRATEGY */}
        {activeStep === 3 && (
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 flex flex-col gap-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black italic text-white uppercase mb-2">Roster Optimizer</h4>
                  <p className="text-xs text-zinc-500 uppercase font-bold leading-relaxed">
                    Utilizza l'intelligenza artificiale per suggerire la composizione ottimale delle squadre basandosi sulle preferenze orarie caricate.
                  </p>
                </div>
                <Link to="/admin/optimizer" className="mt-auto flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-orange-500 transition-all group">
                  <span className="text-xs font-black uppercase text-white">Apri Optimizer</span>
                  <ChevronRight size={18} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 flex flex-col gap-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <RefreshCw size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black italic text-white uppercase mb-2">Import Corridori WTRL</h4>
                  <p className="text-xs text-zinc-500 uppercase font-bold leading-relaxed">
                    Una volta confermati i team, scarica i membri definitivi direttamente dal sito WTRL per ogni squadra.
                  </p>
                </div>
                <button className="mt-auto flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-blue-500 transition-all group">
                  <span className="text-xs font-black uppercase text-white">Sync Roster Definitivi</span>
                  <RefreshCw size={18} className="text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: RACE & LINEUP */}
        {activeStep === 4 && (
          <div className="p-10 flex flex-col items-center justify-center space-y-8 py-20">
            <Users size={64} className="text-zinc-800" />
            <div className="text-center">
              <h3 className="text-3xl font-black italic text-white uppercase mb-4">Gestione War Room</h3>
              <p className="text-zinc-500 text-sm font-bold uppercase max-w-md mx-auto leading-relaxed">
                Qui i capitani compongono le lineup settimanali (3-6 corridori) basandosi sulla disponibilità puntuale degli atleti.
              </p>
            </div>
            <Link to="/roster" className="px-10 py-5 bg-orange-500 text-black font-black uppercase italic rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20">
              Apri Lineup Builder
            </Link>
          </div>
        )}

        {/* STEP 5: RESULTS & MEDIA */}
        {activeStep === 5 && (
          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 flex flex-col gap-4 text-left hover:border-zinc-600 transition-all">
                <BarChart3 className="text-green-500" size={32} />
                <span className="text-sm font-black uppercase italic text-white">Importa Risultati</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Da WTRL / ZwiftPower</span>
              </button>
              <button className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 flex flex-col gap-4 text-left hover:border-zinc-600 transition-all">
                <BookOpen className="text-blue-500" size={32} />
                <span className="text-sm font-black uppercase italic text-white">Genera Giornalino</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Preview & Pubblicazione</span>
              </button>
              <button className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 flex flex-col gap-4 text-left hover:border-zinc-600 transition-all">
                <Calendar className="text-purple-500" size={32} />
                <span className="text-sm font-black uppercase italic text-white">Bilancio Stagione</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Analisi Prestazioni</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ZRLOperations;
