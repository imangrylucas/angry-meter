import { useState, useRef, useMemo } from 'react';

interface OrbitalMeterProps {
  score: number;
  id?: string;
  metric?: string;
  onChange?: (newVal: number) => void;
  showHint?: boolean;
  onInteract?: () => void;
}

// --- COLOR MATH HELPERS ---
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

export const OrbitalMeter = ({ 
  score, 
  metric = "TGT", 
  onChange, 
  showHint = false, 
  onInteract 
}: OrbitalMeterProps) => {
  
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number>(0);
  const startScore = useRef<number>(0);

  // --- SMOOTH GRADIENT LOGIC ---
  const color = useMemo(() => {
    // 1. Idle State (Grey)
    if (score < 5) return '#525252';

    // 2. Define Stops: [Score Threshold, Hex Color]
    const stops = [
      { t: 0,   c: '#FF2F2F' }, // Red
      { t: 25,  c: '#FF6F2E' }, // Orange
      { t: 50,  c: '#FFD02E' }, // Yellow
      { t: 75,  c: '#00E0FF' }, // Blue (Swapped from 100)
      { t: 100, c: '#2EFF86' }  // Green (Swapped from 75)
    ];

    // 3. Find which two stops we are between
    for (let i = 0; i < stops.length - 1; i++) {
      const start = stops[i];
      const end = stops[i + 1];
      
      if (score >= start.t && score <= end.t) {
        // Calculate percentage between these two specific stops (0.0 to 1.0)
        const range = end.t - start.t;
        const relativeScore = score - start.t;
        const factor = relativeScore / range;
        
        return interpolateColor(start.c, end.c, factor);
      }
    }

    return stops[stops.length - 1].c;
  }, [score]);

  const rotation = score * 2.4;

  // --- INTERACTION HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onChange) return;
    if (onInteract) onInteract();
    setIsDragging(true);
    startY.current = e.clientY;
    startScore.current = score;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !onChange) return;
    const deltaY = startY.current - e.clientY;
    const sensitivity = 0.5;
    let newScore = startScore.current + (deltaY * sensitivity);
    newScore = Math.max(0, Math.min(100, newScore));
    onChange(newScore);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      className={`relative w-[200px] h-[200px] flex items-center justify-center touch-none select-none group ${onChange ? 'cursor-ns-resize' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      
      {/* --- HINT OVERLAY --- */}
      <div 
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 ease-in-out ${showHint ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex flex-col items-center gap-1 bg-void/80 backdrop-blur-sm p-2 rounded border border-white/10 animate-pulse">
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none" className="text-white">
                <path d="M6 0L0 6H12L6 0Z" fill="currentColor"/>
                <path d="M6 20L12 14H0L6 20Z" fill="currentColor"/>
                <rect x="5" y="5" width="2" height="10" fill="currentColor"/>
            </svg>
            <span className="text-[9px] font-bold tracking-widest text-white">DRAG</span>
        </div>
      </div>
      
      {/* AMBIENT GLOW */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full blur-[60px] transition-all duration-300 pointer-events-none z-0"
        style={{ 
          backgroundColor: color, 
          opacity: score < 5 ? 0 : (isDragging ? 0.3 : 0.15) 
        }}
      />

      {/* OPTICAL CONTAINER */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* ROTATING RETICLE */}
          <div 
            className="absolute inset-4 border-2 border-dashed rounded-full transition-colors duration-75 ease-linear z-10"
            style={{ 
                borderColor: color,
                transform: `rotate(${rotation}deg)`,
                boxShadow: score < 5 ? 'none' : `0 0 10px ${color}33`,
                opacity: score < 5 ? 0.3 : 1
            }}
          />
          
          {/* COUNTER-ROTATING RING */}
          <div 
            className="absolute inset-8 border border-white/10 rounded-full z-10"
            style={{ 
                transform: `rotate(-${rotation * 0.5}deg)`,
                borderColor: color,
                opacity: score < 5 ? 0.3 : 1
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2" style={{ backgroundColor: color }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2" style={{ backgroundColor: color }} />
          </div>
      </div>

      {/* CORE DATA */}
      <div className="flex flex-col items-center justify-center z-20 pointer-events-none w-full pb-3">
        <div className="text-xs text-muted-text tracking-[0.3em] mb-1 uppercase text-center w-full">
            {metric}
        </div>
        
        <div 
            className="text-5xl font-brand font-bold tabular-nums tracking-tighter italic text-center w-full" 
            style={{ 
                color,
                textShadow: score < 5 ? 'none' : `0 0 ${score * 0.1}px ${color}44`
            }}
        >
            {Math.round(score)}
        </div>
      </div>

    </div>
  );
};