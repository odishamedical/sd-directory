import React from "react";
import * as Icons from "lucide-react";
import EcosystemSwitcher from "./EcosystemSwitcher";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, loading, loginWithGoogle, logout } = useAuth();

  return (
    <header className="sticky top-4 z-40 w-full px-4 sm:px-6">
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

        {/* Nav Links Hub */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-300">
          <span className="px-4 py-1.5 rounded-lg border border-[#e5c158] text-[#e5c158] bg-[#e5c158]/5 font-black shadow-[0_0_10px_rgba(229,193,88,0.05)] cursor-default">
            Directory
          </span>
          <a href="https://sd-gold-hub.vercel.app" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg hover:text-[#e5c158] transition-colors flex items-center gap-1">
            <Icons.Gem className="w-3.5 h-3.5" />
            <span>Gold Hub</span>
          </a>
          <a href="https://sd-bhulia-hub.vercel.app" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg hover:text-[#e5c158] transition-colors flex items-center gap-1">
            <Icons.Scissors className="w-3.5 h-3.5" />
            <span>Bhulia Saree</span>
          </a>
          <a href="https://sd-dehapa-hub.vercel.app" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg hover:text-[#e5c158] transition-colors flex items-center gap-1">
            <Icons.HeartPulse className="w-3.5 h-3.5" />
            <span>DehaPa Health</span>
          </a>
          <a href="https://sd-it-hub-w3sk.vercel.app" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg hover:text-[#e5c158] transition-colors flex items-center gap-1">
            <Icons.Terminal className="w-3.5 h-3.5" />
            <span>IT Hub</span>
          </a>
        </nav>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <EcosystemSwitcher />
          
          {loading ? (
            <div className="w-8 h-8 rounded-full border-2 border-[#e5c158]/20 border-t-[#e5c158] animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-3 ml-2">
              <a 
                href="/dashboard"
                className="px-4 py-1.5 rounded-lg bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Icons.LayoutDashboard className="w-4 h-4" />
                Dashboard
              </a>
              <button 
                onClick={logout}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors group relative"
                title="Sign Out"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Icons.User className="w-4 h-4 text-slate-300 group-hover:text-white" />
                )}
              </button>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="px-4 py-1.5 rounded-lg border border-[#e5c158]/30 text-[#e5c158] font-bold text-xs uppercase tracking-wider hover:bg-[#e5c158]/10 transition-colors ml-2"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
