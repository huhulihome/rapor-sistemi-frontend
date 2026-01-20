import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { AuthContextType, AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth';
import type { Profile } from '../types/database';
import type { User } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      setUser({
        id: authUser.id,
        email: authUser.email!,
        profile: profile as Profile
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setUser({
        id: authUser.id,
        email: authUser.email!
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }: LoginCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (data.user) {
      await loadUserProfile(data.user);
    }
  };

  const register = async ({ email, password, full_name, department }: RegisterCredentials) => {
    // Sign up the user - profile is created automatically via database trigger
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          department
        }
      }
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error('User creation failed');

    // Profile is created automatically by the on_auth_user_created trigger
    // Just wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Load the user profile
    await loadUserProfile(authData.user);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const isAdmin = user?.profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
