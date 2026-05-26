"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import MapPreview from "../components/MapPreview";
import ClaimModal from "../components/ClaimModal";
import Header from "../components/Header";
import DirectoryCard from "../components/DirectoryCard";
import MobileBottomNav from "../components/MobileBottomNav";
import { Listing } from "../data/listings";
import EcosystemSwitcher from "../components/EcosystemSwitcher";
import { db, collection, getDocs, query, orderBy, getDoc, doc } from "../lib/firebase";
import WhatsAppSubscriberBox from "../components/WhatsAppSubscriberBox";

export default function DirectoryHome() {
  const router = useRouter();

  // Listings State
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  
  // Taxonomy State
  const [taxonomyCategories, setTaxonomyCategories] = useState<any[]>([]);
  const [taxonomyLocations, setTaxonomyLocations] = useState<any[]>([]);
  
  // Search & Categories Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  
  // Sidebar Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  
  // Interaction States
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [claimedListingIds, setClaimedListingIds] = useState<string[]>([]);
  const [activeClaimListing, setActiveClaimListing] = useState<any | null>(null);
  const [ssoMessageVisible, setSsoMessageVisible] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchAds, setSearchAds] = useState<any[]>([]);
  const [mobileNavFilter, setMobileNavFilter] = useState<"all" | "wishlist" | "claimed">("all");

  // Load claimed listings from local storage on load
  useEffect(() => {
    const claims = JSON.parse(localStorage.getItem("sd_listing_claims") || "[]");
    const claimedIds = claims.map((c: any) => c.listingId);
    setClaimedListingIds(claimedIds);

    const savedWishlist = JSON.parse(localStorage.getItem("sd_wishlist") || "[]");
    setWishlist(savedWishlist);
    
    // Fetch Live Data from Firestore
    const fetchListings = async () => {
      try {
        const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const liveListings: Listing[] = [];
        if (querySnapshot.empty) {
          console.log("Firestore is empty, seeding initial listings...");
          const { INITIAL_LISTINGS } = await import("../data/listings");
          const { setDoc, doc, serverTimestamp } = await import("../lib/firebase");
          
          for (const listing of INITIAL_LISTINGS) {
            await setDoc(doc(db, "listings", listing.id), {
              ...listing,
              createdAt: serverTimestamp()
            });
            liveListings.push(listing);
          }
        } else {
          querySnapshot.forEach((doc) => {
            liveListings.push({ ...doc.data(), id: doc.id } as Listing);
          });
        }
        
        setListings(liveListings);
        setFilteredListings(liveListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };
    
    const fetchTaxonomy = async () => {
      try {
        const catDoc = await getDoc(doc(db, "taxonomy", "categories"));
        if (catDoc.exists()) setTaxonomyCategories(catDoc.data().data || []);
        const locDoc = await getDoc(doc(db, "taxonomy", "locations"));
        if (locDoc.exists()) setTaxonomyLocations(locDoc.data().data || []);
      } catch (err) {
        console.error("Failed to load taxonomy", err);
      }
    };

    const fetchAds = async () => {
      try {
        const snapshot = await getDoc(doc(db, "taxonomy", "ads"));
        if (snapshot.exists()) {
          const allAds = snapshot.data().data || [];
          const activeSearchAds = allAds.filter((ad: any) => ad.active && ad.position === "search_results");
          setSearchAds(activeSearchAds);
        }
      } catch (err) {
        console.error("Failed to load ads", err);
      }
    };

    fetchListings();
    fetchTaxonomy();
    fetchAds();
  }, []);

  // Filter listings based on Search & Tabs & Sidebar selection
  useEffect(() => {
    let result = listings.map(lst => ({
      ...lst,
      is_claimed: lst.is_claimed || claimedListingIds.includes(lst.id)
    }));

    // Filter by Mobile Bottom Nav Selection
    if (mobileNavFilter === "wishlist") {
      result = result.filter(item => wishlist.includes(item.id));
    } else if (mobileNavFilter === "claimed") {
      result = result.filter(item => item.is_claimed);
    }

    // Filter by Top Category Tabs
    if (selectedTab !== "All") {
      result = result.filter(item => item.category === selectedTab);
    }

    // Filter by Sidebar Categories (if any selected)
    if (selectedCategories.length > 0) {
      result = result.filter(item => selectedCategories.includes(item.category));
    }

    // Filter by Sidebar Location
    if (selectedLocations.length > 0) {
      result = result.filter(item => 
        selectedLocations.some(loc => item.address.toLowerCase().includes(loc.toLowerCase()))
      );
    }

    // Filter by Rating
    if (minRating !== null) {
      result = result.filter(item => item.rating >= minRating);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.address && item.address.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.features && item.features.some((f: string) => f.toLowerCase().includes(q))) ||
        (item.products && item.products.some((p: any) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)))
      );
    }

    // Sort so featured listings always appear at the top
    result.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0; // fallback to original order
    });

    setFilteredListings(result);
  }, [searchQuery, selectedTab, selectedCategories, selectedLocations, minRating, listings, claimedListingIds, mobileNavFilter, wishlist]);

  // Handlers
  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem("sd_wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearchClick = () => {
    // Reset bottom nav filter back to all listings when searching
    setMobileNavFilter("all");
    const searchContainer = document.querySelector('input[placeholder*="Search"]');
    if (searchContainer) {
      searchContainer.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        (searchContainer as HTMLInputElement).focus();
      }, 300);
    }
  };

  const handleProfileClick = () => {
    const email = localStorage.getItem("sd_current_user_email");
    if (email) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const handleCategoryCheckboxChange = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleLocationCheckboxChange = (loc: string) => {
    setSelectedLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const handleClaimSuccess = (listingId: string) => {
    setClaimedListingIds(prev => [...prev, listingId]);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTab("All");
    setSelectedCategories([]);
    setSelectedLocations([]);
    setMinRating(null);
  };

  // Nav Item Class helpers
  const tabClass = (tabName: string) => {
    const isActive = selectedTab === tabName;
    return `px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
      isActive 
        ? "bg-gold-gradient text-slate-950 shadow-md font-bold" 
        : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800"
    }`;
  };

  return (
    <div className="relative min-h-screen bg-[#100D09] text-[#F0E6D3] flex flex-col font-sans overflow-x-hidden">
      
      {/* Subtle grain texture overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, #D4A843 1px, transparent 0)', 
          backgroundSize: '24px 24px' 
        }}
      />
      
      {/* Warm ambient glows */}
      <div className="absolute top-[-5%] left-[5%] w-[600px] h-[600px] bg-[#D4A843]/4 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-[#8B4513]/5 blur-[180px] rounded-full pointer-events-none z-0" />

      {/* 1. Header / Sticky Glass Navigation Hub */}
      <Header />

      {/* 2. Hero search panel */}
      <section className="relative max-w-[1400px] mx-auto w-full px-4 sm:px-6 pt-12 pb-4 z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mb-6">
          
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-[#F0E6D3] mb-4 font-serif">
            Odisha Local <span className="text-gold-gradient">Business Index</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8A7A65] max-w-xl mb-6 leading-relaxed">
            Search authentic handlooms, certified jewelry boutiques, healthcare providers, and local services across Odisha clusters.
          </p>

          {/* Consolidated Search Input Container */}
          <div className="w-full max-w-2xl bg-[#1A1410] border border-[#2E2016] hover:border-[#D4A843]/40 rounded-2xl p-2.5 flex items-center gap-2.5 transition-all duration-300 shadow-xl mb-6">
            <div className="flex items-center gap-2 flex-1 min-w-0 pl-2">
              <Icons.Search className="w-4 h-4 text-[#D4A843] shrink-0" />
              <input
                type="text"
                placeholder="Search businesses, services, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-[#F0E6D3] placeholder-[#6B5B45] text-xs sm:text-sm focus:outline-none w-full border-none"
              />
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Location Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0B08] rounded-xl border border-[#2E2016] text-xs text-[#8A7A65]">
                <Icons.MapPin className="w-3.5 h-3.5 text-[#D4A843]" />
                <span className="font-bold text-[11px]">{selectedLocations[0] || "All Odisha"}</span>
              </div>
              
              {/* Mobile Filter Toggle */}
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden p-2.5 bg-[#0D0B08] border border-[#2E2016] hover:border-[#D4A843]/30 rounded-xl text-[#8A7A65] hover:text-[#F0E6D3] transition-all flex items-center justify-center"
                title="Filters"
              >
                <Icons.SlidersHorizontal className="w-4 h-4 text-[#D4A843]" />
              </button>
            </div>
          </div>

          {/* Category Horizontal Pills Carousel */}
          <div className="w-full max-w-3xl overflow-x-auto flex items-center gap-2 py-2 px-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setSelectedTab("All")}
              className={`px-4 py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 border ${
                selectedTab === "All"
                  ? "bg-[#D4A843] text-[#0D0B08] border-transparent shadow-lg shadow-[#D4A843]/20"
                  : "bg-[#1A1410] hover:bg-[#2A1E10] text-[#8A7A65] hover:text-[#F0E6D3] border-[#2E2016] hover:border-[#D4A843]/30"
              }`}
            >
              All Categories
            </button>
            {taxonomyCategories.map((c: any) => (
              <button
                key={c.id || c.name}
                onClick={() => setSelectedTab(c.name)}
                className={`px-4 py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 border ${
                  selectedTab === c.name
                    ? "bg-[#D4A843] text-[#0D0B08] border-transparent shadow-lg shadow-[#D4A843]/20"
                    : "bg-[#1A1410] hover:bg-[#2A1E10] text-[#8A7A65] hover:text-[#F0E6D3] border-[#2E2016] hover:border-[#D4A843]/30"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 3. Split Layout main panel */}
      <section className="relative max-w-[1400px] mx-auto w-full px-4 sm:px-6 pb-24 z-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Mobile Filter Overlay */}
          {isMobileFilterOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileFilterOpen(false)}
            />
          )}

          {/* Left Sidebar Filter Section / Mobile Drawer */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-[#100D09] border-r border-[#2E2016] p-6 overflow-y-auto transform transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:w-auto lg:max-w-none lg:bg-transparent lg:border-none lg:p-0 lg:overflow-visible lg:transform-none lg:col-span-3 space-y-6 shadow-2xl lg:shadow-none ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            
            <div className="flex justify-between items-center lg:hidden mb-4 pb-4 border-b border-[#2E2016]">
              <span className="text-sm font-bold text-[#F0E6D3] uppercase tracking-wider">Filters</span>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-[#8A7A65] hover:text-[#F0E6D3]">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Container Card */}
            <div className="bg-[#1A1410] border border-[#2E2016] p-5 rounded-2xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#2E2016]">
                <span className="text-xs font-bold text-[#F0E6D3] uppercase tracking-wider flex items-center gap-1.5">
                  <Icons.SlidersHorizontal className="w-3.5 h-3.5 text-[#D4A843]" />
                  <span>Filters</span>
                </span>
                <button 
                  onClick={clearAllFilters}
                  className="text-[10px] font-bold uppercase tracking-wider text-[#D4A843] hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Categories Sidebar Selection */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#8A7A65]">Category</h5>
                <div className="space-y-2 text-xs text-[#B89A6A] max-h-48 overflow-y-auto pr-2">
                  {taxonomyCategories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2.5 cursor-pointer hover:text-[#F0E6D3]">
                      <input 
                        type="checkbox"
                        checked={selectedCategories.includes(c.name)}
                        onChange={() => handleCategoryCheckboxChange(c.name)}
                        className="rounded bg-[#0D0B08] border-[#3D2D18] text-[#D4A843] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Sidebar Selection */}
              <div className="space-y-3 pt-4 border-t border-[#2E2016]">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#8A7A65]">Location</h5>
                <div className="space-y-2 text-xs text-[#B89A6A] max-h-48 overflow-y-auto pr-2">
                  {taxonomyLocations.flatMap(state => state.children).map((d: any) => (
                    <label key={d.id} className="flex items-center gap-2.5 cursor-pointer hover:text-[#F0E6D3]">
                      <input 
                        type="checkbox"
                        checked={selectedLocations.includes(d.name)}
                        onChange={() => handleLocationCheckboxChange(d.name)}
                        className="rounded bg-[#0D0B08] border-[#3D2D18] text-[#D4A843] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                      />
                      <span>{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Map Preview integration */}
              <div className="space-y-2 pt-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#8A7A65]">Map Preview</h5>
                <MapPreview city={selectedLocations[0] || "Bhubaneswar"} />
              </div>

              {/* Star Rating Selectors */}
              <div className="space-y-3 pt-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#8A7A65]">Minimum Rating</h5>
                <div className="flex flex-col gap-2 text-xs text-[#B89A6A]">
                  {[4.9, 4.8, 4.6].map((rate) => (
                    <button 
                      key={rate}
                      onClick={() => setMinRating(minRating === rate ? null : rate)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                        minRating === rate 
                          ? "border-[#D4A843] bg-[#D4A843]/8 text-[#F0E6D3] font-bold" 
                          : "border-[#2E2016] bg-[#0D0B08]/40 hover:border-[#3D2D18] text-[#8A7A65] hover:text-[#B89A6A]"
                      }`}
                    >
                      <Icons.Star className={`w-3.5 h-3.5 ${minRating === rate ? "text-[#D4A843] fill-[#D4A843]" : ""}`} />
                      <span>{rate} Stars & above</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp Subscription */}
              <div className="pt-4 border-t border-[#2E2016]">
                <WhatsAppSubscriberBox />
              </div>

            </div>

          </aside>

          {/* Right Main Grid Section */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 px-2">
              <p className="text-xs text-[#8A7A65]">
                Showing <strong className="text-[#F0E6D3]">{filteredListings.length}</strong> local listings in Odisha
              </p>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[10px] text-[#6B5B45] uppercase font-bold">Sort by:</span>
                <select className="bg-[#1A1410] border border-[#2E2016] rounded-lg text-[10px] font-bold uppercase text-[#D4A843] px-2 py-1.5 focus:outline-none">
                  <option>Promoted & Nearby</option>
                  <option>Highest Rated</option>
                  <option>Reviews Count</option>
                </select>
              </div>
            </div>

            {/* Grid List */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {filteredListings.map((lst, index) => {
                  const isWishlisted = wishlist.includes(lst.id);
                  
                  // Inject Ad after every 6 listings
                  const adIndex = Math.floor(index / 6);
                  const shouldShowAd = index > 0 && index % 6 === 0 && searchAds[adIndex];
                  
                  return (
                    <React.Fragment key={lst.id}>
                      {shouldShowAd && (
                        <div className="col-span-2 md:col-span-2 xl:col-span-3 rounded-2xl overflow-hidden border border-[#e5c158]/30 relative aspect-[6/1] sm:aspect-[8/1] my-4 group shadow-xl">
                          <a href={searchAds[adIndex].linkUrl} target="_blank" rel="noopener noreferrer">
                            <img src={searchAds[adIndex].imageUrl} alt="Advertisement" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold text-[#e5c158] uppercase tracking-widest border border-[#e5c158]/20">
                              Sponsored
                            </div>
                          </a>
                        </div>
                      )}
                      
                      <div 
                        key={lst.id}
                        onClick={() => router.push(`/listing/${lst.id}`)}
                        className="cursor-pointer"
                      >
                        <DirectoryCard 
                          id={lst.id}
                          title={lst.name}
                          category={lst.category}
                          rating={lst.rating}
                          reviewsCount={lst.reviews_count}
                          distanceOrAddress={lst.distance}
                          image={lst.image}
                          isClaimed={lst.is_claimed}
                          isVerified={lst.is_verified}
                          features={lst.features || []}
                          onWishlistToggle={toggleWishlist}
                          isWishlisted={isWishlisted}
                        />
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center glass-panel rounded-2xl max-w-md mx-auto">
                <Icons.AlertCircle className="w-12 h-12 text-[#e5c158] mx-auto mb-4 opacity-50" />
                <h4 className="text-base font-bold text-white mb-2">No Matching Listings</h4>
                <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
                  Try adjusting your search criteria, selecting another cluster region, or clearing the sidebar filters.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 bg-gold-gradient text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider"
                >
                  Reset Directory
                </button>
              </div>
            )}

          </main>

        </div>
      </section>

      {/* 4. Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-8 px-6 text-center z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Shyam Dash Creation. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Bylaws & GI-Tag rules</a>
            <a href="#" className="hover:text-slate-400 transition-colors">IT Support</a>
          </div>
        </div>
      </footer>

      {/* 5. Modals Overlay */}
      {activeClaimListing && (
        <ClaimModal 
          listing={activeClaimListing} 
          onClose={() => setActiveClaimListing(null)} 
          onSuccess={handleClaimSuccess}
        />
      )}

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <MobileBottomNav 
        currentFilter={mobileNavFilter}
        onTabChange={(tab) => setMobileNavFilter(tab)}
        onSearchClick={handleSearchClick}
        onProfileClick={handleProfileClick}
      />

    </div>
  );
}
