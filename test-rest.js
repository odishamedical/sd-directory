

async function testREST() {
  const apiKey = "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8";
  const url = `https://firestore.googleapis.com/v1/projects/sd-auth-center/databases/default/documents/listings?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        name: { stringValue: "Test Listing" }
      }
    })
  });
  
  const data = await response.json();
  console.log("REST API RESPONSE:", JSON.stringify(data, null, 2));
}

testREST();
