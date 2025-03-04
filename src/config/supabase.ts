import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Log configuration for debugging
console.log('Supabase Configuration:');
console.log('URL defined:', !!supabaseUrl);
console.log('Key defined:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration is missing. Check your .env file.');
}

// Create Supabase client with explicit options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: fetch
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Check if the database connection is working
 * @returns Promise<boolean> True if the database is connected, false otherwise
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking database connection...');
    
    // Use a simple function call to check database connectivity
    const { data, error } = await supabase.rpc('get_database_time');
    
    if (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
    
    console.log('Database connection check succeeded:', data);
    return true;
  } catch (error) {
    console.error('Database connection check error:', error);
    return false;
  }
};

/**
 * Check if the auth service is working
 * @returns Promise<boolean> True if the auth service is connected, false otherwise
 */
export const checkAuthConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking auth connection...');
    
    // Try to get the current session to check auth connectivity
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth connection check failed:', error);
      return false;
    }
    
    console.log('Auth connection check succeeded');
    return true;
  } catch (error) {
    console.error('Auth connection check error:', error);
    return false;
  }
};

// Export the supabase client as default
export default supabase;
