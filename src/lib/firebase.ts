
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// IMPORTANT: For production, you should store these keys in environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyDYbsVI-4Zb0QTonR2iN-4GcLCBSrvisl8",
  authDomain: "ahs-cms-7f4f6.firebaseapp.com",
  projectId: "ahs-cms-7f4f6",
  storageBucket: "ahs-cms-7f4f6.firebasestorage.app",
  messagingSenderId: "132715335065",
  appId: "1:132715335065:web:77e7bf22320dc0d8675708",
  measurementId: "G-Z3E9BM7DCN"
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

