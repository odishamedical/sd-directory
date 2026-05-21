export interface Listing {
  id: string;
  name: string;
  category: 'jewelry' | 'handlooms' | 'doctors' | 'it_services' | 'retail' | 'restaurants';
  rating: number;
  reviews_count: number;
  address: string;
  distance: string;
  description: string;
  image: string;
  is_verified: boolean;
  is_claimed: boolean;
  phone?: string;
  website?: string;
  features?: string[];
  external_url?: string;
}

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: "lst-tarini-jewellers",
    name: "Maa Tarini Jewellers",
    category: "jewelry",
    rating: 4.9,
    reviews_count: 128,
    address: "Saheed Nagar, Bhubaneswar, Odisha",
    distance: "275 m",
    description: "Maa Tarini Jewellers is a premier authentic jewelry boutique in Odisha, specializing in exquisite local gold filigree work (Tarakasi), BIS Hallmark 22 Karat gold neckwear, and diamond-studded bridal collections.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
    is_verified: true,
    is_claimed: false,
    phone: "+91 674 254 7890",
    website: "https://tarini-jewellers.shyamdash.com",
    features: ["BIS 916 Hallmarked Gold", "Handcrafted Cuttack Filigree", "Certified Diamond Registry", "Direct Buyback Guarantee"],
    external_url: "https://sd-gold-hub.vercel.app/store/tarini"
  },
  {
    id: "lst-khetramohan-sarees",
    name: "Khetramohan Sarees",
    category: "handlooms",
    rating: 4.9,
    reviews_count: 154,
    address: "Janpath Mall, Bhubaneswar, Odisha",
    distance: "275 m",
    description: "Established in 1982, Khetramohan Sarees brings you direct-from-loom handwoven Sambalpuri double ikat silk pata sarees, traditional Bomkai patterns, and authentic Kotpad organic cotton drapes verified by weaver certifications.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
    is_verified: true,
    is_claimed: false,
    phone: "+91 94370 12345",
    website: "https://khetramohan.bhulia.com",
    features: ["GI-Tag Registered Weaves", "100% Pure Mulberry Silk", "Direct Weaver Escrow Settlement", "Hand-dyed Natural Motif"],
    external_url: "https://sd-bhulia-hub.vercel.app/store/maa-samaleswari-weavers"
  },
  {
    id: "lst-dehapa-clinic",
    name: "Deha Parhon Clinic",
    category: "doctors",
    rating: 4.9,
    reviews_count: 118,
    address: "Jaydev Vihar, Bhubaneswar, Odisha",
    distance: "275 m",
    description: "Deha Parhon Clinic is a state-of-the-art general practice and wellness location featuring senior consulting physicians, diagnostics laboratory, and digital health records integrated directly with the DehaPa Health OS.",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80",
    is_verified: true,
    is_claimed: false,
    phone: "+91 674 230 4567",
    website: "https://dehapa.com/clinic/parhon",
    features: ["Senior MD Consultations", "Integrated Medplum EHR", "E-Prescriptions via WhatsApp", "Home Sample Collection"],
    external_url: "https://sd-dehapa-hub.vercel.app"
  },
  {
    id: "lst-sonepur-weavers",
    name: "Sonepur Handloom Cooperative",
    category: "handlooms",
    rating: 4.8,
    reviews_count: 94,
    address: "Main Bazaar, Sonepur, Odisha",
    distance: "2.4 km",
    description: "A sovereign weaving union of 45 active pit looms, specialized in executing the legendary Sonepuri tissue silk drapes and mathematical Bomkai borders directly for retail clients.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
    is_verified: true,
    is_claimed: true,
    phone: "+91 6654 220 112",
    website: "https://sonepur.bhulia.com",
    features: ["Cooperative Direct Pit Looms", "Authentic Bomkai Silk", "Traditional Ikat borders", "D2C Escrow Payments"],
    external_url: "https://sd-bhulia-hub.vercel.app/store/maa-samaleswari-weavers"
  },
  {
    id: "lst-dehaaneswar-clinic",
    name: "Dehaaneswar General Wellness",
    category: "doctors",
    rating: 4.7,
    reviews_count: 18,
    address: "Patia, Bhubaneswar, Odisha",
    distance: "225 m",
    description: "A specialized multi-physician family wellness center and clinic dedicated to providing primary healthcare, pediatric immunizations, and chronic disease counseling under Odisha medical guidelines.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80",
    is_verified: true,
    is_claimed: false,
    phone: "+91 99371 88990",
    website: "https://dehapa.com/dehaaneswar",
    features: ["General Practitioner", "Immunization Clinic", "Medplum E-Health Card", "Pharmacy delivery"],
    external_url: "https://sd-dehapa-hub.vercel.app"
  },
  {
    id: "lst-tech-office",
    name: "SD Digital Powerhouse Office",
    category: "it_services",
    rating: 4.9,
    reviews_count: 13,
    address: "DLF Cybercity, Bhubaneswar, Odisha",
    distance: "232 m",
    description: "The core technology implementation center for Shyam Dash Creation, designing high-performance Next.js architectures, Directus CMS databases, and customized OIDC SSO cloud infrastructures.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80",
    is_verified: true,
    is_claimed: true,
    phone: "+91 674 669 8800",
    website: "https://sd-digital.vercel.app",
    features: ["Enterprise Next.js SaaS", "Railway Cloud setups", "Medplum EHR Customization", "D2C Payment integration"],
    external_url: "https://sd-it-hub.vercel.app"
  },
  {
    id: "lst-mayurbhanj-jewels",
    name: "Mayurbhanj Silver Crafts",
    category: "jewelry",
    rating: 4.6,
    reviews_count: 42,
    address: "Buxi Bazaar, Cuttack, Odisha",
    distance: "1.8 km",
    description: "Specialized in manufacturing traditional Cuttack silver filigree work, fine ornaments, customized gift plates, and sovereign silver coins for festivals.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80",
    is_verified: false,
    is_claimed: false,
    phone: "+91 671 240 5566",
    features: ["Fine 925 Sterling Silver", "Custom filigree nameplates", "Gift wrapping included"],
    external_url: "https://sd-gold-hub.vercel.app"
  },
  {
    id: "lst-odisha-kitchen",
    name: "Odisha Dalma & Handi Mutton",
    category: "restaurants",
    rating: 4.8,
    reviews_count: 320,
    address: "Kiit Road, Patia, Bhubaneswar, Odisha",
    distance: "450 m",
    description: "Authentic Odia cuisine restaurant serving traditional clay-pot Handi Mutton, pure veg Temple Dalma, Besara, and customized seafood thalis directly to food lovers.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    is_verified: true,
    is_claimed: false,
    phone: "+91 94399 88776",
    features: ["Traditional clay pots", "Odia Temple Cuisine", "Family Dine-in space", "Direct home delivery"],
    external_url: "#"
  }
];
