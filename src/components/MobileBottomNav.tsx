import React from "react";
import * as Icons from "lucide-react";

export interface MobileBottomNavProps {
  currentFilter?: "all" | "wishlist" | "claimed";
  onTabChange?: (tab: "all" | "wishlist" | "claimed") => void;
  onSearchClick?: () => void;
  onProfileClick?: () => void;
}

export default function MobileBottomNav({
  currentFilter = "all",
  onTabChange,
  onSearchClick,
  onProfileClick,
}: MobileBottomNavProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe px-4 pt-2.5 flex justify-between items-center"
      style={{
        background: "rgba(3, 11, 26, 0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0, 212, 255, 0.10)",
        boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.6), 0 -1px 0 rgba(0,212,255,0.06)"
      }}
    >
      
      {/* Home / All Listings */}
      <button 
        onClick={() => onTabChange?.("all")}
        className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer group focus:outline-none"
      >
        {currentFilter === "all" && (
          <div className="absolute inset-0 rounded-full blur-[18px] opacity-30"
            style={{ background: "#00D4FF" }}
          />
        )}
        <Icons.Home
          className={`w-6 h-6 relative z-10 transition-colors ${currentFilter === "all" ? "fill-current" : "text-[#4A7A9B] group-hover:text-white"}`}
          style={{ color: currentFilter === "all" ? "#00D4FF" : undefined }}
        />
        {currentFilter === "all" && (
          <div className="w-1 h-1 rounded-full absolute bottom-1 z-10"
            style={{ background: "#00D4FF", boxShadow: "0 0 10px #00D4FF" }}
          />
        )}
      </button>

      {/* Search */}
      <button 
        onClick={onSearchClick}
        className="flex flex-col items-center justify-center w-12 h-12 cursor-pointer transition-colors focus:outline-none text-[#4A7A9B] hover:text-white"
      >
        <Icons.Search className="w-6 h-6" />
      </button>

      {/* Profile */}
      <button 
        onClick={onProfileClick}
        className="flex flex-col items-center justify-center w-12 h-12 cursor-pointer transition-colors focus:outline-none text-[#4A7A9B] hover:text-white"
      >
        <Icons.User className="w-6 h-6" />
      </button>

      {/* Favorites (Wishlist) */}
      <button 
        onClick={() => onTabChange?.("wishlist")}
        className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer group focus:outline-none"
      >
        {currentFilter === "wishlist" && (
          <div className="absolute inset-0 rounded-full blur-[18px] opacity-30"
            style={{ background: "#00D4FF" }}
          />
        )}
        <Icons.Heart
          className={`w-6 h-6 relative z-10 transition-colors ${currentFilter === "wishlist" ? "fill-current" : "text-[#4A7A9B] group-hover:text-white"}`}
          style={{ color: currentFilter === "wishlist" ? "#00D4FF" : undefined }}
        />
        {currentFilter === "wishlist" && (
          <div className="w-1 h-1 rounded-full absolute bottom-1 z-10"
            style={{ background: "#00D4FF", boxShadow: "0 0 10px #00D4FF" }}
          />
        )}
      </button>

      {/* Bookmarks (Claimed) */}
      <button 
        onClick={() => onTabChange?.("claimed")}
        className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer group focus:outline-none"
      >
        {currentFilter === "claimed" && (
          <div className="absolute inset-0 rounded-full blur-[18px] opacity-30"
            style={{ background: "#00D4FF" }}
          />
        )}
        <Icons.Bookmark
          className={`w-6 h-6 relative z-10 transition-colors ${currentFilter === "claimed" ? "fill-current" : "text-[#4A7A9B] group-hover:text-white"}`}
          style={{ color: currentFilter === "claimed" ? "#00D4FF" : undefined }}
        />
        {currentFilter === "claimed" && (
          <div className="w-1 h-1 rounded-full absolute bottom-1 z-10"
            style={{ background: "#00D4FF", boxShadow: "0 0 10px #00D4FF" }}
          />
        )}
      </button>

    </div>
  );
}
