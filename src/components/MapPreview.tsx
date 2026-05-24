import React from "react";

interface MapPreviewProps {
  city?: string;
}

export default function MapPreview({ city = "Bhubaneswar" }: MapPreviewProps) {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[rgba(229,193,88,0.15)] relative h-48 bg-[#0b132b] shadow-inner flex flex-col justify-between">
      <iframe 
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        loading="lazy" 
        allowFullScreen 
        referrerPolicy="no-referrer-when-downgrade" 
        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCqxlojiRrV5lUWbxdOGEmvpPKuKlxi3oA&q=${encodeURIComponent(city + ", Odisha, India")}`}>
      </iframe>
      <div className="absolute top-2 right-2 z-10 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded px-1.5 py-0.5 text-[8px] text-[#e5c158] font-bold">
        Live Map
      </div>
    </div>
  );
}
