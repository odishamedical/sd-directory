import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, writeBatch } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sd-auth-center.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sd-auth-center",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sd-auth-center.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "393346058191",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:393346058191:web:a5e96e1c481a72f86db4ba"
};

import { getAuth, GoogleAuthProvider } from "firebase/auth";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, "default");
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider, collection, getDocs, getDoc, setDoc, writeBatch, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy };
