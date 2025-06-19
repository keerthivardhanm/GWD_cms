
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6s8RkorDxYy96M-UcU1dm60rLCm0xaTU",
  authDomain: "gmc-cms-v2.firebaseapp.com",
  projectId: "gmc-cms-v2",
  storageBucket: "gmc-cms-v2.firebasestorage.app", // Corrected this, was firebasestorage.app
  messagingSenderId: "854866143960",
  appId: "1:854866143960:web:1583c1d23439dd2284c5ad",
  measurementId: "G-49ZJ13X62D"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };

