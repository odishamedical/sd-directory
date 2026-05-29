import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
  let id: string;
  try {
    // Handle both Next.js 14 (object) and Next.js 15+ (Promise) for params
    const resolvedParams = await Promise.resolve(params);
    id = resolvedParams.id;
  } catch (e) {
    id = (params as any).id;
  }

  try {
    const { db } = await import("@/lib/firebase");
    const { doc, getDoc } = await import("firebase/firestore");
    
    const docRef = doc(db, "listings", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      const title = data.name || "Shyam Dash Directory";
      let description = data.description || "Check out this listing on the Shyam Dash Directory.";
      
      if (description.length > 150) {
          description = description.substring(0, 147) + "...";
      }
      
      const image = data.image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200";

      return {
        title: `${title} | SD Directory`,
        description,
        openGraph: {
          title,
          description,
          images: [{ url: image }],
          type: "website"
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [image]
        }
      };
    }
  } catch (error) {
    console.error("Failed to generate metadata for listing using Firebase SDK:", error);
  }

  // Fallback
  return {
    title: "Shyam Dash Directory Listing",
    description: "Explore this authentic local business on the Shyam Dash Directory.",
    openGraph: {
      title: "Shyam Dash Directory Listing",
      description: "Explore this authentic local business on the Shyam Dash Directory."
    }
  };
}

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
