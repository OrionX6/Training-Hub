#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit 1

# Check if node and npm are installed
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but not installed."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but not installed."
  exit 1
fi

# Install required packages if not present
if ! npm list @supabase/supabase-js >/dev/null 2>&1; then
  echo "Installing required packages..."
  npm install @supabase/supabase-js dotenv
fi

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please create a .env file with your Supabase credentials:"
  echo "REACT_APP_SUPABASE_URL=your_url_here"
  echo "REACT_APP_SUPABASE_ANON_KEY=your_key_here"
  exit 1
fi

# Run the test script
echo "Running authentication tests..."
node scripts/test-auth.js

# Make the script executable
chmod +x scripts/test-auth.sh
