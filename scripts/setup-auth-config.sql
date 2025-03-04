-- This script helps configure Supabase Auth settings properly

-- First, let's check the current auth settings
select * from auth.config;

-- Enable email authentication
update auth.config
set
  enable_signup = true,
  enable_confirmations = false,  -- Disable email confirmation requirement for this setup
  mailer_autoconfirm = true,    -- Auto-confirm email signups
  jwt_exp = 3600,               -- 1 hour token expiration
  site_url = 'http://localhost:3000',  -- Update this for production
  security_refresh_token_reuse_interval = 0,  -- Allow immediate token reuse for testing
  enable_phone_signup = false,   -- Disable phone signup
  enable_phone_autoconfirm = false;  -- Disable phone autoconfirm

-- Set up email templates (if needed)
-- You can customize these for production
update auth.templates
set
  -- Welcome email template
  welcome = jsonb_build_object(
    'subject', 'Welcome to Training Hub',
    'content_html', '
      <h2>Welcome to Training Hub!</h2>
      <p>Your account has been created successfully.</p>
      <p>You can now sign in with your email and password.</p>
    '
  ),
  -- Password reset email template
  recovery = jsonb_build_object(
    'subject', 'Reset Your Password',
    'content_html', '
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
      <p>If you didn''t request this, you can ignore this email.</p>
    '
  );

-- Create SQL function to verify auth setup
create or replace function verify_auth_setup()
returns text as $$
declare
  v_message text;
begin
  v_message := 'Auth Setup Verification:' || chr(10);
  
  -- Check auth.config
  if exists (
    select 1 from auth.config 
    where enable_signup = true 
    and enable_confirmations = false
    and mailer_autoconfirm = true
  ) then
    v_message := v_message || '✓ Auth config is correctly set up' || chr(10);
  else
    v_message := v_message || '✗ Auth config needs attention' || chr(10);
  end if;

  -- Check auth.users super admin
  if exists (
    select 1 from auth.users 
    where email = 'nojs2115@yahoo.com'
    and raw_user_meta_data->>'role' = 'super_admin'
  ) then
    v_message := v_message || '✓ Super admin exists in auth.users' || chr(10);
  else
    v_message := v_message || '✗ Super admin missing from auth.users' || chr(10);
  end if;

  -- Check public.users super admin
  if exists (
    select 1 from public.users 
    where email = 'nojs2115@yahoo.com'
    and role = 'super_admin'
  ) then
    v_message := v_message || '✓ Super admin exists in public.users' || chr(10);
  else
    v_message := v_message || '✗ Super admin missing from public.users' || chr(10);
  end if;

  return v_message;
end;
$$ language plpgsql;

-- Run verification
select verify_auth_setup();

-- Print instructions
select '
Auth setup complete. To test:
1. Sign out if currently signed in
2. Try signing in with:
   Email: nojs2115@yahoo.com
   Password: Password123!
3. You should be logged in with super_admin privileges
' as next_steps;
