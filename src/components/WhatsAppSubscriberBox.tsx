"use client";

import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as Icons from "lucide-react";

export default function WhatsAppSubscriberBox() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in both name and WhatsApp number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "whatsapp_subscribers"), {
        fullName: name.trim(),
        whatsapp: phone.trim(),
        source: "directory_hub_homepage",
        subscribedAt: serverTimestamp()
      });
      setSuccess(true);
      setName("");
      setPhone("");
    } catch (err: any) {
      console.error("Error saving subscriber:", err);
      setError("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-slate-200 relative overflow-hidden backdrop-blur-md">
      {/* Decorative pulse dot */}
      <div className="absolute top-4 right-4 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Icons.Send className="w-4 h-4 text-[#e5c158]" />
        <h5 className="font-bold text-xs uppercase tracking-wider text-[#e5c158]">WhatsApp Business Alerts</h5>
      </div>
      
      <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
        Get instant WhatsApp notifications when new local businesses, verified handloom stores, or craft opportunities register in your area.
      </p>

      {success ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-bold text-center space-y-1">
          <div>✓ Subscribed successfully!</div>
          <p className="font-normal text-[10px] text-slate-400">You will receive local listing alerts on WhatsApp.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="text-[#e5c158] hover:underline text-[10px] block mx-auto mt-2"
          >
            Add another number
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 relative z-10">
          <div>
            <input 
              type="text" 
              placeholder="Your Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 outline-none text-xs focus:border-[#e5c158]/40 transition-colors"
              required
            />
          </div>
          <div>
            <input 
              type="tel" 
              placeholder="WhatsApp Number (e.g. 919876543210)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 outline-none text-xs focus:border-[#e5c158]/40 transition-colors"
              required
            />
          </div>

          {error && <div className="text-red-400 text-[10px] font-bold">{error}</div>}

          <button 
            type="submit"
            disabled={loading}
            className="bg-yellow-600 hover:bg-[#e5c158] disabled:opacity-50 text-slate-950 font-black py-2 rounded-lg text-[10px] transition-all duration-300 uppercase tracking-widest font-mono cursor-pointer"
          >
            {loading ? "Subscribing..." : "Join Alert List"}
          </button>
        </form>
      )}
    </div>
  );
}
