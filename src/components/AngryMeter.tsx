import { useEffect, useState, useRef } from 'react';
import { useAngryEngine } from '../hooks/useAngryEngine';

export const AngryMeter = ({ score = 50 }: { score: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const requestRef = useRef<number>(0);

  // --- PHYSICS LOOP ---
  useEffect(() => {
    const animate = () => {
      setAnimatedScore(prev => {
        const diff = score - prev;
        if (Math.abs(diff) < 0.1) return score;
        return prev + diff * 0.1; 
      });
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [score]);

  // --- GEOMETRY ---
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // --- ENGINE HOOK ---
  const { color, rotationSpeed, label, shadowIntensity, pulseSpeed, distortionScale } = useAngryEngine(animatedScore);

  return (
    <div className="relative group">
      
      {/* AMBIENT ATMOSPHERE (Local Glow) */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full blur-[70px] transition-all duration-300 pointer-events-none"
        style={{ 
          backgroundColor: color, 
          opacity: animatedScore < 2 ? 0 : 0.35 
        }}
      />

      {/* THE HOUSING */}
      <div 
        className="relative flex flex-col items-center justify-center w-[240px] h-[240px] bg-surface/40 backdrop-blur-md rounded-full border shadow-2xl transition-colors duration-300"
        style={{ 
          borderColor: animatedScore < 2 ? 'rgba(255,255,255,0.05)' : `${color}33` 
        }}
      >
        
        {/* THE TURBINE */}
        <div className="relative w-full h-full flex items-center justify-center">
          
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
            className="transform -rotate-90 transition-all duration-500"
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
        
        {/* DATA CORE */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          
          <span 
            className="relative text-7xl font-brand font-black italic tracking-tighter tabular-nums leading-none"
            style={{ 
              color: color,
              textShadow: animatedScore < 2 ? 'none' : `0 0 ${animatedScore * 0.2}px ${color}66`,
              filter: distortionScale > 0 ? `blur(${distortionScale * 0.1}px)` : 'none'
            }}
          >
            {Math.round(animatedScore)}
          </span>

          <div className="mt-2 flex flex-col items-center gap-1">
            <span className="text-[10px] font-brand font-bold italic tracking-[0.2em] text-muted-text uppercase">
              {label}
            </span>
            
            <div 
              className="h-1 rounded-full"
              style={{ 
                backgroundColor: color,
                width: `${20 + (animatedScore * 0.4)}px`,
                boxShadow: animatedScore < 2 ? 'none' : `0 0 10px ${color}`
              }} 
            />
          </div>

        </div>
      </div>
    </div>
  );
};