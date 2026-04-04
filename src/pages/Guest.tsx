import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ChevronRight, Trophy, Users, Bike, ArrowRight, Target, Pause, Play } from 'lucide-react';

// --- CONFIGURATION ---
const SLIDE_DURATION = 6000; // 6 seconds per slide

const SLIDES = [
  { id: 'hero', label: 'Inizio' },
  { id: 'philosophy', label: 'Filosofia' },
  { id: 'weekly-hub', label: 'Palinsesto' },
  { id: 'zrl', label: 'Competizione' },
  { id: 'events', label: 'Community' },
  { id: 'cta', label: 'Unisciti' }
];

// --- COMPONENTS ---

const SlideWrapper: React.FC<{ children: React.ReactNode; isActive: boolean }> = ({ children, isActive }) => (
  <motion.div
    initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
    animate={{ 
      opacity: isActive ? 1 : 0, 
      scale: isActive ? 1 : 1.05,
      filter: isActive ? 'blur(0px)' : 'blur(4px)',
      pointerEvents: isActive ? 'auto' : 'none'
    }}
    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    className="absolute inset-0 flex items-center justify-center overflow-hidden px-6"
  >
    <div className="max-w-6xl mx-auto w-full">
      {children}
    </div>
  </motion.div>
);

const Guest: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  // Auto-play logic
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = 50; // Update progress every 50ms
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (interval / SLIDE_DURATION) * 100;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Handle manual navigation & interaction
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
    lastInteractionRef.current = Date.now();
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Date.now() - lastInteractionRef.current < 800) return;
    if (e.deltaY > 50) {
      nextSlide();
      lastInteractionRef.current = Date.now();
    } else if (e.deltaY < -50) {
      setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
      setProgress(0);
      lastInteractionRef.current = Date.now();
    }
  };

  return (
    <div 
      className="h-screen w-full bg-[#050505] text-white font-sans overflow-hidden relative selection:bg-[#00AEEF] selection:text-black"
      onWheel={handleWheel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* CINEMATIC BACKGROUND (Video più visibile + Slow Zoom) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Overlay Gradiente: più trasparente al centro, scuro ai bordi per profondità */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10" />
        
        <motion.video 
          autoPlay 
          muted 
          loop 
          playsInline
          key={currentSlide} 
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }} // Effetto zoom lento continuo
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-40 saturate-[0.8] blur-[0.5px]"
        >
          <source src="https://www.teaminox.it/wp-content/uploads/2025/11/Presentazione-2025-.mp4" type="video/mp4" />
        </motion.video>
        
        {/* Dynamic Light Rays / Gradients */}
        <motion.div 
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#00AEEF]/10 blur-[150px] rounded-full z-10"
        />
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-[#FF6A00]/10 blur-[150px] rounded-full z-10"
        />
      </div>

      {/* PERSISTENT PREMIUM NAV */}
      <header className="fixed top-0 left-0 right-0 h-24 px-8 md:px-16 flex items-center justify-between z-[100]">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <img 
            src="https://www.teaminox.it/wp-content/uploads/2023/11/cropped-INOX-semplice-colore-lineare.png" 
            className="h-8 md:h-12 cursor-pointer transition-transform hover:scale-105"
            onClick={() => navigate('/')}
          />
          <div className="h-4 w-[1px] bg-white/20 hidden md:block" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hidden md:block">Unified Racing</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-8"
        >
          <button 
            onClick={() => navigate('/login')}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors hidden md:block"
          >
            Accesso
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="group relative px-8 py-3 bg-white text-black font-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 text-[10px] uppercase tracking-widest">Registrati</span>
            <motion.div 
              className="absolute inset-0 bg-[#00AEEF] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"
            />
          </button>
        </motion.div>
      </header>

      {/* SIDEBAR NAVIGATION (APPLE STYLE) */}
      <nav className="fixed left-8 md:left-12 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-8">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(idx)}
            className="group relative flex items-center gap-4"
          >
            <div className="relative h-10 w-1 flex items-center">
              <div className={`absolute inset-0 w-full rounded-full transition-all duration-500 ${currentSlide === idx ? 'bg-white' : 'bg-white/10 group-hover:bg-white/30'}`} />
              {currentSlide === idx && (
                <motion.div 
                  className="absolute top-0 left-0 w-full bg-[#00AEEF] rounded-full origin-top"
                  style={{ height: `${progress}%` }}
                />
              )}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 origin-left ${currentSlide === idx ? 'text-white opacity-100 translate-x-0' : 'text-white/20 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}>
              {slide.label}
            </span>
          </button>
        ))}
      </nav>

      {/* PLAY/PAUSE INDICATOR */}
      <div className="fixed bottom-12 left-12 z-[100] flex items-center gap-4">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="p-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all text-white/40"
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Modo Presentazione</span>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#00AEEF]">{isPaused ? 'In Pausa' : 'In Riproduzione'}</span>
        </div>
      </div>

      {/* MAIN SLIDE CONTAINER */}
      <main className="relative h-screen w-full">
        <AnimatePresence mode="wait">
          
          {/* SLIDE 1: HERO (Testo con Shadow per leggibilità estrema) */}
          {currentSlide === 0 && (
            <SlideWrapper key="hero" isActive={true}>
              <div className="text-center relative z-20">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                >
                  <h1 className="text-7xl md:text-[10rem] font-black mb-6 tracking-tighter leading-[0.8] italic uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                    Pedala con noi.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-[#FFBF00] filter drop-shadow-[0_5px_15px_rgba(255,106,0,0.4)]">
                      Cresci con noi.
                    </span>
                  </h1>
                </motion.div>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="text-xl md:text-3xl text-white/90 max-w-3xl mx-auto mb-16 font-medium leading-tight italic tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]"
                >
                  Oltre il virtuale. Un ecosistema competitivo progettato per <br className="hidden md:block"/> l'eccellenza e la crescita atletica costante.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="flex flex-col md:flex-row items-center justify-center gap-8"
                >
                  <button 
                    onClick={() => navigate('/register')}
                    className="group relative px-16 py-6 bg-[#00AEEF] text-black font-black rounded-2xl transition-all hover:scale-110 shadow-[0_0_50px_rgba(0,174,239,0.5)] uppercase italic tracking-tighter text-2xl overflow-hidden"
                  >
                    <span className="relative z-10">Unisciti al Team</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                  </button>
                  
                  <button 
                    onClick={() => goToSlide(1)}
                    className="text-white/80 hover:text-white font-black uppercase tracking-[0.3em] text-sm transition-all flex items-center gap-3 group"
                  >
                    Esplora il Progetto 
                    <ChevronRight className="group-hover:translate-x-2 transition-transform text-[#00AEEF]" />
                  </button>
                </motion.div>
              </div>
            </SlideWrapper>
          )}

          {/* SLIDE 2: PHILOSOPHY */}
          {currentSlide === 1 && (
            <SlideWrapper key="philosophy" isActive={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <div>
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[12px] font-black text-[#00AEEF] uppercase tracking-[0.5em] mb-8 block"
                  >
                    Manifesto 2026
                  </motion.span>
                  <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-8xl font-black leading-[0.9] italic uppercase mb-12"
                  >
                    La Forza è nel <span className="text-white">Metodo</span>.
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl text-white/40 leading-tight italic"
                  >
                    Non corriamo solo per partecipare. Corriamo per definire nuovi standard di performance nel ciclismo virtuale, trasformando ogni watt in progresso collettivo.
                  </motion.p>
                </div>
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-[#00AEEF]/20 to-transparent" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Target className="w-32 h-32 text-white/10 group-hover:scale-125 group-hover:text-[#00AEEF]/40 transition-all duration-1000" />
                   </div>
                   <div className="absolute bottom-10 left-10">
                      <div className="text-4xl font-black italic">100% Focus</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/40">Sulla tua evoluzione</div>
                   </div>
                </div>
              </div>
            </SlideWrapper>
          )}

          {/* SLIDE 3: WEEKLY HUB */}
          {currentSlide === 2 && (
            <SlideWrapper key="weekly" isActive={true}>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase text-center mb-16 tracking-tighter">
                Il Tuo <span className="text-[#00AEEF]">Campo di Battaglia</span> Settimanale
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[
                  { d: 'Lun', t: '20:30', n: 'ZRL Recon', c: '#00AEEF' },
                  { d: 'Mar', t: '20:45', n: 'ZRL Official', c: '#FF6A00' },
                  { d: 'Mer', t: '19:30', n: 'Social Ride', c: '#ffffff' },
                  { d: 'Gio', t: '20:30', n: 'Elite League', c: '#00AEEF' },
                  { d: 'Ven', t: '20:00', n: 'Drill Workout', c: '#FFBF00' }
                ].map((ev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all text-center group"
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{ev.d} • {ev.t}</div>
                    <div className="h-12 flex items-center justify-center mb-6">
                      <div className="w-2 h-2 rounded-full group-hover:scale-[3] transition-transform duration-500" style={{ backgroundColor: ev.c }} />
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-4">{ev.n}</h3>
                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Accesso Pro</div>
                  </motion.div>
                ))}
              </div>
            </SlideWrapper>
          )}

          {/* SLIDE 4: ZRL ARENA */}
          {currentSlide === 3 && (
            <SlideWrapper key="zrl" isActive={true}>
              <div className="flex flex-col md:flex-row items-center gap-20">
                <div className="flex-1 relative order-2 md:order-1">
                   <div className="w-full aspect-square max-w-lg bg-gradient-to-br from-zinc-900 to-black rounded-full border border-white/10 p-1 flex items-center justify-center relative overflow-hidden">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-t-2 border-[#00AEEF]/40 rounded-full"
                      />
                      <Trophy className="w-40 h-40 text-[#00AEEF] drop-shadow-[0_0_40px_rgba(0,174,239,0.5)]" />
                   </div>
                </div>
                <div className="flex-1 order-1 md:order-2">
                  <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] mb-12">
                    L'Arena <br/><span className="text-[#00AEEF]">ZRL</span>
                  </h2>
                  <p className="text-2xl text-white/50 mb-12 italic leading-tight">
                    La lega di ciclismo virtuale più prestigiosa al mondo. Gareggiamo in ogni categoria, dai debuttanti ai professionisti, con un unico obiettivo: il podio.
                  </p>
                  <div className="flex gap-12">
                    <div>
                      <div className="text-4xl font-black text-white">12+</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/30">Team Attivi</div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-[#FF6A00]">100%</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/30">Supporto DS</div>
                    </div>
                  </div>
                </div>
              </div>
            </SlideWrapper>
          )}

          {/* SLIDE 5: EVENTS */}
          {currentSlide === 4 && (
            <SlideWrapper key="events" isActive={true}>
              <div className="flex flex-col items-center">
                 <h2 className="text-6xl md:text-[8rem] font-black italic uppercase tracking-tighter leading-[0.8] mb-16 text-center">
                   Più di una <br/><span className="text-[#FF6A00]">Squadra</span>
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
                    {[
                      { t: 'Master Winter Tour', d: 'La nostra league interna di riferimento.' },
                      { t: 'Social Gathering', d: 'Incontri dal vivo e ride di gruppo reali.' },
                      { t: 'Tech Lab', d: 'Test materiali e ottimizzazione setup.' }
                    ].map((card, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: i === 0 ? -30 : i === 2 ? 30 : 0, y: i === 1 ? 30 : 0 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:border-[#FF6A00]/50 transition-all text-center"
                      >
                         <h3 className="text-3xl font-black italic uppercase mb-4 tracking-tighter">{card.t}</h3>
                         <p className="text-white/40 italic leading-tight">{card.d}</p>
                      </motion.div>
                    ))}
                 </div>
              </div>
            </SlideWrapper>
          )}

          {/* SLIDE 6: CTA */}
          {currentSlide === 5 && (
            <SlideWrapper key="cta" isActive={true}>
               <div className="text-center relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-gradient-to-r from-[#00AEEF] to-[#FF6A00] blur-[150px] rounded-full -z-10"
                  />
                  <h2 className="text-7xl md:text-[12rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-16">
                    Scrivi la <br/><span className="text-white">Tua Storia</span>
                  </h2>
                  <div className="flex flex-col items-center gap-12">
                    <button 
                      onClick={() => navigate('/register')}
                      className="group relative px-24 py-8 bg-white text-black font-black rounded-full overflow-hidden transition-all hover:scale-110 active:scale-95 shadow-[0_20px_80px_rgba(255,255,255,0.2)]"
                    >
                      <span className="relative z-10 text-3xl italic uppercase tracking-tighter">Entra Ora</span>
                      <motion.div 
                        className="absolute inset-0 bg-[#00AEEF] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500"
                      />
                    </button>
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30 italic">
                      Inoxteam Unified • Stagione 2026
                    </p>
                  </div>
               </div>
            </SlideWrapper>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER MINI */}
      <footer className="fixed bottom-12 right-12 z-[100] flex items-center gap-8">
        <div className="flex flex-col text-right">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 italic">Designed by</span>
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/80">Team Inox Labs</span>
        </div>
      </footer>

    </div>
  );
};

export default Guest;
