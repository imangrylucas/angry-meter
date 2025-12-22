import { useState } from 'react';
import { AngryMeter } from './components/AngryMeter';
import { VerticalMeter } from './components/VerticalMeter';
import { OrbitalMeter } from './components/OrbitalMeter';
import { useAngryEngine } from './hooks/useAngryEngine';

function App() {
  const [score, setScore] = useState(0);
  
  const { color, noiseOpacity } = useAngryEngine(score);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-12 bg-void overflow-hidden relative">
      
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
      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-6xl">
        {/* HEADER */}
        <div className="text-center flex flex-col items-center gap-2 mb-8">
            <h1 className="text-4xl md:text-5xl font-brand text-signal tracking-[-0.04em]">
            ANGRY DIGITAL
            </h1>
            <p className="text-[10px] text-muted-text tracking-[0.3em] uppercase">
            Design Concept Evaluation // v0.5
            </p>
        </div>

        {/* THE SHOWCASE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-8 items-center justify-items-center w-full">
            
            {/* OPTION A: THE SILO */}
            <div className="flex flex-col items-center gap-4 order-2 lg:order-1 opacity-70 hover:opacity-100 transition-opacity">
                <span className="text-[9px] text-muted-text tracking-widest uppercase">OPT. A // SILO</span>
                <VerticalMeter score={score} />
            </div>

            {/* OPTION B: THE TURBINE (PRIME) */}
            <div className="flex flex-col items-center gap-8 order-1 lg:order-2 scale-110">
                <span className="text-[9px] text-kinetic tracking-widest font-bold uppercase">OPT. B // TURBINE (PRIME)</span>
                <AngryMeter score={score} />
            </div>

            {/* OPTION C: THE ORBIT */}
            <div className="flex flex-col items-center gap-4 order-3 lg:order-3 opacity-70 hover:opacity-100 transition-opacity">
                <span className="text-[9px] text-muted-text tracking-widest uppercase">OPT. C // ORBIT</span>
                <OrbitalMeter score={score} />
            </div>
        </div>
        
        {/* MASTER CONTROL */}
        <div className="w-full max-w-md mt-12 space-y-4">
            <input 
            type="range" 
            min="0" max="100" 
            value={score} 
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full h-1 bg-surface rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-kinetic [&::-webkit-slider-thumb]:rounded-sm hover:[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,47,47,0.5)] transition-all"
            />
            {/* FIXED FONTS: Removed 'italic', kept bold/tracking for structure */}
            <div className="flex justify-between text-[10px] text-muted-text font-brand font-bold tracking-[0.2em] uppercase">
                <span>IDLE</span>
                <span>CRITICAL</span>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;