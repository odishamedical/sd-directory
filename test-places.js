

async function test() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDE... wait, I need the actual API key from .env.local";
  // Actually, I can just read .env.local
  const fs = require('fs');
  const env = fs.readFileSync('.env.local', 'utf8');
  const match = env.match(/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=(.*)/);
  if (!match) return console.error('No API key found');
  const key = match[1].trim();

  const url = `https://places.googleapis.com/v1/places:searchText`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.nationalPhoneNumber"
    },
    body: JSON.stringify({
      textQuery: "Kuchinda Sambalpuri Bastralaya"
    })
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
