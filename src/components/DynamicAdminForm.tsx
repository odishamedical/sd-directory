"use client";

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { directoryConfig } from '@/lib/directoryConfig';

export default function DynamicAdminForm({ category }: { category: string }) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const config = directoryConfig[category];
  if (!config) return null;

  const isFieldHidden = (field: any, data: any) => {
    if (!field.hiddenIf) return false;
    const targetValue = data[field.hiddenIf.field];
    return field.hiddenIf.in.includes(targetValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Add standard fields for directory
      const payload = {
        ...formData,
        type: category,
        createdAt: serverTimestamp(),
        verified: true,
        isPublished: true,
      };
      
      // Save directly to the 'directory' collection used by Dehapa Health Hub
      await addDoc(collection(db, "directory"), payload);
      alert("Successfully added to Dehapa Directory!");
      setFormData({});
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl space-y-6">
      <h3 className="text-xl font-black font-serif mb-4 text-cyan-400">Dehapa {(config as any).label} Form</h3>
      
      {config.tabs.map(tab => (
        <div key={tab.id} className="mb-6 p-4 border border-slate-800 rounded-xl bg-slate-950/50">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">{tab.label}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tab.fields.map(field => {
              if (isFieldHidden(field, formData)) return null;
              
              return (
                <div key={field.key} className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                    {field.label} {field.mandatory && <span className="text-rose-500">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                      required={field.mandatory}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                      required={field.mandatory}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                    />
                  ) : field.type === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={formData[field.key] || false}
                      onChange={e => setFormData({...formData, [field.key]: e.target.checked})}
                      className="w-6 h-6 rounded border-slate-800 bg-slate-950 text-cyan-500"
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                      required={field.mandatory}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20">
        {loading ? "Publishing..." : `Publish ${(config as any).label} to Directory`}
      </button>
    </form>
  );
}
