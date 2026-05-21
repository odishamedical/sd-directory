"use client";

import React, { useState, useEffect } from "react";

export default function EcosystemSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      // 1. Check for incoming SSO tokens in the URL
      const params = new URLSearchParams(window.location.search);
      const ssoEmail = params.get("sso_email");
      const ssoName = params.get("sso_name");
      const ssoAvatar = params.get("sso_avatar");
      const ssoRole = params.get("sso_role");

      if (ssoEmail) {
        // Save new SSO session to this domain's localStorage
        localStorage.setItem("sd_current_user_email", ssoEmail);
        if (ssoName) localStorage.setItem("sd_current_user_name", ssoName);
        if (ssoAvatar) localStorage.setItem("sd_current_user_avatar", ssoAvatar);
        if (ssoRole) localStorage.setItem("sd_current_user_role", ssoRole);
        
        // Clean up the URL to hide the tokens (optional but looks professional)
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // 2. Load from localStorage
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

  // Add styles for the mobile slide-up animation
  useEffect(() => {
    if (!document.getElementById("sd-ecosystem-styles")) {
      const style = document.createElement("style");
      style.id = "sd-ecosystem-styles";
      style.innerHTML = `
        @keyframes slideUpDrawer {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUpDrawer {
          animation: slideUpDrawer 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Close drawer on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

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
        className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] font-bold text-[10px] md:text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(197,160,89,0.3)] hover:brightness-110 transition-all cursor-pointer shrink-0"
      >
        <svg className="w-3.5 h-3.5 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="hidden md:inline">Ecosystem Switcher</span>
        <span className="md:hidden">SD Ecosystem</span>
        <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Global Overlay backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fadeIn" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Responsive Menu Container */}
          <div className="fixed md:absolute inset-x-0 bottom-0 md:inset-auto md:right-0 md:top-full md:mt-2.5 w-full md:w-80 bg-[#090F1D]/95 border-t md:border border-[#C5A059]/40 rounded-t-3xl md:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden text-left transform transition-transform duration-300 md:animate-fadeIn animate-slideUpDrawer backdrop-blur-xl flex flex-col max-h-[85vh] md:max-h-none">
            
            {/* Mobile Drag Handle */}
            <div className="w-full flex justify-center py-3 md:hidden">
              <div className="w-12 h-1.5 bg-[#2A344A] rounded-full"></div>
            </div>

            <div className="bg-[#111827]/50 px-4 md:px-4 py-2 md:py-3 border-b border-[#2A344A]">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">Shyam Dash Creation</h4>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Ecosystem Node Switcher</p>
            </div>

            <div className="p-2 space-y-1 overflow-y-auto overscroll-contain flex-1 md:flex-none">
              {projects.map((project) => (
                <a
                  key={project.name}
                  href={project.url}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 p-3 md:p-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all group"
                >
                  <span className="text-2xl md:text-xl shrink-0 mt-0.5 md:mt-0.5">{project.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm md:text-xs font-bold text-white group-hover:text-[#C5A059] transition-colors">{project.name}</span>
                      <span className="text-[9px] md:text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 group-hover:border-[#C5A059]/30 group-hover:text-[#C5A059] transition-colors shrink-0">
                        {project.badge}
                      </span>
                    </div>
                    <p className="text-xs md:text-[10px] text-gray-400 leading-tight mt-0.5 group-hover:text-gray-300 transition-colors">{project.desc}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="bg-[#111827]/50 p-4 md:p-3 border-t border-[#2A344A] flex flex-col gap-2 shrink-0 pb-safe">
              {userEmail ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 md:gap-2 overflow-hidden">
                    {userAvatar ? (
                      <img src={userAvatar} alt="" className="w-8 h-8 md:w-6 md:h-6 rounded-full object-cover border border-[#C5A059]" />
                    ) : (
                      <div className="w-8 h-8 md:w-6 md:h-6 rounded-full bg-[#C5A059] text-[#0A1021] flex items-center justify-center font-bold text-xs md:text-[10px] shrink-0">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <span className="text-xs md:text-[10px] font-bold text-white block truncate leading-none">{userName || userEmail.split("@")[0]}</span>
                      <span className="text-[10px] md:text-[8px] text-[#C5A059] uppercase tracking-wider block mt-0.5 font-mono truncate">{userEmail}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-[10px] md:text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider cursor-pointer bg-red-950/20 border border-red-500/20 px-3 py-1.5 md:px-2 md:py-1 rounded-md shrink-0 hover:bg-red-950/40 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <a
                  href="https://sd-auth-center.vercel.app"
                  className="w-full py-3 md:py-2 bg-gradient-to-r from-[#996515] to-[#C5A059] text-center text-[#0A1021] font-bold text-[11px] md:text-[10px] uppercase tracking-wider rounded-xl md:rounded-lg shadow hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
