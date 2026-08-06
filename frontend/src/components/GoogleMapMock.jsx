import React, { useState } from 'react';
import { MapPin, Info } from 'lucide-react';

const GoogleMapMock = ({ locationName = 'Downtown New York', price = 45 }) => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="relative w-full h-[320px] rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40 bg-slate-100 dark:bg-slate-900 shadow-inner group">
      
      {/* Mock Map Canvas (SVG) */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Land Background */}
        <rect width="100%" height="100%" fill="var(--color-bg)" className="fill-slate-100 dark:fill-slate-900" />
        
        {/* River Water body */}
        <path d="M -20,250 C 150,220 280,310 500,280 L 500,350 L -20,350 Z" fill="#e0f2fe" className="dark:fill-[#082f49]/40" />
        
        {/* Parks */}
        <rect x="50" y="30" width="120" height="90" rx="10" fill="#f0fdf4" className="dark:fill-[#022c22]/20" />
        <rect x="320" y="60" width="80" height="120" rx="15" fill="#f0fdf4" className="dark:fill-[#022c22]/20" />
        
        {/* Roads Grid */}
        {/* Vertical Roads */}
        <line x1="100" y1="0" x2="100" y2="350" stroke="#ffffff" strokeWidth="6" className="dark:stroke-slate-800/70" />
        <line x1="220" y1="0" x2="220" y2="350" stroke="#ffffff" strokeWidth="8" className="dark:stroke-slate-800/70" />
        <line x1="380" y1="0" x2="380" y2="350" stroke="#ffffff" strokeWidth="6" className="dark:stroke-slate-800/70" />
        
        {/* Horizontal Roads */}
        <line x1="0" y1="80" x2="500" y2="80" stroke="#ffffff" strokeWidth="6" className="dark:stroke-slate-800/70" />
        <line x1="0" y1="180" x2="500" y2="180" stroke="#ffffff" strokeWidth="10" className="dark:stroke-slate-800/70" />
        <line x1="0" y1="260" x2="500" y2="260" stroke="#ffffff" strokeWidth="6" className="dark:stroke-slate-800/70" />
      </svg>

      {/* Map Control buttons Overlay */}
      <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
        <Info className="w-3.5 h-3.5 text-blue-500" />
        Simulated Google Map Area
      </div>

      {/* Map Pin Marker */}
      <div className="absolute top-[48%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        {showTooltip && (
          <div className="bg-slate-900 text-white dark:bg-slate-950 px-2.5 py-1.5 rounded-xl shadow-xl border border-slate-700/50 flex flex-col items-center text-center animate-bounce mb-1">
            <span className="text-[10px] font-semibold opacity-70">Pickup base</span>
            <span className="text-xs font-bold text-cyan-400">${price}/day</span>
          </div>
        )}
        <div 
          onClick={() => setShowTooltip(!showTooltip)}
          className="cursor-pointer p-2.5 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-all animate-pulse-glow"
        >
          <MapPin className="w-5 h-5 fill-white/20" />
        </div>
      </div>

      {/* Footer Address bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-lg text-left flex justify-between items-center gap-2">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Pickup location</h4>
          <p className="text-xs text-slate-500 mt-0.5">{locationName}</p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
          Nearby
        </span>
      </div>

    </div>
  );
};

export default GoogleMapMock;
