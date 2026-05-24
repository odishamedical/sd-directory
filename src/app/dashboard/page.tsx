"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { db, collection, query, where, getDocs, updateDoc, doc } from "@/lib/firebase";
import * as Icons from "lucide-react";
import EditListingModal from "@/components/EditListingModal";

export default function Dashboard() {
  const { user, loading, loginWithGoogle } = useAuth();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchMyListings();
    } else if (!loading && !user) {
      setIsLoading(false);
    }
  }, [user, loading]);

  const fetchMyListings = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "listings"), where("ownerId", "==", user?.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMyListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040815]">
        <div className="w-12 h-12 rounded-full border-4 border-[#e5c158]/20 border-t-[#e5c158] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#040815] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel rounded-3xl p-8 text-center border border-[rgba(229,193,88,0.2)]">
            <div className="w-16 h-16 bg-[#e5c158]/10 rounded-full flex items-center justify-center text-[#e5c158] mx-auto mb-6">
              <Icons.Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-8">You must be logged in to access the Business Dashboard.</p>
            <button 
              onClick={loginWithGoogle}
              className="px-6 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 w-full"
            >
              Sign In with Google
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040815] flex flex-col pb-20">
      <Header />
      
      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 pt-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">My Businesses</h1>
            <p className="text-slate-400">Manage your claimed listings and keep your customers updated.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-[#e5c158]/20 border-t-[#e5c158] animate-spin" />
          </div>
        ) : myListings.length === 0 ? (
          <div className="glass-panel border border-[rgba(229,193,88,0.1)] rounded-3xl p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6">
              <Icons.Store className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Claimed Businesses Yet</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Search for your business in the directory and click "Claim Business" to take control of your listing.
            </p>
            <a href="/" className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              Explore Directory
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myListings.map(listing => (
              <div key={listing.id} className="glass-panel border border-[#e5c158]/20 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative group">
                <div className="md:w-1/3 h-48 md:h-auto bg-slate-900 relative">
                  <img src={listing.image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"} alt={listing.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5c158] bg-slate-950/80 px-2 py-1 rounded-full backdrop-blur-sm border border-[#e5c158]/30">
                      {listing.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 md:w-2/3 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">{listing.name}</h3>
                  <div className="flex items-start gap-2 text-slate-400 text-xs mb-1">
                    <Icons.MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#e5c158]" />
                    <span>{listing.address || `${listing.village || ''} ${listing.townOrBlock || ''}, ${listing.district || ''}, ${listing.state || ''}`}</span>
                  </div>
                  {listing.phone && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
                      <Icons.Phone className="w-3.5 h-3.5 shrink-0 text-[#e5c158]" />
                      <span>{listing.phone}</span>
                    </div>
                  )}
                  
                  <div className="mt-auto pt-4 flex gap-3">
                    <button 
                      onClick={() => setEditingListing(listing)}
                      className="flex-1 px-4 py-2 bg-[#e5c158]/10 hover:bg-[#e5c158]/20 border border-[#e5c158]/30 text-[#e5c158] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Icons.Edit3 className="w-4 h-4" /> Edit Details
                    </button>
                    <a 
                      href={`/listing/${listing.id}`}
                      target="_blank"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Icons.ExternalLink className="w-4 h-4" /> View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {editingListing && (
        <EditListingModal 
          listing={editingListing} 
          onClose={() => setEditingListing(null)}
          onRefresh={fetchMyListings}
        />
      )}
    </div>
  );
}
