"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, serverTimestamp, getDoc, writeBatch } from "../../lib/firebase";
import * as Icons from "lucide-react";
import TaxonomyManager from "../../components/TaxonomyManager";
import EditListingModal from "../../components/EditListingModal";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Data States
  const [listings, setListings] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingListing, setEditingListing] = useState<any | null>(null);

  // Importer State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Taxonomy Tagging State
  const [taxonomyCategories, setTaxonomyCategories] = useState<any[]>([]);
  const [taxonomyLocations, setTaxonomyLocations] = useState<any[]>([]);
  const [tagCategory, setTagCategory] = useState("");
  const [tagSubcategory, setTagSubcategory] = useState("");
  const [tagState, setTagState] = useState("");
  const [tagDistrict, setTagDistrict] = useState("");
  const [tagTown, setTagTown] = useState("");
  const [tagArea, setTagArea] = useState("");
  const [tagStreet, setTagStreet] = useState("");
  const [tagVillage, setTagVillage] = useState("");
  const [tagPincode, setTagPincode] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "jewelry",
    address: "",
    distance: "1.2 km",
    description: "",
    image: "",
    phone: "",
    website: "",
    rating: 5.0,
    reviews_count: 1
  });

  useEffect(() => {
    // 1. If arriving directly from Launcher, parse SSO tokens FIRST
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ssoRole = params.get("sso_role");
      if (ssoRole) {
        localStorage.setItem("sd_current_user_role", ssoRole);
        
        // Clean URL optional
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    // 2. Check if user is an admin or super_admin
    const role = localStorage.getItem("sd_current_user_role");
    if (role === "super_admin" || role === "admin") {
      setIsAuthorized(true);
    } else {
      console.warn("Unauthorized role detected:", role);
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;
    if (activeTab === "listings" || activeTab === "dashboard") fetchListings();
    if (activeTab === "claims" || activeTab === "dashboard") fetchClaims();
    if (activeTab === "importer") fetchTaxonomy();
  }, [activeTab, isAuthorized]);

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

  const fetchListings = async () => {
    setIsLoadingData(true);
    try {
      const snapshot = await getDocs(collection(db, "listings"));
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setListings(data);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    }
    setIsLoadingData(false);
  };

  const fetchClaims = async () => {
    setIsLoadingData(true);
    try {
      const snapshot = await getDocs(collection(db, "claims"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as any);
      setClaims(data.sort((a: any, b: any) => (b.submittedAt?.toMillis?.() || 0) - (a.submittedAt?.toMillis?.() || 0)));
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    }
    setIsLoadingData(false);
  };

  const handleApproveClaim = async (claimId: string, listingId: string) => {
    if (!confirm("Approve this claim? The listing will be marked as officially claimed.")) return;
    try {
      await updateDoc(doc(db, "claims", claimId), { status: "Approved" });
      await updateDoc(doc(db, "listings", listingId), { is_claimed: true });
      fetchClaims();
    } catch (err) {
      console.error(err);
      alert("Failed to approve claim.");
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    if (!confirm("Reject this claim?")) return;
    try {
      await updateDoc(doc(db, "claims", claimId), { status: "Rejected" });
      fetchClaims();
    } catch (err) {
      console.error(err);
      alert("Failed to reject claim.");
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing permanently?")) return;
    try {
      await deleteDoc(doc(db, "listings", listingId));
      fetchListings();
    } catch (err) {
      console.error(err);
      alert("Failed to delete listing.");
    }
  };

  const handleDeleteAllListings = async () => {
    if (!confirm("⚠️ WARNING: This will permanently delete ALL listings in your database. Are you absolutely sure?")) return;
    if (prompt("Type 'DELETE ALL' to confirm:") !== "DELETE ALL") return;
    
    setIsLoadingData(true);
    try {
      // In a real production app with 10k+ docs, we'd delete in chunks. For now, batch delete.
      const snapshot = await getDocs(collection(db, "listings"));
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      alert("All listings deleted successfully.");
      fetchListings();
    } catch (err) {
      console.error(err);
      alert("Failed to delete all listings.");
    }
    setIsLoadingData(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "rating" || name === "reviews_count" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(""); setSuccessMsg("");
    try {
      await addDoc(collection(db, "listings"), {
        ...formData,
        is_verified: true,
        is_claimed: false,
        features: ["New Listing"],
        createdAt: serverTimestamp()
      });
      setSuccessMsg("Listing successfully added to the Live Directory!");
      setFormData({
        name: "", category: "jewelry", address: "", distance: "1.2 km",
        description: "", image: "", phone: "", website: "", rating: 5.0, reviews_count: 1
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add listing.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPlaces = async () => {
    if (!searchQuery) return;
    setIsSearching(true); setErrorMsg(""); setSuccessMsg("");
    try {
      // Auto-append location tags to force Google to return highly localized results
      const fullQuery = [searchQuery, tagArea, tagTown, tagDistrict, tagState, tagPincode].filter(Boolean).join(", ");
      const res = await fetch(`/api/places?query=${encodeURIComponent(fullQuery)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to search places");
      setSearchResults(data.results);
      if (data.results.length === 0) setErrorMsg("No results found on Google Maps.");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportAll = async () => {
    setIsImporting(true); setErrorMsg(""); setSuccessMsg("");
    try {
      const cleanData = searchResults.map(place => ({
          id: place.id || "unknown",
          name: place.name || "Unknown",
          address: place.address || "",
          rating: place.rating || 0,
          reviews_count: place.reviews_count || 0,
          image: place.image || "",
          category: tagCategory || place.category || "retail",
          subCategory: tagSubcategory || "",
          country: "India",
          state: tagState || "",
          district: tagDistrict || "",
          townOrBlock: tagTown || "",
          area: tagArea || "",
          street: tagStreet || "",
          village: tagVillage || "",
          pincode: tagPincode || "",
          description: place.description || "",
          distance: place.distance || "",
          is_verified: true,
          is_claimed: false,
          features: ["Auto-Imported", "Google Places"],
          sourceQuery: searchQuery,
          createdAt: serverTimestamp()
        }));

      const promises = cleanData.map(data => addDoc(collection(db, "listings"), data));
      
      // Add a 10-second timeout to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Firebase connection timed out after 10 seconds. Check your Firestore Security Rules.")), 10000)
      );

      await Promise.race([Promise.all(promises), timeoutPromise]);
      
      setSuccessMsg(`Successfully imported ${searchResults.length} listings into the directory!`);
      setSearchResults([]); setSearchQuery("");
    } catch (err: any) {
      console.error("IMPORT ERROR:", err);
      setErrorMsg(err.message || "Failed to import some listings. Check console.");
    } finally {
      setIsImporting(false);
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen flex bg-[#040815] text-[#f8fafc] font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#090F1D] border-r border-[#1e293b] flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-[#1e293b]">
          <h1 className="text-xl font-black font-serif text-[#e5c158]">SD Admin</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Directory Node</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "dashboard" ? "bg-[#e5c158]/10 text-[#e5c158]" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"}`}
          >
            <Icons.LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab("importer")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "importer" ? "bg-[#e5c158]/10 text-[#e5c158]" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"}`}
          >
            <Icons.Zap className="w-5 h-5" /> Data Importer
          </button>
          
          <button 
            onClick={() => setActiveTab("listings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "listings" ? "bg-[#e5c158]/10 text-[#e5c158]" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"}`}
          >
            <Icons.List className="w-5 h-5" /> Manage Listings
          </button>
          
          <button 
            onClick={() => setActiveTab("claims")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "claims" ? "bg-[#e5c158]/10 text-[#e5c158]" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"}`}
          >
            <Icons.ShieldCheck className="w-5 h-5" /> Business Claims
          </button>
          
          <button 
            onClick={() => setActiveTab("taxonomy")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "taxonomy" ? "bg-[#e5c158]/10 text-[#e5c158]" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"}`}
          >
            <Icons.FolderTree className="w-5 h-5" /> Categories & Places
          </button>
        </nav>
        
        <div className="p-4 border-t border-[#1e293b]">
          <a href="/" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors">
            <Icons.ExternalLink className="w-4 h-4" /> View Live Site
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          
          {/* TAB: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-black text-white mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-xl"><Icons.Building2 className="w-6 h-6" /></div>
                    <div><p className="text-sm text-slate-400 font-bold">Total Listings</p><h3 className="text-3xl font-black text-white">{listings.length}</h3></div>
                  </div>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#e5c158]/10 text-[#e5c158] flex items-center justify-center rounded-xl"><Icons.ShieldCheck className="w-6 h-6" /></div>
                    <div><p className="text-sm text-slate-400 font-bold">Pending Claims</p><h3 className="text-3xl font-black text-white">{claims.filter(c => c.status === "Pending Verification").length}</h3></div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/10 text-green-400 flex items-center justify-center rounded-xl"><Icons.CheckCircle className="w-6 h-6" /></div>
                    <div><p className="text-sm text-slate-400 font-bold">Claimed Businesses</p><h3 className="text-3xl font-black text-white">{listings.filter(l => l.is_claimed).length}</h3></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: IMPORTER */}
          {activeTab === "importer" && (
            <div className="animate-fadeIn space-y-12">
              <div>
                <h2 className="text-2xl font-black text-white mb-2">Data Importer</h2>
                <p className="text-slate-400">Search for real businesses to automatically seed the directory.</p>
              </div>

              {/* Tagging Center */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#e5c158] mb-4 flex items-center gap-2">
                  <Icons.Tags className="w-5 h-5"/> Data Tagging Center
                </h3>
                <p className="text-slate-400 text-sm mb-6">Assign the Category and Location hierarchy BEFORE importing. Every listing in this batch will be tagged with these exact values.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Categorization */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Category *</label>
                    <select value={tagCategory} onChange={e => setTagCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:border-[#e5c158] outline-none">
                      <option value="">Select Category...</option>
                      {taxonomyCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Subcategory</label>
                    <input type="text" value={tagSubcategory} onChange={e => setTagSubcategory(e.target.value)} placeholder="e.g. Pediatrician" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:border-[#e5c158] outline-none" />
                  </div>
                  
                  {/* Location High Level */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">State</label>
                    <select value={tagState} onChange={e => {setTagState(e.target.value); setTagDistrict("");}} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:border-[#e5c158] outline-none">
                      <option value="">Select State...</option>
                      {taxonomyLocations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">District</label>
                    <select value={tagDistrict} onChange={e => setTagDistrict(e.target.value)} disabled={!tagState} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:border-[#e5c158] outline-none disabled:opacity-50">
                      <option value="">Select District...</option>
                      {taxonomyLocations.find(l => l.name === tagState)?.children.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Town / Block</label>
                    <input type="text" value={tagTown} onChange={e => setTagTown(e.target.value)} placeholder="e.g. Sambalpur" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Area</label>
                    <input type="text" value={tagArea} onChange={e => setTagArea(e.target.value)} placeholder="e.g. Golebazar" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Street</label>
                    <input type="text" value={tagStreet} onChange={e => setTagStreet(e.target.value)} placeholder="e.g. Gaiety Talkies Rd" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Village</label>
                    <input type="text" value={tagVillage} onChange={e => setTagVillage(e.target.value)} placeholder="e.g. Attabira" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pincode (Optional)</label>
                    <input type="text" value={tagPincode} onChange={e => setTagPincode(e.target.value)} placeholder="e.g. 768001" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-slate-800">
                  <div className="flex-1 relative">
                    <Icons.Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Google Search e.g., Doctors in Cuttack..." 
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleSearchPlaces}
                    disabled={isSearching || !tagCategory}
                    className="px-8 py-4 rounded-xl bg-[#1e293b] text-white font-bold hover:bg-[#2a3a52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSearching ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : "Search Places"}
                  </button>
                </div>
                {!tagCategory && <p className="text-red-400 text-xs mt-2">* You must assign a Category before searching.</p>}

                {searchResults.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-sm font-bold text-[#e5c158]">Found {searchResults.length} Results</h3>
                    <div className="max-h-64 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      {searchResults.map((res, idx) => (
                        <div key={idx} className="flex justify-between items-center pb-3 border-b border-slate-800/50 last:border-0 last:pb-0">
                          <div>
                            <div className="font-bold text-white text-sm">{res.name}</div>
                            <div className="text-xs text-slate-500">{res.address}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-[#e5c158] font-bold">{res.rating} ⭐ ({res.reviews_count})</div>
                            <div className="text-[10px] text-slate-400 uppercase">{tagCategory}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={handleImportAll}
                      disabled={isImporting}
                      className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-[#996515] to-[#C5A059] text-black font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isImporting ? "Injecting into Firebase..." : `Import All ${searchResults.length} Listings Now`}
                    </button>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-4">Manual Entry Form</h2>
              <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Business Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#e5c158] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#e5c158] outline-none">
                      <option value="jewelry">Jewelry</option>
                      <option value="handlooms">Handlooms</option>
                      <option value="doctors">Doctors</option>
                      <option value="it_services">IT Services</option>
                      <option value="retail">Retail</option>
                      <option value="restaurants">Restaurants</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Address / Location</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#e5c158] outline-none" placeholder="e.g., Patia, Bhubaneswar, Odisha" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#e5c158] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Image URL</label>
                    <input type="url" name="image" value={formData.image} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#e5c158] outline-none" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#e5c158] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Initial Rating</label>
                    <input type="number" step="0.1" max="5" name="rating" value={formData.rating} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#e5c158] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Reviews Count</label>
                    <input type="number" name="reviews_count" value={formData.reviews_count} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#e5c158] outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#996515] to-[#C5A059] text-black font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
                  {loading ? "Publishing to Firestore..." : "Publish Live Listing"}
                </button>
              </form>
            </div>
          )}

          {/* TAB: LISTINGS */}
          {activeTab === "listings" && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white">Manage Listings</h2>
                <button 
                  onClick={handleDeleteAllListings} 
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <Icons.Trash2 className="w-4 h-4" /> Delete All Data
                </button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-xs uppercase text-slate-500 font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Business</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {isLoadingData ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                      ) : listings.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No listings found.</td></tr>
                      ) : (
                        listings.map((lst) => (
                          <tr key={lst.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{lst.name}</div>
                              <div className="text-xs text-slate-500">{lst.address}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">
                                {lst.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {lst.is_claimed ? (
                                <span className="text-green-400 text-xs font-bold flex items-center gap-1"><Icons.ShieldCheck className="w-3.5 h-3.5"/> Claimed</span>
                              ) : (
                                <span className="text-slate-500 text-xs font-bold">Unclaimed</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingListing(lst)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/30 p-2 rounded-lg transition-colors" title="Edit Listing">
                                  <Icons.Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteListing(lst.id)} className="text-red-400 hover:text-red-300 hover:bg-red-950/30 p-2 rounded-lg transition-colors" title="Delete Listing">
                                  <Icons.Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLAIMS */}
          {activeTab === "claims" && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-black text-white mb-6">Business Claims</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-xs uppercase text-slate-500 font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Claimant / Role</th>
                        <th className="px-6 py-4">Business</th>
                        <th className="px-6 py-4">Document</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {isLoadingData ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                      ) : claims.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No claims filed yet.</td></tr>
                      ) : (
                        claims.map((claim) => (
                          <tr key={claim.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{claim.ownerName}</div>
                              <div className="text-xs text-[#e5c158]">{claim.role}</div>
                              <div className="text-[10px] text-slate-500">{claim.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-200">{claim.listingName}</div>
                              <a href={claim.website} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">View Website</a>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-slate-300 font-bold">{claim.docType}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{claim.docNumber}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                                claim.status === "Approved" ? "bg-green-500/10 text-green-400" :
                                claim.status === "Rejected" ? "bg-red-500/10 text-red-400" :
                                "bg-[#e5c158]/10 text-[#e5c158]"
                              }`}>
                                {claim.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {claim.status === "Pending Verification" && (
                                <>
                                  <button onClick={() => handleApproveClaim(claim.id, claim.listingId)} className="bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                    Approve
                                  </button>
                                  <button onClick={() => handleRejectClaim(claim.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                    Reject
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "taxonomy" && (
            <TaxonomyManager />
          )}

          {editingListing && (
            <EditListingModal 
              listing={editingListing} 
              onClose={() => setEditingListing(null)} 
              onRefresh={fetchListings} 
            />
          )}

        </div>
      </main>
    </div>
  );
}
