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
    // Check if user is super_admin
    const role = localStorage.getItem("sd_current_user_role");
    if (role === "super_admin") {
      setIsAuthorized(true);
    } else {
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
