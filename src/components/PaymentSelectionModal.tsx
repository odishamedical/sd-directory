import React, { useState } from "react";
import * as Icons from "lucide-react";
import { db, doc, updateDoc } from "../lib/firebase";

interface PaymentSelectionModalProps {
  listingId: string;
  claimId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentSelectionModal({ listingId, claimId, onClose, onSuccess }: PaymentSelectionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const tiers = [
    {
      id: "basic",
      name: "Basic",
      price: "₹1,500",
      description: "Ideal for small local shops.",
      features: [
        "Claim Ownership & 'Verified Storefront' Badge",
        "Update Business Description & Contact Info",
        "Upload 1 High-Quality Header Image",
        "Customer Reviews management"
      ]
    },
    {
      id: "professional",
      name: "Professional",
      price: "₹2,000",
      description: "Ideal for established businesses wanting more visibility.",
      isPopular: true,
      features: [
        "All Basic Features",
        "Priority Ranking in search results",
        "Extended Media Gallery (up to 3 images)",
        "Social Media Links (Instagram, Facebook)",
        "Embedded YouTube Video Pitch"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: "₹3,000",
      description: "Ideal for high-ticket businesses like jewelers, weavers, and clinics.",
      features: [
        "All Professional Features",
        "Products & Services Catalog (10 items)",
        "Zero Competitor Ads on your page",
        "Top-Tier SEO Backlinks"
      ]
    }
  ];

  const handleSelectTier = async (tierId: string) => {
    setSelectedTier(tierId);
    setIsProcessing(true);
    
    // Simulate Razorpay/Stripe checkout delay
    setTimeout(async () => {
      try {
        // Calculate expiry date: Current date + 18 months (1 year + 6 months free)
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 18);

        await updateDoc(doc(db, "listings", listingId), {
          tier: tierId,
          subscriptionExpiry: expiryDate.toISOString(),
          paymentStatus: "paid"
        });

        await updateDoc(doc(db, "claims", claimId), {
          status: "Pending Verification"
        });

        onSuccess();
      } catch (err) {
        console.error("Failed to update tier", err);
        alert("Payment failed or database error. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }, 2000); // 2-second simulated checkout
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-5xl glass-panel rounded-3xl overflow-hidden shadow-2xl relative border border-[rgba(0,212,255,0.25)] my-8">
        
        {/* Glowing Ambient Top Bar */}
        <div className="h-1 bg-cyan-gradient w-full" />
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 sticky top-0 z-10">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">Step 2: Choose Your Plan</span>
            <h3 className="text-xl font-bold text-white">Select a Monetization Tier</h3>
            <p className="text-xs text-green-400 mt-1 font-bold animate-pulse">🎉 Launch Offer: Get 6 Months FREE on all annual plans! (Total 18 Months validity)</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/50">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              className={`relative bg-slate-900 rounded-2xl border ${tier.isPopular ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.15)]' : 'border-slate-800'} p-6 flex flex-col`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-gradient text-slate-950 text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6 pt-2">
                <h4 className="text-lg font-bold text-white mb-2">{tier.name}</h4>
                <div className="text-3xl font-black text-cyan-400 mb-1">{tier.price}</div>
                <div className="text-xs text-slate-500">/ year (plus 6 months free)</div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed h-10">{tier.description}</p>
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {tier.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Icons.CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300 leading-relaxed">{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelectTier(tier.id)}
                disabled={isProcessing}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex justify-center items-center gap-2
                  ${tier.isPopular 
                    ? 'btn-primary-cyan text-slate-950 hover:opacity-90' 
                    : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                  }
                  ${isProcessing && selectedTier !== tier.id ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isProcessing && selectedTier === tier.id ? (
                  <>
                    <Icons.Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Select Plan"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
