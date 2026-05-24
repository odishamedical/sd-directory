"use client";

import React, { useState, useEffect } from "react";
import { db, doc, getDoc, setDoc, storage, ref, uploadBytesResumable, getDownloadURL } from "@/lib/firebase";
import * as Icons from "lucide-react";

export default function AdsManager() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Ad Form State
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState("search_results"); // or sidebar
  const [active, setActive] = useState(true);
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "taxonomy", "ads");
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setAds(snapshot.data().data || []);
      } else {
        setAds([]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `ads/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Upload failed", error);
        alert("Upload failed.");
        setUploading(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setImageUrl(downloadURL);
        setUploading(false);
        setUploadProgress(0);
      }
    );
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !linkUrl) return alert("Please provide both Image URL and Link URL");
    
    setSaving(true);
    try {
      const newAd = {
        id: "ad_" + Date.now(),
        imageUrl,
        linkUrl,
        position,
        active,
        createdAt: new Date().toISOString()
      };
      
      const updatedAds = [...ads, newAd];
      await setDoc(doc(db, "taxonomy", "ads"), { data: updatedAds });
      
      setAds(updatedAds);
      setImageUrl("");
      setLinkUrl("");
    } catch (err: any) {
      console.error(err);
      alert("Failed to create ad: " + err.message);
    }
    setSaving(false);
  };

  const handleToggleActive = async (ad: any) => {
    try {
      const updatedAds = ads.map(a => a.id === ad.id ? { ...a, active: !a.active } : a);
      await setDoc(doc(db, "taxonomy", "ads"), { data: updatedAds });
      setAds(updatedAds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    try {
      const updatedAds = ads.filter(a => a.id !== id);
      await setDoc(doc(db, "taxonomy", "ads"), { data: updatedAds });
      setAds(updatedAds);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading ads...</div>;
  }

  return (
    <div className="animate-fadeIn space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Ads Manager</h2>
          <p className="text-slate-400">Manage monetization banners across the directory.</p>
        </div>
      </div>

      {/* Add New Ad Form */}
      <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Icons.PlusCircle className="w-5 h-5 text-[#e5c158]" /> Create New Ad Campaign
        </h3>
        <form onSubmit={handleAddAd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Image URL or Upload</label>
            <div className="flex gap-2">
              <input 
                type="url" 
                value={imageUrl} 
                onChange={e => setImageUrl(e.target.value)} 
                className="flex-1 bg-[#040815] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e5c158]/50" 
                placeholder="https://example.com/banner.jpg"
                required
              />
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <div className={`h-full px-4 rounded-xl flex items-center justify-center border transition-colors ${uploading ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-white cursor-pointer'}`}>
                  {uploading ? `${Math.round(uploadProgress)}%` : <Icons.Upload className="w-5 h-5" />}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination Link URL</label>
            <input 
              type="url" 
              value={linkUrl} 
              onChange={e => setLinkUrl(e.target.value)} 
              className="w-full bg-[#040815] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e5c158]/50" 
              placeholder="https://advertiser-website.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display Position</label>
            <select 
              value={position} 
              onChange={e => setPosition(e.target.value)} 
              className="w-full bg-[#040815] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e5c158]/50"
            >
              <option value="search_results">Search Results Grid</option>
              <option value="listing_sidebar">Listing Page Sidebar</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-[#e5c158] hover:bg-[#f5d168] text-slate-950 font-black rounded-xl px-4 py-3 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? "Saving..." : <><Icons.Plus className="w-5 h-5" /> Publish Ad</>}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Ads List */}
      <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1e293b] bg-slate-900/50 flex items-center justify-between">
          <h3 className="font-bold text-white">Active Campaigns</h3>
          <span className="bg-[#e5c158]/20 text-[#e5c158] px-2 py-0.5 rounded text-xs font-bold">{ads.length} Ads</span>
        </div>
        <div className="divide-y divide-[#1e293b]">
          {ads.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic">No ads running yet. Create one above!</div>
          ) : ads.map(ad => (
            <div key={ad.id} className="p-4 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-800/30 transition-colors">
              <div className="w-full md:w-48 aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                <img src={ad.imageUrl} alt="Ad Banner" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ad.position === 'search_results' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {ad.position.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ad.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {ad.active ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-300 truncate max-w-md" title={ad.linkUrl}>
                  🔗 {ad.linkUrl}
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button 
                  onClick={() => handleToggleActive(ad)}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-colors ${ad.active ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
                >
                  {ad.active ? 'Pause' : 'Activate'}
                </button>
                <button 
                  onClick={() => handleDelete(ad.id)}
                  className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"
                >
                  <Icons.Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
