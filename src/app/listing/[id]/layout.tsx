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
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/sd-auth-center/databases/(default)/documents/listings/${id}`, { 
      next: { revalidate: 60 } 
    });
    
    if (res.ok) {
      const data = await res.json();
      
      if (data && data.fields) {
        const title = data.fields.name?.stringValue || "Shyam Dash Directory";
        const description = data.fields.description?.stringValue || "Check out this listing on the Shyam Dash Directory.";
        const image = data.fields.image?.stringValue || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200";

        return {
          title,
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
    }
  } catch (error) {
    console.error("Failed to generate metadata for listing:", error);
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
