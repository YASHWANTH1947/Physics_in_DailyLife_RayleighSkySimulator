import React, { useRef, useEffect, useCallback } from 'react';

interface SkySimulationProps {
  sunAngle: number;
}

export const SkySimulation: React.FC<SkySimulationProps> = ({ sunAngle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use a ref to store the latest angle so the draw function doesn't need to change identity
  const angleRef = useRef(sunAngle);

  useEffect(() => {
    angleRef.current = sunAngle;
  }, [sunAngle]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High DPI and Resizing
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) return;

    // Only set dimensions if they have changed to avoid clearing canvas unnecessarily
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
    }
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;

    // --- Physics / Drawing Logic ---
    
    const currentAngle = angleRef.current;

    // Angle 0 = Sunrise (Left), 90 = Noon (Top), 180 = Sunset (Right)
    const rad = (currentAngle * Math.PI) / 180;
    
    // Calculate Sky Colors
    const distFromNoon = Math.abs(currentAngle - 90);
    // Non-linear fade for sunset colors
    const sunsetFactor = Math.min(1, Math.pow(distFromNoon / 90, 3)); 

    // Sky Top Color
    const r = 135 * (1 - sunsetFactor * 0.8);
    const g = 206 * (1 - sunsetFactor * 0.8);
    const b = 235 * (1 - sunsetFactor * 0.6);
    
    // Horizon Color
    const horizonR = 200 + (255 - 200) * sunsetFactor;
    const horizonG = 230 + (100 - 230) * sunsetFactor; 
    const horizonB = 255 + (50 - 255) * sunsetFactor;

    const skyTopColor = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    const skyHorizonColor = `rgb(${Math.floor(horizonR)}, ${Math.floor(horizonG)}, ${Math.floor(horizonB)})`;

    // Fill Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, skyTopColor);
    gradient.addColorStop(1, skyHorizonColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Sun Orbit Configuration
    const cx = width / 2;
    const cy = height * 0.9; // Horizon line lower at 90% height
    
    // Maximize radius: Fit within width (with padding) and height (with top padding)
    // This makes the arc much larger
    const orbitRadius = Math.min(width * 0.45, height * 0.75);

    // Sun Position
    const theta = Math.PI - rad;
    const sunX = cx + orbitRadius * Math.cos(theta);
    const sunY = cy - orbitRadius * Math.sin(theta);

    // Draw Rays / Scattering (only if sun is above horizon)
    if (sunY <= cy + 10) {
        ctx.save();
        ctx.globalAlpha = 0.2 + (0.2 * (1-sunsetFactor)); 
        ctx.lineWidth = 2;
        
        const rays = 12;
        for(let i=0; i<rays; i++) {
            const spread = (i - rays/2) * 0.1; 
            ctx.beginPath();
            ctx.moveTo(sunX, sunY);
            // Rays hit the ground level
            const endX = cx + spread * width * 1.5;
            const endY = cy;

            const rayGrad = ctx.createLinearGradient(sunX, sunY, endX, endY);
            rayGrad.addColorStop(0, "rgba(255, 255, 200, 0.8)");
            rayGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.strokeStyle = rayGrad;
            
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Draw Sun
    const sunColor = distFromNoon > 70 ? '#ff5500' : '#ffffdd';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
    ctx.fillStyle = sunColor;
    ctx.shadowColor = sunColor;
    ctx.shadowBlur = 20 + (20 * sunsetFactor); 
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Ground
    ctx.fillStyle = "#0f172a"; 
    ctx.beginPath();
    ctx.fillRect(0, cy, width, height - cy);

    // Draw Atmosphere Arc (Visual Guide)
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    const atmosphereRadius = orbitRadius + 25;
    ctx.arc(cx, cy, atmosphereRadius, Math.PI, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Text Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    
    // Ensure label doesn't go off top of screen
    const labelY = Math.max(15, cy - atmosphereRadius - 8);
    ctx.fillText("Atmosphere Top", cx, labelY);
    
    // Observer
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.fillText("Observer", cx, cy + 12);

  }, []); 

  // Effect to handle resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(draw);
    });
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [draw]);

  // Effect to trigger redraw when angle changes
  useEffect(() => {
    requestAnimationFrame(draw);
  }, [sunAngle, draw]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-64 md:h-96 rounded-xl shadow-inner border border-slate-700 bg-slate-900 block"
    />
  );
};