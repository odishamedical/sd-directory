import React from "react";
import * as Icons from "lucide-react";

export interface DirectoryCardProps {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  distanceOrAddress: string;
  image: string;
  priceLevel?: string;
  isClaimed?: boolean;
}

export default function DirectoryCard({
  id,
  title,
  category,
  rating,
  reviewsCount,
  distanceOrAddress,
  image,
  priceLevel = "$$",
  isClaimed = false,
}: DirectoryCardProps) {
  return (
    <div className="bg-[#0B132B]/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 flex flex-col justify-between border border-slate-800 hover:border-[#E5C158]/40 hover:shadow-[0_8px_30px_rgba(229,193,88,0.08)] transition-all duration-300 group h-full select-none">
      
      {/* Top Section: Image + Info */}
      <div className="flex flex-col gap-2">
        
        {/* Image Container: Optimized aspect ratio */}
        <div className="w-full aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden relative border border-white/5 bg-slate-950">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Floating Premium Rating Badge */}
          <div className="absolute top-2 right-2 bg-[#040815]/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-[#E5C158] text-[11px] font-bold flex items-center gap-1">
            <Icons.Star className="w-3 h-3 fill-[#E5C158] stroke-none" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Text Info */}
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#E5C158] font-black">{category}</span>
          
          <h3 className="text-white font-extrabold text-[14px] sm:text-[16px] leading-snug line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>
          
          <div className="flex items-center text-slate-400 text-[10px] sm:text-[11px] gap-1.5">
            <span>{priceLevel} • {reviewsCount} reviews</span>
          </div>

          <div className="flex items-center text-slate-400 text-[10px] sm:text-[11px] gap-1">
            <Icons.MapPin className="w-3 h-3 text-[#E5C158]" />
            <span className="truncate">{distanceOrAddress}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Clean row */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-900">
        <button className="flex-1 bg-gradient-to-b from-[#F6D365] to-[#D5A021] text-slate-950 font-black text-[11px] sm:text-xs py-2 rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-md">
          {isClaimed ? "Details" : "Claim"}
        </button>
        <button className="w-9 h-9 shrink-0 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center border border-slate-700/50 hover:border-slate-500 active:scale-95 transition-all">
          <Icons.Phone className="w-3.5 h-3.5 fill-[#E5C158] stroke-none" />
        </button>
      </div>

    </div>
  );
}
