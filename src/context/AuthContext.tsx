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

  // Password validation function
  const validatePassword = (password: string): PasswordValidation => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  // Function to check if password meets all requirements
  const isPasswordValid = (password: string): boolean => {
    const validation = validatePassword(password);
    return Object.values(validation).every(Boolean);
  };

  const loadUserData = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setPasswordChangeRequired(false);
        throw error;
      }

      if (!userData) {
        console.error('No user data found');
        setUserData(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setPasswordChangeRequired(false);
        return;
      }

      setUserData(userData);
      setIsAdmin(userData.role === 'admin' || userData.role === 'super_admin');
      setIsSuperAdmin(userData.role === 'super_admin');
      setPasswordChangeRequired(userData.password_change_required ?? false);
    } catch (err) {
      console.error('Error in loadUserData:', err);
      toast.error('Failed to load user data. Please try signing in again.');
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(true);

      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setUserData(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setPasswordChangeRequired(false);
      }

      setLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      // First try to get session and clear if exists
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Existing session found, signing out first');
        await supabase.auth.signOut();
      }

      // Attempt sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Sign in error:', authError);
        toast.error('Failed to sign in. Please check your credentials and try again.');
        throw authError;
      }

      if (!authData?.user) {
        console.error('No user data returned from auth');
        toast.error('Authentication failed. Please try again.');
        return;
      }

      console.log('Sign in successful, user ID:', authData.user.id);

      try {
        // Load user data after successful authentication
        await loadUserData(authData.user.id);
        console.log('User data loaded successfully');
        toast.success('Successfully signed in!');
      } catch (userDataError) {
        console.error('Error loading user data:', userDataError);
        // Sign out if we can't load user data
        await supabase.auth.signOut();
        toast.error('Error loading user data. Please try again.');
        throw userDataError;
      }
    } catch (error) {
      console.error('Sign in process error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // Validate new password
    if (!isPasswordValid(newPassword)) {
      throw new Error('New password does not meet requirements');
    }

    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password in Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Update password_change_required flag
      if (userData) {
        const { error: updateUserError } = await supabase
          .from('users')
          .update({ password_change_required: false })
          .eq('id', userData.id);

        if (updateUserError) {
          throw updateUserError;
        }

        setPasswordChangeRequired(false);
        toast.success('Password successfully updated');
      }
    } catch (error) {
      console.error('Error changing password:', error);
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
