"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, doc, getDoc, collection, getDocs, addDoc, query, orderBy, serverTimestamp } from "../../../lib/firebase";
import * as Icons from "lucide-react";
import ClaimModal from "../../../components/ClaimModal";
import Header from "../../../components/Header";

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState<any[]>([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    fetchListing();
    fetchReviews();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const docRef = doc(db, "listings", listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Listing not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load listing.");
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, `listings/${listingId}/reviews`), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, `listings/${listingId}/reviews`), {
        text: newReviewText,
        rating: newReviewRating,
        author: "Anonymous User",
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

  if (loading) return <div className="min-h-screen bg-[#040815] flex items-center justify-center text-[#e5c158] font-bold"><Icons.Loader2 className="w-8 h-8 animate-spin"/></div>;
  if (error || !listing) return <div className="min-h-screen bg-[#040815] flex flex-col items-center justify-center text-white"><h1 className="text-2xl font-bold mb-4">{error}</h1><button onClick={() => router.push("/")} className="text-[#e5c158] hover:underline">Return to Directory</button></div>;

  const getCategoryTheme = (cat: string) => {
    const themes: Record<string, { label: string; icon: any; color: string }> = {
      jewelry: { label: "Premium Jewelry", icon: Icons.Gem, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
      handlooms: { label: "Handloom Weavers", icon: Icons.Scissors, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
      doctors: { label: "Medical / Doctor", icon: Icons.HeartPulse, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
      it_services: { label: "IT & Software", icon: Icons.Terminal, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
      retail: { label: "Retail Stores", icon: Icons.ShoppingBag, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
      restaurants: { label: "Food & Restaurant", icon: Icons.Utensils, color: "text-rose-400 bg-rose-400/10 border-rose-400/20" }
    };
    return themes[cat] || { label: cat || "Business", icon: Icons.Building, color: "text-slate-400 bg-slate-400/10 border-slate-400/20" };
  };

  const theme = getCategoryTheme(listing.category);
  const CatIcon = theme.icon;
  const products = listing.products || [];

  return (
    <div className="min-h-screen bg-[#040815] pb-24">
      {/* Global Header */}
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-bold text-sm">
            <Icons.ArrowLeft className="w-4 h-4"/> Back to Directory
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Image */}
            <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden relative border border-[#1e293b]">
              <img 
                src={listing.image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200"} 
                alt={listing.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-4 ${theme.color}`}>
                  <CatIcon className="w-4 h-4" />
                  {theme.label}
                </div>
                <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">{listing.name}</h1>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About {listing.name}</h2>
              <p className="text-slate-300 leading-relaxed text-lg">{listing.description || "No description provided."}</p>
            </div>

            {/* Products & Services Section */}
            {products.length > 0 && (
              <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-[#e5c158] mb-6 flex items-center gap-2">
                  <Icons.ShoppingBag className="w-6 h-6"/> Products & Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((prod: any, idx: number) => (
                    <div key={idx} className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 hover:border-[#e5c158]/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white">{prod.name}</h3>
                        {prod.price && <span className="bg-[#1e293b] text-[#e5c158] font-mono text-sm px-2 py-1 rounded">{prod.price}</span>}
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{prod.description}</p>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-950 px-2 py-1 rounded-md">
                        {prod.type === 'service' ? <Icons.Calendar className="w-3 h-3"/> : <Icons.Tag className="w-3 h-3"/>}
                        {prod.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Icons.Star className="w-6 h-6 text-[#e5c158]"/> User Reviews
              </h2>
              
              <form onSubmit={submitReview} className="mb-8 bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={star} onClick={() => setNewReviewRating(star)} className={`p-1 transition-colors ${star <= newReviewRating ? "text-[#e5c158]" : "text-slate-700 hover:text-slate-500"}`}>
                      <Icons.Star className="w-6 h-6" fill={star <= newReviewRating ? "currentColor" : "none"}/>
                    </button>
                  ))}
                </div>
                <textarea 
                  value={newReviewText}
                  onChange={e => setNewReviewText(e.target.value)}
                  placeholder="Write your review here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#e5c158] outline-none mb-3"
                  rows={3}
                />
                <button type="submit" disabled={submittingReview} className="bg-[#e5c158] text-slate-950 font-bold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50">
                  {submittingReview ? "Posting..." : "Post Review"}
                </button>
              </form>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-slate-500 italic">No reviews yet. Be the first to review!</p>
                ) : reviews.map(review => (
                  <div key={review.id} className="border-b border-slate-800 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{review.author}</span>
                      <div className="flex gap-1 text-[#e5c158]">
                        {[...Array(review.rating)].map((_, i) => <Icons.Star key={i} className="w-4 h-4" fill="currentColor"/>)}
                      </div>
                    </div>
                    <p className="text-slate-400">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            {/* Quick Actions / Contact */}
            <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="font-bold text-white">Contact & Details</h3>
                {!listing.is_claimed && (
                  <button onClick={() => setShowClaimModal(true)} className="px-3 py-1.5 rounded-lg border border-[#e5c158] text-[#e5c158] hover:bg-[#e5c158] hover:text-slate-950 font-bold text-xs transition-colors whitespace-nowrap">
                    Claim Business
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-900 rounded-lg shrink-0 text-slate-400"><Icons.MapPin className="w-5 h-5"/></div>
                  <div>
                    <div className="text-sm font-bold text-white">Location</div>
                    <div className="text-sm text-slate-400">{listing.address || `${listing.village || ''} ${listing.area || ''}, ${listing.townOrBlock || ''}, ${listing.district || ''}, ${listing.state || ''} ${listing.pincode || ''}`}</div>
                  </div>
                </div>


                {listing.website && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-lg shrink-0 text-slate-400"><Icons.Globe className="w-5 h-5"/></div>
                    <div>
                      <div className="text-sm font-bold text-white">Website</div>
                      <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#e5c158] hover:underline break-all">{listing.website}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Share & Promote */}
            <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Icons.Share2 className="w-5 h-5 text-[#e5c158]" /> Share & Promote
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    const userEmail = typeof window !== "undefined" ? localStorage.getItem("sd_current_user_email") : "";
                    const shareUrl = `${window.location.origin}/listing/${listing.id}${userEmail ? `?ref=${encodeURIComponent(userEmail)}` : ""}`;
                    const text = `Check out ${listing.name} on the Shyam Dash Directory!`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + shareUrl)}`, '_blank');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-bold text-xs transition-colors"
                >
                  <Icons.MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
                <button 
                  onClick={() => {
                    const userEmail = typeof window !== "undefined" ? localStorage.getItem("sd_current_user_email") : "";
                    const shareUrl = `${window.location.origin}/listing/${listing.id}${userEmail ? `?ref=${encodeURIComponent(userEmail)}` : ""}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 font-bold text-xs transition-colors"
                >
                  <Icons.Share className="w-4 h-4" /> Facebook
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-3 text-center">Share to earn viral referral rewards!</p>
            </div>

          </div>

        </div>
      </div>
      
      {showClaimModal && (
        <ClaimModal
          listing={listing}
          onClose={() => setShowClaimModal(false)}
          onSuccess={() => {
            setShowClaimModal(false);
            const claims = JSON.parse(localStorage.getItem("sd_listing_claims") || "[]");
            claims.push({ listingId, date: new Date().toISOString() });
            localStorage.setItem("sd_listing_claims", JSON.stringify(claims));
            setListing({...listing, is_claimed: true});
          }}
        />
      )}
    </div>
  );
}
