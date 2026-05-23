import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google API Error:", data);
      return NextResponse.json({ error: data.error_message || "Failed to fetch from Google" }, { status: 500 });
    }

    // Format the results to match our app's needs slightly
    const results = data.results.map((place: any) => {
      // Determine a rough category based on query or types
      let category = "retail";
      const q = query.toLowerCase();
      if (q.includes("hospital") || q.includes("doctor") || q.includes("clinic") || q.includes("pathology")) category = "doctors";
      else if (q.includes("jewel")) category = "jewelry";
      else if (q.includes("handloom") || q.includes("saree") || q.includes("weaver")) category = "handlooms";
      else if (q.includes("it ") || q.includes("software") || q.includes("tech")) category = "it_services";
      else if (q.includes("restaurant") || q.includes("cafe") || q.includes("food")) category = "restaurants";

      // Construct photo URL if available
      let imageUrl = "";
      if (place.photos && place.photos.length > 0) {
        imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`;
      } else {
        // Fallback placeholder
        imageUrl = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"; 
      }

      // Generate a smart description
      const ratingText = place.rating ? ` with an excellent ${place.rating}-star rating` : "";
      const description = `${place.name} is a leading facility located at ${place.formatted_address}, Odisha. Known for providing top-tier services to the local community${ratingText}.`;

      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating || 0,
        reviews_count: place.user_ratings_total || 0,
        image: imageUrl,
        category: category,
        description: description,
        distance: "2.5 km", // Hardcoded mock for now, can calculate later
        is_verified: true,
        is_claimed: false,
      };
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
