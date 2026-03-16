'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { api } from '@/lib/api';

interface Artist {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  artist: Artist | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  artist: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveArtist = useCallback(async (sess: Session) => {
    try {
      const result = await api<{ token: string; artist: Artist; refresh_token?: string }>(
        '/v1/auth/oauth/callback',
        {
          method: 'POST',
          body: {
            access_token: sess.access_token,
            refresh_token: sess.refresh_token,
          },
        },
      );
      setArtist(result.artist);
    } catch {
      // Artist profile doesn't exist yet — will be created on first use
      setArtist(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      if (sess) {
        resolveArtist(sess);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) {
        resolveArtist(sess);
      } else {
        setArtist(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [resolveArtist]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setArtist(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        artist,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
