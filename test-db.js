
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sd-auth-center.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sd-auth-center",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sd-auth-center.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "393346058191",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:393346058191:web:a5e96e1c481a72f86db4ba"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  const snapshot = await getDocs(query(collection(db, "listings"), where("name", "==", "Shree Mahavir Bastralaya")));
  snapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}

test();
