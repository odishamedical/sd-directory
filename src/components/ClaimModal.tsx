import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { db, addDoc, collection, serverTimestamp } from "../lib/firebase";
import { useAuth } from "@/context/AuthContext";
import ProfileBlockerModal from "./ProfileBlockerModal";
import PaymentSelectionModal from "./PaymentSelectionModal";

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
  const { user, loginWithGoogle } = useAuth();
  const [step, setStep] = useState(0); // Step 0 is Auth Check
  const [showProfileBlocker, setShowProfileBlocker] = useState(false);
  
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
  const [docFile, setDocFile] = useState<File | string | null>(null);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && step === 0) {
      const isComplete = localStorage.getItem("sd_current_user_profile_complete") === "true";
      if (!isComplete) {
        setShowProfileBlocker(true);
      } else {
        setStep(1);
        setOwnerName(user.displayName || "");
        setEmail(user.email || "");
      }
    }
  }, [user, step]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const docRef = await addDoc(collection(db, "claims"), {
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
        submittedAt: serverTimestamp(),
        status: "Pending Payment",
        uid: user?.uid || null
      });

      setClaimId(docRef.id);
      setStep(4);
    } catch (err) {
      console.error("Failed to submit claim:", err);
      alert("Error submitting claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

  if (showProfileBlocker) {
    return <ProfileBlockerModal onClose={onClose} />;
  }

  if (step === 4 && claimId) {
    return (
      <PaymentSelectionModal 
        listingId={listing.id} 
        claimId={claimId}
        onClose={onClose} 
        onSuccess={() => {
          setStep(5);
          onSuccess(listing.id);
        }} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl relative border border-[rgba(0,212,255,0.25)] animate-float">
        
        {/* Glowing Ambient Top Bar */}
        <div className="h-1 bg-cyan-gradient w-full" />
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">Verification Wizard</span>
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
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step === 1 ? "bg-cyan-gradient text-slate-950" : "bg-slate-800 text-slate-300"}`}>1</span>
              <span className={step === 1 ? "text-white font-bold" : ""}>Business</span>
            </div>
            <Icons.ChevronRight className="w-4 h-4 text-slate-700" />
            <div className="flex gap-4 items-center">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step === 2 ? "bg-cyan-gradient text-slate-950" : "bg-slate-800 text-slate-300"}`}>2</span>
              <span className={step === 2 ? "text-white font-bold" : ""}>Contact</span>
            </div>
            <Icons.ChevronRight className="w-4 h-4 text-slate-700" />
            <div className="flex gap-4 items-center">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step === 3 ? "bg-cyan-gradient text-slate-950" : "bg-slate-800 text-slate-300"}`}>3</span>
              <span className={step === 3 ? "text-white font-bold" : ""}>Verify</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {step === 0 && (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-400/30">
                <Icons.Lock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Authentication Required</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  To claim a business and manage it, you must be logged into the Shyam Dash Ecosystem.
                </p>
              </div>
              <button 
                onClick={loginWithGoogle}
                className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-3 mt-4"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign In with Google
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Confirm listing parameters and provide your official digital credentials. We will compare this data to public Google records.
              </p>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Company Listing</label>
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white flex items-center justify-between">
                  <span>{listing.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
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
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="website" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Website or Facebook/Social Page *</label>
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="accent-cyan-400 w-3 h-3 cursor-pointer"
                      checked={website === "I don't have a website or social media page"}
                      onChange={(e) => {
                        if (e.target.checked) setWebsite("I don't have a website or social media page");
                        else setWebsite("");
                      }}
                    />
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors">I don't have one</span>
                  </label>
                </div>
                <input 
                  type="url" 
                  id="website"
                  placeholder="https://example.com or https://facebook.com/business"
                  value={website === "I don't have a website or social media page" ? "" : website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={website === "I don't have a website or social media page"}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
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
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
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
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Your Relationship to Business *</label>
                <select 
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors"
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
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors"
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
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Upload Digital Copy (PDF/JPEG) *</label>
                <div className="w-full border-2 border-dashed border-slate-800 hover:border-cyan-400/50 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/20 transition-all flex flex-col items-center gap-2"
                  onClick={() => setDocFile("mock_upload_success.pdf")}
                >
                  <Icons.UploadCloud className="w-8 h-8 text-cyan-400/60" />
                  {docFile ? (
                    <div className="text-xs text-green-400 font-bold flex items-center gap-1">
                      <Icons.CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{typeof docFile === 'string' ? docFile : docFile.name} (Ready for submission)</span>
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

          {step === 5 && (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 border border-green-500/30 animate-pulse">
                <Icons.CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Claim Request Filed & Payment Received!</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Your payment was successful and verification file is submitted. Our moderation board will audit your details. We will email setup details to <strong className="text-white">{email}</strong> within 24 hours.
                </p>
              </div>
              
              <div className="w-full bg-cyan-400/5 border border-cyan-400/20 rounded-2xl p-4 text-left flex items-start gap-3 mt-4">
                <Icons.ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  <strong>SSO Integration Note:</strong> Since central SSO registration is offline, your email/phone has been staged for whitelist clearance. No immediate password is required.
                </p>
              </div>

              <button 
                onClick={onClose}
                className="px-6 py-3 btn-primary-cyan font-bold rounded-xl hover:opacity-90 transition-all text-xs uppercase tracking-wider mt-6 w-full"
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
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl btn-primary-cyan font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(0,212,255,0.2)]"
              >
                <span>Continue</span>
                <Icons.ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl btn-primary-cyan font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-lg hover:shadow-[0_0_15px_rgba(0,212,255,0.2)]"
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
