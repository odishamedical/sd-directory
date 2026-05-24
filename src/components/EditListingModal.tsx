import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { db, doc, updateDoc, getDoc } from "../lib/firebase";

interface EditListingModalProps {
  listing: any;
  onClose: () => void;
  onRefresh: () => void;
}

export default function EditListingModal({ listing, onClose, onRefresh }: EditListingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: listing.name || "",
    category: listing.category || "",
    subCategory: listing.subCategory || "",
    country: listing.country || "India",
    state: listing.state || "",
    district: listing.district || "",
    townOrBlock: listing.townOrBlock || "",
    area: listing.area || "",
    street: listing.street || "",
    village: listing.village || "",
    pincode: listing.pincode || "",
    description: listing.description || "",
    address: listing.address || "",
    phone: listing.phone || "",
    image: listing.image || "",
    products: listing.products || []
  });

  const [taxonomyCategories, setTaxonomyCategories] = useState<any[]>([]);
  const [taxonomyLocations, setTaxonomyLocations] = useState<any[]>([]);

  useEffect(() => {
    fetchTaxonomy();
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { id: Date.now().toString(), name: "", price: "", type: "product", description: "" }]
    }));
  };

  const removeProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((p: any) => p.id !== id)
    }));
  };

  const updateProduct = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p: any) => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Clean formData to remove any undefined values which Firestore rejects
    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== undefined)
    );

    try {
      await updateDoc(doc(db, "listings", listing.id), cleanData);
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to update listing", err);
      alert("Failed to update listing: " + (err.message || JSON.stringify(err)));
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#1e293b] flex justify-between items-center sticky top-0 bg-[#090F1D] z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Icons.Edit3 className="w-5 h-5 text-[#e5c158]" /> Edit Listing
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-[#e5c158] font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Business Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-slate-400 font-bold">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-slate-400 font-bold">Full Address (Legacy)</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-slate-400 font-bold">Image URL</label>
                <input type="text" name="image" value={formData.image} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-slate-400 font-bold">Google Source Query (Read-Only)</label>
                <input type="text" value={listing.sourceQuery || "N/A"} disabled className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-500 text-sm outline-none opacity-70" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[#e5c158] font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]">
                  <option value="">Select Category...</option>
                  {taxonomyCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Subcategory</label>
                <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[#e5c158] font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Location Hierarchy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">State</label>
                <select name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]">
                  <option value="">Select State...</option>
                  {taxonomyLocations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">District</label>
                <select name="district" value={formData.district} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]">
                  <option value="">Select District...</option>
                  {taxonomyLocations.find(l => l.name === formData.state)?.children.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Town / Block</label>
                <input type="text" name="townOrBlock" value={formData.townOrBlock} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Area</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Street</label>
                <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Village</label>
                <input type="text" name="village" value={formData.village} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#e5c158]" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-[#e5c158] font-bold text-sm uppercase tracking-wider">Products & Services</h3>
              <button type="button" onClick={addProduct} className="text-xs bg-[#1e293b] hover:bg-[#2a3a52] text-white px-2 py-1 rounded transition-colors flex items-center gap-1">
                <Icons.Plus className="w-3 h-3"/> Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.products.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No products or services added yet.</p>
              ) : formData.products.map((prod: any) => (
                <div key={prod.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 relative">
                  <button type="button" onClick={() => removeProduct(prod.id)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors">
                    <Icons.Trash2 className="w-4 h-4"/>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold">Name</label>
                      <input type="text" value={prod.name} onChange={e => updateProduct(prod.id, 'name', e.target.value)} placeholder="e.g. Silk Saree" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none focus:border-[#e5c158]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold">Price / Fee</label>
                      <input type="text" value={prod.price} onChange={e => updateProduct(prod.id, 'price', e.target.value)} placeholder="e.g. ₹5,000" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none focus:border-[#e5c158]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold">Type</label>
                      <select value={prod.type} onChange={e => updateProduct(prod.id, 'type', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none focus:border-[#e5c158]">
                        <option value="product">Product (for Sale)</option>
                        <option value="service">Service (Booking/Consultancy)</option>
                      </select>
                    </div>
                    <div className="space-y-1 md:col-span-3">
                      <label className="text-[10px] uppercase text-slate-400 font-bold">Short Description</label>
                      <input type="text" value={prod.description} onChange={e => updateProduct(prod.id, 'description', e.target.value)} placeholder="e.g. Pure authentic handwoven silk..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none focus:border-[#e5c158]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-700 text-white font-bold hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-xl bg-gold-gradient text-slate-950 font-black tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
              {loading ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
