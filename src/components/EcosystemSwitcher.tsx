"use client";

import React, { useState, useEffect } from "react";

export default function EcosystemSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      setUserEmail(localStorage.getItem("sd_current_user_email"));
      setUserName(localStorage.getItem("sd_current_user_name"));
      setUserAvatar(localStorage.getItem("sd_current_user_avatar"));
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("sd_auth_change", checkAuth);
    return () => window.removeEventListener("sd_auth_change", checkAuth);
  }, []);

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out from the SD Ecosystem?")) {
      localStorage.removeItem("sd_current_user_email");
      localStorage.removeItem("sd_current_user_name");
      localStorage.removeItem("sd_current_user_avatar");
      localStorage.removeItem("sd_current_user_role");
      localStorage.removeItem("sd_current_user_uid");
      checkAuth();
      window.dispatchEvent(new Event("sd_auth_change"));
      window.location.reload();
    }
  };

  const projects = [
    {
      name: "Gold Hub",
      desc: "Luxury Gold Jewelry Marketplace",
      url: "https://sd-gold-hub.vercel.app",
      icon: "💛",
      badge: "Marketplace"
    },
    {
      name: "Bhulia Hub",
      desc: "Authentic Sambalpuri Handlooms",
      url: "https://sd-bhulia-hub.vercel.app",
      icon: "🧵",
      badge: "Heritage"
    },
    {
      name: "SD Directory",
      desc: "Odisha Business & Artisan Index",
      url: "https://sd-directory.vercel.app",
      icon: "🧭",
      badge: "Index"
    },
    {
      name: "DehaPa Health",
      desc: "Next-Gen Telemedicine & Patient Portal",
      url: "https://sd-dehapa-hub.vercel.app",
      icon: "🏥",
      badge: "Healthcare"
    },
    {
      name: "IT Hub",
      desc: "Enterprise SaaS & Hosting Nodes",
      url: "https://sd-it-hub-w3sk.vercel.app",
      icon: "💻",
      badge: "Infrastructure"
    }
  ];

  return (
    <div className="relative inline-block text-left z-50 font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(197,160,89,0.3)] hover:brightness-110 transition-all cursor-pointer shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span>Ecosystem Switcher</span>
        <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-[#090F1D]/95 border border-[#C5A059]/40 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden text-left animate-fadeIn">
            <div className="bg-[#111827]/50 px-4 py-3 border-b border-[#2A344A]">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">Shyam Dash Creation</h4>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Ecosystem Node Switcher</p>
            </div>

            <div className="p-2 space-y-1">
              {projects.map((project) => (
                <a
                  key={project.name}
                  href={project.url}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <span className="text-xl shrink-0 mt-0.5">{project.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-[#C5A059] transition-colors">{project.name}</span>
                      <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 group-hover:border-[#C5A059]/30 group-hover:text-[#C5A059] transition-colors shrink-0">
                        {project.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5 group-hover:text-gray-300 transition-colors">{project.desc}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="bg-[#111827]/50 p-3 border-t border-[#2A344A] flex flex-col gap-2">
              {userEmail ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {userAvatar ? (
                      <img src={userAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-[#C5A059]" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#C5A059] text-[#0A1021] flex items-center justify-center font-bold text-[10px] shrink-0">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold text-white block truncate leading-none">{userName || userEmail.split("@")[0]}</span>
                      <span className="text-[8px] text-[#C5A059] uppercase tracking-wider block mt-0.5 font-mono truncate">{userEmail}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider cursor-pointer bg-red-950/20 border border-red-500/20 px-2 py-1 rounded-md shrink-0 hover:bg-red-950/40 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <a
                  href="https://sd-auth-center.vercel.app"
                  className="w-full py-2 bg-gradient-to-r from-[#996515] to-[#C5A059] text-center text-[#0A1021] font-bold text-[10px] uppercase tracking-wider rounded-lg shadow hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Universal Sign In (SSO)</span>
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
