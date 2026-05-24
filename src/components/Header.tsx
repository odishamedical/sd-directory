import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user: firebaseUser, loading } = useAuth();
  const [ssoUser, setSsoUser] = useState<any>(null);

  const checkSso = () => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("sd_current_user_email");
      if (email) {
        setSsoUser({
          email,
          displayName: localStorage.getItem("sd_current_user_name") || email.split("@")[0],
          photoURL: localStorage.getItem("sd_current_user_avatar")
        });
      } else {
        setSsoUser(null);
      }
    }
  };

  useEffect(() => {
    checkSso();
    window.addEventListener("sd_auth_change", checkSso);
    return () => window.removeEventListener("sd_auth_change", checkSso);
  }, []);

  const activeUser = firebaseUser || ssoUser;

  return (
    <header className="sticky top-2 z-40 w-full px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto glass-panel border border-[rgba(229,193,88,0.18)] rounded-2xl px-6 py-4 flex items-center justify-between backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-[#090F1D]/80">
        
        {/* Logo Brand */}
        <a href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-gradient p-[1px]">
            <div className="w-full h-full bg-[#060c18] rounded-xl flex items-center justify-center">
              <Icons.Compass className="w-5 h-5 text-[#e5c158]" />
            </div>
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-white block font-serif">SHYAM DASH</span>
            <span className="text-[10px] text-[#e5c158] tracking-widest uppercase block -mt-1 font-bold">DIRECTORY</span>
          </div>
        </a>

        {/* Local Navigation Badge / Info */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider text-[#e5c158] bg-[#e5c158]/5 border border-[#e5c158]/20">
            Odisha Artisan & Business Index
          </span>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          {loading && !activeUser ? (
            <div className="w-6 h-6 rounded-full border-2 border-[#e5c158]/20 border-t-[#e5c158] animate-spin" />
          ) : activeUser ? (
            <a 
              href="/dashboard"
              className="px-4 py-1.5 rounded-lg bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Icons.LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
          ) : null}
        </div>

      </div>
    </header>
  );
}
