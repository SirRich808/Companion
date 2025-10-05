import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    let active = true;

    const initialiseSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!active) {
          return;
        }

        if (sessionError) {
          setError(toMessage(sessionError, 'Failed to read session'));
          setSession(null);
          setUser(null);
          return;
        }

        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      } catch (initialiseError) {
        if (active) {
          setError(toMessage(initialiseError, 'Failed to initialise authentication'));
          setSession(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initialiseSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
      setError(null);
    });

    return () => {
      active = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const runAuthAction = async (action: () => Promise<void>, fallback: string) => {
    clearError();
    try {
      await action();
    } catch (authError) {
      const message = toMessage(authError, fallback);
      setError(message);
      throw authError instanceof Error ? authError : new Error(message);
    }
  };

  const signInWithGoogle = () =>
    runAuthAction(async () => {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });

      if (authError) {
        throw authError;
      }
    }, 'Google sign-in failed');

  const signInWithMagicLink = (email: string) =>
    runAuthAction(async () => {
      if (!email || !email.includes('@')) {
        throw new Error('Please provide a valid email address');
      }

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });

      if (authError) {
        throw authError;
      }
    }, 'Magic link sign-in failed');

  const signOut = () =>
    runAuthAction(async () => {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) {
        throw authError;
      }
    }, 'Sign out failed');

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signInWithGoogle,
    signInWithMagicLink,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
