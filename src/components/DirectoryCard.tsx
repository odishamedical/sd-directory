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
  isVerified = false,
  features = [],
  onWishlistToggle,
  isWishlisted = false,
}: DirectoryCardProps) {
  // Only show Claimed+Verified badge when listing has been claimed
  const showClaimedBadge = isClaimed;

  return (
    <div className="bg-[#1A1410] rounded-3xl flex flex-col justify-between border border-[#2E2016]/80 hover:border-[#D4A843]/50 hover:shadow-[0_0_30px_rgba(212,168,67,0.14)] transition-all duration-500 group h-full relative overflow-hidden select-none shadow-lg">

      {/* Warm editorial top glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A843]/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex flex-col gap-0">

        {/* Poster Image Container — full bleed, no padding */}
        <div className="w-full aspect-[4/3] rounded-t-3xl overflow-hidden relative bg-[#0D0B08]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Cinematic gradient overlay — stronger at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1410] via-[#1A1410]/20 to-transparent" />

          {/* CLAIMED badge — top left, only when claimed */}
          {showClaimedBadge && (
            <div className="absolute top-3 left-3 bg-[#D4A843] text-[#0D0B08] px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
              <Icons.BadgeCheck className="w-3 h-3" />
              <span>Claimed</span>
            </div>
          )}

          {/* Wishlist heart — top right */}
          {onWishlistToggle && (
            <button
              onClick={(e) => { e.stopPropagation(); onWishlistToggle(id, e); }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all active:scale-90 ${
                isWishlisted
                  ? "bg-red-500/20 border-red-500/50"
                  : "bg-[#0D0B08]/70 border-white/10 hover:border-[#D4A843]/40"
              }`}
            >
              <Icons.Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "text-red-400 fill-red-400" : "text-[#8A7A65]"}`} />
            </button>
          )}

          {/* Rating badge — bottom right, overlaid on image */}
          <div className="absolute bottom-3 right-3 bg-[#D4A843] text-[#0D0B08] px-2 py-1 rounded-xl font-black text-[10px] flex items-center gap-1 shadow-lg">
            <Icons.Star className="w-3 h-3 fill-[#0D0B08] stroke-none" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Card content — tight, editorial-style */}
        <div className="px-3 pt-3 pb-0 space-y-1.5">

          {/* Category + price row */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#D4A843] font-black">
              {category.replace("_", " ")}
            </span>
            <span className="text-[9px] font-bold text-[#6B5B45]">{priceLevel}</span>
          </div>

          {/* Title — editorial bold */}
          <h3 className="text-[#F0E6D3] font-extrabold text-[14px] sm:text-[15px] leading-snug tracking-tight line-clamp-2 min-h-[2.4rem] group-hover:text-[#D4A843] transition-colors duration-300">
            {title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-[#8A7A65] text-[10px]">
            <Icons.MapPin className="w-3 h-3 text-[#D4A843] shrink-0" />
            <span className="truncate font-medium">{distanceOrAddress}</span>
          </div>

          {/* Feature tags */}
          {features && features.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {features.slice(0, 2).map((feat, idx) => (
                <span
                  key={idx}
                  className="text-[8px] bg-[#2A1E10] border border-[#3D2D18] text-[#B89A6A] px-2 py-0.5 rounded-lg font-semibold"
                >
                  {feat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 p-3 mt-2 border-t border-[#2E2016]/60">
        <button className="flex-1 bg-[#D4A843] hover:bg-[#E8BC55] text-[#0D0B08] font-black text-[11px] py-2.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(212,168,67,0.2)] hover:shadow-[0_6px_20px_rgba(212,168,67,0.35)] active:scale-95">
          {isClaimed ? "View Details" : "Claim Business"}
        </button>
        <button className="w-10 h-10 shrink-0 bg-[#2A1E10] hover:bg-[#3D2D18] border border-[#3D2D18] hover:border-[#D4A843]/40 rounded-xl flex items-center justify-center active:scale-95 transition-all">
          <Icons.Phone className="w-4 h-4 text-[#D4A843]" />
        </button>
      </div>

    </div>
  );
}
