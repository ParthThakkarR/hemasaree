'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as unknown as User | null;
  const isLoading = status === 'loading';

  const login = (userData: User) => {
    // NextAuth handles redirects in signIn, but we can maintain this signature for compatibility
    router.push(userData.isAdmin ? '/admin' : '/');
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

import { Session } from 'next-auth';

export function AuthProvider({ children, session }: { children: ReactNode, session?: Session | null }) {
  return (
    <SessionProvider session={session} refetchInterval={0}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

