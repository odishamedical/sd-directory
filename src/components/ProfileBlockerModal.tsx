"use client";

import React from "react";

interface ProfileBlockerModalProps {
  onClose: () => void;
  actionName?: string;
  originHub?: string;
}

export default function ProfileBlockerModal({ onClose, actionName = "perform this action", originHub }: ProfileBlockerModalProps) {
  const handleCompleteProfile = () => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      const authCenterBase = window.location.hostname === "localhost" 
        ? "http://localhost:3000" 
        : "https://sd-auth-center.vercel.app";
      
      const inviteRef = sessionStorage.getItem("sd_invite_ref") || "";
      const inviteName = sessionStorage.getItem("sd_invite_name") || "";
      
      const params = new URLSearchParams();
      params.set("redirect_uri", currentUrl);
      if (inviteRef) params.set("ref", inviteRef);
      if (inviteName) params.set("invite_name", inviteName);
      
      window.location.href = `${authCenterBase}?${params.toString()}`;
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#020610]/95 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0A1021] border-2 border-[#C5A059] rounded-3xl shadow-[0_0_50px_rgba(197,160,89,0.3)] overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200">
        
        {/* Glow indicator */}
        <div className="h-1.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent w-full -mt-6 -mx-6 mb-6" />
        
        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] text-3xl shadow-[0_0_20px_rgba(197,160,89,0.1)]">
            ⚠️
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-wider text-white font-serif">PROFILE REGISTRATION REQUIRED</h3>
            <p className="text-[10px] text-[#C5A059] uppercase tracking-widest font-mono mt-1">WhatsApp Verification Locked</p>
          </div>
        </div>

        {/* Message body */}
        <div className="text-center text-xs text-gray-300 leading-relaxed px-2 space-y-3 font-sans">
          <p>
            To complete your order checkout, consult doctors, claim listings, or submit reviews, you must verify your profile details.
          </p>
          <div className="bg-[#C5A059]/10 border border-[#C5A059]/20 p-3.5 rounded-xl text-left text-[11px] text-white leading-normal">
            <span className="font-bold text-[#C5A059] uppercase block mb-1">🎁 Ecosystem Promotion Alert</span>
            Registration is currently <strong className="text-[#FFE082]">FREE</strong> for new accounts. Fill up your details now before it becomes paid!
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5 mt-6">
          <button 
            onClick={handleCompleteProfile}
            className="w-full py-3 bg-gradient-to-r from-[#996515] via-[#C5A059] to-[#996515] text-[#0A1021] rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer shadow-lg font-sans"
          >
            Complete Profile Now (Free)
          </button>
          
          <button 
            onClick={onClose}
            className="w-full py-3 border border-slate-800 hover:bg-slate-900 text-gray-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer font-sans"
          >
            Continue in Read-Only Mode
          </button>
        </div>

      </div>
    </div>
  );
}
