// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// IMPORTANT: For production, you should store these keys in environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyDWfKkIE0r7l0jW4c-GzjV0MLzJZmOXQ7k",
  authDomain: "ahs-cms-2.firebaseapp.com",
  projectId: "ahs-cms-2",
  storageBucket: "ahs-cms-2.firebasestorage.app",
  messagingSenderId: "173405605530",
  appId: "1:173405605530:web:07d81427309814328dd923"
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
