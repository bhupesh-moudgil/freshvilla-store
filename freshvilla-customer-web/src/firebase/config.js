// Firebase Configuration
// TODO: Replace with your actual Firebase credentials from Firebase Console
// Go to: https://console.firebase.google.com/
// 1. Create a new project or select existing
// 2. Go to Project Settings > General > Your apps > Web app
// 3. Copy the firebaseConfig object and paste it below

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDemoKey-REPLACE_THIS",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "freshvilla-store.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "freshvilla-store",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "freshvilla-store.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
