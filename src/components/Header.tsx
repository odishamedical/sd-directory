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
    <header className="sticky top-0 z-40 w-full border-b py-4 px-6 md:px-12 hidden md:block"
      style={{
        background: "rgba(3, 11, 26, 0.95)",
        borderColor: "rgba(0, 212, 255, 0.10)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.04)"
      }}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* Logo Brand — Cyan Glow */}
        <a
          href="/"
          className="font-black text-xl tracking-widest uppercase"
          style={{
            background: "linear-gradient(135deg, #00D4FF 0%, #38BDF8 60%, #818CF8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 12px rgba(0,212,255,0.5))"
          }}
        >
          SD Directory
        </a>

        {/* Center Navigation */}
        <nav className="hidden lg:flex items-center gap-10 text-[15px] font-medium text-[#7BA3C8]">
          <a href="#" className="hover:text-[#00D4FF] transition-colors duration-200">Explore</a>
          <a href="#" className="hover:text-[#00D4FF] transition-colors duration-200">Near Me</a>
          <a href="#" className="hover:text-[#00D4FF] transition-colors duration-200">Search</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-8">
          {loading && !activeUser ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#00D4FF]/20 border-t-[#00D4FF] animate-spin" />
          ) : activeUser ? (
            <a href="/dashboard" className="text-[15px] font-medium text-[#7BA3C8] hover:text-[#00D4FF] transition-colors">
              Dashboard
            </a>
          ) : (
            <a href="/login" className="text-[15px] font-medium text-[#7BA3C8] hover:text-[#00D4FF] transition-colors">
              Login
            </a>
          )}
          
          <a 
            href="/list-business"
            className="font-bold text-[15px] px-6 py-2.5 rounded-xl text-[#020810] transition-all"
            style={{
              background: "linear-gradient(135deg, #00D4FF 0%, #38BDF8 100%)",
              boxShadow: "0 0 20px rgba(0,212,255,0.30)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 35px rgba(0,212,255,0.55)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 20px rgba(0,212,255,0.30)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            List Your Business
          </a>
        </div>

      </div>
    </header>
  );
}
