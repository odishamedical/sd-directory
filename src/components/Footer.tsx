"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }, 1500);
  };

  const ecosystemLinks = [
    { name: "SD Directory", url: "/", icon: <Icons.Search className="w-5 h-5" />, color: "from-[#00D4FF] to-[#007BFF]", isActive: true },
    { name: "Gold Hub", url: "https://sd-gold-hub.vercel.app", icon: <Icons.Gem className="w-5 h-5" />, color: "from-[#e5c158] to-[#b08d4b]", isActive: false },
    { name: "Sambalpuri Hub", url: "https://sd-bhulia-hub.vercel.app", icon: <Icons.Shirt className="w-5 h-5" />, color: "from-[#EF4444] to-[#991B1B]", isActive: false },
    { name: "Telemedicine", url: "https://sd-dehapa-hub.vercel.app", icon: <Icons.Stethoscope className="w-5 h-5" />, color: "from-[#10B981] to-[#047857]", isActive: false },
    { name: "News Hub", url: "https://sd-news-hub.vercel.app", icon: <Icons.Radio className="w-5 h-5" />, color: "from-[#8B5CF6] to-[#6D28D9]", isActive: false },
    { name: "IT & Digital", url: "https://sd-it-hub-w3sk.vercel.app", icon: <Icons.Cpu className="w-5 h-5" />, color: "from-[#F97316] to-[#C2410C]", isActive: false },
  ];

  return (
    <footer className="bg-[#020610] border-t border-slate-800/50 mt-20 pt-16 pb-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-[#00D4FF]/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 lg:gap-16 relative z-10">
        
        {/* Column 1: Ecosystem Grid */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Icons.Globe className="w-5 h-5 text-[#00D4FF]" /> The SD Ecosystem
          </h3>
          <p className="text-sm text-slate-400">
            Shyam Dash Creation is building a unified digital ecosystem. Explore our other dedicated platforms below.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ecosystemLinks.map((link, idx) => (
              <a 
                key={idx} 
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300 group
                  ${link.isActive 
                    ? 'bg-slate-800/80 border-[#00D4FF]/30 shadow-[0_0_15px_rgba(0,212,255,0.1)]' 
                    : 'bg-[#090F1D] border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 hover:-translate-y-1'
                  }`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${link.color} text-white shadow-lg`}>
                  {link.icon}
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white text-center">{link.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: About & Contact Info */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Icons.Building2 className="w-5 h-5 text-[#00D4FF]" /> About Us
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            <strong className="text-white">Shyam Dash Creation</strong> is dedicated to empowering local businesses, artisans, and professionals across Odisha by bridging the gap between traditional commerce and the digital future.
          </p>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                <Icons.MapPin className="w-4 h-4 text-[#00D4FF]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-300">Corporate Office</p>
                <p className="text-xs text-slate-500 mt-1">Satyasai Enclave Rd, Khandagiri<br/>Bhubaneswar, Odisha 751030</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                <Icons.Mail className="w-4 h-4 text-[#00D4FF]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-300">Email Address</p>
                <p className="text-xs text-slate-500 mt-1">contact@shyamdash.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                <Icons.Phone className="w-4 h-4 text-[#00D4FF]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-300">Support Line</p>
                <p className="text-xs text-slate-500 mt-1">+91 99384 66148</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Contact Form */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Icons.MessageSquare className="w-5 h-5 text-[#00D4FF]" /> Quick Contact
          </h3>
          <form onSubmit={handleSubmit} className="bg-[#090F1D] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Your Name" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#020610] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-all"
              />
            </div>
            <div>
              <input 
                type="email" 
                placeholder="Your Email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#020610] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-all"
              />
            </div>
            <div>
              <textarea 
                placeholder="How can we help you?" 
                rows={3}
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-[#020610] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-all resize-none"
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                ${submitStatus === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 
                  'bg-[#00D4FF] hover:bg-[#00b8e6] text-[#030B1A]'}
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : submitStatus === 'success' ? (
                <><Icons.Check className="w-4 h-4" /> Message Sent</>
              ) : (
                <><Icons.Send className="w-4 h-4" /> Send Message</>
              )}
            </button>
          </form>
        </div>

      </div>

      <div className="mt-16 pt-8 border-t border-slate-800/50 text-center relative z-10">
        <p className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} Shyam Dash Creation. All rights reserved. Built for the future of Odisha.
        </p>
      </div>
    </footer>
  );
}
