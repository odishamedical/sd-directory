"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import MapPreview from "../components/MapPreview";
import ClaimModal from "../components/ClaimModal";
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
          const { addDoc, serverTimestamp } = await import("../lib/firebase");
          
          for (const listing of INITIAL_LISTINGS) {
            // Remove the hardcoded ID so Firestore generates a new one, but keep the data
            const { id, ...dataToSave } = listing;
            await addDoc(collection(db, "listings"), {
              ...dataToSave,
              createdAt: serverTimestamp()
            });
            liveListings.push(listing);
          }
        } else {
          querySnapshot.forEach((doc) => {
            liveListings.push({ id: doc.id, ...doc.data() } as Listing);
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

    fetchListings();
    fetchTaxonomy();
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
    <div className="relative min-h-screen bg-[#040815] text-[#f8fafc] flex flex-col font-sans">
      
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
      <header className="sticky top-4 z-40 w-full px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto glass-panel border border-[rgba(229,193,88,0.18)] rounded-2xl px-6 py-4 flex items-center justify-between backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient p-[1px]">
              <div className="w-full h-full bg-[#060c18] rounded-xl flex items-center justify-center">
                <Icons.Compass className="w-5 h-5 text-[#e5c158]" />
              </div>
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block font-serif">SHYAM DASH</span>
              <span className="text-[10px] text-[#e5c158] tracking-widest uppercase block -mt-1 font-bold">DIRECTORY</span>
            </div>
          </div>

          {/* Nav Links Hub */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-300">
            <span className="px-4 py-1.5 rounded-lg border border-[#e5c158] text-[#e5c158] bg-[#e5c158]/5 font-black shadow-[0_0_10px_rgba(229,193,88,0.05)] cursor-default">
              Directory
            </span>
            <a href="https://sd-gold-hub.vercel.app" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg hover:text-[#e5c158] transition-colors flex items-center gap-1">
              <Icons.Gem className="w-3.5 h-3.5" />
              <span>Gold Hub</span>
            </a>
            <a href="https://sd-bhulia-hub.vercel.app" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg hover:text-[#e5c158] transition-colors flex items-center gap-1">
              <Icons.Scissors className="w-3.5 h-3.5" />
              <span>Bhulia Saree</span>
            </a>
            <a href="https://sd-dehapa-hub.vercel.app" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg hover:text-[#e5c158] transition-colors flex items-center gap-1">
              <Icons.HeartPulse className="w-3.5 h-3.5" />
              <span>DehaPa Health</span>
            </a>
            <a href="https://sd-it-hub-w3sk.vercel.app" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg hover:text-[#e5c158] transition-colors flex items-center gap-1">
              <Icons.Terminal className="w-3.5 h-3.5" />
              <span>IT Hub</span>
            </a>
          </nav>

          {/* Action button */}
          <div className="flex items-center gap-3">
            <EcosystemSwitcher />
          </div>

        </div>
      </header>

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
          <div className="w-full max-w-2xl relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icons.Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search stores, jewelry, handlooms, doctors across Odisha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-12 pr-28 bg-slate-900/60 border border-[rgba(229,193,88,0.3)] rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] backdrop-blur-md transition-all shadow-[0_0_20px_rgba(229,193,88,0.15)] hover:shadow-[0_0_30px_rgba(229,193,88,0.25)]"
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="p-1.5 text-slate-500 hover:text-slate-200 mr-2 rounded-lg"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              )}
              <button className="px-5 h-full bg-gold-gradient text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-md">
                Search
              </button>
            </div>
          </div>

          {/* Categories Tab pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl">
            <button 
              onClick={() => setSelectedTab("All")}
              className={tabClass("All")}
            >
              All Listings
            </button>
            {taxonomyCategories.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setSelectedTab(tab.name)}
                className={tabClass(tab.name)}
              >
                {tab.name}
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
            <div className="flex justify-between items-center px-2">
              <p className="text-xs text-slate-400">
                Showing <strong className="text-white">{filteredListings.length}</strong> local listings in Odisha
              </p>
              <div className="flex items-center gap-2">
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
                {filteredListings.map((lst) => {
                  const isWishlisted = wishlist.includes(lst.id);
                  
                  return (
                    <div 
                      key={lst.id}
                      onClick={() => router.push(`/listing/${lst.id}`)}
                      className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    >
                      
                      {/* Photo Header */}
                      <div className="relative h-44 bg-slate-950 w-full overflow-hidden border-b border-slate-900">
                        <img 
                          src={lst.image} 
                          alt={lst.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#040815]/90 via-transparent to-transparent" />
                        
                        {/* Wishlist Heart Toggle */}
                        <button 
                          onClick={(e) => toggleWishlist(lst.id, e)}
                          className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 backdrop-blur-sm transition-colors text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Icons.Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>

                        {/* Google Rating overlay */}
                        <div className="absolute bottom-3 left-3 bg-[#e5c158]/95 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                          <Icons.Star className="w-3 h-3 fill-current" />
                          <span>{lst.rating} ({lst.reviews_count})</span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        
                        <div>
                          {/* Name Block */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-base font-extrabold text-white font-serif line-clamp-1 group-hover:text-[#e5c158] transition-colors">
                              {lst.name}
                            </h3>
                            {lst.is_verified && (
                              <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5" title="SD Verified Listing">
                                <Icons.Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          {/* Address / Distance */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-4">
                            <Icons.MapPin className="w-3.5 h-3.5 text-[#e5c158] shrink-0" />
                            <span className="truncate">{lst.address.split(",")[0]}, Odisha</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[#e5c158] font-bold shrink-0">{lst.distance}</span>
                          </div>

                          {/* Description Snippet */}
                          <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-2">
                            {lst.description}
                          </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-2 pt-3 border-t border-slate-900/60">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/listing/${lst.id}`);
                            }}
                            className="w-full py-2.5 rounded-xl border border-slate-700 hover:border-slate-400 bg-slate-950/20 hover:bg-slate-900/60 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                          
                          {/* Only show Claim if it has an owner but isn't claimed yet (Mock Logic) */}
                          {!lst.is_claimed && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveClaimListing(lst);
                              }}
                              className="w-full py-2.5 rounded-xl border border-[#e5c158]/50 hover:border-[#e5c158] bg-[#e5c158]/10 hover:bg-[#e5c158]/20 text-[#e5c158] font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                              Claim this Listing
                            </button>
                          )}
                        </div>

                      </div>

                    </div>
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

      {/* Floating Mobile Filter Button */}
      <button 
        onClick={() => setIsMobileFilterOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden flex items-center gap-2 px-6 py-3 bg-gold-gradient text-slate-950 font-black rounded-full shadow-[0_8px_30px_rgba(229,193,88,0.4)] hover:scale-105 transition-transform"
      >
        <Icons.SlidersHorizontal className="w-4 h-4" />
        FILTERS
      </button>

    </div>
  );
}
