import React from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import DirectoryListingCard from "@/components/DirectoryListingCard";
import Link from "next/link";
import Header from "@/components/Header";

// Note: This is an SSR page. It runs on the server for every request, ensuring Google always sees fresh imported data.
export const dynamic = 'force-dynamic';

export default async function DirectoryLocationPage({ params }: { params: { location: string[] } }) {
  const { location } = params;
  
  const state = location[0] ? decodeURIComponent(location[0]) : null;
  const district = location[1] ? decodeURIComponent(location[1]) : null;
  const block = location[2] ? decodeURIComponent(location[2]) : null;

  // Build breadcrumbs
  const breadcrumbs = [
    { name: "Directory Home", path: "/" },
  ];
  if (state) breadcrumbs.push({ name: state, path: `/directory/${state}` });
  if (district) breadcrumbs.push({ name: district, path: `/directory/${state}/${district}` });
  if (block) breadcrumbs.push({ name: block, path: `/directory/${state}/${district}/${block}` });

  // Fetch data from Firestore
  let listings: any[] = [];
  try {
    let q = query(collection(db, "listings"));
    
    if (state) q = query(q, where("state", "==", state));
    if (district) q = query(q, where("district", "==", district));
    if (block) q = query(q, where("townOrBlock", "==", block)); // Assuming 'townOrBlock' or 'village'
    
    q = query(q, limit(30));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() });
    });
  } catch (err) {
    console.error("Failed to fetch listings for SSR directory page:", err);
  }

  // Formatting Title
  let pageTitle = "Verified Sellers & Weavers";
  if (block) pageTitle = `Handloom Weavers in ${block}, ${district}`;
  else if (district) pageTitle = `Top Sellers in ${district}, ${state}`;
  else if (state) pageTitle = `Authentic Handlooms in ${state}`;

  return (
    <div className="relative min-h-screen text-[#E8F4FF] flex flex-col font-sans overflow-x-hidden bg-[#030B1A]">
      <Header />
      
      {/* Aura ambient glows */}
      <div className="absolute top-[-5%] left-[5%] w-[700px] h-[700px] rounded-full pointer-events-none z-0" style={{ background: "rgba(0,212,255,0.04)", filter: "blur(160px)" }} />
      <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full pointer-events-none z-0" style={{ background: "rgba(56,189,248,0.03)", filter: "blur(140px)" }} />

      <main className="relative max-w-[1400px] mx-auto w-full px-4 sm:px-6 pt-12 pb-24 z-10 flex-1">
        
        {/* Breadcrumbs (SEO friendly) */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A7A9B]">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.path}>
              <Link href={crumb.path} className="hover:text-[#00D4FF] transition-colors">{crumb.name}</Link>
              {idx < breadcrumbs.length - 1 && <span className="text-[10px] opacity-50">/</span>}
            </React.Fragment>
          ))}
        </nav>

        {/* Hero */}
        <div className="mb-10 border-b border-[rgba(0,212,255,0.1)] pb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-3 font-serif text-[#E8F4FF]">
            {pageTitle}
          </h1>
          <p className="text-sm max-w-2xl leading-relaxed text-[#4A7A9B]">
            Browse the official Bhulia.com directory of verified master weavers, vendors, and resellers in {block || district || state}. Secure purchases through the ecosystem.
          </p>
        </div>

        {/* Search Results */}
        <div className="mb-6">
          <p className="text-xs text-[#4A7A9B]">
            Found <strong className="text-[#E8F4FF]">{listings.length}</strong> listings matching this location.
          </p>
        </div>

        {listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map((lst) => (
                <DirectoryListingCard 
                  key={lst.id}
                  id={lst.id}
                  name={lst.name}
                  category={lst.category?.toLowerCase() || "vendor"}
                  address={lst.address || `${lst.townOrBlock || ''}, ${lst.district || ''}, ${lst.state || ''}`}
                  isVerified={lst.is_verified || false}
                  imageUrl={lst.image}
                  description={lst.description}
                />
              ))}
            </div>
            
            {listings.length >= 30 && (
              <div className="mt-12 text-center">
                <Link 
                  href={`/search?state=${encodeURIComponent(state || "")}&district=${encodeURIComponent(district || "")}&block=${encodeURIComponent(block || "")}`} 
                  className="inline-flex px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-[#020810] transition-all bg-gradient-to-r from-[#00D4FF] to-[#38BDF8] shadow-[0_4px_16px_rgba(0,212,255,0.3)] hover:scale-105"
                >
                  Load More on Interactive Map
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center rounded-2xl max-w-md mx-auto bg-[#071428] border border-[rgba(0,212,255,0.1)] shadow-2xl">
            <h4 className="text-base font-bold mb-2 text-[#E8F4FF]">No Sellers Found</h4>
            <p className="text-xs mb-6 text-[#4A7A9B] max-w-xs mx-auto">
              We couldn't find any listings for this specific region yet. Check back later as our Google Importer adds more data.
            </p>
            <Link href="/" className="px-6 py-2.5 bg-[#0070F3] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-[#005BB5] transition-all">
              Go Back to Directory
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
