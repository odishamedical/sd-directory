import React from "react";
import * as Icons from "lucide-react";

export interface DirectoryCardProps {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  distanceOrAddress: string;
  image: string;
  priceLevel?: string;
  isClaimed?: boolean;
}

export default function DirectoryCard({
  id,
  title,
  category,
  rating,
  reviewsCount,
  distanceOrAddress,
  image,
  priceLevel = "$$",
  isClaimed = false,
}: DirectoryCardProps) {
  return (
    <div className="bg-[#1C212E]/60 backdrop-blur-md rounded-[20px] p-4 flex flex-col justify-between border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:border-[#E5C158]/30 hover:shadow-[0_0_20px_rgba(229,193,88,0.15)] transition-all group">
      
      {/* Top Section: Image + Info */}
      <div className="flex flex-row md:flex-col gap-4 mb-5">
        
        {/* Image Container: Square on Mobile, Wide Rectangle on Desktop */}
        <div className="w-[100px] h-[100px] md:w-full md:h-[180px] shrink-0 rounded-[14px] overflow-hidden relative border border-white/10">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Text Info */}
        <div className="flex-1 flex flex-col justify-center md:mt-2">
          <h3 className="text-white font-bold text-[17px] md:text-[20px] leading-tight mb-1">
            {title}
          </h3>
          
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-[#E5C158]">
              <Icons.Star className="w-3.5 h-3.5 fill-[#E5C158]" />
              <span className="text-[13px] font-bold ml-1">{rating}</span>
            </div>
            <span className="text-[#94A3B8] text-[12px]">({reviewsCount} reviews)</span>
          </div>

          <div className="flex items-center text-[#94A3B8] text-[12px] mb-1 gap-1.5">
            <Icons.Utensils className="w-3.5 h-3.5 hidden md:block" /> 
            <span>{category} • {priceLevel}</span>
          </div>

          <div className="flex items-center text-[#94A3B8] text-[12px] gap-1.5">
            <Icons.MapPin className="w-3.5 h-3.5" />
            <span>{distanceOrAddress}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 bg-gradient-to-b from-[#F6D365] to-[#D5A021] text-[#1A1A1A] font-bold text-[14px] py-3 rounded-xl shadow-[0_0_20px_rgba(229,193,88,0.2)] hover:shadow-[0_0_30px_rgba(229,193,88,0.4)] transition-all">
          {isClaimed ? "View Listing" : "Claim Listing"}
        </button>
        <button className="w-12 h-12 shrink-0 bg-gradient-to-b from-[#F6D365] to-[#D5A021] text-[#1A1A1A] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(229,193,88,0.2)] hover:shadow-[0_0_30px_rgba(229,193,88,0.4)] transition-all">
          <Icons.Phone className="w-4 h-4 fill-current" />
        </button>
      </div>

    </div>
  );
}
