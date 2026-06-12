import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Heart, MapPin, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { coupleData } from './data';

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Instancia o áudio uma única vez
  useEffect(() => {
    audioRef.current = new Audio(coupleData.audioUrl);
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const nextStep = () => {
    if (currentStep === 0) {
      confetti();
      // Inicia a música após o primeiro clique (interação obrigatória do navegador)
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log("Aguardando interação:", err));
        setIsPlaying(true);
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log(err));
    }
    setIsPlaying(!isPlaying);
  };

  const variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-stone-950 p-2 selection:bg-spotify">
      <div className="relative w-full max-w-md h-[852px] bg-black rounded-[40px] shadow-2xl border-8 border-neutral-800 overflow-hidden flex flex-col justify-between p-6">
        
        {/* Barra de progresso */}
        <div className="absolute top-4 left-0 right-0 px-6 flex gap-1 z-50">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-white transition-all duration-300 ${
                  idx < currentStep ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Telas */}
        <div className="flex-1 flex flex-col justify-center mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="h-full flex flex-col justify-between"
            >
              {currentStep === 0 && <WelcomeScreen onNext={nextStep} />}
              {currentStep === 1 && <StatsScreen isPlaying={isPlaying} onTogglePlay={togglePlay} />}
              {currentStep === 2 && <TransitionScreen onNext={nextStep} />}
              {currentStep === 3 && <GalleryScreen />}
              {currentStep === 4 && <TimelineScreen />}
              {currentStep === 5 && <StarMapScreen onRestart={() => { setCurrentStep(0); if(audioRef.current) audioRef.current.currentTime = 0; }} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navegação Inferior */}
        {currentStep > 0 && (
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-40">
            <button onClick={prevStep} className="text-xs text-neutral-400 hover:text-white transition">
              Voltar
            </button>
            {currentStep < 5 && (
              <button onClick={nextStep} className="bg-white text-black font-semibold px-4 py-2 rounded-full flex items-center gap-1 text-sm shadow-md">
                Avançar <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full space-y-6 px-4">
      <div className="w-20 h-20 bg-spotify rounded-full flex items-center justify-center shadow-lg animate-pulse">
        <Heart size={40} className="text-white fill-white" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {coupleData.partner1} separou um presente especial!
        </h1>
        <p className="text-neutral-400 text-sm">
          Um momento único feito com carinho para celebrar a jornada de vocês.
        </p>
      </div>
      <button 
        onClick={onNext}
        className="mt-4 bg-spotify hover:bg-green-500 text-white font-bold tracking-wide px-8 py-4 rounded-full text-base transition-transform transform hover:scale-105 shadow-md"
      >
        Ver Presente
      </button>
    </div>
  );
}

function StatsScreen({ isPlaying, onTogglePlay }: { isPlaying: boolean; onTogglePlay: () => void }) {
  const [timeLeft, setTimeLeft] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(coupleData.startDate).getTime();
      const now = new Date().getTime();
      const difference = now - start;

      const seconds = Math.floor((difference / 1000) % 60);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const days = Math.floor((difference / (1000 * 60 * 60 * 24)) % 30);
      const months = Math.floor((difference / (1000 * 60 * 60 * 24 * 30.4375)) % 12);
      const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));

      setTimeLeft({ years, months, days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col space-y-6 h-[90%] justify-center">
      <div className="bg-cardBg p-5 rounded-2xl border border-neutral-800 shadow-xl space-y-4">
        <div className="flex items-center gap-4">
          <img src={coupleData.topSong.albumCover} alt="Album" className="w-16 h-16 rounded-md object-cover shadow-md" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white truncate text-base">{coupleData.topSong.title}</h4>
            <p className="text-neutral-400 text-xs truncate">{coupleData.topSong.artist}</p>
          </div>
          <button onClick={onTogglePlay} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow">
            {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="ml-0.5 fill-black" />}
          </button>
        </div>
        <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: isPlaying ? "100%" : "0%" }} 
            transition={{ duration: 180, ease: "linear" }} 
            className="h-full bg-spotify" 
          />
        </div>
      </div>

      <div className="bg-cardBg p-6 rounded-2xl border border-neutral-800 shadow-xl space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-spotify">Sobre nós</span>
          <h2 className="text-2xl font-black text-white">{coupleData.partner1} e {coupleData.partner2}</h2>
          <p className="text-neutral-400 text-xs mt-0.5">Juntos desde 2022</p>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-black/40 p-3 rounded-xl border border-neutral-900">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="text-center p-2">
              <div className="text-xl font-black text-white">{value}</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                {unit === 'years' ? 'Anos' : unit === 'months' ? 'Meses' : unit === 'days' ? 'Dias' : unit === 'hours' ? 'Horas' : unit === 'minutes' ? 'Min' : 'Seg'}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-neutral-800">
          <p className="text-xs text-neutral-400 italic font-medium leading-relaxed">
            "{coupleData.specialMessage}"
          </p>
        </div>
      </div>
    </div>
  );
}

function TransitionScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full space-y-6 bg-gradient-to-b from-spotify/10 to-transparent rounded-3xl p-4">
      <motion.h2 className="text-3xl font-black tracking-tight leading-tight">
        {coupleData.partner1} e {coupleData.partner2}
      </motion.h2>
      <p className="text-neutral-300 font-medium text-sm max-w-[250px]">
        Os momentos marcantes que desenharam nossa história de amor.
      </p>
      <button onClick={onNext} className="text-xs bg-neutral-800 text-neutral-200 px-4 py-2 rounded-full hover:bg-neutral-700 transition">
        Ver momentos ✨
      </button>
    </div>
  );
}

function GalleryScreen() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col space-y-4 h-[90%] justify-center">
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-spotify">Nossas memórias ❤️</span>
        <h3 className="text-xl font-bold">A nossa história, em cada detalhe</h3>
      </div>

      <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 cursor-grab active:cursor-grabbing" onClick={() => setActiveIndex((prev) => (prev + 1) % coupleData.gallery.length)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full relative"
          >
            <img
              src={coupleData.gallery[activeIndex].image}
              alt={coupleData.gallery[activeIndex].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6">
              <h4 className="text-lg font-bold text-white mb-2">{coupleData.gallery[activeIndex].title}</h4>
              <p className="text-sm text-neutral-300 leading-relaxed">{coupleData.gallery[activeIndex].description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
          {coupleData.gallery.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-spotify' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineScreen() {
  return (
    <div className="flex flex-col space-y-4 h-[90%] justify-center px-2">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-spotify">Nossa Jornada</span>
        <h3 className="text-xl font-bold">Cada passo até aqui</h3>
      </div>

      <div className="space-y-6 max-h-[550px] overflow-y-auto pr-1 scrollbar-none">
        {coupleData.timeline.map((item, index) => (
          <div key={index} className="flex gap-4 items-start relative group">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-spotify ring-4 ring-spotify/20 z-10" />
              {index !== coupleData.timeline.length - 1 && (
                <div className="w-[2px] h-32 bg-neutral-800 group-hover:bg-neutral-700 transition" />
              )}
            </div>
            
            {/* Card com Foto e Texto */}
            <div className="bg-cardBg border border-neutral-800 rounded-2xl flex-1 shadow-md overflow-hidden transition-transform active:scale-[0.98]">
              {/* Foto da Timeline */}
              {item.image && (
                <div className="w-full h-64 overflow-hidden border-b border-neutral-800">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {/* Texto do Card */}
              <div className="p-3.5">
                <span className="text-[10px] font-bold text-spotify uppercase tracking-wider">{item.date}</span>
                <h4 className="font-bold text-sm text-white mt-0.5">{item.title}</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarMapScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-[90%] space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-spotify">O céu daquela noite</span>
        <h3 className="text-lg font-bold max-w-[280px] mx-auto mt-1">"{coupleData.starMap.phrase}"</h3>
      </div>

      <div className="w-64 h-64 bg-radial-glow rounded-full border-2 border-neutral-800 relative flex items-center justify-center shadow-2xl overflow-hidden bg-stone-950">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <svg className="w-48 h-48 text-white/40 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" viewBox="0 0 100 100">
          <polyline points="20,30 40,25 60,45 80,40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2" />
          <polyline points="40,25 35,65 55,80" fill="none" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="20" cy="30" r="2" fill="white" className="animate-ping" />
          <circle cx="40" cy="25" r="2.5" fill="white" />
          <circle cx="60" cy="45" r="2" fill="white" />
          <circle cx="80" cy="40" r="3" fill="white" />
          <circle cx="35" cy="65" r="1.5" fill="white" />
          <circle cx="55" cy="80" r="2" fill="white" />
        </svg>
      </div>

      <div className="space-y-1 bg-cardBg/60 p-4 rounded-xl border border-neutral-900 w-full max-w-[280px]">
        <div className="flex items-center justify-center gap-1 text-spotify text-xs font-bold uppercase tracking-wider">
          <MapPin size={12} /> {coupleData.starMap.location}
        </div>
        <p className="text-neutral-400 text-xs">{coupleData.starMap.dateText}</p>
      </div>

      <button 
        onClick={onRestart}
        className="mt-2 text-xs text-neutral-500 hover:text-white transition underline underline-offset-4"
      >
        Rever do começo ❤️
      </button>
    </div>
  );
}