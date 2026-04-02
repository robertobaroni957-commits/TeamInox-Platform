import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Trophy, Users, Bike, ArrowRight, Target } from 'lucide-react';

const Guest: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-zinc-100 font-sans overflow-x-hidden relative">

      {/* Background Video */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0 opacity-10 saturate-50 blur-[1px] pointer-events-none"
      >
        <source src="https://www.teaminox.it/wp-content/uploads/2025/11/Presentazione-2025-.mp4" type="video/mp4" />
      </video>
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-[#0D0D0D]/80 via-[#0D0D0D] to-[#0D0D0D] z-0"></div>

      <div className="relative z-10">

        {/* NAV */}
        <nav className="h-16 px-6 flex items-center justify-between border-b border-zinc-800/50 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <img src="https://www.teaminox.it/wp-content/uploads/2023/11/cropped-INOX-semplice-colore-lineare.png" className="h-6 md:h-8" />
          <button 
            onClick={() => navigate('/')}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#00AEEF] transition-colors"
          >
            Indietro
          </button>
        </nav>

        {/* HERO */}
        <section className="min-h-[80vh] flex items-center justify-center px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] italic uppercase">
              Pedala con noi.<br />
              <span className="text-[#FF6A00]">Cresci con noi.</span>
            </h1>
            <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 font-medium leading-tight italic">
              Un team competitivo, una community unita, un progetto in crescita.
            </p>
            <button 
              onClick={() => navigate('/register')}
              className="px-12 py-5 bg-[#00AEEF] hover:bg-[#0091c7] text-black font-black rounded-xl transition-all transform hover:scale-105 shadow-2xl shadow-[#00AEEF]/20 uppercase italic tracking-tighter text-xl flex items-center mx-auto"
            >
              Registrati ora <ChevronRight className="ml-2 w-6 h-6" />
            </button>
          </div>
        </section>

        {/* Filosofia */}
        <section className="py-24 px-6 border-t border-zinc-800/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[10px] font-black text-[#00AEEF] uppercase tracking-[0.3em] mb-8">Philosophy</h2>
            <p className="text-3xl md:text-5xl font-black leading-[1.1] tracking-tight italic uppercase mb-10">
              Il progresso è una scelta collettiva. In TEAM INOX, la <span className="text-[#00AEEF]">crescita personale</span> nasce dalla <span className="text-[#FF6A00]">disciplina e dal metodo</span>.
            </p>
            <p className="text-xl text-zinc-400 leading-relaxed font-medium">
              Siamo nati per sfidare i limiti del ciclismo virtuale. La nostra mentalità competitiva non esclude mai lo spirito di squadra: corriamo come un unico blocco, dove il successo del singolo è il carburante per la crescita di tutto il team.
            </p>
          </div>
        </section>

        {/* Weekly Race Hub */}
        <section className="py-24 px-6 bg-zinc-950/20 border-t border-zinc-900">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[10px] font-black text-[#00AEEF] uppercase tracking-[0.4em] mb-16 text-center">Weekly Race Hub</h2>

            <div className="space-y-4">
              {[
                { day: "Lunedì", time: "20:30", name: "ZRL Recon Ride", type: "Recon", desc: "Studio tattico del percorso ZRL della settimana." },
                { day: "Martedì", time: "20:45", name: "ZRL Official Race", type: "Race", desc: "La nostra arena principale. Più divisioni attive." },
                { day: "Mercoledì", time: "19:30", name: "Recovery Ride", type: "Social", desc: "Sgambata di scarico e community chat." },
                { day: "Giovedì", time: "20:30", name: "Master Winter Tour", type: "League", desc: "La nostra league invernale. Competizione interna." },
                { day: "Venerdì", time: "20:00", name: "Drill Training", type: "Workout", desc: "Allenamento strutturato per sprint e salita." },
              ].map((event, idx) => (
                <div key={idx} className="flex items-center p-4 md:p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl hover:border-[#FF6A00]/30 transition-all group">
                  <div className="w-20 md:w-24 shrink-0 border-r border-zinc-800 mr-4 md:mr-6 text-left">
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{event.day}</div>
                    <div className="text-lg font-black italic text-zinc-200">{event.time}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        event.type === 'Race' ? 'bg-[#00AEEF]/10 text-[#00AEEF]' : 
                        event.type === 'Workout' ? 'bg-[#FF6A00]/10 text-[#FF6A00]' : 
                        'bg-zinc-800 text-zinc-500'
                      }`}>
                        {event.type}
                      </span>
                      <h3 className="text-sm md:text-lg font-black uppercase italic tracking-tight">{event.name}</h3>
                    </div>
                    <p className="text-xs text-zinc-500 leading-tight md:leading-normal">{event.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ZRL */}
        <section className="py-24 px-6 bg-[#00AEEF]/5 border-y border-[#00AEEF]/10">
          <div className="max-w-4xl mx-auto">
             <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-8 leading-none">
                ZRL – La nostra <br/><span className="text-[#00AEEF]">arena competitiva</span>
             </h2>
             <p className="text-xl text-zinc-400 mb-10">
                Protagonisti in ogni divisione della Zwift Racing League.  
                Dalla pianificazione tattica al sacrificio dell'ultimo watt, forgiamo il carattere round dopo round.
             </p>
             <button 
                onClick={() => navigate('/register')}
                className="flex items-center gap-3 text-[#00AEEF] font-black uppercase tracking-widest text-sm group"
              >
                Scopri la ZRL con TEAM INOX <ArrowRight className="group-hover:translate-x-2 transition-transform" />
             </button>
          </div>
        </section>

        {/* EVENTI TEAM INOX */}
        <section className="py-24 px-6 bg-[#FF6A00]/5 border-y border-[#FF6A00]/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-8 leading-none">
              I nostri eventi,<br />
              <span className="text-[#FF6A00]">la nostra community</span>
            </h2>

            <p className="text-xl text-zinc-400 mb-12">
              TEAM INOX non partecipa soltanto alle competizioni: le crea.  
              Eventi pensati per unire la community, far crescere gli atleti e condividere la passione per il ciclismo virtuale.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-black/40 border border-zinc-800 rounded-xl backdrop-blur-md hover:border-[#FF6A00]/40 transition-all">
                <h3 className="text-xl font-black uppercase tracking-tight mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#FF6A00]" />
                  Master Winter Tour
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  La nostra competizione stagionale più iconica.  
                  Gare, classifiche, sfide e una community sempre attiva.
                </p>
              </div>

              <div className="p-6 bg-black/40 border border-zinc-800 rounded-xl backdrop-blur-md hover:border-[#FF6A00]/40 transition-all">
                <h3 className="text-xl font-black uppercase tracking-tight mb-3 flex items-center gap-2">
                  <Bike className="w-5 h-5 text-[#FF6A00]" />
                  Allenamenti Strutturati
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Sessioni settimanali guidate dai nostri capitani.  
                  Costruite per migliorare potenza, resistenza e tecnica.
                </p>
              </div>

              <div className="p-6 bg-black/40 border border-zinc-800 rounded-xl backdrop-blur-md hover:border-[#FF6A00]/40 transition-all">
                <h3 className="text-xl font-black uppercase tracking-tight mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#FF6A00]" />
                  Ride Sociali
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Uscite di gruppo aperte ai nuovi membri.  
                  Perfette per conoscere il team e pedalare insieme.
                </p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/register')}
              className="mt-12 flex items-center gap-3 text-[#FF6A00] font-black uppercase tracking-widest text-sm group"
            >
              Partecipa agli eventi TEAM INOX 
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </section>

        {/* CTA FINALE */}
        <section className="py-32 px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-12 italic uppercase tracking-tighter leading-none">
            Entra in TEAM INOX — <br /><span className="text-[#00AEEF]">Registrati ora</span>
          </h2>
          <button 
            onClick={() => navigate('/register')}
            className="px-12 py-6 bg-[#FF6A00] hover:bg-[#e65c00] text-black font-black rounded-xl transition-all transform hover:scale-110 shadow-2xl shadow-[#FF6A00]/20 uppercase italic tracking-tighter text-2xl"
          >
            Start Your Journey
          </button>
        </section>

        <footer className="py-12 border-t border-zinc-900 text-center">
          <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em]">&copy; 2026 TEAM INOX UNIFIED</p>
        </footer>
      </div>
    </div>
  );
};

export default Guest;
