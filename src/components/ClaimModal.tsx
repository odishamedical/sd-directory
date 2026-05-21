import React, { useState } from "react";
import * as Icons from "lucide-react";

interface ClaimModalProps {
  listing: {
    id: string;
    name: string;
    category: string;
    address: string;
  };
  onClose: () => void;
  onSuccess: (listingId: string) => void;
}

export default function ClaimModal({ listing, onClose, onSuccess }: ClaimModalProps) {
  const [step, setStep] = useState(1);
  const [website, setWebsite] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Owner");
  const [docType, setDocType] = useState(
    listing.category === "handlooms"
      ? "Weaver ID Card"
      : listing.category === "doctors"
      ? "Medical Registration ID"
      : listing.category === "jewelry"
      ? "GSTIN / BIS Certificate"
      : "Trade License"
  );
  const [docNumber, setDocNumber] = useState("");
  const [docFile, setDocFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (step === 1 && !website.trim()) {
      alert("Please provide an official website or social media page.");
      return;
    }
    if (step === 2 && (!ownerName.trim() || !email.trim() || !phone.trim())) {
      alert("Please fill in all contact information fields.");
      return;
    }
    if (step === 3 && !docNumber.trim()) {
      alert("Please provide the registration certificate number.");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Save locally to simulate backend store
      const claims = JSON.parse(localStorage.getItem("sd_listing_claims") || "[]");
      claims.push({
        listingId: listing.id,
        listingName: listing.name,
        category: listing.category,
        website,
        ownerName,
        email,
        phone,
        role,
        docType,
        docNumber,
        submittedAt: new Date().toISOString(),
        status: "Pending Verification"
      });
      localStorage.setItem("sd_listing_claims", JSON.stringify(claims));

      // Trigger success callback
      onSuccess(listing.id);
      setStep(4);
    }, 1500);
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      jewelry: "Jewelry Store",
      handlooms: "Handloom Weaver",
      doctors: "Doctor / Clinic",
      it_services: "IT Services Provider",
      retail: "Retail Business",
      restaurants: "Restaurant"
    };
    return map[cat] || cat;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl relative border border-[rgba(229,193,88,0.25)] animate-float">
        
        {/* Glowing Ambient Top Bar */}
        <div className="h-1 bg-gold-gradient w-full" />
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#e5c158] block mb-0.5">Verification Wizard</span>
            <h3 className="text-lg font-bold text-white">Claim: {listing.name}</h3>
          </div>
          {step < 4 && (
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Wizard Steps indicator */}
        {step < 4 && (
          <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800/40 flex justify-between items-center text-xs text-slate-400">
            <div className="flex gap-4 items-center">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step === 1 ? "bg-gold-gradient text-slate-950" : "bg-slate-800 text-slate-300"}`}>1</span>
              <span className={step === 1 ? "text-white font-bold" : ""}>Business</span>
            </div>
            <Icons.ChevronRight className="w-4 h-4 text-slate-700" />
            <div className="flex gap-4 items-center">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step === 2 ? "bg-gold-gradient text-slate-950" : "bg-slate-800 text-slate-300"}`}>2</span>
              <span className={step === 2 ? "text-white font-bold" : ""}>Contact</span>
            </div>
            <Icons.ChevronRight className="w-4 h-4 text-slate-700" />
            <div className="flex gap-4 items-center">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step === 3 ? "bg-gold-gradient text-slate-950" : "bg-slate-800 text-slate-300"}`}>3</span>
              <span className={step === 3 ? "text-white font-bold" : ""}>Verify</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Confirm listing parameters and provide your official digital credentials. We will compare this data to public Google records.
              </p>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Company Listing</label>
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white flex items-center justify-between">
                  <span>{listing.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5c158] bg-[#e5c158]/10 px-2 py-0.5 rounded-full">
                    {getCategoryLabel(listing.category)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Registered Address</label>
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300">
                  {listing.address}
                </div>
              </div>

              <div>
                <label htmlFor="website" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Official Website or Facebook/Social Page *</label>
                <input 
                  type="url" 
                  id="website"
                  placeholder="https://example.com or https://facebook.com/business"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-[#e5c158] focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide contact details for the primary representative who will receive login access once verification passes.
              </p>
              <div>
                <label htmlFor="owner-name" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Full Name *</label>
                <input 
                  type="text" 
                  id="owner-name"
                  placeholder="Mr/Ms. Sahu"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-[#e5c158] focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Email ID *</label>
                  <input 
                    type="email" 
                    id="email"
                    placeholder="contact@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-[#e5c158] focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Mobile / WhatsApp *</label>
                  <input 
                    type="tel" 
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-[#e5c158] focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Your Relationship to Business *</label>
                <select 
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-[#e5c158] focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors"
                >
                  <option value="Owner">Primary Owner / Director</option>
                  <option value="Manager">Store Manager / Head of Operations</option>
                  <option value="Agent">Authorized Agency / IT Consultant</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your official proof of identity to guarantee authenticity and GI-Tag compliance under SD ecosystem bylaws.
              </p>
              
              <div>
                <label htmlFor="doc-type" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Document Type *</label>
                <select 
                  id="doc-type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-[#e5c158] focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors"
                >
                  <option value="GSTIN / BIS Certificate">GSTIN Number / BIS Gold Certificate</option>
                  <option value="Weaver ID Card">Primary Weaver Cooperative Society ID Card</option>
                  <option value="Medical Registration ID">Odisha Medical Council License ID</option>
                  <option value="Trade License">Municipal Trade License certificate</option>
                  <option value="Aadhaar / Pan Card">Aadhaar Card / Business PAN card</option>
                </select>
              </div>

              <div>
                <label htmlFor="doc-number" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Registration / Certificate Number *</label>
                <input 
                  type="text" 
                  id="doc-number"
                  placeholder="e.g. 21AAAAA1111A1Z1 or OMC-55678"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-[#e5c158] focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Upload Digital Copy (PDF/JPEG) *</label>
                <div className="w-full border-2 border-dashed border-slate-800 hover:border-[#e5c158]/50 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/20 transition-all flex flex-col items-center gap-2"
                  onClick={() => setDocFile("mock_upload_success.pdf")}
                >
                  <Icons.UploadCloud className="w-8 h-8 text-[#e5c158]/60" />
                  {docFile ? (
                    <div className="text-xs text-green-400 font-bold flex items-center gap-1">
                      <Icons.CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{docFile} (Ready for submission)</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-300 font-bold">Click to upload your registration file</p>
                      <p className="text-[10px] text-slate-500">Max size 5MB (PDF, JPG, PNG)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 border border-green-500/30 animate-pulse">
                <Icons.CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Claim Request Filed!</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Your verification file is submitted. Our moderation board will audit your GSTIN/Weaver ID against registry systems. We will email setup details to <strong className="text-white">{email}</strong> within 24 hours.
                </p>
              </div>
              
              <div className="w-full bg-[#e5c158]/5 border border-[#e5c158]/20 rounded-2xl p-4 text-left flex items-start gap-3 mt-4">
                <Icons.ShieldCheck className="w-5 h-5 text-[#e5c158] shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  <strong>SSO Integration Note:</strong> Since central SSO registration is offline, your email/phone has been staged for whitelist clearance. No immediate password is required.
                </p>
              </div>

              <button 
                onClick={onClose}
                className="px-6 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl hover:opacity-90 transition-all text-xs uppercase tracking-wider mt-6 w-full"
              >
                Close Verification portal
              </button>
            </div>
          )}
        </div>

        {/* Wizard Footer controls */}
        {step < 4 && (
          <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800 flex justify-between items-center">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={handleBack} 
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-all cursor-pointer"
              >
                <Icons.ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(229,193,88,0.2)]"
              >
                <span>Continue</span>
                <Icons.ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-lg hover:shadow-[0_0_15px_rgba(229,193,88,0.2)]"
              >
                {isSubmitting ? (
                  <>
                    <Icons.Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Icons.CheckCircle2 className="w-4 h-4" />
                    <span>Submit Claim Request</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
