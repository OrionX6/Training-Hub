# Authentication Testing Scripts

This directory contains scripts to help debug and test authentication with Supabase.

## Available Scripts

### test-auth.sh
Tests the Supabase authentication setup and super admin login.

```bash
# Make the script executable
chmod +x scripts/test-auth.sh

# Run the test
./scripts/test-auth.sh
```

The script will:
1. Check if Node.js and npm are installed
2. Install required dependencies if needed
3. Verify .env configuration
4. Test connection to Supabase
5. Test super admin authentication
6. Test user data fetching
7. Test sign out functionality

### debug-auth.sql
SQL script to diagnose authentication issues in Supabase:

1. Go to your Supabase dashboard
2. Open the SQL editor
3. Copy and paste the contents of `debug-auth.sql`
4. Run the script to check auth configuration

### setup-auth-config.sql
SQL script to configure authentication settings:

1. Go to your Supabase dashboard
2. Open the SQL editor
3. Copy and paste the contents of `setup-auth-config.sql`
4. Run the script to set up proper auth configuration

## Troubleshooting

If you encounter authentication issues:

1. First, run `./scripts/test-auth.sh` to diagnose the problem
2. Check your `.env` file has the correct Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_url_here
   REACT_APP_SUPABASE_ANON_KEY=your_key_here
   ```
3. Run the debug-auth.sql script in Supabase
4. Run the setup-auth-config.sql script in Supabase
5. Try signing in with the super admin credentials:
   - Email: nojs2115@yahoo.com
   - Password: Password123!

If problems persist, check:
- Supabase console for any error messages
- Browser console for JavaScript errors
- Network tab in browser dev tools for API errors
