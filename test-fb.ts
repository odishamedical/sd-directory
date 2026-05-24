import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: "sd-auth-center.firebaseapp.com",
  projectId: "sd-auth-center",
  storageBucket: "sd-auth-center.firebasestorage.app",
  messagingSenderId: "393346058191",
  appId: "1:393346058191:web:a5e96e1c481a72f86db4ba"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Starting write...");
  try {
    const docRef = await addDoc(collection(db, "test_write"), {
      message: "Hello world",
      createdAt: serverTimestamp()
    });
    console.log("Success! Doc ID:", docRef.id);
  } catch (err) {
    console.error("Error writing:", err);
  }
  process.exit(0);
}

test();
