import React, { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { db, doc, updateDoc, getDoc, storage, ref, uploadBytesResumable, getDownloadURL } from "../lib/firebase";
import ImageCropper from "./ImageCropper";

interface EditListingModalProps {
  listing: any;
  onClose: () => void;
  onRefresh: () => void;
}

export default function EditListingModal({ listing, onClose, onRefresh }: EditListingModalProps) {
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Tier Lockouts
  const isProfessional = listing.tier === 'professional' || listing.tier === 'premium' || !listing.is_claimed;
  const isPremium = listing.tier === 'premium' || !listing.is_claimed;

  // Cropper & Upload States
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [targetCropField, setTargetCropField] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    keywords: listing.keywords ? listing.keywords.join(", ") : "",
    products: listing.products || [],
    youtubeUrl: listing.youtubeUrl || "",
    youtubeUrl2: listing.youtubeUrl2 || "",
    galleryImage1: listing.galleryImage1 || "",
    galleryImage2: listing.galleryImage2 || ""
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
        setTargetCropField(fieldName);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async (croppedBlob: Blob) => {
    if (!targetCropField) return;
    setCropImageSrc(null);
    setUploadingField(targetCropField);
    
    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `directory/${listing.id}/${targetCropField}_${timestamp}.jpg`);
      const uploadTask = await uploadBytesResumable(storageRef, croppedBlob);
      const downloadURL = await getDownloadURL(uploadTask.ref);
      
      setFormData(prev => ({ ...prev, [targetCropField]: downloadURL }));
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingField(null);
      setTargetCropField(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
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

  const generateDescription = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          state: formData.state,
          district: formData.district,
          townOrBlock: formData.townOrBlock,
          products: formData.products,
          keywords: formData.keywords
        })
      });
      const data = await res.json();
      if (res.ok && data.description) {
        setFormData(prev => ({ ...prev, description: data.description }));
      } else {
        alert(data.error || "Failed to generate description");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating description.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const keywordsArray = formData.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);

      await updateDoc(doc(db, "listings", listing.id), {
        ...formData,
        keywords: keywordsArray,
        updatedAt: new Date().toISOString()
      });
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
      
      {cropImageSrc && (
        <ImageCropper 
          imageSrc={cropImageSrc} 
          onCropComplete={handleCropSave} 
          onCancel={() => {
            setCropImageSrc(null);
            setTargetCropField(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }} 
        />
      )}

      <div className="bg-[#090F1D] border border-[#1e293b] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <div className="p-6 border-b border-[#1e293b] flex justify-between items-center sticky top-0 bg-[#090F1D] z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Icons.Edit3 className="w-5 h-5 text-cyan-400" /> Edit Listing
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Business Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400 font-bold">Description (SEO Rich Content)</label>
                  <button 
                    type="button" 
                    onClick={generateDescription}
                    disabled={isGenerating}
                    className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isGenerating ? <Icons.Loader2 className="w-3 h-3 animate-spin" /> : <Icons.Sparkles className="w-3 h-3" />}
                    {isGenerating ? "Generating..." : "Generate with AI"}
                  </button>
                </div>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={6} 
                  placeholder="Write a detailed description of your business. Mention your history, specialties, and key services to help Google index your page better."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm outline-none focus:border-cyan-400 leading-relaxed" 
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-slate-400 font-bold">SEO Keywords / Hashtags</label>
                <input 
                  type="text" 
                  name="keywords" 
                  value={formData.keywords} 
                  onChange={handleChange} 
                  placeholder="e.g. handloom, sambalpuri saree, cotton"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" 
                />
                <p className="text-[9px] text-slate-500 mt-0.5">Comma-separated tags to improve search ranking.</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-slate-400 font-bold">Full Address (Legacy)</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-slate-400 font-bold">Primary Listing Image (16:9)</label>
                <div className="flex items-center gap-4">
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="w-24 h-14 object-cover rounded-md border border-slate-700" />
                  )}
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        setTargetCropField("image");
                        fileInputRef.current?.click();
                      }}
                      disabled={uploadingField === "image"}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition-colors flex items-center gap-2"
                    >
                      {uploadingField === "image" ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.UploadCloud className="w-4 h-4" />}
                      Upload Image
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setTargetCropField("image");
                        cameraInputRef.current?.click();
                      }}
                      disabled={uploadingField === "image"}
                      className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 font-bold rounded-lg text-xs transition-colors flex items-center gap-2 border border-cyan-400/20"
                    >
                      <Icons.Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={(e) => targetCropField && handleFileSelect(e, targetCropField)} 
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    ref={cameraInputRef} 
                    onChange={(e) => targetCropField && handleFileSelect(e, targetCropField)} 
                  />
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-slate-400 font-bold">Google Source Query (Read-Only)</label>
                <input type="text" value={listing.sourceQuery || "N/A"} disabled className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-500 text-sm outline-none opacity-70" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400">
                  <option value="">Select Category...</option>
                  {taxonomyCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Subcategory</label>
                <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Location Hierarchy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">State</label>
                <select name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400">
                  <option value="">Select State...</option>
                  {taxonomyLocations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">District</label>
                <select name="district" value={formData.district} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400">
                  <option value="">Select District...</option>
                  {taxonomyLocations.find(l => l.name === formData.state)?.children.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Town / Block</label>
                <input type="text" name="townOrBlock" value={formData.townOrBlock} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Area</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Street</label>
                <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Village</label>
                <input type="text" name="village" value={formData.village} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Media & Gallery (Professional Tier+)</h3>
            
            {!isProfessional ? (
              <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-xl p-4 text-center">
                <Icons.Lock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-cyan-400 font-bold">Professional Feature</p>
                <p className="text-[10px] text-slate-400 mt-1">Upgrade to Professional or Premium to unlock video embeds and image galleries.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold flex items-center gap-1"><Icons.Video className="w-3 h-3 text-red-500" /> YouTube Video URL 1</label>
                  <input type="text" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} placeholder="e.g. https://youtube.com/watch?v=..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold flex items-center gap-1"><Icons.Video className="w-3 h-3 text-red-500" /> YouTube Video URL 2</label>
                  <input type="text" name="youtubeUrl2" value={formData.youtubeUrl2} onChange={handleChange} placeholder="Optional second video" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-400" />
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-blue-400 font-bold flex items-center gap-1"><Icons.BadgeCheck className="w-3 h-3"/> Gallery Image 1 (16:9)</label>
                  <div className="flex items-center gap-4">
                    {formData.galleryImage1 && (
                      <img src={formData.galleryImage1} alt="Preview" className="w-24 h-14 object-cover rounded-md border border-slate-700" />
                    )}
                    <button 
                      type="button" 
                      onClick={() => { setTargetCropField("galleryImage1"); fileInputRef.current?.click(); }}
                      disabled={uploadingField === "galleryImage1"}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition-colors flex items-center gap-2"
                    >
                      {uploadingField === "galleryImage1" ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Camera className="w-4 h-4" />}
                      Upload Gallery 1
                    </button>
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-blue-400 font-bold flex items-center gap-1"><Icons.BadgeCheck className="w-3 h-3"/> Gallery Image 2 (16:9)</label>
                  <div className="flex items-center gap-4">
                    {formData.galleryImage2 && (
                      <img src={formData.galleryImage2} alt="Preview" className="w-24 h-14 object-cover rounded-md border border-slate-700" />
                    )}
                    <button 
                      type="button" 
                      onClick={() => { setTargetCropField("galleryImage2"); fileInputRef.current?.click(); }}
                      disabled={uploadingField === "galleryImage2"}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition-colors flex items-center gap-2"
                    >
                      {uploadingField === "galleryImage2" ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Camera className="w-4 h-4" />}
                      Upload Gallery 2
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">Products & Services {isPremium ? '' : <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded ml-2">(Premium Tier+)</span>}</h3>
              {isPremium && (
                <button type="button" onClick={addProduct} className="text-xs bg-[#1e293b] hover:bg-[#2a3a52] text-white px-2 py-1 rounded transition-colors flex items-center gap-1">
                  <Icons.Plus className="w-3 h-3"/> Add Item
                </button>
              )}
            </div>
            
            {!isPremium ? (
              <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-xl p-4 text-center">
                <Icons.Lock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-cyan-400 font-bold">Premium Catalog Feature</p>
                <p className="text-[10px] text-slate-400 mt-1">Upgrade to Premium to add up to 10 specific products or services to your storefront.</p>
              </div>
            ) : (
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
                        <input type="text" value={prod.name} onChange={e => updateProduct(prod.id, 'name', e.target.value)} placeholder="e.g. Silk Saree" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none focus:border-cyan-400" />
                      </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold">Price / Fee</label>
                      <input type="text" value={prod.price} onChange={e => updateProduct(prod.id, 'price', e.target.value)} placeholder="e.g. ₹5,000" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none focus:border-cyan-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold">Type</label>
                      <select value={prod.type} onChange={e => updateProduct(prod.id, 'type', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none focus:border-cyan-400">
                        <option value="product">Product (for Sale)</option>
                        <option value="service">Service (Booking/Consultancy)</option>
                      </select>
                    </div>
                    <div className="space-y-1 md:col-span-3">
                      <label className="text-[10px] uppercase text-slate-400 font-bold">Short Description</label>
                      <input type="text" value={prod.description} onChange={e => updateProduct(prod.id, 'description', e.target.value)} placeholder="e.g. Pure authentic handwoven silk..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none focus:border-cyan-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-700 text-white font-bold hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-xl btn-primary-cyan text-slate-950 font-black tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
              {loading ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
