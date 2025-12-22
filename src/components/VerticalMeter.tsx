import { useAngryEngine } from '../hooks/useAngryEngine';

export const VerticalMeter = ({ score }: { score: number }) => {
  const { color, label, shadowIntensity, distortionScale } = useAngryEngine(score);

  return (
    <div className="relative group h-[300px] w-[100px] flex flex-col items-center justify-end">
      
      {/* --- FX DEFINITIONS --- */}
      {/* Invisible SVG to hold the unique filter for this component */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="heatHazeSilo">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise">
              <animate attributeName="baseFrequency" values="0.02;0.025;0.02" dur="3s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={distortionScale} />
          </filter>
        </defs>
      </svg>

      {/* AMBIENT GLOW */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120px] h-[120px] rounded-full blur-[50px] transition-all duration-300 pointer-events-none z-0"
        style={{ 
          backgroundColor: color, 
          opacity: score < 2 ? 0 : 0.3 
        }}
      />

      {/* HOUSING CONTAINER */}
      <div className="relative z-10 w-16 h-full bg-surface/20 border border-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        
        {/* 1. BACKGROUND RULER */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 px-3 opacity-30 z-0">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="w-full h-[1px] bg-white/50" />
            ))}
        </div>

        {/* 2. ACTIVE LIQUID PLASMA */}
        <div 
            className="absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out z-10"
            style={{ 
                height: `${score}%`,
                backgroundColor: color,
                boxShadow: score < 2 ? 'none' : `0 0 ${shadowIntensity * 40}px ${color}`
            }}
        >
            {/* A. RISING BUBBLES TEXTURE */}
            <div 
                className="absolute inset-0 opacity-40 mix-blend-overlay" 
                style={{
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.8) 1.5px, transparent 1.5px), radial-gradient(rgba(255,255,255,0.8) 1.5px, transparent 1.5px)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 10px',
                    animation: 'riseBubbles 4s linear infinite'
                }}
            />

            {/* B. LIQUID SURFACE (WAVE ENGINE) */}
            {/* LOGIC UPDATE: We hide the wave entirely when score > 98%. 
                This ensures the 'square' top of the liquid fills the 'rounded' top of the container perfectly without artifacts. */}
            <div 
                className="absolute left-0 right-0 -top-[12px] h-[20px] overflow-hidden transition-opacity duration-300"
                style={{ opacity: score > 98 ? 0 : 1 }}
            >
                
                {/* Wave Layer 1 (Back/Slow) */}
                <div 
                    className="absolute inset-0 w-[200%]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23FFFFFF' fill-opacity='0.5' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z' /%3E%3C/svg%3E")`,
                        backgroundSize: '50% 100%',
                        animation: 'waveMove 3s linear infinite'
                    }} 
                />
                
                {/* Wave Layer 2 (Front/Fast) */}
                <div 
                    className="absolute inset-0 w-[200%]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23FFFFFF' fill-opacity='0.9' d='M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z' /%3E%3C/svg%3E")`,
                        backgroundSize: '50% 100%',
                        animation: 'waveMove 2s linear infinite reverse',
                        opacity: score < 2 ? 0 : 1 
                    }} 
                />
            </div>
        </div>

        {/* 3. GLASS TUBE REFLECTION */}
        <div className="absolute inset-0 z-20 pointer-events-none rounded-full ring-1 ring-inset ring-white/10 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-50" />
      </div>

      {/* FOOTER LABEL */}
      <div className="absolute -bottom-16 text-center z-10">
        <span 
            className="text-3xl font-brand font-black italic tracking-tighter tabular-nums transition-colors inline-block" 
            style={{ 
                color,
                textShadow: score < 2 ? 'none' : `0 0 ${score * 0.2}px ${color}66`,
                // HEAT DISTORTION: Applied strictly to the text only.
                filter: distortionScale > 0 ? 'url(#heatHazeSilo)' : 'none'
            }}
        >
            {Math.round(score)}
        </span>
        <div className="text-[9px] font-brand font-bold italic tracking-[0.2em] text-muted-text uppercase mt-1">
            {label}
        </div>
      </div>
      
      {/* PHYSICS ANIMATION */}
      <style>{`
        @keyframes riseBubbles {
            0% { background-position: 0px 0px, 10px 10px; }
            100% { background-position: 0px -20px, 10px -10px; }
        }
        @keyframes waveMove {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};