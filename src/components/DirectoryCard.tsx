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
  isVerified?: boolean;
  features?: string[];
  onWishlistToggle?: (id: string, e: React.MouseEvent) => void;
  isWishlisted?: boolean;
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
  isVerified = true,
  features = [],
  onWishlistToggle,
  isWishlisted = false,
}: DirectoryCardProps) {
  return (
    <div className="bg-gradient-to-b from-[#0A1128] to-[#040815] rounded-3xl p-3 sm:p-4.5 flex flex-col justify-between border border-slate-800/80 hover:border-[#E5C158]/55 hover:shadow-[0_0_25px_rgba(229,193,88,0.12)] transition-all duration-500 group h-full relative overflow-hidden select-none">
      
      {/* Decorative Gold Poster Flare */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#E5C158]/5 blur-2xl rounded-full pointer-events-none group-hover:bg-[#E5C158]/10 transition-colors duration-500" />
      
      <div className="flex flex-col gap-3">
        
        {/* Poster Image Container */}
        <div className="w-full aspect-[4/3] sm:aspect-[1.4] rounded-2xl overflow-hidden relative border border-white/5 bg-slate-950 shadow-md">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          
          {/* Ambient Overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Floating Verification Tag */}
          {isVerified && (
            <div className="absolute top-3 left-3 bg-[#E5C158] text-[#040815] px-2 py-0.5 rounded-lg border border-[#E5C158]/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
              <Icons.ShieldCheck className="w-3 h-3 fill-[#040815] stroke-none" />
              <span>Verified</span>
            </div>
          )}

          {/* Wishlist Heart Icon */}
          {onWishlistToggle && (
            <button
              onClick={(e) => onWishlistToggle(id, e)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#040815]/80 backdrop-blur-md border border-white/10 hover:border-[#E5C158]/35 flex items-center justify-center transition-all active:scale-90"
            >
              <Icons.Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "text-red-500 fill-red-500" : "text-slate-400 group-hover:text-white"}`} />
            </button>
          )}

          {/* Rating Badge - Promoted Style */}
          <div className="absolute bottom-3 right-3 bg-gradient-to-r from-[#F6D365]/90 to-[#D5A021]/90 text-slate-950 px-2 py-0.5 rounded-lg font-black text-[10px] flex items-center gap-1 shadow-md">
            <Icons.Star className="w-3 h-3 fill-slate-950 stroke-none" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Poster Content details */}
        <div className="space-y-2">
          
          {/* Category Tag */}
          <div className="flex justify-between items-center">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#E5C158] font-black">
              {category.replace("_", " ")}
            </span>
            <span className="text-[10px] font-extrabold text-slate-400">{priceLevel}</span>
          </div>
          
          {/* Title */}
          <h3 className="text-white font-extrabold text-[15px] sm:text-[17px] leading-tight tracking-tight group-hover:text-[#E5C158] transition-colors duration-300 line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>

          {/* Location Badge */}
          <div className="flex items-center text-slate-400 text-[11px] gap-1">
            <Icons.MapPin className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
            <span className="truncate font-medium">{distanceOrAddress}</span>
          </div>

          {/* Highlight Key features - dynamic list */}
          {features && features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {features.slice(0, 2).map((feat, idx) => (
                <span 
                  key={idx} 
                  className="text-[8px] sm:text-[9px] bg-slate-900/80 border border-slate-800/80 text-slate-300 px-2 py-0.5 rounded-lg font-semibold tracking-wide"
                >
                  {feat}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Action buttons footer */}
      <div className="flex gap-2.5 mt-4 pt-3.5 border-t border-slate-900/60">
        <button className="flex-1 bg-gradient-to-b from-[#F6D365] to-[#D5A021] hover:from-white hover:to-[#E5C158] text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(229,193,88,0.15)] hover:shadow-[0_6px_20px_rgba(229,193,88,0.25)] active:scale-95">
          {isClaimed ? "Details" : "Claim Business"}
        </button>
        <button className="w-10 h-10 shrink-0 bg-slate-900/80 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center border border-slate-800/80 hover:border-[#E5C158]/30 active:scale-95 transition-all">
          <Icons.Phone className="w-4 h-4 fill-[#E5C158] stroke-none" />
        </button>
      </div>

    </div>
  );
}
