import React from "react";
import * as Icons from "lucide-react";

export default function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0A101D] border-t border-white/5 pb-safe px-4 pt-3 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      
      {/* Home (Active - Gold Glow) */}
      <div className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer group">
        <div className="absolute inset-0 bg-[#E5C158] blur-[15px] opacity-20 rounded-full"></div>
        <Icons.Home className="w-6 h-6 text-[#E5C158] fill-[#E5C158] relative z-10" />
        <div className="w-1 h-1 bg-[#E5C158] rounded-full absolute bottom-1 shadow-[0_0_10px_#E5C158]"></div>
      </div>

      {/* Search */}
      <div className="flex flex-col items-center justify-center w-12 h-12 cursor-pointer text-[#64748B] hover:text-white transition-colors">
        <Icons.Search className="w-6 h-6" />
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center justify-center w-12 h-12 cursor-pointer text-[#64748B] hover:text-white transition-colors">
        <Icons.User className="w-6 h-6" />
      </div>

      {/* Favorites */}
      <div className="flex flex-col items-center justify-center w-12 h-12 cursor-pointer text-[#64748B] hover:text-white transition-colors">
        <Icons.Heart className="w-6 h-6" />
      </div>

      {/* Bookmark */}
      <div className="flex flex-col items-center justify-center w-12 h-12 cursor-pointer text-[#64748B] hover:text-white transition-colors">
        <Icons.Bookmark className="w-6 h-6" />
      </div>

    </div>
  );
}
