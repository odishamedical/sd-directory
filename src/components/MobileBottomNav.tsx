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
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0A101D]/95 backdrop-blur-lg border-t border-white/5 pb-safe px-4 pt-2.5 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      
      {/* Home / All Listings */}
      <button 
        onClick={() => onTabChange?.("all")}
        className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer group focus:outline-none"
      >
        {currentFilter === "all" && (
          <div className="absolute inset-0 bg-[#E5C158] blur-[15px] opacity-25 rounded-full"></div>
        )}
        <Icons.Home className={`w-6 h-6 relative z-10 transition-colors ${currentFilter === "all" ? "text-[#E5C158] fill-[#E5C158]" : "text-[#64748B] group-hover:text-white"}`} />
        {currentFilter === "all" && (
          <div className="w-1 h-1 bg-[#E5C158] rounded-full absolute bottom-1 shadow-[0_0_10px_#E5C158] z-10"></div>
        )}
      </button>

      {/* Search (Focus Input & Scroll to Search) */}
      <button 
        onClick={onSearchClick}
        className="flex flex-col items-center justify-center w-12 h-12 cursor-pointer text-[#64748B] hover:text-white transition-colors focus:outline-none"
      >
        <Icons.Search className="w-6 h-6" />
      </button>

      {/* Profile */}
      <button 
        onClick={onProfileClick}
        className="flex flex-col items-center justify-center w-12 h-12 cursor-pointer text-[#64748B] hover:text-white transition-colors focus:outline-none"
      >
        <Icons.User className="w-6 h-6" />
      </button>

      {/* Favorites (Wishlist) */}
      <button 
        onClick={() => onTabChange?.("wishlist")}
        className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer group focus:outline-none"
      >
        {currentFilter === "wishlist" && (
          <div className="absolute inset-0 bg-[#E5C158] blur-[15px] opacity-25 rounded-full"></div>
        )}
        <Icons.Heart className={`w-6 h-6 relative z-10 transition-colors ${currentFilter === "wishlist" ? "text-[#E5C158] fill-[#E5C158]" : "text-[#64748B] group-hover:text-white"}`} />
        {currentFilter === "wishlist" && (
          <div className="w-1 h-1 bg-[#E5C158] rounded-full absolute bottom-1 shadow-[0_0_10px_#E5C158] z-10"></div>
        )}
      </button>

      {/* Bookmarks (Claimed) */}
      <button 
        onClick={() => onTabChange?.("claimed")}
        className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer group focus:outline-none"
      >
        {currentFilter === "claimed" && (
          <div className="absolute inset-0 bg-[#E5C158] blur-[15px] opacity-25 rounded-full"></div>
        )}
        <Icons.Bookmark className={`w-6 h-6 relative z-10 transition-colors ${currentFilter === "claimed" ? "text-[#E5C158] fill-[#E5C158]" : "text-[#64748B] group-hover:text-white"}`} />
        {currentFilter === "claimed" && (
          <div className="w-1 h-1 bg-[#E5C158] rounded-full absolute bottom-1 shadow-[0_0_10px_#E5C158] z-10"></div>
        )}
      </button>

    </div>
  );
}
