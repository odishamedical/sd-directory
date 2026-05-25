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

  // Load claimed listings from local storage on load
  useEffect(() => {
    const claims = JSON.parse(localStorage.getItem("sd_listing_claims") || "[]");
    const claimedIds = claims.map((c: any) => c.listingId);
    setClaimedListingIds(claimedIds);
    
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
  }, [searchQuery, selectedTab, selectedCategories, selectedLocations, minRating, listings, claimedListingIds]);

  // Handlers
  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
    <div className="relative min-h-screen bg-[#040815] text-[#f8fafc] flex flex-col font-sans overflow-x-hidden">
      
      {/* Background Dots Mesh */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, #3a4b7c 1px, transparent 0)', 
          backgroundSize: '30px 30px' 
        }}
      />
      
      {/* Glowing Ambient Ambient Background Filters */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 blur-[180px] rounded-full pointer-events-none z-0" />

      {/* 1. Header / Sticky Glass Navigation Hub */}
      <Header />

      {/* 2. Hero search panel */}
      <section className="relative max-w-[1400px] mx-auto w-full px-4 sm:px-6 pt-12 pb-8 z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mb-8">
          
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white mb-6 font-serif">
            Odisha Local <span className="text-gold-gradient">Business Index</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mb-8 leading-relaxed">
            Search authentic handlooms, certified jewelry boutiques, healthcare providers, and local services across Odisha clusters.
          </p>

          {/* Search bar */}
          <div className="w-full max-w-4xl relative mb-10 flex flex-col md:flex-row gap-4 items-center">
            
            {/* Desktop / Responsive Unified Search Bar */}
            <div className="w-full flex items-center bg-[#0A101D] border border-[#E5C158] rounded-2xl p-1.5 shadow-[0_0_15px_rgba(229,193,88,0.15)]">
              <Icons.Search className="w-5 h-5 text-[#94A3B8] ml-4 md:hidden" />
              <input 
                type="text" 
                placeholder="Find local businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-[#E2E8F0] placeholder-[#64748B] px-4 py-3 focus:outline-none focus:ring-0 text-sm md:text-base"
              />
              
              {/* Mobile Right Icons (Filter & Location) hidden on desktop */}
              <div className="flex items-center gap-3 pr-3 md:hidden border-l border-white/10 pl-3">
                <Icons.SlidersHorizontal className="w-5 h-5 text-[#94A3B8]" />
                <Icons.MapPin className="w-5 h-5 text-[#94A3B8]" />
              </div>

              {/* Desktop Search Button */}
              <button className="hidden md:flex bg-gradient-to-b from-[#F6D365] to-[#D5A021] w-12 h-12 rounded-xl items-center justify-center shrink-0 shadow-[0_0_15px_rgba(229,193,88,0.2)]">
                <Icons.Search className="w-5 h-5 text-[#1A1A1A]" />
              </button>

              {/* Desktop Location Dropdown */}
              <div className="hidden md:flex items-center gap-2 bg-[#1C2438] border border-[#E5C158]/30 rounded-xl px-2 h-12 ml-2 shrink-0 relative">
                <Icons.MapPin className="w-4 h-4 text-[#E5C158] ml-2 pointer-events-none" />
                <select 
                  value={selectedLocations[0] || ""}
                  onChange={(e) => setSelectedLocations(e.target.value ? [e.target.value] : [])}
                  className="bg-transparent border-none text-[#E2E8F0] text-sm focus:outline-none focus:ring-0 cursor-pointer appearance-none pr-8 pl-1 w-[140px]"
                >
                  <option value="" className="bg-[#1C2438]">All Odisha</option>
                  {taxonomyLocations.flatMap((state: any) => state.children || []).map((loc: any) => (
                    <option key={loc.id} value={loc.name} className="bg-[#1C2438]">
                      {loc.name}, OD
                    </option>
                  ))}
                </select>
                <Icons.ChevronDown className="w-4 h-4 text-[#E5C158] absolute right-3 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Categories Tab pills (Desktop) / Glowing Icons (Mobile) */}
          <div className="w-full">
            {/* Mobile Categories (Horizontal Scroll) */}
            <div className="flex md:hidden gap-5 overflow-x-auto no-scrollbar pb-4 px-2 w-[calc(100vw-32px)]">
               {taxonomyCategories.map((tab) => {
                 const isActive = selectedTab === tab.name;
                 return (
                   <div key={tab.id} onClick={() => setSelectedTab(tab.name)} className="flex flex-col items-center gap-2 cursor-pointer shrink-0">
                     <div className={`w-[60px] h-[60px] rounded-[16px] flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-gradient-to-b from-[#F6D365] to-[#D5A021] shadow-[0_0_20px_#E5C158] border border-[#E5C158]' : 'bg-gradient-to-b from-[#E5C158]/20 to-transparent border border-[#E5C158]/40 shadow-[0_0_15px_rgba(229,193,88,0.2)]'}`}>
                       <Icons.Store className={`w-6 h-6 ${isActive ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]'}`} />
                     </div>
                     <span className={`text-[12px] font-medium ${isActive ? 'text-white' : 'text-[#94A3B8]'}`}>{tab.name}</span>
                   </div>
                 );
               })}
            </div>

            {/* Desktop Categories (Pills) */}
            <div className="hidden md:flex flex-wrap items-center justify-center gap-4">
              <button 
                onClick={() => setSelectedTab("All")}
                className={`px-5 py-2.5 rounded-full border flex items-center gap-2 text-[15px] font-medium transition-all ${selectedTab === "All" ? 'border-[#E5C158] text-[#E5C158] shadow-[0_0_15px_rgba(229,193,88,0.2)]' : 'border-white/10 text-[#E2E8F0] hover:border-[#E5C158]/50 hover:text-white'}`}
              >
                <Icons.LayoutGrid className="w-4 h-4" />
                All
              </button>
              {taxonomyCategories.map((tab) => {
                const isActive = selectedTab === tab.name;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => setSelectedTab(tab.name)}
                    className={`px-5 py-2.5 rounded-full border flex items-center gap-2 text-[15px] font-medium transition-all ${isActive ? 'border-[#E5C158] text-[#E5C158] shadow-[0_0_15px_rgba(229,193,88,0.2)]' : 'border-white/10 text-[#E2E8F0] hover:border-[#E5C158]/50 hover:text-white'}`}
                  >
                    <Icons.Tag className="w-4 h-4" />
                    {tab.name}
                  </button>
                )
              })}
            </div>
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
          <aside className={`fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-[#060c18] border-r border-slate-800 p-6 overflow-y-auto transform transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:w-auto lg:max-w-none lg:bg-transparent lg:border-none lg:p-0 lg:overflow-visible lg:transform-none lg:col-span-3 space-y-6 shadow-2xl lg:shadow-none ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            
            <div className="flex justify-between items-center lg:hidden mb-4 pb-4 border-b border-slate-800">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Filters</span>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-slate-400 hover:text-white">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Container Card */}
            <div className="glass-panel p-5 rounded-2xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Icons.SlidersHorizontal className="w-3.5 h-3.5 text-[#e5c158]" />
                  <span>Filters</span>
                </span>
                <button 
                  onClick={clearAllFilters}
                  className="text-[10px] font-bold uppercase tracking-wider text-[#e5c158] hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Categories Sidebar Selection */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</h5>
                <div className="space-y-2 text-xs text-slate-300 max-h-48 overflow-y-auto pr-2">
                  {taxonomyCategories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                      <input 
                        type="checkbox"
                        checked={selectedCategories.includes(c.name)}
                        onChange={() => handleCategoryCheckboxChange(c.name)}
                        className="rounded bg-slate-900 border-slate-700 text-[#e5c158] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Sidebar Selection */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</h5>
                <div className="space-y-2 text-xs text-slate-300 max-h-48 overflow-y-auto pr-2">
                  {taxonomyLocations.flatMap(state => state.children).map((d: any) => (
                    <label key={d.id} className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                      <input 
                        type="checkbox"
                        checked={selectedLocations.includes(d.name)}
                        onChange={() => handleLocationCheckboxChange(d.name)}
                        className="rounded bg-slate-900 border-slate-700 text-[#e5c158] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                      />
                      <span>{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Map Preview integration */}
              <div className="space-y-2 pt-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Map Preview</h5>
                <MapPreview city={selectedLocations[0] || "Bhubaneswar"} />
              </div>

              {/* Star Rating Selectors */}
              <div className="space-y-3 pt-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Minimum Rating</h5>
                <div className="flex flex-col gap-2 text-xs text-slate-300">
                  {[4.9, 4.8, 4.6].map((rate) => (
                    <button 
                      key={rate}
                      onClick={() => setMinRating(minRating === rate ? null : rate)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                        minRating === rate 
                          ? "border-[#e5c158] bg-[#e5c158]/5 text-white font-bold" 
                          : "border-slate-800 bg-slate-950/20 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Icons.Star className={`w-3.5 h-3.5 ${minRating === rate ? "text-[#e5c158] fill-[#e5c158]" : ""}`} />
                      <span>{rate} Stars & above</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </aside>

          {/* Right Main Grid Section */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 px-2">
              <p className="text-xs text-slate-400">
                Showing <strong className="text-white">{filteredListings.length}</strong> local listings in Odisha
              </p>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Sort by:</span>
                <select className="bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold uppercase text-[#e5c158] px-2 py-1.5 focus:outline-none">
                  <option>Promoted & Nearby</option>
                  <option>Highest Rated</option>
                  <option>Reviews Count</option>
                </select>
              </div>
            </div>

            {/* Grid List */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredListings.map((lst, index) => {
                  const isWishlisted = wishlist.includes(lst.id);
                  
                  // Inject Ad after every 6 listings
                  const adIndex = Math.floor(index / 6);
                  const shouldShowAd = index > 0 && index % 6 === 0 && searchAds[adIndex];
                  
                  return (
                    <React.Fragment key={lst.id}>
                      {shouldShowAd && (
                        <div className="md:col-span-2 xl:col-span-3 rounded-2xl overflow-hidden border border-[#e5c158]/30 relative aspect-[6/1] sm:aspect-[8/1] my-4 group shadow-xl">
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
      <MobileBottomNav />

    </div>
  );
}
