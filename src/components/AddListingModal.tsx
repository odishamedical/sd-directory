"use client";

import React, { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { db, collection, addDoc, serverTimestamp, getDoc, doc, storage, ref, uploadBytesResumable, getDownloadURL } from "../lib/firebase";
import ImageCropper from "./ImageCropper";

interface AddListingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddListingModal({ onClose, onSuccess }: AddListingModalProps) {
  const [loading, setLoading] = useState(false);
  const [taxonomyCategories, setTaxonomyCategories] = useState<any[]>([]);

  // Image Cropping States
  const [targetCropField, setTargetCropField] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    address: "",
    phone: "",
    description: "",
    image: "",
    rating: 5.0,
    reviews_count: 1,
    distance: "",
    state: "",
    district: "",
    townOrBlock: "",
    area: "",
    pincode: "",
    keywords: "",
  });

  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const catDoc = await getDoc(doc(db, "taxonomy", "categories"));
        if (catDoc.exists()) setTaxonomyCategories(catDoc.data().data || []);
      } catch (err) {
        console.error("Failed to load taxonomy", err);
      }
    };
    fetchTaxonomy();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setCropImageUrl(imageUrl);
    }
    // reset the input value so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropImageUrl(null);
    if (!targetCropField) return;

    setUploadingField(targetCropField);
    try {
      const fileName = `directory/new_listings/${targetCropField}_${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, croppedBlob);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload failed", error);
          alert("Image upload failed");
          setUploadingField(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({ ...prev, [targetCropField]: downloadURL }));
          setUploadingField(null);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingField(null);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" || name === "reviews_count" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      alert("Business Name and Category are required.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "listings"), {
        ...formData,
        keywords: formData.keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
        is_verified: true,
        is_claimed: false,
        is_featured: false,
        features: ["New Listing"],
        createdAt: serverTimestamp(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Failed to add listing: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#020810",
    border: "1px solid rgba(0,212,255,0.15)",
    borderRadius: "10px",
    padding: "10px 12px",
    color: "#E8F4FF",
    fontSize: "13px",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#4A7A9B",
    marginBottom: "6px",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#071428",
          border: "1px solid rgba(0,212,255,0.18)",
          maxHeight: "90vh",
          boxShadow: "0 0 60px rgba(0,212,255,0.12), 0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-6 py-4 sticky top-0 z-10"
          style={{
            background: "#071428",
            borderBottom: "1px solid rgba(0,212,255,0.10)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,212,255,0.12)" }}
            >
              <Icons.Plus className="w-4 h-4" style={{ color: "#00D4FF" }} />
            </div>
            <div>
              <h2 className="font-black text-base" style={{ color: "#E8F4FF" }}>
                Add New Listing
              </h2>
              <p className="text-[10px]" style={{ color: "#4A7A9B" }}>
                Publishes directly to the live directory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ color: "#4A7A9B", background: "rgba(0,212,255,0.06)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#E8F4FF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#4A7A9B";
            }}
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">

          {/* Row 1 — Name + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Business Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Dr. Kumar Clinic"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required style={inputStyle}>
                <option value="">Select Category...</option>
                {taxonomyCategories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 — Phone + Distance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Distance / Area Label</label>
              <input
                type="text"
                name="distance"
                value={formData.distance}
                onChange={handleChange}
                placeholder="e.g. 1.2 km · Patia"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Row 3 — Address */}
          <div>
            <label style={labelStyle}>Full Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street, Area, District, State"
              style={inputStyle}
            />
          </div>

          {/* Row 4 — Location Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "state", label: "State", placeholder: "Odisha" },
              { name: "district", label: "District", placeholder: "Cuttack" },
              { name: "townOrBlock", label: "Town / Block", placeholder: "Sambalpur" },
              { name: "pincode", label: "Pincode", placeholder: "768001" },
            ].map((field) => (
              <div key={field.name}>
                <label style={labelStyle}>{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          {/* Row 5 — Description & Keywords */}
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the business, services, specialties..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <div>
              <label style={labelStyle}>SEO Keywords / Hashtags</label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g. dentist, root canal, teeth whitening"
                style={inputStyle}
              />
              <p className="text-[9px] text-slate-500 mt-1">Comma-separated tags to improve search ranking.</p>
            </div>
          </div>

          {/* Row 6 — Image Upload */}
          <div className="space-y-1">
            <label style={labelStyle}>Header Image (16:9)</label>
            <div className="flex items-center gap-4">
              {formData.image && (
                <img src={formData.image} alt="Preview" className="w-32 h-20 object-cover rounded-md border border-slate-700" />
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
              
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => { setTargetCropField("image"); fileInputRef.current?.click(); }}
                  disabled={uploadingField === "image"}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition-colors flex items-center gap-2"
                >
                  {uploadingField === "image" ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.UploadCloud className="w-4 h-4" />}
                  Upload
                </button>
                <button 
                  type="button" 
                  onClick={() => { setTargetCropField("image"); cameraInputRef.current?.click(); }}
                  disabled={uploadingField === "image"}
                  className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 font-bold rounded-lg text-xs transition-colors flex items-center gap-2 border border-cyan-400/20"
                >
                  <Icons.Camera className="w-4 h-4" />
                  Take Photo
                </button>
              </div>
              <p className="text-[9px] text-slate-500">Recommended size: 1200x675px</p>
            </div>
          </div>

          {/* Row 7 — Rating + Reviews */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Initial Rating (out of 5)</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="5"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Reviews Count</label>
              <input
                type="number"
                name="reviews_count"
                value={formData.reviews_count}
                onChange={handleChange}
                min="0"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex gap-3 pt-2"
            style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: "rgba(0,212,255,0.05)",
                border: "1px solid rgba(0,212,255,0.14)",
                color: "#7BA3C8",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #00D4FF 0%, #38BDF8 100%)",
                color: "#020810",
                boxShadow: "0 4px 20px rgba(0,212,255,0.35)",
              }}
            >
              {loading ? (
                <Icons.Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icons.Zap className="w-4 h-4" />
              )}
              {loading ? "Publishing..." : "Publish Live Listing"}
            </button>
          </div>
        </form>
      </div>
      {cropImageUrl && (
        <ImageCropper
          imageSrc={cropImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageUrl(null)}
          aspectRatio={16 / 9}
        />
      )}
    </div>
  );
}
