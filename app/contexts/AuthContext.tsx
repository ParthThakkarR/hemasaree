'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// This interface defines the shape of our user object
interface User {
  id: string;
  email: string;
  firstName: string;
  isAdmin: boolean;
}

// This defines the values that our context will provide
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The AuthProvider component wraps our app and provides the auth state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On initial app load, check if the user is already logged in via cookie
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        // This is expected if the user is not logged in
      } finally {
        setIsLoading(false);
      }
    };
    verifyUser();
  }, []);

  // The login function, called from the login page
  const login = (userData: User) => {
    setUser(userData);
    if (userData.isAdmin) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  // The logout function, called from the navbar
  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to easily access the auth context in any component
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
