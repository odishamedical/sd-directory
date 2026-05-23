"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, collection, addDoc, serverTimestamp } from "../../lib/firebase";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Importer State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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
    // Check if user is an admin or super_admin
    const role = localStorage.getItem("sd_current_user_role");
    if (role === "super_admin" || role === "admin") {
      setIsAuthorized(true);
    } else {
      console.warn("Unauthorized role detected:", role);
      router.push("/");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "rating" || name === "reviews_count" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Create listing object based on our schema
      const listingData = {
        ...formData,
        is_verified: true,
        is_claimed: false,
        features: ["New Listing"],
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "listings"), listingData);
      
      setSuccessMsg("Listing successfully added to the Live Directory!");
      setFormData({
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
    } catch (err: any) {
      console.error("Error adding listing: ", err);
      setErrorMsg(err.message || "Failed to add listing.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPlaces = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const res = await fetch(`/api/places?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to search places");
      
      setSearchResults(data.results);
      if (data.results.length === 0) setErrorMsg("No results found on Google Maps.");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportAll = async () => {
    setIsImporting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      let imported = 0;
      for (const place of searchResults) {
        await addDoc(collection(db, "listings"), {
          ...place,
          features: ["Auto-Imported", "Google Places"],
          createdAt: serverTimestamp()
        });
        imported++;
      }
      setSuccessMsg(`Successfully imported ${imported} listings into the directory!`);
      setSearchResults([]);
      setSearchQuery("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to import some listings. Check console.");
    } finally {
      setIsImporting(false);
    }
  };

  if (!isAuthorized) return null; // or a loading spinner

  return (
    <div className="min-h-screen bg-[#040815] text-white font-sans p-8 pt-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black font-serif text-[#e5c158] mb-2">SD Directory Admin</h1>
        <p className="text-slate-400 text-sm mb-8">Secure Master Control Panel - Add New Public Listings</p>

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6">
            {successMsg}
          </div>
        )}
        
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6">
            {errorMsg}
          </div>
        )}

        {/* GOOGLE PLACES AUTO-IMPORTER */}
        <div className="bg-slate-900/50 border border-[#e5c158]/50 p-8 rounded-2xl mb-8">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-[#e5c158]">⚡</span> Google Places Auto-Importer
          </h2>
          <p className="text-sm text-slate-400 mb-6">Search for real businesses to automatically seed the directory.</p>
          
          <div className="flex gap-4 mb-6">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Doctors in Cuttack" 
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-[#e5c158] outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSearchPlaces()}
            />
            <button 
              onClick={handleSearchPlaces}
              disabled={isSearching || !searchQuery}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Search Places"}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
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
                      <div className="text-[10px] text-slate-400 uppercase">{res.category}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleImportAll}
                disabled={isImporting}
                className="w-full py-3 mt-2 rounded-xl bg-gold-gradient text-slate-950 font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
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
              <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Image URL (Unsplash/Firebase)</label>
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

        <div className="mt-8 text-center">
          <a href="/" className="text-[#e5c158] hover:underline text-sm font-bold">← Return to Directory</a>
        </div>
      </div>
    </div>
  );
}
