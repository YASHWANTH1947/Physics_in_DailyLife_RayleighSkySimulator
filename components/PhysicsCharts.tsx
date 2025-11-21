import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WavelengthData } from '../types';

interface PhysicsChartsProps {
  sunAngle: number;
}

export const PhysicsCharts: React.FC<PhysicsChartsProps> = ({ sunAngle }) => {
  
  const data: WavelengthData[] = useMemo(() => {
    // Physics: I ~ 1 / lambda^4
    const r = 650;
    const g = 550;
    const b = 450;

    // Normalize to Blue = 100 for visualization
    const iBlue = 1 / Math.pow(b, 4);
    const factor = 100 / iBlue;

    return [
      { name: 'Blue', wavelength: 450, intensity: (1 / Math.pow(b, 4)) * factor, color: '#3b82f6' },
      { name: 'Green', wavelength: 550, intensity: (1 / Math.pow(g, 4)) * factor, color: '#22c55e' },
      { name: 'Red', wavelength: 650, intensity: (1 / Math.pow(r, 4)) * factor, color: '#ef4444' },
    ];
  }, []);

  // Calculate Path Length Factor approximation: 1 / sin(elevation)
  // Elevation: 90 at noon, 0 at horizon. Minimal path = 1 unit.
  const elevationRad = (sunAngle * Math.PI) / 180;
  const effectiveAngle = sunAngle > 90 ? 180 - sunAngle : sunAngle;
  // Clamp angle to avoid infinity, min 5 degrees
  const clampedAngle = Math.max(effectiveAngle, 5); 
  const pathLength = 1 / Math.sin(clampedAngle * Math.PI / 180);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Chart Section */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
          Scattering Intensity
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={60} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                cursor={{fill: 'transparent'}}
              />
              <Bar dataKey="intensity" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Blue light scatters ~4x more strongly than red light ($I \propto 1/\lambda^4$)
        </p>
      </div>

      {/* Math & Status Section */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
             <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
             Atmospheric Conditions
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
              <span className="text-slate-400">Sun Elevation</span>
              <span className="font-mono text-xl">{effectiveAngle.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
              <span className="text-slate-400">Atmosphere Path</span>
              <div className="text-right">
                <span className="font-mono text-xl text-orange-400">{pathLength.toFixed(2)}x</span>
                <div className="text-xs text-slate-500">Relative to noon</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="text-center">
                <p className="font-serif italic text-slate-300 text-lg mb-1">
                  $$ I \propto \frac{1}{\lambda^4} $$
                </p>
                <p className="text-xs text-slate-400">Rayleigh Scattering Formula</p>
            </div>
        </div>
      </div>
    </div>
  );
};
