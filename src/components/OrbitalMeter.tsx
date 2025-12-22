import { useAngryEngine } from '../hooks/useAngryEngine';

export const OrbitalMeter = ({ score }: { score: number }) => {
  const { color, label, distortionScale } = useAngryEngine(score);
  
  const rotation = score * 2.4;

  return (
    <div className="relative w-[200px] h-[200px] flex items-center justify-center">

      {/* --- FX DEFINITIONS --- */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="heatHazeOrbit">
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
          opacity: score < 2 ? 0 : 0.25 
        }}
      />

      {/* OPTICAL CONTAINER */}
      {/* We wrap the graphical elements to apply the heat haze */}
      <div className="absolute inset-0 flex items-center justify-center"
           style={{ filter: distortionScale > 0 ? 'url(#heatHazeOrbit)' : 'none' }}>
           
          {/* OUTER RING */}
          <div className="absolute inset-0 border border-white/5 rounded-full z-10" />
          
          {/* ROTATING RETICLE */}
          <div 
            className="absolute inset-4 border-2 border-dashed rounded-full transition-all duration-500 ease-out z-10"
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
      <div className="flex flex-col items-center z-20">
        <div className="text-xs text-muted-text tracking-[0.3em] mb-1 uppercase">TGT</div>
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
        <div className="text-[9px] font-brand font-bold italic tracking-[0.2em] text-muted-text uppercase mt-2">
              {label}
        </div>
      </div>

    </div>
  );
};