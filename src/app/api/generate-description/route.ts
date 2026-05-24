import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, state, district, townOrBlock, products } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured on the server." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Extract product info
    let productsText = "";
    if (products && Array.isArray(products) && products.length > 0) {
      const productNames = products.map((p: any) => p.name).filter(Boolean);
      if (productNames.length > 0) {
        productsText = `Their key products/services include: ${productNames.join(", ")}.`;
      }
    }

    // Location info
    const locationParts = [townOrBlock, district, state].filter(Boolean);
    const locationText = locationParts.length > 0 ? `located in ${locationParts.join(", ")}` : "in Odisha";

    const prompt = `
      You are an expert local SEO copywriter for a business directory in Odisha, India.
      Write a compelling, professional, and SEO-optimized business description for the following business:
      
      Business Name: ${name || "A local business"}
      Category: ${category || "General Business"}
      Location: ${locationText}
      ${productsText}

      Instructions:
      - Write exactly 3 to 4 sentences in a single paragraph.
      - Make it sound welcoming, trustworthy, and authentic.
      - Naturally include the location and category keywords for local Google SEO ranking.
      - Focus on quality, heritage (if applicable like handlooms/jewelry), or professional service (if doctors/IT).
      - Do NOT use emojis.
      - Do NOT include contact info (phone/email) in this description.
      - Do NOT say "Welcome to [Name]". Just describe the business.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ description: responseText.trim() });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate description. Please try again." }, { status: 500 });
  }
}
