import { useState, useMemo, useEffect } from 'react';
import { AngryMeter } from './components/AngryMeter';
import { OrbitalMeter } from './components/OrbitalMeter';
import { useAngryEngine } from './hooks/useAngryEngine';

// --- COLOR UTILITIES (Shared with OrbitalMeter) ---
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const interpolateColor = (color1: string, color2: string, factor: number) => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));
  return rgbToHex(r, g, b);
};

// Helper to get the exact color for a score
const getMeterColor = (score: number) => {
    if (score < 5) return '#525252'; // Idle Grey

    const stops = [
      { t: 0,   c: '#FF2F2F' }, // Red
      { t: 25,  c: '#FF6F2E' }, // Orange
      { t: 50,  c: '#FFD02E' }, // Yellow
      { t: 75,  c: '#00E0FF' }, // Blue
      { t: 100, c: '#2EFF86' }  // Green
    ];

    for (let i = 0; i < stops.length - 1; i++) {
      const start = stops[i];
      const end = stops[i + 1];
      if (score >= start.t && score <= end.t) {
        const range = end.t - start.t;
        const relativeScore = score - start.t;
        return interpolateColor(start.c, end.c, relativeScore / range);
      }
    }
    return stops[stops.length - 1].c;
};

function App() {
  const [volume, setVolume] = useState(0); 
  const [timing, setTiming] = useState(0); 
  const [displacement, setDisplacement] = useState(0);
  
  // --- UI STATE ---
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const totalScore = useMemo(() => {
    return (volume * 0.4) + (timing * 0.3) + (displacement * 0.3);
  }, [volume, timing, displacement]);
  
  const { color, noiseOpacity, phaseTitle, tickerData } = useAngryEngine(totalScore);

  const [tickerIndex, setTickerIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
        setTickerIndex(prev => (prev + 1) % tickerData.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, [tickerData]);

  const openReport = () => {
    setIsClosing(false);
    setShowReport(true);
  };

  const closeReport = () => {
    setIsClosing(true);
    setTimeout(() => {
        setShowReport(false);
        setIsClosing(false);
    }, 300);
  };

  // --- REPORT DATA GENERATOR ---
  const reportData = useMemo(() => {
    if (totalScore < 30) {
      return [
        { label: "COMPETITOR A", status: "MONITORING", value: "NO ACTION DETECTED", highlight: false },
        { label: "COMPETITOR B", status: "STABLE", value: "BASELINE TRAFFIC", highlight: false },
        { label: "MARKET SENTIMENT", status: "CALM", value: "OPPORTUNITY WINDOW OPEN", highlight: true }
      ];
    } else if (totalScore < 70) {
      return [
        { label: "COMPETITOR A", status: "LOSING SHARE", value: "-15% SHARE OF VOICE", highlight: true },
        { label: "COMPETITOR B", status: "REACTIVE", value: "BLOG UPDATE DETECTED (40m AGO)", highlight: true },
        { label: "RANKING SHIFT", status: "VOLATILE", value: "YOU MOVED TO #3", highlight: false }
      ];
    } else {
      return [
        { label: "COMPETITOR A", status: "PANIC MODE", value: "PAID SPEND INCREASED 200%", highlight: true },
        { label: "COMPETITOR B", status: "DISPLACED", value: "DROPPED TO PAGE 2", highlight: true },
        { label: "DOMINANCE", status: "ESTABLISHED", value: "AUTHORITY SCORE MAXIMIZED", highlight: true }
      ];
    }
  }, [totalScore]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-12 bg-void overflow-hidden relative">
      <style>{`
        @keyframes expand-center {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes collapse-center {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0); }
        }
        @keyframes fade-in-overlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-out-overlay { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
      
      {/* --- DAMAGE REPORT OVERLAY --- */}
      {showReport && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
            style={{ 
                animation: isClosing ? 'fade-out-overlay 0.3s forwards' : 'fade-in-overlay 0.3s forwards' 
            }}
            onClick={closeReport}
        >
            <div 
                className="w-full max-w-lg bg-black/10 backdrop-blur-2xl border border-white/10 p-8 relative shadow-2xl rounded-2xl"
                style={{ 
                    borderColor: color, 
                    boxShadow: `0 0 50px -10px ${color}33`,
                    animation: isClosing 
                        ? 'collapse-center 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards' 
                        : 'expand-center 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
                }}
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-2xl font-sans font-extrabold text-white uppercase tracking-tight">
                            DAMAGE REPORT
                        </h2>
                        <span className="text-[10px] font-brand font-bold text-muted-text uppercase tracking-[0.2em]">
                            SECTOR ANALYSIS // {phaseTitle}
                        </span>
                    </div>
                    <button 
                        onClick={closeReport}
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {reportData.map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] text-muted-text font-brand font-bold tracking-[0.2em] uppercase">
                                    {item.label}
                                </span>
                                <span 
                                    className="text-[10px] font-brand font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-sm"
                                    style={{ 
                                        backgroundColor: item.highlight ? `${color}33` : 'rgba(255,255,255,0.05)',
                                        color: item.highlight ? color : '#888'
                                    }}
                                >
                                    {item.status}
                                </span>
                            </div>
                            <div className="text-sm font-sans font-bold text-white tracking-wide border-l-2 pl-3 py-1"
                                 style={{ borderColor: item.highlight ? color : '#333' }}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center opacity-50">
                    <span className="text-[9px] font-brand font-bold tracking-widest text-muted-text">SYS.ID: ANGRY-DIGITAL-V0.5</span>
                    <span className="text-[9px] font-brand font-bold tracking-widest text-muted-text">STATUS: ACTIVE</span>
                </div>
            </div>
        </div>
      )}

      {/* --- GLOBAL ENVIRONMENTAL EFFECTS --- */}
      <div 
        className="fixed inset-0 z-0 transition-colors duration-500 ease-linear pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)` 
        }}
      />

      <div 
        className="fixed inset-0 z-50 pointer-events-none mix-blend-overlay transition-opacity duration-200"
        style={{ 
          opacity: noiseOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
        }}
      />

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-6xl">
        {/* HEADER */}
        <div className="text-center flex flex-col items-center gap-2">
            <h1 className="text-4xl md:text-5xl font-brand text-signal tracking-[-0.04em]">
            ANGRY DIGITAL
            </h1>
            <p className="text-[10px] text-muted-text tracking-[0.3em] uppercase">
            COMPETITOR DISPLACEMENT ENGINE
            </p>
        </div>

        {/* PRIMARY SHOWCASE */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full py-4 gap-12">
            {/* LEFT: TACTICAL FEED */}
            <div className="flex flex-col items-end text-right gap-2 md:w-[250px]">
                 <span className="text-[9px] text-muted-text tracking-[0.2em] font-bold uppercase opacity-50">
                    STATUS FEED
                 </span>
                 <span 
                    className="text-2xl font-sans font-extrabold tracking-tight uppercase leading-none transition-colors duration-300"
                    style={{ color: color }}
                 >
                    {phaseTitle}
                 </span>
                 <div className="h-4 overflow-hidden relative w-full flex justify-end">
                    <span 
                        key={tickerIndex} 
                        className="text-[10px] text-muted-text/80 font-bold tracking-widest uppercase absolute animate-in slide-in-from-bottom-2 fade-in duration-500"
                    >
                        {tickerData[tickerIndex]}
                    </span>
                 </div>
            </div>

            {/* CENTER: ANGRY METER */}
            <div className="scale-110">
                <AngryMeter score={totalScore} onClick={openReport} />
            </div>

             {/* RIGHT: BALANCE */}
             <div className="hidden md:block md:w-[250px]" />
        </div>
        
        {/* INPUT DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 w-full max-w-5xl justify-items-center mt-4 p-8 border-t border-white/5">
            
            {/* METER 1: VOLUME */}
            <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
                <div className="text-center space-y-1">
                    <span className="text-[9px] text-muted-text tracking-widest font-bold uppercase block">VOLUME STOLEN</span>
                    <span className="text-[9px] tracking-widest font-bold uppercase block">
                        <span className="text-muted-text opacity-50">WEIGHT: </span>
                        <span style={{ color: getMeterColor(volume) }}>40%</span>
                    </span>
                </div>
                <OrbitalMeter 
                    score={volume} id="vol" metric="VOL" 
                    onChange={setVolume} showHint={!userHasInteracted} onInteract={() => setUserHasInteracted(true)}
                />
            </div>

            {/* METER 2: TIMING */}
            <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
                <div className="text-center space-y-1">
                    <span className="text-[9px] text-muted-text tracking-widest font-bold uppercase block">PRE-EMPTION</span>
                    <span className="text-[9px] tracking-widest font-bold uppercase block">
                        <span className="text-muted-text opacity-50">WEIGHT: </span>
                        <span style={{ color: getMeterColor(timing) }}>30%</span>
                    </span>
                </div>
                <OrbitalMeter 
                    score={timing} id="tme" metric="TME" 
                    onChange={setTiming} showHint={!userHasInteracted} onInteract={() => setUserHasInteracted(true)}
                />
            </div>

            {/* METER 3: DISPLACEMENT */}
            <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
                <div className="text-center space-y-1">
                    <span className="text-[9px] text-muted-text tracking-widest font-bold uppercase block">RANK DROP</span>
                    <span className="text-[9px] tracking-widest font-bold uppercase block">
                        <span className="text-muted-text opacity-50">WEIGHT: </span>
                        <span style={{ color: getMeterColor(displacement) }}>30%</span>
                    </span>
                </div>
                <OrbitalMeter 
                    score={displacement} id="dsp" metric="DSP" 
                    onChange={setDisplacement} showHint={!userHasInteracted} onInteract={() => setUserHasInteracted(true)}
                />
            </div>

        </div>

      </div>
    </div>
  );
}

export default App;