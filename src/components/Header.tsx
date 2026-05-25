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
    <header className="sticky top-0 z-40 w-full bg-[#0A101D] border-b border-white/5 py-4 px-6 md:px-12 hidden md:block">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* Logo Brand */}
        <a href="/" className="text-[#E5C158] font-bold text-xl tracking-wider">
          SD DIRECTORY
        </a>

        {/* Center Navigation */}
        <nav className="hidden lg:flex items-center gap-10 text-[15px] font-medium text-[#E2E8F0]">
          <a href="#" className="hover:text-[#E5C158] transition-colors">Explore</a>
          <a href="#" className="hover:text-[#E5C158] transition-colors">Near Me</a>
          <a href="#" className="hover:text-[#E5C158] transition-colors">Search</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-8">
          {loading && !activeUser ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#E5C158]/20 border-t-[#E5C158] animate-spin" />
          ) : activeUser ? (
            <a href="/dashboard" className="text-[15px] font-medium text-[#E2E8F0] hover:text-[#E5C158] transition-colors">
              Dashboard
            </a>
          ) : (
            <a href="/login" className="text-[15px] font-medium text-[#E2E8F0] hover:text-[#E5C158] transition-colors">
              Login
            </a>
          )}
          
          <a 
            href="/list-business"
            className="bg-gradient-to-b from-[#F6D365] to-[#D5A021] text-[#1A1A1A] font-bold text-[15px] px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(229,193,88,0.2)] hover:shadow-[0_0_30px_rgba(229,193,88,0.4)] transition-all"
          >
            List Your Business
          </a>
        </div>

      </div>
    </header>
  );
}
