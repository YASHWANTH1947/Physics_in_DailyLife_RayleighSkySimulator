import React, { useRef, useEffect } from 'react';

interface SkySimulationProps {
  sunAngle: number;
}

export const SkySimulation: React.FC<SkySimulationProps> = ({ sunAngle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;

    // Physics / Color Logic
    // Angle 0 = Left horizon (Sunrise), 90 = Top (Noon), 180 = Right horizon (Sunset)
    // We map input (0..180) to Radians. 
    // Standard math: 0 is right. We want 0 to be left.
    // Let's use: x = -cos(angle)
    const rad = (sunAngle * Math.PI) / 180;
    
    // Calculate Sky Colors based on Angle
    // 90 deg -> Blue. 0/180 deg -> Orange/Red.
    const distFromNoon = Math.abs(sunAngle - 90);
    const sunsetFactor = Math.min(1, Math.pow(distFromNoon / 90, 3)); // Non-linear for sharper sunset

    // Interpolate RGB
    const r = 135 + (255 - 135) * sunsetFactor;
    const g = 206 + (69 - 206) * sunsetFactor;
    const b = 235 + (0 - 235) * sunsetFactor;
    
    const horizonR = 200 + (255 - 200) * sunsetFactor;
    const horizonG = 230 + (100 - 230) * sunsetFactor;
    const horizonB = 255 + (50 - 255) * sunsetFactor;

    const skyTopColor = `rgb(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b)})`;
    const skyHorizonColor = `rgb(${Math.floor(horizonR)}, ${Math.floor(horizonG)}, ${Math.floor(horizonB)})`;

    // Draw Sky Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, skyTopColor);
    gradient.addColorStop(1, skyHorizonColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Sun Position
    const orbitRadius = width * 0.4;
    const cx = width / 2;
    const cy = height * 0.85; // Horizon line lower down
    
    // Sun coords: -cos(rad) puts 0 at left, 180 at right. -sin(rad) goes up.
    const sunX = cx - orbitRadius * Math.cos(rad);
    const sunY = cy - orbitRadius * Math.sin(rad);

    // Draw Rays / Scattering visualization
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    // Draw a "beam" from sun to observer (center bottom)
    const rays = 12;
    for(let i=0; i<rays; i++) {
        const offset = (i - rays/2) * 0.05;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(cx + offset * 100, cy);
        
        // Ray changes color as it travels?
        // Simpler: Just white rays indicating light direction
        const rayGrad = ctx.createLinearGradient(sunX, sunY, cx, cy);
        rayGrad.addColorStop(0, "rgba(255, 255, 200, 0.8)");
        rayGrad.addColorStop(1, `rgba(255, ${200 * (1-sunsetFactor)}, ${200 * (1-sunsetFactor)}, 0)`);
        ctx.strokeStyle = rayGrad;
        ctx.stroke();
    }
    ctx.restore();

    // Draw Sun
    const sunColor = distFromNoon > 70 ? '#ff4500' : '#ffff00'; // Red at horizons, yellow otherwise
    ctx.beginPath();
    ctx.arc(sunX, sunY, 25, 0, Math.PI * 2);
    ctx.fillStyle = sunColor;
    ctx.shadowColor = sunColor;
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Ground/Earth
    ctx.fillStyle = "#1e293b"; // Slate-800
    ctx.beginPath();
    ctx.fillRect(0, cy, width, height - cy);

    // Draw Observer
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI*2);
    ctx.fill();
    
    // Atmosphere Arc (Symbolic)
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, orbitRadius + 20, Math.PI, 0); // Semicircle
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = "white";
    ctx.font = "12px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Atmosphere Boundary", cx, cy - orbitRadius - 30);
    ctx.fillText("Observer", cx, cy + 20);

  }, [sunAngle]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-64 md:h-96 rounded-xl shadow-2xl border border-slate-700 bg-slate-800"
    />
  );
};
