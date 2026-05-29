import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: "sd-auth-center.firebaseapp.com",
  projectId: "sd-auth-center",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const querySnapshot = await getDocs(collection(db, "listings"));
    console.log("Listings found:", querySnapshot.docs.length);
    if (querySnapshot.docs.length > 0) {
      console.log("Sample ID:", querySnapshot.docs[0].id);
    }
  } catch(e) {
    console.error("Error fetching listings:", e);
  }
}

test();
