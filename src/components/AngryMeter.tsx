import { useEffect, useState, useRef, useMemo } from 'react';
import { useAngryEngine } from '../hooks/useAngryEngine';

interface AngryMeterProps {
  score?: number;
  onClick?: () => void;
}

// Helper to determine phase based on raw input, not animated values
const getPhaseData = (score: number) => {
  if (score > 70) return { id: 'RAGE', rank: 3 };
  if (score > 30) return { id: 'AGITATION', rank: 2 };
  return { id: 'SIMMER', rank: 1 };
};

export const AngryMeter = ({ score = 50, onClick }: AngryMeterProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const smoothScoreRef = useRef(0);
  
  const [isMoving, setIsMoving] = useState(false);
  const isMovingRef = useRef(false);
  const requestRef = useRef<number>(0);

  // --- PHASE TRANSITION STATE ---
  const [triggerShake, setTriggerShake] = useState(false);
  const [triggerFlare, setTriggerFlare] = useState(false);
  
  // We use the raw score to determine the "Stable Phase" to avoid flickering
  const { id: stablePhase, rank: stableRank } = getPhaseData(score);
  const prevRankRef = useRef<number>(stableRank);

  // --- PHYSICS LOOP ---
  useEffect(() => {
    const animate = () => {
      const diff = score - smoothScoreRef.current;
      const currentlyMoving = Math.abs(diff) > 0.1;

      if (currentlyMoving !== isMovingRef.current) {
        isMovingRef.current = currentlyMoving;
        setIsMoving(currentlyMoving);
      }

      smoothScoreRef.current += diff * 0.1;

      const time = Date.now();
      const breath = Math.sin(time / 800) * 0.8;
      
      let finalValue = smoothScoreRef.current + breath;
      finalValue = Math.max(0, Math.min(100, finalValue));

      setAnimatedScore(finalValue);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [score]);

  // --- ENGINE HOOK ---
  const { 
    color, 
    rotationSpeed, 
    shadowIntensity, 
    pulseSpeed, 
    distortionScale,
    // We ignore the hook's phase because it breathes. We use stablePhase instead.
  } = useAngryEngine(animatedScore);

  // --- LOGIC: PHASE CHANGE & DIRECTION CHECK ---
  useEffect(() => {
    // Only trigger if the rank has CHANGED
    if (stableRank !== prevRankRef.current) {
        
        // DIRECTION CHECK: Only trigger FX if we are going UP (Leveling Up)
        if (stableRank > prevRankRef.current) {
            setTriggerShake(true);
            setTriggerFlare(true);

            // Reset effects
            setTimeout(() => setTriggerShake(false), 500); 
            setTimeout(() => setTriggerFlare(false), 800); 
        }

        // Update the ref to the new rank
        prevRankRef.current = stableRank;
    }
  }, [stableRank]); // Only runs when the stable calculated phase changes


  // --- GEOMETRY ---
  const radius = 80;
  const strokeWidth = 14; 
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const angleInRad = (animatedScore * 3.6 - 90) * (Math.PI / 180);
  const emitterX = 120 + radius * Math.cos(angleInRad);
  const emitterY = 120 + radius * Math.sin(angleInRad);
  const tipRotation = animatedScore * 3.6;

  // --- PARTICLES ---
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      r1: Math.random(),
      r2: Math.random(),
      delay: Math.random() * 0.5,
      size: 1 + Math.random() * 2
    }));
  }, []);

  return (
    <div 
        className={`relative group ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
      <style>{`
        /* PHASE FX ANIMATIONS */
        @keyframes impact-shake {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-4px, 4px); }
          50% { transform: translate(4px, -4px); }
          75% { transform: translate(-4px, -4px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes phase-shockwave {
          0% { transform: scale(1); opacity: 0.8; border-width: 20px; }
          100% { transform: scale(2.5); opacity: 0; border-width: 0px; }
        }

        @keyframes breathe-subtle {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); filter: blur(70px); }
          50% { opacity: 0.45; transform: translate(-50%, -50%) scale(1.05); filter: blur(75px); }
        }

        /* Particle Configs */
        @keyframes particle-mist {
          0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          20% { opacity: 0.6; transform: translate(var(--rx), -10px) scale(1); }
          100% { opacity: 0; transform: translate(var(--rx), -40px) scale(2); }
        }
        @keyframes particle-spark {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
        }
        @keyframes particle-plasma {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          50% { opacity: 1; transform: translate(var(--rx), 10px) scale(0.8); }
          100% { opacity: 0; transform: translate(var(--rx), 30px) scale(0); }
        }
      `}</style>

      {/* CLICK HINT */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="text-[9px] font-brand font-bold tracking-widest text-white/50 uppercase whitespace-nowrap bg-black/50 px-2 py-1 rounded border border-white/10">
            Click to Expand Report
        </span>
      </div>

      {/* --- PHASE TRANSITION FLARE (SHOCKWAVE) --- */}
      {triggerFlare && (
         <div 
            className="absolute left-0 top-0 w-full h-full rounded-full border-2 z-0 pointer-events-none"
            style={{ 
                borderColor: color,
                animation: 'phase-shockwave 0.6s ease-out forwards'
            }}
         />
      )}

      {/* AMBIENT ATMOSPHERE */}
      <div 
        className="absolute left-1/2 top-1/2 w-[220px] h-[220px] rounded-full transition-colors duration-300 pointer-events-none"
        style={{ 
          backgroundColor: color,
          animation: 'breathe-subtle 6s ease-in-out infinite alternate'
        }}
      />

      {/* THE HOUSING */}
      <div 
        className="relative flex flex-col items-center justify-center w-[240px] h-[240px] bg-surface/40 backdrop-blur-md rounded-full border transition-all duration-300 z-10 group-hover:scale-105"
        style={{ 
            borderColor: `${color}33`,
            boxShadow: stablePhase === 'RAGE' 
                ? `0 20px 50px -10px rgba(0,0,0,0.5), 0 0 ${animatedScore * 0.5}px ${color}22` 
                : `0 20px 50px -10px rgba(0,0,0,0.5)`,
            animation: triggerShake ? 'impact-shake 0.4s cubic-bezier(.36,.07,.19,.97) both' : 'none'
        }}
      >
        
        {/* THE TURBINE */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full">
          <div 
            className="absolute inset-[10px] border border-dashed rounded-full opacity-30"
            style={{ 
              animation: `spin ${rotationSpeed} linear infinite`,
              borderColor: color
            }} 
          />

          <svg 
            height="100%" 
            width="100%" 
            viewBox="0 0 200 200"
            className="transform -rotate-90 transition-all duration-500 relative z-10"
            style={{ 
              animation: animatedScore > 90 ? `pulse ${pulseSpeed} cubic-bezier(0.4, 0, 0.6, 1) infinite` : 'none',
              filter: distortionScale > 0 ? 'url(#heatHaze)' : 'none'
            }}
          >
             <defs>
              <filter id="heatHaze">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise">
                  <animate attributeName="baseFrequency" values="0.02;0.025;0.02" dur="3s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale={distortionScale} />
              </filter>

              <mask id="revealMask">
                 <rect x="0" y="0" width="200" height="200" fill="black" />
                 <circle 
                   cx="100" cy="100" r={normalizedRadius}
                   stroke="white" 
                   strokeWidth={strokeWidth}
                   fill="transparent"
                   pathLength={circumference} 
                   strokeDasharray={circumference}
                   style={{ strokeDashoffset }}
                   strokeLinecap="butt" 
                 />
              </mask>
            </defs>
            
            <circle 
              cx="100" cy="100" r={normalizedRadius}
              stroke={color} 
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray="8 4" 
              strokeLinecap="butt"
              mask="url(#revealMask)" 
              filter={`drop-shadow(0 0 ${shadowIntensity * 5}px ${color})`}
            />
          </svg>
        </div>

        {/* DYNAMIC PARTICLE EMITTER */}
        {isMoving && (
            <div 
                className="absolute z-50 pointer-events-none flex items-center justify-center"
                style={{
                    left: emitterX,
                    top: emitterY,
                    transform: `translate(-50%, -50%) rotate(${tipRotation}deg)`,
                    width: '0px', 
                    height: '0px'
                }}
            >
                {particles.map(p => {
                    const angle = p.r1 * 360;
                    const rad = angle * (Math.PI / 180);
                    const tx = Math.cos(rad) * (10 + p.r2 * 20);
                    const ty = Math.sin(rad) * (10 + p.r2 * 20);
                    const rx = (p.r1 - 0.5) * 20;

                    let animName = 'particle-mist';
                    let dur = 1 + p.r1;
                    if (stablePhase === 'AGITATION') { animName = 'particle-spark'; dur = 0.1 + p.r2 * 0.2; }
                    if (stablePhase === 'RAGE') { animName = 'particle-plasma'; dur = 0.4 + p.r2 * 0.4; }

                    return (
                        <div 
                            key={p.id}
                            className="absolute"
                            style={{
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                backgroundColor: color, 
                                borderRadius: stablePhase === 'SIMMER' ? '50%' : '0px',
                                filter: stablePhase === 'SIMMER' ? 'blur(1px)' : 'none',
                                boxShadow: stablePhase === 'SIMMER' ? 'none' : `0 0 4px ${color}`, 
                                
                                // @ts-expect-error custom css props
                                '--tx': `${tx}px`,
                                '--ty': `${ty}px`,
                                '--rx': `${rx}px`,

                                animation: `${animName} ${dur}s linear infinite`,
                                animationDelay: `${p.delay}s`
                            }}
                        />
                    );
                })}
            </div>
        )}
        
        {/* DATA CORE */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none gap-2">
            <span 
                className="relative text-7xl font-brand font-black italic tracking-tighter tabular-nums leading-none"
                style={{ 
                    color: color,
                    textShadow: `0 0 ${animatedScore * 0.2}px ${color}66`,
                    filter: distortionScale > 0 ? `blur(${distortionScale * 0.1}px)` : 'none'
                }}
            >
                {Math.round(animatedScore)}
            </span>

            <div className="flex flex-col items-center gap-1">
                {/* Use Stable Phase for label */}
                <span className="text-[10px] font-brand font-bold italic tracking-[0.2em] text-muted-text uppercase">
                    {stablePhase}
                </span>
                
                <div 
                    className="h-1 rounded-full"
                    style={{ 
                        backgroundColor: color,
                        width: `${15 + (animatedScore * 0.6)}px`,
                        boxShadow: `0 0 ${isMoving ? '15px' : '10px'} ${color}`
                    }} 
                />
            </div>
        </div>
      </div>
    </div>
  );
};