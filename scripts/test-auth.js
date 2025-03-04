const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration!');
  console.error('Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('\nTesting Supabase Authentication Configuration...\n');

  try {
    // 1. Test connection
    console.log('1. Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      throw new Error(`Connection test failed: ${testError.message}`);
    }
    console.log('✓ Connection successful');

    // 2. Test super admin sign in
    console.log('\n2. Testing super admin authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'nojs2115@yahoo.com',
      password: 'Password123!',
    });

    if (authError) {
      throw new Error(`Auth test failed: ${authError.message}`);
    }
    console.log('✓ Successfully authenticated as super admin');

    // 3. Test user data fetch
    console.log('\n3. Testing user data fetch...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'nojs2115@yahoo.com')
      .single();

    if (userError) {
      throw new Error(`User data fetch failed: ${userError.message}`);
    }

    console.log('✓ Successfully fetched user data:');
    console.log({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      password_change_required: userData.password_change_required,
    });

    // 4. Test sign out
    console.log('\n4. Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      throw new Error(`Sign out failed: ${signOutError.message}`);
    }
    console.log('✓ Successfully signed out');

    // Final success message
    console.log('\n✅ All authentication tests passed successfully!\n');
    console.log('You can now try logging in through the web interface with:');
    console.log('Email: nojs2115@yahoo.com');
    console.log('Password: Password123!\n');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error.message);
    console.error('\nPlease check your Supabase configuration and try again.');
    process.exit(1);
  }
}

testAuth();
