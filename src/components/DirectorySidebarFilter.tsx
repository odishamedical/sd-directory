"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db, doc, getDoc } from "../lib/firebase";
import * as Icons from "lucide-react";

export default function DirectorySidebarFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Taxonomy State from Firebase
  const [taxonomyCategories, setTaxonomyCategories] = useState<any[]>([]);
  const [taxonomyLocations, setTaxonomyLocations] = useState<any[]>([]);
  
  // Cascading Form State
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [village, setVillage] = useState("");
  const [category, setCategory] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read from URL query params
    if (searchParams) {
      if (searchParams.get("state")) setState(searchParams.get("state")!);
      if (searchParams.get("district")) setDistrict(searchParams.get("district")!);
      if (searchParams.get("village")) setVillage(searchParams.get("village")!);
      if (searchParams.get("category")) setCategory(searchParams.get("category")!);
      if (searchParams.get("block")) setBlock(searchParams.get("block")!);
    }

    const fetchTaxonomy = async () => {
      try {
        const catDoc = await getDoc(doc(db, "taxonomy", "categories"));
        if (catDoc.exists()) setTaxonomyCategories(catDoc.data().data || []);
        
        const locDoc = await getDoc(doc(db, "taxonomy", "locations"));
        if (locDoc.exists()) setTaxonomyLocations(locDoc.data().data || []);
      } catch (err) {
        console.error("Failed to load taxonomy", err);
      }
      setIsLoading(false);
    };
    fetchTaxonomy();
  }, [searchParams]);

  const handleSearch = () => {
    let url = `/search?country=${encodeURIComponent(country)}`;
    if (state) url += `&state=${encodeURIComponent(state)}`;
    if (district) url += `&district=${encodeURIComponent(district)}`;
    if (block) url += `&block=${encodeURIComponent(block)}`;
    if (village) url += `&village=${encodeURIComponent(village)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    
    router.push(url);
  };

  const clearAllFilters = () => {
    setState("");
    setDistrict("");
    setBlock("");
    setVillage("");
    setCategory("");
    router.push("/search");
  };

  const isOdisha = state === "Odisha";
  
  // Get available districts for the selected state from Firebase Taxonomy
  const availableDistricts = taxonomyLocations.find(l => l.name === state)?.children || [];

  return (
    <aside className="w-full h-full rounded-2xl p-5 space-y-6 flex flex-col" style={{ background: "#071428", border: "1px solid rgba(0,212,255,0.10)" }}>
      
      <div className="flex justify-between items-center pb-4" style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#E8F4FF" }}>
          <Icons.Search className="w-3.5 h-3.5" style={{ color: "#00D4FF" }} />
          <span>Search Filters</span>
        </span>
        <button 
          onClick={clearAllFilters}
          className="text-[10px] font-bold uppercase tracking-wider hover:underline"
          style={{ color: "#00D4FF" }}
        >
          Clear All
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Icons.Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4A7A9B]">Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-[#020810] border border-[rgba(0,212,255,0.1)] text-[#E8F4FF] text-xs p-2.5 rounded-lg outline-none focus:border-[#00D4FF] appearance-none"
            >
              <option value="">All Categories</option>
              {taxonomyCategories.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5 pt-4" style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4A7A9B]">Country</label>
            <input 
              type="text" 
              value={country} 
              onChange={e => setCountry(e.target.value)}
              className="w-full bg-[#020810]/50 border border-[rgba(0,212,255,0.1)] text-[#7BA3C8] text-xs p-2.5 rounded-lg outline-none"
              disabled
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4A7A9B]">State</label>
            <select 
              value={state} 
              onChange={e => {
                setState(e.target.value);
                setDistrict("");
                setBlock("");
                setVillage("");
              }}
              className="w-full bg-[#020810] border border-[rgba(0,212,255,0.1)] text-[#E8F4FF] text-xs p-2.5 rounded-lg outline-none focus:border-[#00D4FF] appearance-none"
            >
              <option value="">All States</option>
              {taxonomyLocations.map(l => <option key={l.id || l.name} value={l.name}>{l.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4A7A9B]">District</label>
            {isOdisha ? (
              <select 
                value={district} 
                onChange={e => {
                  setDistrict(e.target.value);
                  setBlock("");
                }}
                disabled={!state}
                className="w-full bg-[#020810] border border-[rgba(0,212,255,0.1)] text-[#E8F4FF] text-xs p-2.5 rounded-lg outline-none focus:border-[#00D4FF] appearance-none disabled:opacity-50"
              >
                <option value="">All Districts</option>
                {availableDistricts.map((d: any) => <option key={d.id || d.name} value={d.name}>{d.name}</option>)}
              </select>
            ) : (
              <input 
                type="text" 
                value={district} 
                onChange={e => setDistrict(e.target.value)}
                placeholder="Enter District Name"
                disabled={!state}
                className="w-full bg-[#020810] border border-[rgba(0,212,255,0.1)] text-[#E8F4FF] text-xs p-2.5 rounded-lg outline-none focus:border-[#00D4FF] disabled:opacity-50"
              />
            )}
          </div>

          {isOdisha && (
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase tracking-wider text-[#4A7A9B]">Block (Optional)</label>
               <input 
                 type="text" 
                 value={block} 
                 onChange={e => setBlock(e.target.value)}
                 placeholder="Enter Block Name"
                 disabled={!district}
                 className="w-full bg-[#020810] border border-[rgba(0,212,255,0.1)] text-[#E8F4FF] text-xs p-2.5 rounded-lg outline-none focus:border-[#00D4FF] disabled:opacity-50"
               />
             </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4A7A9B]">Town / Village</label>
            <input 
              type="text" 
              value={village} 
              onChange={e => setVillage(e.target.value)}
              placeholder="Enter Town/Village"
              disabled={!state}
              className="w-full bg-[#020810] border border-[rgba(0,212,255,0.1)] text-[#E8F4FF] text-xs p-2.5 rounded-lg outline-none focus:border-[#00D4FF] disabled:opacity-50"
            />
          </div>

        </div>
      )}

      <button 
        onClick={handleSearch}
        className="w-full py-3 mt-4 rounded-xl text-xs font-black uppercase tracking-widest text-[#020810] transition-all"
        style={{
          background: "linear-gradient(135deg, #00D4FF, #38BDF8)",
          boxShadow: "0 4px 16px rgba(0,212,255,0.3)"
        }}
      >
        Apply Filters
      </button>

    </aside>
  );
}
