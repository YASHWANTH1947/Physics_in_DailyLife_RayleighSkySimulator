import React, { useState, useCallback } from 'react';
import { Sun, CloudSun, Moon, Info, Bot, GraduationCap, User } from 'lucide-react';
import { SkySimulation } from './components/SkySimulation';
import { PhysicsCharts } from './components/PhysicsCharts';
import { explainSkyPhysics } from './services/geminiService';

export default function App() {
  // State: 0 = Sunrise, 90 = Noon, 180 = Sunset
  const [sunAngle, setSunAngle] = useState<number>(45);
  const [explanation, setExplanation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSunAngle(parseFloat(e.target.value));
    // Clear old explanation when state changes significantly to avoid staleness
    if (explanation) setExplanation("");
  };

  const getPhaseLabel = (angle: number) => {
    if (angle < 20) return 'Sunrise';
    if (angle < 70) return 'Morning';
    if (angle < 110) return 'Midday';
    if (angle < 160) return 'Afternoon';
    return 'Sunset';
  };

  const fetchExplanation = useCallback(async () => {
    setIsLoading(true);
    const effectiveAngle = sunAngle > 90 ? 180 - sunAngle : sunAngle;
    const clampedAngle = Math.max(effectiveAngle, 5); 
    const pathLength = 1 / Math.sin(clampedAngle * Math.PI / 180);
    
    const text = await explainSkyPhysics(sunAngle, pathLength);
    setExplanation(text);
    setIsLoading(false);
  }, [sunAngle]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-12">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <CloudSun className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Rayleigh Sky Simulator</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Interactive Light Scattering Demonstration</p>
            </div>
          </div>
          <a href="https://en.wikipedia.org/wiki/Rayleigh_scattering" target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Physics Reference</span>
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Simulation Canvas */}
        <section className="mb-8 relative group">
          <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono">
            Time: {getPhaseLabel(sunAngle)}
          </div>
          <SkySimulation sunAngle={sunAngle} />
          <p className="mt-2 text-center text-sm text-slate-500 italic">
            Drag the slider below to move the sun
          </p>
        </section>

        {/* Controls */}
        <section className="mb-12 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex justify-between items-end mb-2 text-sm font-medium text-slate-400">
                <span className="flex items-center gap-1"><Sun className="w-4 h-4" /> Sunrise (0°)</span>
                <span className="flex items-center gap-1 font-bold text-white">Noon (90°)</span>
                <span className="flex items-center gap-1"><Moon className="w-4 h-4" /> Sunset (180°)</span>
            </div>
            
            <div className="relative h-12 flex items-center">
                <div className="absolute w-full h-2 bg-gradient-to-r from-orange-500 via-blue-400 to-orange-500 rounded-full opacity-20"></div>
                <input 
                    type="range" 
                    min="0" 
                    max="180" 
                    step="0.5"
                    value={sunAngle} 
                    onChange={handleAngleChange}
                    className="w-full h-2 bg-transparent appearance-none cursor-pointer z-10 relative"
                />
            </div>
            
            <div className="mt-2 text-center">
                <span className="inline-block px-4 py-1 bg-slate-800 rounded text-2xl font-bold text-blue-400">
                    {sunAngle.toFixed(1)}°
                </span>
            </div>
        </section>

        {/* Data & Stats */}
        <PhysicsCharts sunAngle={sunAngle} />

        {/* AI Explanation Section */}
        <section className="mt-8">
          <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 p-6 rounded-xl border border-indigo-500/30">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-600 rounded-full shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Ask the AI Physicist</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Curious why the color shifts so dramatically? Ask Gemini to analyze the current simulation parameters.
                </p>
                
                {!explanation && !isLoading && (
                  <button 
                    onClick={fetchExplanation}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    Explain Current View
                  </button>
                )}

                {isLoading && (
                  <div className="flex items-center gap-2 text-indigo-300 text-sm animate-pulse">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    Analyzing light paths...
                  </div>
                )}

                {explanation && (
                   <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                     <div className="bg-slate-950/50 p-4 rounded-lg border border-indigo-500/20 text-slate-200 text-sm leading-relaxed">
                       {explanation}
                     </div>
                     <button 
                       onClick={fetchExplanation}
                       className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline"
                     >
                       Refresh Explanation
                     </button>
                   </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 border-t border-slate-800 pt-8 text-slate-400 text-sm space-y-2">
          <h4 className="font-semibold text-slate-200">Instructions</h4>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use the <strong>Slider</strong> to change the time of day (Sun Angle).</li>
            <li>Observe the <strong>Sky Color</strong> change from blue to red/orange.</li>
            <li>Look at the <strong>Scattering Intensity</strong> chart to see how blue light scatters 4x more than red.</li>
            <li>Note the <strong>Atmosphere Path</strong> value increasing as the sun gets lower.</li>
          </ul>
        </section>

        {/* Student & Guide Details Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Card */}
            <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-lg shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-blue-400 uppercase font-bold tracking-wider mb-1">Project Submitted By</p>
                <h3 className="text-lg font-bold text-white">KR Yashwanth Reddy</h3>
                <div className="flex flex-col text-sm text-slate-400 mt-1">
                  <span>Roll No: <span className="text-slate-200 font-mono">2401730151</span></span>
                  <span className="text-slate-500">B.Tech CSE (AI & ML)</span>
                </div>
              </div>
            </div>

            {/* Guide Card */}
            <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-colors flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white shadow-lg shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-purple-400 uppercase font-bold tracking-wider mb-1">Under the Guidance of</p>
                <h3 className="text-lg font-bold text-white">Mr. Vicky Kapoor</h3>
                <p className="text-sm text-slate-400 mt-1">Faculty / Project Guide</p>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}