"use client";

import React, { useState, useEffect } from "react";
import { db, doc, getDoc, setDoc } from "../lib/firebase";
import * as Icons from "lucide-react";

export interface TaxonomyCategory {
  id: string;
  name: string;
  children: { id: string; name: string }[];
}

export interface TaxonomyLocation {
  id: string;
  name: string;
  children: { id: string; name: string }[];
}

export default function TaxonomyManager() {
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [locations, setLocations] = useState<TaxonomyLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchTaxonomy();
  }, []);

  const fetchTaxonomy = async () => {
    setLoading(true);
    try {
      const catDoc = await getDoc(doc(db, "taxonomy", "categories"));
      if (catDoc.exists()) {
        setCategories(catDoc.data().data || []);
      }
      
      const locDoc = await getDoc(doc(db, "taxonomy", "locations"));
      if (locDoc.exists()) {
        setLocations(locDoc.data().data || []);
      }
    } catch (err: any) {
      setErrorMsg("Failed to load taxonomy. Make sure your Firestore rules allow reading 'taxonomy' collection.");
    }
    setLoading(false);
  };

  const saveCategories = async (newCats: TaxonomyCategory[]) => {
    setSaving(true);
    setErrorMsg(""); setSuccessMsg("");
    try {
      await setDoc(doc(db, "taxonomy", "categories"), { data: newCats });
      setCategories(newCats);
      setSuccessMsg("Categories saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg("Failed to save categories.");
    }
    setSaving(false);
  };

  const saveLocations = async (newLocs: TaxonomyLocation[]) => {
    setSaving(true);
    setErrorMsg(""); setSuccessMsg("");
    try {
      await setDoc(doc(db, "taxonomy", "locations"), { data: newLocs });
      setLocations(newLocs);
      setSuccessMsg("Locations saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg("Failed to save locations.");
    }
    setSaving(false);
  };

  // UI Handlers for Categories
  const addCategory = () => {
    const name = prompt("Enter new Category name (e.g., Doctors, Jewelry):");
    if (!name) return;
    const newCats = [...categories, { id: Date.now().toString(), name, children: [] }];
    saveCategories(newCats);
  };

  const addSubcategory = (catId: string) => {
    const name = prompt("Enter new Subcategory name (e.g., Pediatrician, Silk Weavers):");
    if (!name) return;
    const newCats = categories.map(c => {
      if (c.id === catId) {
        return { ...c, children: [...c.children, { id: Date.now().toString(), name }] };
      }
      return c;
    });
    saveCategories(newCats);
  };

  const removeCategory = (catId: string) => {
    if (!confirm("Remove this category?")) return;
    saveCategories(categories.filter(c => c.id !== catId));
  };

  const removeSubcategory = (catId: string, subId: string) => {
    if (!confirm("Remove this subcategory?")) return;
    const newCats = categories.map(c => {
      if (c.id === catId) {
        return { ...c, children: c.children.filter(s => s.id !== subId) };
      }
      return c;
    });
    saveCategories(newCats);
  };

  // UI Handlers for Locations
  const addState = () => {
    const name = prompt("Enter new State name (e.g., Odisha, Delhi):");
    if (!name) return;
    const newLocs = [...locations, { id: Date.now().toString(), name, children: [] }];
    saveLocations(newLocs);
  };

  const addDistrict = (stateId: string) => {
    const name = prompt("Enter new District name (e.g., Sambalpur, Cuttack):");
    if (!name) return;
    const newLocs = locations.map(l => {
      if (l.id === stateId) {
        return { ...l, children: [...l.children, { id: Date.now().toString(), name }] };
      }
      return l;
    });
    saveLocations(newLocs);
  };

  const removeState = (stateId: string) => {
    if (!confirm("Remove this State?")) return;
    saveLocations(locations.filter(l => l.id !== stateId));
  };

  const removeDistrict = (stateId: string, distId: string) => {
    if (!confirm("Remove this District?")) return;
    const newLocs = locations.map(l => {
      if (l.id === stateId) {
        return { ...l, children: l.children.filter(d => d.id !== distId) };
      }
      return l;
    });
    saveLocations(newLocs);
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Taxonomy...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black font-serif text-[#f8fafc]">Manage Categories & Places</h2>
          <p className="text-slate-400 mt-1">Dynamically control the dropdowns for the Auto-Importer and Frontend Sidebar.</p>
        </div>
        {saving && <div className="text-yellow-500 font-bold animate-pulse flex items-center gap-2"><Icons.Loader2 className="w-4 h-4 animate-spin"/> Saving...</div>}
      </div>

      {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">{errorMsg}</div>}
      {successMsg && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">{successMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CATEGORIES CARD */}
        <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#e5c158] flex items-center gap-2">
              <Icons.Tags className="w-5 h-5" /> Category Hierarchy
            </h3>
            <button onClick={addCategory} className="bg-[#1e293b] hover:bg-[#2a3a52] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
              <Icons.Plus className="w-4 h-4"/> Add Category
            </button>
          </div>
          
          <div className="space-y-4">
            {categories.length === 0 ? (
              <p className="text-slate-500 italic text-sm">No categories created yet.</p>
            ) : categories.map(cat => (
              <div key={cat.id} className="border border-[#1e293b] bg-[#040815] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-white text-lg">{cat.name}</h4>
                  <div className="flex gap-2">
                    <button onClick={() => addSubcategory(cat.id)} className="text-[#e5c158] hover:text-yellow-300 p-1.5 rounded-lg bg-[#1e293b] transition-all" title="Add Subcategory">
                      <Icons.Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeCategory(cat.id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-[#1e293b] transition-all" title="Remove Category">
                      <Icons.Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="pl-4 border-l-2 border-[#1e293b] space-y-2 mt-2">
                  {cat.children.length === 0 ? (
                    <p className="text-slate-600 text-sm">No subcategories</p>
                  ) : cat.children.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center bg-[#090F1D] px-3 py-2 rounded-lg border border-[#1e293b]">
                      <span className="text-slate-300 text-sm">{sub.name}</span>
                      <button onClick={() => removeSubcategory(cat.id, sub.id)} className="text-slate-500 hover:text-red-400 transition-all">
                        <Icons.X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LOCATIONS CARD */}
        <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#e5c158] flex items-center gap-2">
              <Icons.MapPin className="w-5 h-5" /> Location Hierarchy
            </h3>
            <button onClick={addState} className="bg-[#1e293b] hover:bg-[#2a3a52] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
              <Icons.Plus className="w-4 h-4"/> Add State
            </button>
          </div>
          
          <div className="space-y-4">
            {locations.length === 0 ? (
              <p className="text-slate-500 italic text-sm">No states created yet.</p>
            ) : locations.map(state => (
              <div key={state.id} className="border border-[#1e293b] bg-[#040815] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-white text-lg">{state.name}</h4>
                  <div className="flex gap-2">
                    <button onClick={() => addDistrict(state.id)} className="text-[#e5c158] hover:text-yellow-300 p-1.5 rounded-lg bg-[#1e293b] transition-all" title="Add District">
                      <Icons.Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeState(state.id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-[#1e293b] transition-all" title="Remove State">
                      <Icons.Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="pl-4 border-l-2 border-[#1e293b] space-y-2 mt-2">
                  {state.children.length === 0 ? (
                    <p className="text-slate-600 text-sm">No districts</p>
                  ) : state.children.map(dist => (
                    <div key={dist.id} className="flex justify-between items-center bg-[#090F1D] px-3 py-2 rounded-lg border border-[#1e293b]">
                      <span className="text-slate-300 text-sm">{dist.name}</span>
                      <button onClick={() => removeDistrict(state.id, dist.id)} className="text-slate-500 hover:text-red-400 transition-all">
                        <Icons.X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
