"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, doc, getDoc, collection, getDocs, addDoc, query, orderBy, serverTimestamp, where, limit } from "../../../lib/firebase";
import * as Icons from "lucide-react";
import ClaimModal from "../../../components/ClaimModal";
import Header from "../../../components/Header";
import { useAuth } from "@/context/AuthContext";
import DirectorySidebarFilter from "../../../components/DirectorySidebarFilter";

function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loginWithGoogle } = useAuth();
  const listingId = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedListings, setRelatedListings] = useState<any[]>([]);

  const [reviews, setReviews] = useState<any[]>([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [sidebarAds, setSidebarAds] = useState<any[]>([]);

  useEffect(() => {
    if (!listingId) return;
    fetchListing();
    fetchReviews();
    fetchAds();
  }, [listingId]);

  useEffect(() => {
    if (listing) {
      document.title = `${listing.name} in ${listing.village || listing.townOrBlock || listing.district || "Odisha"} | SD Directory`;
    }
  }, [listing]);

  const fetchAds = async () => {
    try {
      const snapshot = await getDoc(doc(db, "taxonomy", "ads"));
      if (snapshot.exists()) {
        const allAds = snapshot.data().data || [];
        const activeSidebarAds = allAds.filter((ad: any) => ad.active && ad.position === "listing_sidebar");
        setSidebarAds(activeSidebarAds);
      }
    } catch (err) {
      console.error("Failed to load ads", err);
    }
  };

  const fetchListing = async () => {
    try {
      const docRef = doc(db, "listings", listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setListing({ id: docSnap.id, ...data });
        fetchRelatedListings(data.category, data.district || data.village, docSnap.id);
      } else {
        setError("Listing not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load listing.");
    }
    setLoading(false);
  };

  const fetchRelatedListings = async (category: string, location: string, currentId: string) => {
    if (!category) return;
    try {
      let q = query(
        collection(db, "listings"),
        where("category", "==", category),
        limit(5)
      );
      const snapshot = await getDocs(q);
      let related = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.id !== currentId);
        
      setRelatedListings(related.slice(0, 4));
    } catch (err) {
      console.error("Failed to load related listings", err);
    }
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
    if (!user) {
      alert("Please log in to submit a review.");
      return;
    }
    if (!newReviewText.trim()) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, `listings/${listingId}/reviews`), {
        text: newReviewText,
        rating: newReviewRating,
        author: user.displayName || user.email?.split('@')[0] || "Directory User",
        uid: user.uid,
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": listing.name,
    "image": listing.image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
    "description": listing.description || `Explore ${listing.name} in ${listing.village || listing.townOrBlock || listing.district || "Odisha"}.`,
    "telephone": listing.phone || "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": listing.street || listing.area || "",
      "addressLocality": listing.village || listing.townOrBlock || "",
      "addressRegion": listing.state || "Odisha",
      "postalCode": listing.pincode || "",
      "addressCountry": listing.country || "IN"
    },
    "aggregateRating": listing.rating ? {
      "@type": "AggregateRating",
      "ratingValue": listing.rating,
      "reviewCount": listing.reviews_count || 1
    } : undefined
  };

  return (
    <div className="min-h-screen bg-[#040815] pb-24">
      {/* Inject JSON-LD Schema for Google SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Global Header */}
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-bold text-sm">
            <Icons.ArrowLeft className="w-4 h-4"/> Back to Directory
          </button>
        </div>
        
        {/* Breadcrumb Trail */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-6 text-slate-500 bg-slate-900/50 border border-slate-800 px-4 py-2.5 rounded-lg w-fit">
          <button onClick={() => router.push("/search")} className="hover:text-white cursor-pointer transition-colors text-slate-400">{listing.country || "India"}</button>
          <Icons.ChevronRight className="w-3 h-3 text-slate-600" />
          
          <button onClick={() => router.push(`/search?state=${encodeURIComponent(listing.state || "Odisha")}`)} className="hover:text-white cursor-pointer transition-colors text-slate-400">{listing.state || "Odisha"}</button>
          <Icons.ChevronRight className="w-3 h-3 text-slate-600" />
          
          {listing.district && (
            <>
              <button onClick={() => router.push(`/search?state=${encodeURIComponent(listing.state || "Odisha")}&district=${encodeURIComponent(listing.district)}`)} className="hover:text-white cursor-pointer transition-colors text-slate-400">{listing.district}</button>
              <Icons.ChevronRight className="w-3 h-3 text-slate-600" />
            </>
          )}
          
          {(listing.village || listing.townOrBlock) && (
            <>
              <button onClick={() => router.push(`/search?state=${encodeURIComponent(listing.state || "Odisha")}&district=${encodeURIComponent(listing.district || "")}&village=${encodeURIComponent(listing.village || listing.townOrBlock)}`)} className="hover:text-white cursor-pointer transition-colors text-[#00D4FF]">{listing.village || listing.townOrBlock}</button>
              <Icons.ChevronRight className="w-3 h-3 text-slate-600" />
            </>
          )}
          
          <button 
            onClick={() => {
              let url = `/search?state=${encodeURIComponent(listing.state || "Odisha")}`;
              if (listing.district) url += `&district=${encodeURIComponent(listing.district)}`;
              if (listing.village || listing.townOrBlock) url += `&village=${encodeURIComponent(listing.village || listing.townOrBlock)}`;
              url += `&category=${encodeURIComponent(listing.category)}`;
              router.push(url);
            }} 
            className="hover:text-white cursor-pointer transition-colors text-[#e5c158]"
          >
            {theme.label}
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Universal Left Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 h-[calc(100vh-120px)]">
              <DirectorySidebarFilter />
            </div>
          </div>

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
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">{listing.name}</h1>
                  {listing.is_claimed && (
                    <div className="bg-blue-500/20 border border-blue-500/40 text-blue-400 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm mt-2" title="SD Verified Listing">
                      <Icons.BadgeCheck className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About {listing.name}</h2>
              <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">{listing.description || "No description provided."}</p>
            </div>

            {/* Media & Gallery Section */}
            {(listing.youtubeUrl || listing.youtubeUrl2 || listing.galleryImage1 || listing.galleryImage2) && (
              <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-[#e5c158] mb-6 flex items-center gap-2">
                  <Icons.Image className="w-6 h-6"/> Media & Gallery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listing.youtubeUrl && getYouTubeId(listing.youtubeUrl) && (
                    <div className="rounded-xl overflow-hidden border border-[#1e293b] aspect-video">
                      <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${getYouTubeId(listing.youtubeUrl)}`}
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    </div>
                  )}
                  {listing.youtubeUrl2 && getYouTubeId(listing.youtubeUrl2) && (
                    <div className="rounded-xl overflow-hidden border border-[#1e293b] aspect-video">
                      <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${getYouTubeId(listing.youtubeUrl2)}`}
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    </div>
                  )}
                  {listing.is_claimed && listing.galleryImage1 && (
                    <div className="rounded-xl overflow-hidden border border-[#1e293b] aspect-video">
                      <img src={listing.galleryImage1} alt="Gallery Image 1" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {listing.is_claimed && listing.galleryImage2 && (
                    <div className="rounded-xl overflow-hidden border border-[#1e293b] aspect-video">
                      <img src={listing.galleryImage2} alt="Gallery Image 2" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products & Services Section */}
            {products.length > 0 && (
              <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-[#e5c158] mb-6 flex items-center gap-2">
                  <Icons.ShoppingBag className="w-6 h-6"/> Products & Services
                </h2>

                {/* B2B Authorization Check */}
                {(() => {
                  const isB2B = listing.category?.toLowerCase().includes("b2b") || listing.category?.toLowerCase().includes("wholesale") || listing.category?.toLowerCase().includes("raw");
                  const userRole = typeof window !== "undefined" ? localStorage.getItem("sd_current_user_role") : null;
                  const isAuthorized = userRole === "admin" || userRole === "super_admin" || userRole === "retailer" || userRole === "weaver" || userRole === "vendor";
                  
                  if (isB2B && !isAuthorized) {
                    return (
                      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
                        <Icons.Lock className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-white font-bold mb-2">B2B Wholesale Catalog</h3>
                        <p className="text-slate-400 text-sm mb-4">You must be an authorized retailer or vendor to view this supplier's products and pricing.</p>
                        <button onClick={() => router.push("/launcher?redirect=" + encodeURIComponent(`/listing/${listing.id}`))} className="bg-[#e5c158] text-black font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors">
                          Login as Business
                        </button>
                      </div>
                    );
                  }

                  return (
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
                  );
                })()}
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Icons.Star className="w-6 h-6 text-[#e5c158]"/> User Reviews
              </h2>
              
              {user ? (
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
              ) : (
                <div className="mb-8 bg-slate-900 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                  <Icons.MessageSquare className="w-12 h-12 text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Want to leave a review?</h3>
                  <p className="text-slate-400 mb-6">Join the community to share your experience with {listing.name}.</p>
                  <button onClick={loginWithGoogle} className="bg-white text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-lg">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
                    Continue with Google
                  </button>
                </div>
              )}

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
                
                {listing.phone && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-900 rounded-lg shrink-0 text-slate-400"><Icons.Phone className="w-5 h-5"/></div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">Phone & WhatsApp</div>
                      <div className="flex items-center justify-between mt-1">
                        <a href={`tel:${listing.phone}`} className="text-sm text-[#e5c158] hover:underline font-bold">{listing.phone}</a>
                        <a 
                          href={`https://api.whatsapp.com/send?phone=${listing.phone.replace(/\D/g,'')}&text=${encodeURIComponent("Hello! I found your listing on the Shyam Dash Directory.")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-[#25D366]/10 text-[#25D366] text-[10px] font-bold uppercase tracking-wider hover:bg-[#25D366]/20 transition-colors flex items-center gap-1"
                        >
                          <Icons.MessageCircle className="w-3 h-3" /> Chat
                        </a>
                      </div>
                    </div>
                  </div>
                )}

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


            {/* Google Map Location */}
            <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-2 overflow-hidden aspect-square relative">
              <iframe 
                width="100%" 
                height="100%" 
                style={{ border: 0, borderRadius: '0.75rem' }} 
                loading="lazy" 
                allowFullScreen 
                referrerPolicy="no-referrer-when-downgrade" 
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDaDGYrNJkyswlqG8H0ySwWxfT0yxaGzFc&q=${encodeURIComponent(`${listing.name}, ${listing.address || listing.district + ", Odisha"}`)}`}>
              </iframe>
              <div className="absolute top-4 right-4 z-10 bg-slate-950/90 backdrop-blur-sm border border-slate-800 rounded px-2 py-1 text-[10px] text-[#e5c158] font-bold uppercase tracking-wider">
                Live Map
              </div>
            </div>

            {/* Sidebar Ads */}
            {sidebarAds.length > 0 && (
              <div className="space-y-4">
                {sidebarAds.map(ad => (
                  <div key={ad.id} className="bg-[#090F1D] border border-[#1e293b] rounded-2xl overflow-hidden relative group shadow-lg">
                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
                      <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold text-[#e5c158] uppercase tracking-widest border border-[#e5c158]/20">
                        Sponsored
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            )}

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
        
        {/* Related Listings Grid */}
        {relatedListings.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-800/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Icons.Sparkles className="w-6 h-6 text-[#00D4FF]" /> Similar {listing.category || "Businesses"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedListings.map(related => (
                <div 
                  key={related.id} 
                  onClick={() => router.push(`/listing/${related.id}`)}
                  className="bg-[#090F1D] border border-slate-800 hover:border-[#00D4FF]/50 rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={related.image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4"} 
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090F1D] to-transparent"></div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-white group-hover:text-[#00D4FF] transition-colors line-clamp-1">{related.name}</h4>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 line-clamp-1">
                      <Icons.MapPin className="w-3 h-3 text-[#e5c158]" /> {related.village || related.district || "Odisha"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
