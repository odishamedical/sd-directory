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
  isFeatured?: boolean;
  features?: string[];
  onWishlistToggle?: (id: string, e: React.MouseEvent) => void;
  isWishlisted?: boolean;
  // Admin props
  isAdmin?: boolean;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onFeature?: (e: React.MouseEvent) => void;
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
  isFeatured = false,
  features = [],
  onWishlistToggle,
  isWishlisted = false,
  isAdmin = false,
  onEdit,
  onDelete,
  onFeature,
}: DirectoryCardProps) {
  const showClaimedBadge = isClaimed;

  return (
    <div
      className="rounded-3xl flex flex-col justify-between transition-all duration-500 group h-full relative overflow-hidden select-none shadow-lg"
      style={{
        background: "#071428",
        border: isFeatured
          ? "1px solid rgba(0,212,255,0.45)"
          : "1px solid rgba(0, 212, 255, 0.10)",
        boxShadow: isFeatured
          ? "0 0 30px rgba(0,212,255,0.15), 0 4px 20px rgba(0,0,0,0.4)"
          : "0 4px 20px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.border =
          "1px solid rgba(0, 212, 255, 0.45)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 0 30px rgba(0,212,255,0.12), 0 8px 32px rgba(0,0,0,0.5)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.border = isFeatured
          ? "1px solid rgba(0,212,255,0.45)"
          : "1px solid rgba(0, 212, 255, 0.10)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = isFeatured
          ? "0 0 30px rgba(0,212,255,0.15), 0 4px 20px rgba(0,0,0,0.4)"
          : "0 4px 20px rgba(0,0,0,0.4)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Cyan top glow strip on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,212,255,0.6), rgba(129,140,248,0.4), transparent)",
        }}
      />

      <div className="flex flex-col gap-0">
        {/* Poster Image Container */}
        <div
          className="w-full aspect-[4/3] rounded-t-3xl overflow-hidden relative"
          style={{ background: "#020810" }}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Cinematic gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, #071428 0%, rgba(7,20,40,0.3) 50%, transparent 100%)",
            }}
          />

          {/* Featured badge — top left */}
          {isFeatured && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #00D4FF, #38BDF8)",
                color: "#020810",
                boxShadow: "0 2px 12px rgba(0,212,255,0.5)",
              }}
            >
              <Icons.Star className="w-3 h-3 fill-[#020810] stroke-none" />
              <span>Featured</span>
            </div>
          )}

          {/* CLAIMED badge — top left (only when not featured) */}
          {showClaimedBadge && !isFeatured && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #00D4FF, #38BDF8)",
                color: "#020810",
                boxShadow: "0 2px 12px rgba(0,212,255,0.4)",
              }}
            >
              <Icons.BadgeCheck className="w-3 h-3" />
              <span>Claimed</span>
            </div>
          )}

          {/* Wishlist heart — top right */}
          {onWishlistToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWishlistToggle(id, e);
              }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all active:scale-90 ${
                isWishlisted
                  ? "bg-red-500/20 border-red-500/50"
                  : "bg-[#020810]/70 border-white/10 hover:border-[#00D4FF]/40"
              }`}
            >
              <Icons.Heart
                className={`w-4 h-4 transition-colors ${
                  isWishlisted ? "text-red-400 fill-red-400" : "text-[#4A7A9B]"
                }`}
              />
            </button>
          )}

          {/* Rating badge — bottom right */}
          <div
            className="absolute bottom-3 right-3 px-2 py-1 rounded-xl font-black text-[10px] flex items-center gap-1 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #00D4FF, #38BDF8)",
              color: "#020810",
              boxShadow: "0 2px 10px rgba(0,212,255,0.5)",
            }}
          >
            <Icons.Star className="w-3 h-3 fill-[#020810] stroke-none" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Card content */}
        <div className="px-3 pt-3 pb-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <span
              className="text-[9px] uppercase tracking-[0.15em] font-black"
              style={{ color: "#00D4FF" }}
            >
              {category.replace("_", " ")}
            </span>
            <span className="text-[9px] font-bold" style={{ color: "#4A7A9B" }}>
              {priceLevel}
            </span>
          </div>

          <h3
            className="font-extrabold text-[14px] sm:text-[15px] leading-snug tracking-tight line-clamp-2 min-h-[2.4rem] transition-colors duration-300"
            style={{ color: "#E8F4FF" }}
          >
            {title}
          </h3>

          <div
            className="flex items-center gap-1.5 text-[10px]"
            style={{ color: "#4A7A9B" }}
          >
            <Icons.MapPin
              className="w-3 h-3 shrink-0"
              style={{ color: "#00D4FF" }}
            />
            <span className="truncate font-medium">{distanceOrAddress}</span>
          </div>

          {features && features.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {features.slice(0, 2).map((feat, idx) => (
                <span
                  key={idx}
                  className="text-[8px] px-2 py-0.5 rounded-lg font-semibold"
                  style={{
                    background: "rgba(0, 212, 255, 0.08)",
                    border: "1px solid rgba(0, 212, 255, 0.18)",
                    color: "#7BA3C8",
                  }}
                >
                  {feat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="flex gap-2 p-3 mt-2"
        style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}
      >
        <button
          className="flex-1 font-black text-[11px] py-2.5 rounded-xl transition-all active:scale-95 text-[#020810]"
          style={{
            background: "linear-gradient(135deg, #00D4FF 0%, #38BDF8 100%)",
            boxShadow: "0 4px 16px rgba(0,212,255,0.25)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 6px 24px rgba(0,212,255,0.45)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 4px 16px rgba(0,212,255,0.25)";
          }}
        >
          {isClaimed ? "View Details" : "Claim Business"}
        </button>
        <button
          className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center active:scale-95 transition-all"
          style={{
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.18)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(0,212,255,0.15)";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(0,212,255,0.40)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(0,212,255,0.08)";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(0,212,255,0.18)";
          }}
        >
          <Icons.Phone className="w-4 h-4" style={{ color: "#00D4FF" }} />
        </button>
      </div>

      {/* ===== ADMIN ACTION BAR ===== */}
      {isAdmin && (
        <div
          className="flex items-center gap-1.5 px-3 py-2.5"
          style={{
            borderTop: "1px solid rgba(0,212,255,0.12)",
            background: "rgba(0,212,255,0.04)",
          }}
        >
          <span
            className="text-[9px] font-black uppercase tracking-widest mr-auto"
            style={{ color: "rgba(0,212,255,0.4)" }}
          >
            Admin
          </span>

          {/* Edit */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(e); }}
            title="Edit Listing"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95"
            style={{
              background: "rgba(56,189,248,0.10)",
              border: "1px solid rgba(56,189,248,0.25)",
              color: "#38BDF8",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(56,189,248,0.20)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(56,189,248,0.10)";
            }}
          >
            <Icons.Edit3 className="w-3 h-3" />
            Edit
          </button>

          {/* Feature toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); onFeature?.(e); }}
            title={isFeatured ? "Remove Featured" : "Mark as Featured"}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95"
            style={{
              background: isFeatured
                ? "rgba(0,212,255,0.18)"
                : "rgba(0,212,255,0.06)",
              border: isFeatured
                ? "1px solid rgba(0,212,255,0.45)"
                : "1px solid rgba(0,212,255,0.15)",
              color: isFeatured ? "#00D4FF" : "#4A7A9B",
            }}
          >
            <Icons.Star
              className="w-3 h-3"
              style={{ fill: isFeatured ? "#00D4FF" : "none" }}
            />
            {isFeatured ? "Unfeature" : "Feature"}
          </button>

          {/* Delete */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(e); }}
            title="Delete Listing"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95"
            style={{
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#F87171",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(239,68,68,0.20)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(239,68,68,0.10)";
            }}
          >
            <Icons.Trash2 className="w-3 h-3" />
            Del
          </button>
        </div>
      )}
    </div>
  );
}
