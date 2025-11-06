import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import app from '../firebaseConfig';

const auth = getAuth(app);

export const useFirebaseAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setIsAuthenticated(true);
      console.log('✅ Admin logged in successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      // Handle specific error codes
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        throw new Error('Email o password non corretti');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Troppi tentativi falliti. Riprova più tardi');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email non valida');
      } else {
        throw new Error('Errore durante il login. Riprova');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Admin logged out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  };
};


