import { useMemo } from 'react';

// Color blender utility (Unchanged)
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

export const useAngryEngine = (animatedScore: number) => {
  return useMemo(() => {
    let dynamicColor;
    // We keep your original logic for colors/labels, but add "Phase" logic
    let currentNoise = 0.03; 
    let scale = 0; 
    
    // --- COLOR LOGIC (UNCHANGED) ---
    // ZONE 0: IDLE (0-2%)
    if (animatedScore <= 2) {
      dynamicColor = '#525252'; 
    }
    // ZONE 1: CRYO (2% - 35%)
    else if (animatedScore <= 35) {
      const factor = (animatedScore - 2) / 33;
      dynamicColor = interpolateColor('#525252', '#22D3EE', factor);
    }
    // ZONE 2: YELLOW SURGE (35% - 55%)
    else if (animatedScore <= 55) {
      const factor = (animatedScore - 35) / 20;
      dynamicColor = interpolateColor('#22D3EE', '#FFE600', factor);
      currentNoise = 0.08 + (factor * 0.05); 
    }
    // ZONE 3: ACTIVE (55% - 75%)
    else if (animatedScore <= 75) {
      const factor = (animatedScore - 55) / 20;
      dynamicColor = interpolateColor('#FFE600', '#FF6F2E', factor);
      currentNoise = 0.05;
    }
    // ZONE 4: CRITICAL (75% - 100%)
    else {
      const factor = (animatedScore - 75) / 25;
      dynamicColor = interpolateColor('#FF6F2E', '#FF2F2F', factor);
      currentNoise = 0.05 + (factor * 0.05);
      scale = factor * 4; 
    }

    // --- NEW: NARRATIVE PHASE LOGIC (0-30, 31-70, 71-100) ---
    let phase = 'SIMMER';
    let phaseTitle = 'WAKING THE GIANT';
    let tickerData = ['COMPETITORS IDENTIFIED', 'KEYWORDS TARGETED'];

    if (animatedScore > 70) {
        phase = 'RAGE';
        phaseTitle = 'COMPETITOR PANIC'; // Shortened slightly to fit
        tickerData = ['AUTHORITY SCORE: MAX', 'TRAFFIC HIJACKED'];
    } else if (animatedScore > 30) {
        phase = 'AGITATION';
        phaseTitle = 'THEY KNOW YOU\'RE HERE';
        tickerData = ['RANKINGS GAINED', 'VISIBILITY DROPPING'];
    }

    const speedMs = 15000 - (animatedScore / 100) * 14200; 

    return {
      color: dynamicColor,
      rotationSpeed: `${speedMs}ms`,
      shadowIntensity: animatedScore / 100,
      pulseSpeed: '2.5s',
      noiseOpacity: currentNoise,
      distortionScale: scale,
      // New Exports
      phase,
      phaseTitle,
      tickerData
    };
  }, [animatedScore]);
};