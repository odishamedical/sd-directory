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
import { db, collection, getDocs, query, orderBy, getDoc, doc, updateDoc, deleteDoc } from "../lib/firebase";
import WhatsAppSubscriberBox from "../components/WhatsAppSubscriberBox";
import EditListingModal from "../components/EditListingModal";
import AddListingModal from "../components/AddListingModal";

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
  
  // Smart Cascading Filter States
  const [smartState, setSmartState] = useState("");
  const [smartDistrict, setSmartDistrict] = useState("");
  const [smartVillage, setSmartVillage] = useState("");
  const [smartCategory, setSmartCategory] = useState("");

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

  // Admin States
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminModeActive, setAdminModeActive] = useState(true);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [isAddingListing, setIsAddingListing] = useState(false);

  // Load claimed listings from local storage on load
  useEffect(() => {
    const claims = JSON.parse(localStorage.getItem("sd_listing_claims") || "[]");
    const claimedIds = claims.map((c: any) => c.listingId);
    setClaimedListingIds(claimedIds);

    const savedWishlist = JSON.parse(localStorage.getItem("sd_wishlist") || "[]");
    setWishlist(savedWishlist);

    // Check admin role
    const role = localStorage.getItem("sd_current_user_role");
    if (role === "super_admin" || role === "admin") setIsAdmin(true);
    
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
    
    // Read from URL query params (for breadcrumb navigation)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("state")) setSmartState(params.get("state")!);
      if (params.get("district")) setSmartDistrict(params.get("district")!);
      if (params.get("village")) setSmartVillage(params.get("village")!);
      if (params.get("category")) setSmartCategory(params.get("category")!);
    }
  }, []);

  // Derived options for Smart Filter based on LIVE listings data
  const availableStates = Array.from(new Set(listings.map(l => l.state).filter(Boolean)));
  const availableDistricts = Array.from(new Set(listings.filter(l => !smartState || l.state === smartState).map(l => l.district).filter(Boolean)));
  const availableVillages = Array.from(new Set(listings.filter(l => (!smartState || l.state === smartState) && (!smartDistrict || l.district === smartDistrict)).map(l => l.village || l.townOrBlock).filter(Boolean)));
  const availableCategories = Array.from(new Set(listings.filter(l => (!smartState || l.state === smartState) && (!smartDistrict || l.district === smartDistrict) && (!smartVillage || (l.village === smartVillage || l.townOrBlock === smartVillage))).map(l => l.category).filter(Boolean)));

  // Filter listings based on Search & Tabs & Sidebar & Smart Filters
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

    // Filter by Smart Cascading Dropdowns
    if (smartState) result = result.filter(item => item.state === smartState);
    if (smartDistrict) result = result.filter(item => item.district === smartDistrict);
    if (smartVillage) result = result.filter(item => item.village === smartVillage || item.townOrBlock === smartVillage);
    if (smartCategory) result = result.filter(item => item.category === smartCategory);

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

  // Admin handlers
  const handleAdminEdit = (lst: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingListing(lst);
  };

  const handleAdminDelete = async (listingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this listing permanently? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "listings", listingId));
      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch (err) {
      alert("Failed to delete listing.");
    }
  };

  const handleAdminFeature = async (lst: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, "listings", lst.id), { is_featured: !lst.is_featured });
      setListings(prev => prev.map(l => l.id === lst.id ? { ...l, is_featured: !l.is_featured } : l));
    } catch (err) {
      alert("Failed to update featured status.");
    }
  };

  // Nav Item Class helpers
  const tabClass = (tabName: string) => {
    const isActive = selectedTab === tabName;
    return `px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
      isActive 
        ? "text-[#020810] shadow-md font-bold" 
        : "text-[#7BA3C8] border border-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.35)]"
    }`;
  };

  return (
    <div className="relative min-h-screen text-[#E8F4FF] flex flex-col font-sans overflow-x-hidden" style={{ background: "#030B1A" }}>
      
      {/* Subtle dot grid overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.025] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, #00D4FF 1px, transparent 0)', 
          backgroundSize: '28px 28px' 
        }}
      />
      
      {/* Aura ambient glows — cyan + violet orbs */}
      <div className="absolute top-[-5%] left-[5%] w-[700px] h-[700px] rounded-full pointer-events-none z-0" style={{ background: "rgba(0,212,255,0.04)", filter: "blur(160px)" }} />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: "rgba(129,140,248,0.05)", filter: "blur(180px)" }} />
      <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full pointer-events-none z-0" style={{ background: "rgba(56,189,248,0.03)", filter: "blur(140px)" }} />

      {/* 1. Header / Sticky Glass Navigation Hub */}
      <Header />

      {/* Admin Mode Banner */}
      {isAdmin && (
        <div
          className="relative z-20 w-full px-4 py-2.5 flex items-center justify-between gap-3"
          style={{
            background: "rgba(0,212,255,0.06)",
            borderBottom: "1px solid rgba(0,212,255,0.15)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: "rgba(0,212,255,0.15)" }}
            >
              <Icons.ShieldCheck className="w-3 h-3" style={{ color: "#00D4FF" }} />
            </div>
            <span className="text-[11px] font-bold" style={{ color: "#00D4FF" }}>
              Admin Mode
            </span>
            <span className="text-[11px] hidden sm:inline-block" style={{ color: "#4A7A9B" }}>
              — Edit, delete or feature any listing directly from this page
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminModeActive(!adminModeActive)}
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
              style={{
                background: adminModeActive ? "rgba(239,68,68,0.10)" : "rgba(34,197,94,0.10)",
                border: adminModeActive ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(34,197,94,0.25)",
                color: adminModeActive ? "#F87171" : "#4ADE80",
              }}
            >
              <Icons.Power className="w-3 h-3" />
              {adminModeActive ? "Turn Off" : "Turn On"}
            </button>
            <a
              href="/admin"
            className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            style={{
              background: "rgba(0,212,255,0.10)",
              border: "1px solid rgba(0,212,255,0.25)",
              color: "#00D4FF",
            }}
          >
            <Icons.LayoutDashboard className="w-3 h-3" />
            Full Admin Panel
          </a>
        </div>
        </div>
      )}

      {/* 2. Hero search panel */}
      <section className="relative max-w-[1400px] mx-auto w-full px-4 sm:px-6 pt-12 pb-4 z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mb-6">
          
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-4 font-serif" style={{ color: "#E8F4FF" }}>
            Odisha Local{" "}
            <span style={{
              background: "linear-gradient(135deg, #00D4FF 0%, #38BDF8 55%, #818CF8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 16px rgba(0,212,255,0.4))"
            }}>Business Index</span>
          </h1>
          <p className="text-xs sm:text-sm max-w-xl mb-6 leading-relaxed" style={{ color: "#4A7A9B" }}>
            Search authentic handlooms, certified jewelry boutiques, healthcare providers, and local services across Odisha clusters.
          </p>

          {/* Smart Cascading Filter Bar */}
          <div className="w-full max-w-4xl mx-auto mb-6 bg-[#071428] border border-[rgba(0,212,255,0.14)] rounded-2xl p-3 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              
              <div className="flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#4A7A9B] mb-1 px-1">State</label>
                <select 
                  value={smartState} 
                  onChange={e => { setSmartState(e.target.value); setSmartDistrict(""); setSmartVillage(""); setSmartCategory(""); }}
                  className="bg-[#020810] border border-[rgba(0,212,255,0.1)] text-[#E8F4FF] text-xs p-2.5 rounded-lg outline-none focus:border-[#00D4FF] appearance-none"
                >
                  <option value="">All States</option>
                  {availableStates.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#4A7A9B] mb-1 px-1">District</label>
                <select 
                  value={smartDistrict} 
                  onChange={e => { setSmartDistrict(e.target.value); setSmartVillage(""); setSmartCategory(""); }}
                  disabled={!smartState && availableDistricts.length === 0}
                  className="bg-[#020810] border border-[rgba(0,212,255,0.1)] text-[#E8F4FF] text-xs p-2.5 rounded-lg outline-none focus:border-[#00D4FF] appearance-none disabled:opacity-50"
                >
                  <option value="">All Districts</option>
                  {availableDistricts.map(d => <option key={d as string} value={d as string}>{d as string}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#4A7A9B] mb-1 px-1">Town / Village</label>
                <select 
                  value={smartVillage} 
                  onChange={e => { setSmartVillage(e.target.value); setSmartCategory(""); }}
                  disabled={!smartDistrict && availableVillages.length === 0}
                  className="bg-[#020810] border border-[rgba(0,212,255,0.1)] text-[#E8F4FF] text-xs p-2.5 rounded-lg outline-none focus:border-[#00D4FF] appearance-none disabled:opacity-50"
                >
                  <option value="">All Towns/Villages</option>
                  {availableVillages.map(v => <option key={v as string} value={v as string}>{v as string}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#4A7A9B] mb-1 px-1">Category</label>
                <select 
                  value={smartCategory} 
                  onChange={e => setSmartCategory(e.target.value)}
                  className="bg-[#020810] border border-[rgba(0,212,255,0.1)] text-[#00D4FF] font-bold text-xs p-2.5 rounded-lg outline-none focus:border-[#00D4FF] appearance-none"
                >
                  <option value="">All Categories</option>
                  {availableCategories.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
                </select>
              </div>

            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-6 w-full max-w-4xl justify-center">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-[#071428] border border-[rgba(0,212,255,0.14)] rounded-full px-4 py-2 shadow-lg">
              <Icons.Search className="w-3.5 h-3.5" style={{ color: "#00D4FF" }} />
              <input
                type="text"
                placeholder="Or type a keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs focus:outline-none w-full border-none"
                style={{ color: "#E8F4FF" }}
              />
            </div>
            
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden p-2 rounded-full transition-all flex items-center justify-center bg-[#071428] border border-[rgba(0,212,255,0.14)]"
            >
              <Icons.SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "#00D4FF" }} />
            </button>
          </div>

          {/* Programmatic SEO Quick Links (Crawler Highway) */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A7A9B] w-full mb-1">Browse by Location</span>
            {["Odisha", "Bargarh", "Sonepur", "Boudh", "Bhubaneswar", "Sambalpur"].map((loc) => (
              <a 
                key={loc}
                href={`/directory/${loc === "Odisha" ? "Odisha" : `Odisha/${loc}`}`}
                className="text-xs font-bold text-[#7BA3C8] hover:text-[#00D4FF] border border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.02)] px-3 py-1.5 rounded-full transition-all hover:bg-[rgba(0,212,255,0.08)]"
              >
                {loc}
              </a>
            ))}
          </div>

          {/* Category Horizontal Pills Carousel */}
          <div className="w-full max-w-3xl overflow-x-auto flex items-center gap-2 py-2 px-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setSelectedTab("All")}
              className="px-4 py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300"
              style={{
                background: selectedTab === "All" ? "linear-gradient(135deg, #00D4FF, #38BDF8)" : "rgba(0,212,255,0.06)",
                color: selectedTab === "All" ? "#020810" : "#4A7A9B",
                border: selectedTab === "All" ? "1px solid transparent" : "1px solid rgba(0,212,255,0.14)",
                boxShadow: selectedTab === "All" ? "0 4px 16px rgba(0,212,255,0.3)" : "none"
              }}
            >
              All Categories
            </button>
            {taxonomyCategories.map((c: any) => (
              <button
                key={c.id || c.name}
                onClick={() => setSelectedTab(c.name)}
                className="px-4 py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300"
                style={{
                  background: selectedTab === c.name ? "linear-gradient(135deg, #00D4FF, #38BDF8)" : "rgba(0,212,255,0.06)",
                  color: selectedTab === c.name ? "#020810" : "#4A7A9B",
                  border: selectedTab === c.name ? "1px solid transparent" : "1px solid rgba(0,212,255,0.14)",
                  boxShadow: selectedTab === c.name ? "0 4px 16px rgba(0,212,255,0.3)" : "none"
                }}
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
          <aside className={`fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm p-6 overflow-y-auto transform transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:w-auto lg:max-w-none lg:bg-transparent lg:border-none lg:p-0 lg:overflow-visible lg:transform-none lg:col-span-3 space-y-6 shadow-2xl lg:shadow-none ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            style={{ background: isMobileFilterOpen ? "#030B1A" : undefined, borderRight: isMobileFilterOpen ? "1px solid rgba(0,212,255,0.10)" : undefined }}>
            
            <div className="flex justify-between items-center lg:hidden mb-4 pb-4"
              style={{ borderBottom: "1px solid rgba(0,212,255,0.10)" }}>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#E8F4FF" }}>Filters</span>
              <button onClick={() => setIsMobileFilterOpen(false)} style={{ color: "#4A7A9B" }}>
                <Icons.X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Container Card */}
            <div className="p-5 rounded-2xl space-y-6"
              style={{ background: "#071428", border: "1px solid rgba(0,212,255,0.10)" }}>
              <div className="flex justify-between items-center pb-4"
                style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#E8F4FF" }}>
                  <Icons.SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "#00D4FF" }} />
                  <span>Filters</span>
                </span>
                <button 
                  onClick={clearAllFilters}
                  className="text-[10px] font-bold uppercase tracking-wider hover:underline"
                  style={{ color: "#00D4FF" }}
                >
                  Clear All
                </button>
              </div>

              {/* Categories Sidebar Selection */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4A7A9B" }}>Category</h5>
                <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-2" style={{ color: "#7BA3C8" }}>
                  {taxonomyCategories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2.5 cursor-pointer hover:text-[#E8F4FF]">
                      <input 
                        type="checkbox"
                        checked={selectedCategories.includes(c.name)}
                        onChange={() => handleCategoryCheckboxChange(c.name)}
                        className="rounded w-4 h-4 cursor-pointer focus:ring-0 focus:ring-offset-0"
                        style={{ accentColor: "#00D4FF" }}
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Sidebar Selection */}
              <div className="space-y-3 pt-4" style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}>
                <h5 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4A7A9B" }}>Location</h5>
                <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-2" style={{ color: "#7BA3C8" }}>
                  {taxonomyLocations.flatMap(state => state.children).map((d: any) => (
                    <label key={d.id} className="flex items-center gap-2.5 cursor-pointer hover:text-[#E8F4FF]">
                      <input 
                        type="checkbox"
                        checked={selectedLocations.includes(d.name)}
                        onChange={() => handleLocationCheckboxChange(d.name)}
                        className="rounded w-4 h-4 cursor-pointer focus:ring-0 focus:ring-offset-0"
                        style={{ accentColor: "#00D4FF" }}
                      />
                      <span>{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Map Preview integration */}
              <div className="space-y-2 pt-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4A7A9B" }}>Map Preview</h5>
                <MapPreview city={selectedLocations[0] || "Bhubaneswar"} />
              </div>

              {/* Star Rating Selectors */}
              <div className="space-y-3 pt-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4A7A9B" }}>Minimum Rating</h5>
                <div className="flex flex-col gap-2 text-xs">
                  {[4.9, 4.8, 4.6].map((rate) => (
                    <button 
                      key={rate}
                      onClick={() => setMinRating(minRating === rate ? null : rate)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-left cursor-pointer transition-all"
                      style={{
                        border: minRating === rate ? "1px solid rgba(0,212,255,0.5)" : "1px solid rgba(0,212,255,0.10)",
                        background: minRating === rate ? "rgba(0,212,255,0.08)" : "rgba(2,8,16,0.5)",
                        color: minRating === rate ? "#E8F4FF" : "#4A7A9B",
                        fontWeight: minRating === rate ? 700 : 400
                      }}
                    >
                      <Icons.Star className="w-3.5 h-3.5" style={{ color: minRating === rate ? "#00D4FF" : undefined, fill: minRating === rate ? "#00D4FF" : "none" }} />
                      <span>{rate} Stars & above</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp Subscription */}
              <div className="pt-4" style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}>
                <WhatsAppSubscriberBox />
              </div>

            </div>

          </aside>

          {/* Right Main Grid Section */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 px-2">
              <p className="text-xs" style={{ color: "#4A7A9B" }}>
                Showing <strong style={{ color: "#E8F4FF" }}>{filteredListings.length}</strong> local listings in Odisha
              </p>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[10px] uppercase font-bold" style={{ color: "#4A7A9B" }}>Sort by:</span>
                <select
                  className="rounded-lg text-[10px] font-bold uppercase px-2 py-1.5 focus:outline-none"
                  style={{ background: "#071428", border: "1px solid rgba(0,212,255,0.14)", color: "#00D4FF" }}
                >
                  <option>Promoted & Nearby</option>
                  <option>Highest Rated</option>
                  <option>Reviews Count</option>
                </select>
              </div>
            </div>

            {/* Grid List */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredListings.map((lst, index) => {
                  const isWishlisted = wishlist.includes(lst.id);
                  
                  // Inject Ad after every 6 listings
                  const adIndex = Math.floor(index / 6);
                  const shouldShowAd = index > 0 && index % 6 === 0 && searchAds[adIndex];
                  
                  return (
                    <React.Fragment key={lst.id}>
                      {shouldShowAd && (
                        <div className="col-span-1 md:col-span-2 xl:col-span-3 rounded-2xl overflow-hidden relative aspect-[6/1] sm:aspect-[8/1] my-4 group shadow-xl"
                          style={{ border: "1px solid rgba(0,212,255,0.20)" }}>
                          <a href={searchAds[adIndex].linkUrl} target="_blank" rel="noopener noreferrer">
                            <img src={searchAds[adIndex].imageUrl} alt="Advertisement" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest"
                              style={{ color: "#00D4FF", border: "1px solid rgba(0,212,255,0.25)" }}>
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
                          isFeatured={lst.is_featured}
                          features={lst.features || []}
                          onWishlistToggle={toggleWishlist}
                          isWishlisted={isWishlisted}
                          isAdmin={isAdmin && adminModeActive}
                          onEdit={(e) => handleAdminEdit(lst, e)}
                          onDelete={(e) => handleAdminDelete(lst.id, e)}
                          onFeature={(e) => handleAdminFeature(lst, e)}
                        />
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center rounded-2xl max-w-md mx-auto glass-panel">
                <Icons.AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: "#00D4FF" }} />
                <h4 className="text-base font-bold mb-2" style={{ color: "#E8F4FF" }}>No Matching Listings</h4>
                <p className="text-xs mb-6 max-w-xs mx-auto" style={{ color: "#4A7A9B" }}>
                  Try adjusting your search criteria, selecting another cluster region, or clearing the sidebar filters.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 font-bold rounded-xl text-xs uppercase tracking-wider text-[#020810] transition-all"
                  style={{
                    background: "linear-gradient(135deg, #00D4FF, #38BDF8)",
                    boxShadow: "0 4px 16px rgba(0,212,255,0.3)"
                  }}
                >
                  Reset Directory
                </button>
              </div>
            )}

          </main>

        </div>
      </section>

      {/* 4. Footer */}
      <footer className="mt-auto py-8 px-6 text-center z-10"
        style={{ borderTop: "1px solid rgba(0,212,255,0.08)", background: "rgba(2,8,16,0.8)" }}>
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs" style={{ color: "#4A7A9B" }}>
          <p>© 2026 Shyam Dash Creation. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#00D4FF] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#00D4FF] transition-colors">Bylaws & GI-Tag rules</a>
            <a href="#" className="hover:text-[#00D4FF] transition-colors">IT Support</a>
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

      {/* Edit Listing Modal (Admin) */}
      {editingListing && (
        <EditListingModal
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onRefresh={() => {
            setEditingListing(null);
            // Re-fetch updated listing from Firestore
            const fetchUpdated = async () => {
              try {
                const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const updated: any[] = [];
                snapshot.forEach(d => updated.push({ ...d.data(), id: d.id }));
                setListings(updated);
              } catch {}
            };
            fetchUpdated();
          }}
        />
      )}

      {/* Add Listing Modal (Admin) */}
      {isAddingListing && (
        <AddListingModal
          onClose={() => setIsAddingListing(false)}
          onSuccess={() => {
            setIsAddingListing(false);
            const fetchNew = async () => {
              try {
                const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const updated: any[] = [];
                snapshot.forEach(d => updated.push({ ...d.data(), id: d.id }));
                setListings(updated);
              } catch {}
            };
            fetchNew();
          }}
        />
      )}

      {/* Floating Add Button (Admin only) */}
      {isAdmin && adminModeActive && (
        <button
          onClick={() => setIsAddingListing(true)}
          className="fixed bottom-20 right-5 md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 group"
          style={{
            background: "linear-gradient(135deg, #00D4FF 0%, #38BDF8 100%)",
            boxShadow: "0 0 30px rgba(0,212,255,0.5), 0 8px 24px rgba(0,0,0,0.4)",
          }}
          title="Add New Listing"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 50px rgba(0,212,255,0.7), 0 10px 30px rgba(0,0,0,0.5)";
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 30px rgba(0,212,255,0.5), 0 8px 24px rgba(0,0,0,0.4)";
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          <Icons.Plus className="w-6 h-6 text-[#020810]" />
        </button>
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
