'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    // Dynamic import to handle supabase client on client side only
    import('@/lib/supabase').then(({ getSupabaseClient }) => {
      const client = getSupabaseClient();
      if (client) {
        setSupabase(client);
        
        // Check if user is already logged in
        client.auth.getSession().then((data: any) => {
          setSession(data.data.session);
          setUser(data.data.session?.user ?? null);
          setLoading(false);
        });

        // Listen for auth changes
        const { data } = client.auth.onAuthStateChange((_event: string, newSession: Session | null) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
        });

        return () => {
          if (data?.subscription) {
            data.subscription.unsubscribe();
          }
        };
      } else {
        setLoading(false);
      }
    });
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
