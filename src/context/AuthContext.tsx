import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, checkDatabaseConnection, checkAuthConnection } from '../config/supabase';
import { User, PasswordValidation } from '../types';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: SupabaseUser | null;
  userData: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  passwordChangeRequired: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  validatePassword: (password: string) => PasswordValidation;
  refreshAuthState: (force?: boolean) => Promise<void>;
  connectionError: boolean;
  dbError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMountedRef = useRef(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [dbError, setDbError] = useState(false);
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to clear loading state after a timeout
  const startAuthTimeout = useCallback((timeoutMs = 5000) => {
    // Clear any existing timeout
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
    }
    
    // Set a new timeout
    authTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && loading) {
        console.log('Auth loading timeout reached, forcing loading state to false');
        setLoading(false);
      }
    }, timeoutMs);
  }, [loading]);

  const loadUserData = useCallback(async (userId: string) => {
    if (!isMountedRef.current) return;

    try {
      console.log('Loading user data for ID:', userId);
      
      // Try to directly get user data first
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

      if (!error && data) {
        if (isMountedRef.current) {
          console.log('Loaded existing user data:', data);
          setUserData(data);
          setIsAdmin(data.role === 'admin' || data.role === 'super_admin');
          setIsSuperAdmin(data.role === 'super_admin');
          setPasswordChangeRequired(data.password_change_required ?? false);
          setDbError(false);
        }
        return;
      }

      // If there's an error or no data, verify auth state
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Authentication error when loading user data:', authError);
        setConnectionError(true);
        return;
      }

      if (!authData.user) {
        console.error('No authenticated user found');
        setConnectionError(true);
        return;
      }

      // Try to create/update the user record
      const { data: upsertData, error: upsertError } = await supabase.from('users').upsert(
        {
          id: userId,
          email: authData.user.email,
          role: 'user',
          password_change_required: true,
        },
        { onConflict: 'id' }
      ).select().single();

      if (upsertError) {
        console.error('Error upserting user data:', upsertError);
        setDbError(true);
        // Set minimal user data to allow login
        if (isMountedRef.current) {
          setUserData({
            id: userId,
            email: authData.user.email || '',
            role: 'user',
            password_change_required: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        return;
      }

      if (isMountedRef.current && upsertData) {
        console.log('Updated user data:', upsertData);
        setUserData(upsertData);
        setIsAdmin(upsertData.role === 'admin' || upsertData.role === 'super_admin');
        setIsSuperAdmin(upsertData.role === 'super_admin');
        setPasswordChangeRequired(upsertData.password_change_required ?? false);
        setDbError(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setDbError(true);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isMountedRef.current) return;

      try {
        console.log('Attempting sign in:', email);
        setLoading(true);
        setConnectionError(false);
        setDbError(false);

        // Check for super admin email
        const isSuperAdminEmail = email.toLowerCase() === 'nojs2115@yahoo.com';
        
        // Direct sign in attempt
        console.log('Sending sign in request to Supabase');
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
          console.error('No user returned from sign in');
          toast.error('Authentication failed');
          throw new Error('Authentication failed');
        }

        // Set the user state immediately
        setUser(authData.user);
        console.log('User authenticated:', authData.user.id);
        toast.success('Successfully signed in!');

        // If this is the super admin email, set the super admin status directly
        if (isSuperAdminEmail) {
          console.log('Super admin detected, setting status directly');
          setIsAdmin(true);
          setIsSuperAdmin(true);
          
          // Create minimal user data if needed
          if (!userData) {
            setUserData({
              id: authData.user.id,
              email: authData.user.email || '',
              role: 'super_admin',
              password_change_required: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }

        // Load user data in the background
        loadUserData(authData.user.id).catch(error => {
          console.error('Background user data load failed:', error);
          
          // If this is the super admin email and the data load failed, ensure super admin status
          if (isSuperAdminEmail) {
            setIsAdmin(true);
            setIsSuperAdmin(true);
          }
        });

        return authData;
      } catch (error) {
        if (isMountedRef.current) {
          setUser(null);
          setUserData(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
        throw error;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [loadUserData],
  );

  const signOut = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);

      // First clear local state
      setUser(null);
      setUserData(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setPasswordChangeRequired(false);

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out. Please try again.');
      throw error;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const refreshAuthState = useCallback(
    async (forceReload = false) => {
      if (!isMountedRef.current) return;

      try {
        console.log('Refreshing auth state', forceReload ? '(forced)' : '');
        setLoading(true);
        startAuthTimeout();

        // Check auth connection first
        const isAuthConnected = await checkAuthConnection();
        setConnectionError(!isAuthConnected);

        if (!isAuthConnected) {
          console.error('Cannot refresh auth: Authentication service unavailable');
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('Error getting user during refresh:', authError);
          setConnectionError(true);
          return;
        }

        if (!isMountedRef.current) return;

        // Check database connection separately
        const isDbConnected = await checkDatabaseConnection();
        setDbError(!isDbConnected);

        if (authData?.user) {
          setUser(authData.user);
          
          // Check for super admin email
          const isSuperAdminEmail = authData.user.email?.toLowerCase() === 'nojs2115@yahoo.com';
          
          // If this is the super admin email, set the super admin status directly
          if (isSuperAdminEmail) {
            console.log('Super admin detected in refresh auth state, setting status directly');
            setIsAdmin(true);
            setIsSuperAdmin(true);
            
            // Create minimal user data if needed
            if (!userData) {
              setUserData({
                id: authData.user.id,
                email: authData.user.email || '',
                role: 'super_admin',
                password_change_required: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
          
          // Still try to load user data
          await loadUserData(authData.user.id).catch(error => {
            console.error('Error loading user data in refresh auth state:', error);
            
            // If this is the super admin email and the data load failed, ensure super admin status
            if (isSuperAdminEmail) {
              setIsAdmin(true);
              setIsSuperAdmin(true);
            }
          });
        } else {
          setUser(null);
          setUserData(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setPasswordChangeRequired(false);
        }
      } catch (error) {
        console.error('Error refreshing auth state:', error);
        if (isMountedRef.current) {
          setUser(null);
          setUserData(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setPasswordChangeRequired(false);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          if (authTimeoutRef.current) {
            clearTimeout(authTimeoutRef.current);
          }
        }
      }
    },
    [loadUserData, startAuthTimeout],
  );

  const validatePassword = useCallback((password: string): PasswordValidation => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!Object.values(validatePassword(newPassword)).every(Boolean)) {
        throw new Error('New password does not meet requirements');
      }

      if (!isMountedRef.current || !user) return;

      try {
        setLoading(true);
        startAuthTimeout(15000); // 15 second timeout for password change

        // Check auth connection first
        const isAuthConnected = await checkAuthConnection();
        if (!isAuthConnected) {
          console.error('Cannot change password: Authentication service unavailable');
          setConnectionError(true);
          toast.error('Unable to connect to authentication service. Please try again later.');
          return;
        }

        // Verify current password
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email || '',
          password: currentPassword,
        });

        if (verifyError) {
          toast.error('Current password is incorrect');
          throw new Error('Current password is incorrect');
        }

        if (!isMountedRef.current) return;

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          toast.error('Failed to update password');
          throw updateError;
        }

        if (!isMountedRef.current) return;

        // Check if we can update the database flag
        const isDbConnected = await checkDatabaseConnection();
        if (isDbConnected && userData) {
          const { error: flagError } = await supabase
            .from('users')
            .update({ password_change_required: false })
            .eq('id', userData.id);

          if (flagError) {
            console.error('Error updating password change flag:', flagError);
            setDbError(true);
          } else {
            setPasswordChangeRequired(false);
          }
        } else {
          setDbError(true);
          // Still mark as not required locally
          setPasswordChangeRequired(false);
        }

        if (isMountedRef.current) {
          toast.success('Password successfully updated');
        }
      } catch (error) {
        console.error('Password change error:', error);
        throw error;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          if (authTimeoutRef.current) {
            clearTimeout(authTimeoutRef.current);
          }
        }
      }
    },
    [user, userData, validatePassword, startAuthTimeout],
  );

  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;

    const setupAuth = async () => {
      if (!isMountedRef.current) return;

      try {
        console.log('Setting up auth...');
        // Don't set loading to true here to avoid affecting the login button

        // Check auth connection first
        const isAuthConnected = await checkAuthConnection();
        setConnectionError(!isAuthConnected);

        // Check database connection separately - don't block auth
        const isDbConnected = await checkDatabaseConnection();
        setDbError(!isDbConnected);

        if (!isAuthConnected) {
          console.error('Cannot set up auth: Authentication service unavailable');
          setInitialCheckDone(true);
          return;
        }

        // Set up auth state change listener first
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMountedRef.current) return;

          console.log('Auth state changed:', event, session?.user?.id);

          try {
            if (event === 'SIGNED_OUT' || !session) {
              setUser(null);
              setUserData(null);
              setIsAdmin(false);
              setIsSuperAdmin(false);
              setPasswordChangeRequired(false);
            } else if (session?.user) {
              setUser(session.user);
              
              // Check for super admin email
              const isSuperAdminEmail = session.user.email?.toLowerCase() === 'nojs2115@yahoo.com';
              
              // If this is the super admin email, set the super admin status directly
              if (isSuperAdminEmail) {
                console.log('Super admin detected in auth state change, setting status directly');
                setIsAdmin(true);
                setIsSuperAdmin(true);
                
                // Create minimal user data if needed
                if (!userData) {
                  setUserData({
                    id: session.user.id,
                    email: session.user.email || '',
                    role: 'super_admin',
                    password_change_required: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  });
                }
              }
              
              // Still try to load user data
              await loadUserData(session.user.id).catch(error => {
                console.error('Error loading user data in auth state change:', error);
                
                // If this is the super admin email and the data load failed, ensure super admin status
                if (isSuperAdminEmail) {
                  setIsAdmin(true);
                  setIsSuperAdmin(true);
                }
              });
            }
          } catch (error) {
            console.error('Error handling auth state change:', error);
            setUser(null);
            setUserData(null);
            setIsAdmin(false);
            setIsSuperAdmin(false);
            setPasswordChangeRequired(false);
          } finally {
            if (isMountedRef.current) {
              setLoading(false);
            }
          }
        });

        authSubscription = subscription;

        // Then check for existing session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setConnectionError(true);
          setInitialCheckDone(true);
          return;
        }

        // Initial session loading
        if (session?.user) {
          setUser(session.user);
          
          // Check for super admin email
          const isSuperAdminEmail = session.user.email?.toLowerCase() === 'nojs2115@yahoo.com';
          
          // If this is the super admin email, set the super admin status directly
          if (isSuperAdminEmail) {
            console.log('Super admin detected in initial session loading, setting status directly');
            setIsAdmin(true);
            setIsSuperAdmin(true);
            
            // Create minimal user data if needed
            if (!userData) {
              setUserData({
                id: session.user.id,
                email: session.user.email || '',
                role: 'super_admin',
                password_change_required: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
          
          // Still try to load user data
          await loadUserData(session.user.id).catch(error => {
            console.error('Error loading user data in initial session loading:', error);
            
            // If this is the super admin email and the data load failed, ensure super admin status
            if (isSuperAdminEmail) {
              setIsAdmin(true);
              setIsSuperAdmin(true);
            }
          });
        }
      } catch (error) {
        console.error('Error in auth setup:', error);
        if (isMountedRef.current) {
          setUser(null);
          setUserData(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setPasswordChangeRequired(false);
          setConnectionError(true);
        }
      } finally {
        // Always mark initial check as done
        if (isMountedRef.current) {
          setInitialCheckDone(true);
          if (authTimeoutRef.current) {
            clearTimeout(authTimeoutRef.current);
          }
        }
      }
    };

    // Start auth setup immediately
    setupAuth();

    return () => {
      console.log('Cleaning up auth subscriptions');
      isMountedRef.current = false;
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [loadUserData, startAuthTimeout]);

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
    refreshAuthState,
    connectionError,
    dbError,
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
