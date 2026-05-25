import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { db, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "../lib/firebase";
import ProfileBlockerModal from "./ProfileBlockerModal";

interface Listing {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews_count: number;
  address: string;
  distance: string;
  description: string;
  image: string;
  is_verified: boolean;
  is_claimed: boolean;
  phone?: string;
  website?: string;
  features?: string[];
  external_url?: string;
}

interface ListingDetailModalProps {
  listing: Listing;
  onClose: () => void;
  onClaim: () => void;
}

export default function ListingDetailModal({ listing, onClose, onClaim }: ListingDetailModalProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showProfileBlocker, setShowProfileBlocker] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [listing.id]);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, `listings/${listing.id}/reviews`), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    
    const userEmail = localStorage.getItem("sd_current_user_email");
    const isProfileComplete = localStorage.getItem("sd_current_user_profile_complete") === "true";

    if (!userEmail || !isProfileComplete) {
      setShowProfileBlocker(true);
      return;
    }

    setSubmittingReview(true);
    try {
      const userName = localStorage.getItem("sd_current_user_name") || "Verified User";
      await addDoc(collection(db, `listings/${listing.id}/reviews`), {
        text: newReviewText,
        rating: newReviewRating,
        author: userName,
        createdAt: serverTimestamp()
      });
      setNewReviewText("");
      fetchReviews();
    } catch (err) {
      console.error("Failed to submit review", err);
      alert("Failed to post review.");
    }
    setSubmittingReview(false);
  };

  // Category-specific details helper
  const getCategoryTheme = (cat: string) => {
    const themes: Record<string, { label: string; icon: any; color: string }> = {
      jewelry: { label: "Premium Jewelry", icon: Icons.Gem, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
      handlooms: { label: "Handloom Weavers", icon: Icons.Scissors, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
      doctors: { label: "Medical / Doctor", icon: Icons.HeartPulse, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
      it_services: { label: "IT & Software", icon: Icons.Terminal, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
      retail: { label: "Retail Stores", icon: Icons.ShoppingBag, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
      restaurants: { label: "Food & Restaurant", icon: Icons.Utensils, color: "text-rose-400 bg-rose-400/10 border-rose-400/20" }
    };
    return themes[cat] || { label: cat, icon: Icons.Building, color: "text-slate-400 bg-slate-400/10 border-slate-400/20" };
  };

  const theme = getCategoryTheme(listing.category);
  const CatIcon = theme.icon;

  const mockHours = [
    { day: "Monday - Friday", hours: "10:00 AM - 08:30 PM" },
    { day: "Saturday", hours: "10:00 AM - 07:00 PM" },
    { day: "Sunday", hours: "Closed" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl glass-panel rounded-3xl overflow-hidden shadow-2xl relative border border-[rgba(229,193,88,0.25)] max-h-[90vh] flex flex-col">
        
        {/* Glowing top line */}
        <div className="h-1 bg-gold-gradient w-full shrink-0" />
        
        {/* Banner/Photo */}
        <div className="relative h-64 bg-slate-950 w-full shrink-0 overflow-hidden border-b border-slate-800">
          <img 
            src={listing.image} 
            alt={listing.name} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040815] via-slate-950/30 to-transparent" />
          
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-white p-2 rounded-xl border border-slate-800 backdrop-blur-md transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>

          {/* Badge & Name overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider mb-3 ${theme.color}`}>
              <CatIcon className="w-3.5 h-3.5" />
              <span>{theme.label}</span>
            </span>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-serif">
                {listing.name}
              </h2>
              {listing.is_verified && (
                <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/35 flex items-center justify-center text-blue-400" title="SD Certified Authenticity">
                  <Icons.Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* Main Info Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Block: Description, Contacts */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#e5c158] mb-2">About The Business</h4>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {listing.description}
                </p>
              </div>

              {/* Core Features / Tags */}
              {listing.features && listing.features.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#e5c158] mb-3">Key Features & Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {listing.features.map((feat, idx) => (
                      <span key={idx} className="bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1 text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                        <Icons.Check className="w-3 h-3 text-[#e5c158]" />
                        <span>{feat}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Address / Distance */}
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 flex gap-4 items-start">
                <Icons.MapPin className="w-5 h-5 text-[#e5c158] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white mb-0.5">Location & Distance</h5>
                  <p className="text-xs text-slate-300 mb-1">{listing.address}</p>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#e5c158] bg-[#e5c158]/10 px-2 py-0.5 rounded-full">
                    📍 {listing.distance} away
                  </span>
                </div>
              </div>
            </div>

            {/* Right Block: Working hours, contacts details */}
            <div className="md:col-span-5 space-y-6 border-t md:border-t-0 md:border-l border-slate-800/80 pt-6 md:pt-0 md:pl-6">
              
              {/* Star Rating details */}
              <div className="bg-[#e5c158]/5 border border-[#e5c158]/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">User Rating</h5>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black text-white">{listing.rating}</span>
                    <div className="flex items-center text-[#e5c158]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Icons.Star key={s} className="w-4.5 h-4.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-300 font-bold block">{listing.reviews_count}</span>
                  <span className="text-[9px] text-slate-500 block uppercase">Google Reviews</span>
                </div>
              </div>

              {/* Operations Hours */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#e5c158] mb-3">Hours of Operation</h4>
                <div className="space-y-2 text-xs">
                  {mockHours.map((h, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">{h.day}</span>
                      <span className="text-white font-semibold">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Directly Contacts Info */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#e5c158]">Contact Information</h4>
                {listing.phone && (
                  <a href={`tel:${listing.phone}`} className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-[#e5c158] transition-colors">
                    <Icons.Phone className="w-4 h-4 text-slate-500" />
                    <span>{listing.phone}</span>
                  </a>
                )}
                {listing.website && (
                  <a href={listing.website} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-[#e5c158] transition-colors truncate">
                    <Icons.Globe className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">{listing.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
                  </a>
                )}
              </div>

              {/* User Reviews Section */}
              <div className="pt-6 mt-6 border-t border-slate-800">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#e5c158] mb-4">User Reviews</h4>
                
                {/* Review Form */}
                <form onSubmit={submitReview} className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
                  <h5 className="text-xs text-white font-bold mb-2">Leave a Review</h5>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icons.Star 
                        key={star} 
                        className={`w-5 h-5 cursor-pointer transition-colors ${star <= newReviewRating ? "text-[#e5c158] fill-current" : "text-slate-700"}`}
                        onClick={() => setNewReviewRating(star)}
                      />
                    ))}
                  </div>
                  <textarea 
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share your experience..." 
                    rows={2} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:border-[#e5c158] outline-none mb-3"
                  />
                  <button type="submit" disabled={submittingReview} className="px-4 py-2 bg-[#1e293b] hover:bg-[#2a3a52] text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-50">
                    {submittingReview ? "Posting..." : "Post Review"}
                  </button>
                </form>

                {/* Review List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No reviews yet. Be the first!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-white">{rev.author}</span>
                          <div className="flex items-center text-[#e5c158]">
                            {[...Array(5)].map((_, i) => (
                              <Icons.Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-current" : "text-slate-700"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300">{rev.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          
          {/* Claim Status Label */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${listing.is_claimed ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
              Listing Status: {listing.is_claimed ? "Claimed & Verified Storefront" : "Unclaimed listing"}
            </span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {listing.is_claimed ? (
              <a 
                href={listing.external_url || "#"}
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto text-center px-6 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl hover:opacity-90 transition-all text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_0_20px_rgba(229,193,88,0.25)] flex items-center justify-center gap-1.5"
              >
                <Icons.ExternalLink className="w-4 h-4" />
                <span>Visit Sovereign Storefront</span>
              </a>
            ) : (
              <>
                <button 
                  onClick={onClose} 
                  className="w-1/2 sm:w-auto px-5 py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    onClose();
                    onClaim();
                  }}
                  className="w-1/2 sm:w-auto px-6 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl hover:opacity-90 transition-all text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_0_15px_rgba(229,193,88,0.2)] cursor-pointer"
                >
                  Claim This Listing
                </button>
              </>
            )}
          </div>
        </div>

      </div>
      {showProfileBlocker && (
        <ProfileBlockerModal onClose={() => setShowProfileBlocker(false)} />
      )}
    </div>
  );
}
