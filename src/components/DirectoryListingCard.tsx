"use client";

import React from "react";
import Link from "next/link";

interface ListingProps {
  id: string;
  name: string;
  category: "weaver" | "vendor" | "reseller";
  address: string;
  isVerified: boolean;
  imageUrl?: string;
  description?: string;
}

export default function DirectoryListingCard({
  id,
  name,
  category,
  address,
  isVerified,
  imageUrl,
  description
}: ListingProps) {
  const getCategoryLabel = () => {
    switch (category) {
      case "weaver": return "Master Weaver";
      case "vendor": return "Verified Vendor";
      case "reseller": return "Bhulia Reseller";
      default: return "Seller";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#0070F3]/30 transition-all group flex flex-col md:flex-row gap-5">
      {/* Image / Avatar */}
      <div className="w-full md:w-32 h-32 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-50 to-gray-200">
            {category === "weaver" ? "🧵" : category === "vendor" ? "🏪" : "📦"}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-[#0070F3] transition-colors">{name}</h3>
              {isVerified && (
                <span className="text-[#C5A059] flex items-center bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200/50 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  <span className="mr-1">✓</span> Verified
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-[#0070F3] uppercase tracking-wider mb-2">{getCategoryLabel()}</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description || "Traditional Sambalpuri Handloom seller located in Odisha."}</p>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-auto">
          <span>📍</span>
          <span>{address}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="shrink-0 flex flex-col justify-center gap-3 w-full md:w-auto md:border-l border-gray-100 md:pl-5">
        <Link 
          href={`/${category}/${id}`} 
          className="w-full md:w-auto text-center px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black shadow-sm transition-colors"
        >
          View Profile
        </Link>
        
        {!isVerified && (
          <a 
            href="https://hub.bhulia.com/dashboard?verify=true" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto text-center px-6 py-2.5 bg-white border border-[#0070F3] text-[#0070F3] text-sm font-bold rounded-xl hover:bg-blue-50 shadow-sm transition-colors"
          >
            Get Verified
          </a>
        )}
      </div>
    </div>
  );
}
