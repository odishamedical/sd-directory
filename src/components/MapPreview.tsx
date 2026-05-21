import React from "react";

interface MapPreviewProps {
  city?: string;
}

export default function MapPreview({ city = "Bhubaneswar" }: MapPreviewProps) {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[rgba(229,193,88,0.15)] relative h-48 bg-[#0b132b] shadow-inner flex flex-col justify-between">
      {/* Visual representation of grid lines/streets */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10px 10px, rgba(229, 193, 88, 0.4) 1px, transparent 0),
            linear-gradient(rgba(229, 193, 88, 0.1) 1px, transparent 0),
            linear-gradient(90deg, rgba(229, 193, 88, 0.1) 1px, transparent 0)
          `,
          backgroundSize: "20px 20px, 40px 40px, 40px 40px"
        }}
      />

      {/* Styled Mock Streets / Highways */}
      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 50 Q 150 120 300 80" stroke="#e5c158" strokeWidth="3" fill="none" />
        <path d="M 50 0 L 150 200" stroke="#e5c158" strokeWidth="2" fill="none" />
        <path d="M 0 160 C 100 120 180 180 300 140" stroke="#e5c158" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        <path d="M 220 0 L 220 200" stroke="#e5c158" strokeWidth="2" fill="none" />
      </svg>

      {/* Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-[#e5c158]/10 blur-xl rounded-full" />

      {/* Active Pin */}
      <div className="absolute top-[45%] left-[45%] z-10 flex flex-col items-center">
        {/* Glowing Circle */}
        <span className="relative flex h-8 w-8 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f5a623] opacity-40"></span>
          <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-[#e5c158] border-2 border-[#040815] shadow-md flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-[#040815] rounded-full"></span>
          </span>
        </span>
        <div className="bg-[#050c1e]/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-[#e5c158]/30 text-[9px] font-bold text-white shadow-md mt-1 tracking-tight">
          {city}, OR
        </div>
      </div>

      <div className="absolute bottom-2 left-2 z-10 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded px-1.5 py-0.5 text-[8px] text-slate-400 font-mono">
        Map view: GPS Active
      </div>
      <div className="absolute bottom-2 right-2 z-10 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded px-1.5 py-0.5 text-[8px] text-[#e5c158] font-bold">
        Google Maps
      </div>
    </div>
  );
}
