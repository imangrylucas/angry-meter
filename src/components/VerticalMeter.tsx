import { useState, useRef } from 'react';
import { useAngryEngine } from '../hooks/useAngryEngine';

interface VerticalMeterProps {
  score: number;
  id?: string;
  metric?: string;
  onChange?: (newVal: number) => void;
  showHint?: boolean;
  onInteract?: () => void;
}

export const VerticalMeter = ({ 
  score, 
  id = "1", 
  metric = "TGT", 
  onChange, 
  showHint = false, 
  onInteract 
}: VerticalMeterProps) => {
  
  // FIX: Destructure 'phase' instead of 'label'
  const { color, phase, distortionScale } = useAngryEngine(score);
  const [isDragging, setIsDragging] = useState(false);
  
  const startY = useRef<number>(0);
  const startScore = useRef<number>(0);

  const rotation = score * 2.4;
  const filterId = `heatHazeOrbit-${id}`;

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

      {/* --- FX DEFINITIONS --- */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id={filterId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise">
              <animate attributeName="baseFrequency" values="0.02;0.025;0.02" dur="3s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={distortionScale} />
          </filter>
        </defs>
      </svg>
      
      {/* AMBIENT GLOW */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full blur-[60px] transition-all duration-300 pointer-events-none z-0"
        style={{ 
          backgroundColor: color, 
          opacity: score < 2 ? 0 : (isDragging ? 0.4 : 0.25) 
        }}
      />

      {/* OPTICAL CONTAINER */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
           style={{ filter: distortionScale > 0 ? `url(#${filterId})` : 'none' }}>
           
          {/* ROTATING RETICLE */}
          <div 
            className="absolute inset-4 border-2 border-dashed rounded-full transition-transform duration-75 ease-out z-10"
            style={{ 
                borderColor: color,
                transform: `rotate(${rotation}deg)`,
                opacity: score < 2 ? 0.1 : 1,
                boxShadow: score < 2 ? 'none' : `0 0 15px ${color}33`
            }}
          />
          
          {/* COUNTER-ROTATING RING */}
          <div 
            className="absolute inset-8 border border-white/10 rounded-full z-10"
            style={{ 
                transform: `rotate(-${rotation * 0.5}deg)`,
                borderColor: score < 2 ? 'rgba(255,255,255,0.1)' : color 
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2" style={{ backgroundColor: color }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2" style={{ backgroundColor: color }} />
          </div>
      </div>

      {/* CORE DATA */}
      <div className="flex flex-col items-center z-20 pointer-events-none">
        <div className="text-xs text-muted-text tracking-[0.3em] mb-1 uppercase">
            {metric}
        </div>
        
        <div 
            className="text-5xl font-brand font-bold tabular-nums tracking-tighter italic" 
            style={{ 
                color,
                textShadow: score < 2 ? 'none' : `0 0 ${score * 0.2}px ${color}66`,
                filter: distortionScale > 0 ? `blur(${distortionScale * 0.1}px)` : 'none'
            }}
        >
            {Math.round(score)}
        </div>
        
        {/* FIX: Use 'phase' here instead of 'label' */}
        <div className="text-[9px] font-brand font-bold italic tracking-[0.2em] text-muted-text uppercase mt-2">
              {phase}
        </div>
      </div>

    </div>
  );
};