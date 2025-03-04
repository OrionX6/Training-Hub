import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { User, PasswordValidation } from '../types';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: SupabaseUser | null;
  userData: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  passwordChangeRequired: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  validatePassword: (password: string) => PasswordValidation;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);

  const loadUserData = async (userId: string) => {
    try {
      console.log('Loading user data for ID:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }

      if (!data) {
        console.error('No user data found');
        throw new Error('No user data found');
      }

      console.log('User data loaded:', data);
      setUserData(data);
      setIsAdmin(data.role === 'admin' || data.role === 'super_admin');
      setIsSuperAdmin(data.role === 'super_admin');
      setPasswordChangeRequired(data.password_change_required ?? false);
    } catch (error) {
      console.error('Error in loadUserData:', error);
      toast.error('Failed to load user data');
      throw error;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          await loadUserData(session.user.id);
        } catch (error) {
          console.error('Failed to load user data on auth change:', error);
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setPasswordChangeRequired(false);
      }
      
      setLoading(false);
    });

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id);
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserData(session.user.id);
        }
      } catch (error) {
        console.error('Error in initial auth check:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (password: string): PasswordValidation => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const isPasswordValid = (password: string): boolean => {
    const validation = validatePassword(password);
    return Object.values(validation).every(Boolean);
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);
      
      // Clear any existing session
      await supabase.auth.signOut();
      
      // Attempt sign in
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        toast.error('Invalid login credentials');
        throw signInError;
      }

      if (!authData.user) {
        console.error('No user data in sign in response');
        toast.error('Authentication failed');
        throw new Error('No user data returned');
      }

      console.log('Sign in successful, loading user data...');
      await loadUserData(authData.user.id);
      
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error('Login process error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserData(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setPasswordChangeRequired(false);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!isPasswordValid(newPassword)) {
      throw new Error('New password does not meet requirements');
    }

    try {
      // Verify current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (verifyError) {
        toast.error('Current password is incorrect');
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error('Failed to update password');
        throw updateError;
      }

      // Update password_change_required flag
      if (userData) {
        const { error: flagError } = await supabase
          .from('users')
          .update({ password_change_required: false })
          .eq('id', userData.id);

        if (flagError) {
          console.error('Error updating password change flag:', flagError);
          throw flagError;
        }

        setPasswordChangeRequired(false);
        toast.success('Password successfully updated');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    isAdmin,
    isSuperAdmin,
    loading,
    passwordChangeRequired,
    signIn,
    signOut,
    changePassword,
    validatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
