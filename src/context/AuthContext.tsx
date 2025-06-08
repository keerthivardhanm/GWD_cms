
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Assuming db might be needed later for user profiles
import { doc, getDoc } from 'firebase/firestore'; // For fetching user profile data
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  userData: UserProfile | null; // For additional user data like name, role from Firestore
  loading: boolean;
  login: (email_param: string, password_param: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  // Add other profile fields as needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch additional user data from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as UserProfile);
        } else {
          // Fallback if no specific profile, use email from auth
          setUserData({ name: firebaseUser.email || 'User', email: firebaseUser.email || '', role: 'Viewer' });
          console.warn("User profile not found in Firestore, using default data.");
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email_param: string, password_param: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email_param, password_param);
      // onAuthStateChanged will handle setting user and redirecting
      // router.push('/dashboard'); // Navigation handled by ProtectedRoute or AppLayout effect
      toast({ title: "Login Successful", description: "Welcome back!" });
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Failed to login. Please check your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      }
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
      setLoading(false); // Ensure loading is false on error
      throw error; // Re-throw to allow form to handle its own loading state
    }
    // setLoading(false); // onAuthStateChanged handles final loading state
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
      router.push('/login');
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
