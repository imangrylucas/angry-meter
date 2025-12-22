import { useEffect, useState, useMemo, useRef } from 'react';

// --- UTILITY: COLOR BLENDER ---
const interpolateColor = (color1: string, color2: string, factor: number) => {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

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

  // --- FX ENGINE ---
  const { color, rotationSpeed, label, shadowIntensity, pulseSpeed, noiseOpacity, distortionScale } = useMemo(() => {
    let dynamicColor;
    let statusLabel;
    let currentNoise = 0.03; 
    let scale = 0; // Default distortion scale (none)
    
    // ZONE 0: IDLE
    if (animatedScore <= 2) {
      dynamicColor = '#525252'; 
      statusLabel = 'IDLE';
    }
    // ZONE 1: CRYO (2% - 35%)
    else if (animatedScore <= 35) {
      const factor = (animatedScore - 2) / 33;
      dynamicColor = interpolateColor('#525252', '#22D3EE', factor);
      statusLabel = 'INITIATING';
    }
    // ZONE 2: YELLOW SURGE (35% - 55%)
    else if (animatedScore <= 55) {
      const factor = (animatedScore - 35) / 20;
      dynamicColor = interpolateColor('#22D3EE', '#FFE600', factor);
      statusLabel = 'INITIATING';
      currentNoise = 0.08 + (factor * 0.05); 
    }
    // ZONE 3: ACTIVE (55% - 75%)
    else if (animatedScore <= 75) {
      const factor = (animatedScore - 55) / 20;
      dynamicColor = interpolateColor('#FFE600', '#FF6F2E', factor);
      statusLabel = 'ACTIVE';
      currentNoise = 0.05;
    }
    // ZONE 4: CRITICAL & PRE-CRITICAL (75% - 100%)
    else {
      const factor = (animatedScore - 75) / 25;
      dynamicColor = interpolateColor('#FF6F2E', '#FF2F2F', factor);
      statusLabel = animatedScore > 90 ? 'CRITICAL' : 'ACTIVE';
      currentNoise = 0.05 + (factor * 0.05);

      // --- DISTORTION MATH ---
      // Ramps up from 0px to 4px scale starting at 75%
      scale = factor * 4; 
    }

    const speedMs = 15000 - (animatedScore / 100) * 14200; 

    return {
      color: dynamicColor,
      rotationSpeed: `${speedMs}ms`,
      label: statusLabel,
      shadowIntensity: animatedScore / 100,
      pulseSpeed: '2.5s',
      noiseOpacity: currentNoise,
      distortionScale: scale // Pass the calculated scale to the SVG
    };
  }, [animatedScore]);

  return (
    <div className="relative group">
      
      {/* 1. REACTIVE BACKGROUND */}
      <div 
        className="fixed inset-0 z-[-1] transition-colors duration-500 ease-linear pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)` 
        }}
      />

      {/* 2. CRT NOISE */}
      <div 
        className="fixed inset-0 z-[50] pointer-events-none mix-blend-overlay transition-opacity duration-200"
        style={{ 
          opacity: noiseOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
        }}
      />

      {/* 3. AMBIENT ATMOSPHERE */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full blur-[70px] transition-all duration-300 pointer-events-none"
        style={{ 
          backgroundColor: color, 
          opacity: animatedScore < 2 ? 0 : 0.35 
        }}
      />

      {/* 4. THE HOUSING */}
      <div 
        className="relative flex flex-col items-center justify-center w-[240px] h-[240px] bg-surface/40 backdrop-blur-md rounded-full border shadow-2xl transition-colors duration-300"
        style={{ 
          borderColor: animatedScore < 2 ? 'rgba(255,255,255,0.05)' : `${color}33` 
        }}
      >
        
        {/* 5. THE TURBINE */}
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
              // Only apply filter if there is actual distortion to render
              filter: distortionScale > 0 ? 'url(#heatHaze)' : 'none'
            }}
          >
             <defs>
              {/* HEAT HAZE FILTER */}
              <filter id="heatHaze">
                {/* baseFrequency: 0.02 is much smoother/larger waves than 0.05.
                   dur: 3s is much slower than 0.2s. 
                */}
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise">
                  <animate attributeName="baseFrequency" values="0.02;0.025;0.02" dur="3s" repeatCount="indefinite" />
                </feTurbulence>
                {/* scale: This is bound to our dynamic 'distortionScale'.
                   0 = No distortion. 4 = High distortion.
                */}
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
        
        {/* 6. DATA CORE */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          
          <span 
            className="relative text-7xl font-brand font-black italic tracking-tighter tabular-nums leading-none"
            style={{ 
              color: color,
              textShadow: animatedScore < 2 ? 'none' : `0 0 ${animatedScore * 0.2}px ${color}66`,
              // Apply simple blur twitch proportional to distortion
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