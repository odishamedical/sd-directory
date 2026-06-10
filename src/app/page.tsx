"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import Header from "../components/Header";
import DirectoryCard from "../components/DirectoryCard";
import { db, collection, getDocs, query, orderBy, limit, getDoc, doc, where } from "../lib/firebase";

export default function DirectoryHome() {
  const router = useRouter();

  const [taxonomyCategories, setTaxonomyCategories] = useState<any[]>([]);
  const [categoryRows, setCategoryRows] = useState<Record<string, any[]>>({});
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        // 1. Fetch Categories
        const catDoc = await getDoc(doc(db, "taxonomy", "categories"));
        let categories = [];
        if (catDoc.exists()) {
          categories = catDoc.data().data || [];
          setTaxonomyCategories(categories);
        }

        // 2. Fetch Featured
        const featuredQ = query(collection(db, "listings"), where("is_featured", "==", true), limit(10));
        const featuredSnap = await getDocs(featuredQ);
        setFeatured(featuredSnap.docs.map(d => ({ ...d.data(), id: d.id })));

        // 3. Fetch Top 10 for each Category
        const rowData: Record<string, any[]> = {};
        for (const cat of categories) {
          const catQ = query(collection(db, "listings"), where("category", "==", cat.name), orderBy("createdAt", "desc"), limit(10));
          const catSnap = await getDocs(catQ);
          rowData[cat.name] = catSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        }
        setCategoryRows(rowData);

      } catch (err) {
        console.error("Failed to load homepage data", err);
      }
      setLoading(false);
    };

    loadHomepageData();
  }, []);

  return (
    <div className="relative min-h-screen text-[#E8F4FF] flex flex-col font-sans overflow-x-hidden" style={{ background: "#030B1A" }}>
      
      {/* Background Orbs */}
      <div className="absolute top-[-5%] left-[5%] w-[700px] h-[700px] rounded-full pointer-events-none z-0" style={{ background: "rgba(0,212,255,0.04)", filter: "blur(160px)" }} />
      <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full pointer-events-none z-0" style={{ background: "rgba(56,189,248,0.03)", filter: "blur(140px)" }} />

      <Header />

      <section className="relative max-w-[1400px] mx-auto w-full px-4 sm:px-6 pt-12 pb-8 z-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-4 font-serif text-[#E8F4FF]">
          Odisha Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#38BDF8]">Business Index</span>
        </h1>
        <p className="text-xs sm:text-sm max-w-xl mx-auto mb-8 text-[#4A7A9B]">
          Explore authentic handlooms, raw material suppliers, and B2B wholesalers across Odisha.
        </p>
        
        <button 
          onClick={() => router.push("/search")}
          className="px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest text-[#020810] transition-all bg-gradient-to-r from-[#00D4FF] to-[#38BDF8] shadow-[0_4px_16px_rgba(0,212,255,0.3)] hover:scale-105"
        >
          Open Advanced Search Map
        </button>
      </section>

      <section className="relative max-w-[1600px] mx-auto w-full px-4 sm:px-6 pb-24 z-10 space-y-16">
        
        {loading ? (
           <div className="flex justify-center py-24">
             <Icons.Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
           </div>
        ) : (
          <>
            {/* Featured Row */}
            {featured.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Icons.Star className="w-6 h-6 text-[#00D4FF]" /> Top Featured
                  </h2>
                  <button onClick={() => router.push("/search")} className="text-xs font-bold text-[#00D4FF] hover:underline uppercase">View All</button>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {featured.map(lst => (
                    <div key={lst.id} className="min-w-[300px] max-w-[300px] snap-start" onClick={() => router.push(`/listing/${lst.id}`)}>
                      <DirectoryCard id={lst.id} title={lst.name} category={lst.category} rating={lst.rating || 5} reviewsCount={lst.reviews_count || 1} distanceOrAddress={lst.district || "Odisha"} image={lst.image} isClaimed={lst.is_claimed} isVerified={lst.is_verified} isFeatured={lst.is_featured} features={lst.features || []} onWishlistToggle={()=>{}} isWishlisted={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Category Rows */}
            {taxonomyCategories.map(cat => {
              const rowItems = categoryRows[cat.name] || [];
              if (rowItems.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-4">
                  <div className="flex items-center justify-between border-t border-[rgba(0,212,255,0.1)] pt-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      {cat.name}
                    </h2>
                    <button onClick={() => router.push(`/search?category=${encodeURIComponent(cat.name)}`)} className="text-xs font-bold text-[#00D4FF] hover:underline uppercase flex items-center gap-1">
                      See All <Icons.ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {rowItems.map(lst => (
                      <div key={lst.id} className="min-w-[300px] max-w-[300px] snap-start cursor-pointer" onClick={() => router.push(`/listing/${lst.id}`)}>
                        <DirectoryCard id={lst.id} title={lst.name} category={lst.category} rating={lst.rating || 5} reviewsCount={lst.reviews_count || 1} distanceOrAddress={lst.district || "Odisha"} image={lst.image} isClaimed={lst.is_claimed} isVerified={lst.is_verified} isFeatured={lst.is_featured} features={lst.features || []} onWishlistToggle={()=>{}} isWishlisted={false} />
                      </div>
                    ))}
                    {rowItems.length >= 10 && (
                      <div className="min-w-[150px] snap-start flex items-center justify-center">
                         <button onClick={() => router.push(`/search?category=${encodeURIComponent(cat.name)}`)} className="text-[#00D4FF] font-bold text-sm uppercase tracking-wider flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                           <div className="w-12 h-12 rounded-full border border-[#00D4FF] flex items-center justify-center">
                             <Icons.ArrowRight className="w-5 h-5" />
                           </div>
                           Load More
                         </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

      </section>
    </div>
  );
}
