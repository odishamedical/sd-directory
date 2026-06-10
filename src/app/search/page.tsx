"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db, collection, getDocs, query, orderBy, limit, startAfter, where } from "../../lib/firebase";
import * as Icons from "lucide-react";
import Header from "../../components/Header";
import DirectoryCard from "../../components/DirectoryCard";
import DirectorySidebarFilter from "../../components/DirectorySidebarFilter";
import MapPreview from "../../components/MapPreview";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  // Extract params
  const state = searchParams?.get("state") || "";
  const district = searchParams?.get("district") || "";
  const block = searchParams?.get("block") || "";
  const village = searchParams?.get("village") || "";
  const category = searchParams?.get("category") || "";

  useEffect(() => {
    fetchListings(true);
  }, [state, district, block, village, category]);

  const fetchListings = async (isFirstPage: boolean) => {
    if (isFirstPage) {
      setLoading(true);
      setListings([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let q = query(collection(db, "listings"));

      // Build filters
      if (state) q = query(q, where("state", "==", state));
      if (district) q = query(q, where("district", "==", district));
      if (block) q = query(q, where("townOrBlock", "==", block));
      if (village) q = query(q, where("village", "==", village)); // Or search both townOrBlock and village
      if (category) q = query(q, where("category", "==", category));

      q = query(q, orderBy("createdAt", "desc"));
      
      if (!isFirstPage && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }
      
      q = query(q, limit(20));

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
      } else {
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastDoc);
        
        const newDocs = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        
        if (isFirstPage) {
          setListings(newDocs);
        } else {
          setListings(prev => [...prev, ...newDocs]);
        }

        if (querySnapshot.docs.length < 20) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching paginated listings:", error);
    }
    
    setLoading(false);
    setLoadingMore(false);
  };

  return (
    <div className="relative min-h-screen text-[#E8F4FF] flex flex-col font-sans overflow-x-hidden bg-[#030B1A]">
      <Header />

      <main className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 pt-8 pb-24 flex-1">
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#E8F4FF]">
            Directory Search
          </h1>
          <p className="text-xs text-[#4A7A9B]">
            Showing <strong className="text-[#E8F4FF]">{listings.length}</strong> results
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar - 25% */}
          <div className="w-full lg:w-1/4 sticky top-24">
            <DirectorySidebarFilter />
          </div>

          {/* Center Listings - 45% */}
          <div className="w-full lg:w-2/5 space-y-4">
            {loading ? (
              <div className="flex justify-center py-24">
                <Icons.Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
              </div>
            ) : listings.length > 0 ? (
              <div className="space-y-4">
                {listings.map(lst => (
                  <div key={lst.id} onClick={() => router.push(`/listing/${lst.id}`)} className="cursor-pointer">
                    <DirectoryCard 
                      id={lst.id}
                      title={lst.name}
                      category={lst.category}
                      rating={lst.rating || 5}
                      reviewsCount={lst.reviews_count || 1}
                      distanceOrAddress={lst.address || lst.district || "Odisha"}
                      image={lst.image}
                      isClaimed={lst.is_claimed}
                      isVerified={lst.is_verified}
                      isFeatured={lst.is_featured}
                      features={lst.features || []}
                      onWishlistToggle={() => {}}
                      isWishlisted={false}
                    />
                  </div>
                ))}
                
                {hasMore && (
                  <button 
                    onClick={() => fetchListings(false)}
                    disabled={loadingMore}
                    className="w-full py-4 mt-6 rounded-xl border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.05)] text-[#00D4FF] font-bold text-sm uppercase tracking-wider hover:bg-[rgba(0,212,255,0.1)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingMore ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : "Load More (20)"}
                  </button>
                )}
                {!hasMore && listings.length > 0 && (
                  <p className="text-center text-xs text-[#4A7A9B] mt-8">End of results.</p>
                )}
              </div>
            ) : (
              <div className="py-24 text-center rounded-2xl bg-[#071428] border border-[rgba(0,212,255,0.1)]">
                <h4 className="text-base font-bold mb-2 text-[#E8F4FF]">No Match Found</h4>
                <p className="text-xs text-[#4A7A9B]">Try loosening your sidebar filters.</p>
              </div>
            )}
          </div>

          {/* Right Map - 30% */}
          <div className="w-full lg:w-[30%] sticky top-24 hidden lg:block h-[calc(100vh-120px)] bg-[#071428] border border-[rgba(0,212,255,0.1)] rounded-2xl overflow-hidden">
             <MapPreview city={district || state || "Bhubaneswar"} />
             <div className="absolute top-4 right-4 z-10 bg-slate-950/90 backdrop-blur-sm border border-[rgba(0,212,255,0.2)] rounded px-3 py-1.5 text-[10px] text-[#00D4FF] font-bold uppercase tracking-wider shadow-lg">
                Interactive Map
             </div>
          </div>

        </div>

      </main>
    </div>
  );
}
