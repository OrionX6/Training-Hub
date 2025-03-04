#!/bin/bash

# Exit on error
set -e

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if git is installed
if ! command_exists git; then
  echo "Error: git is not installed"
  exit 1
fi

# Ensure we're in the training-hub directory
cd "$(dirname "$0")/.."

# Initialize git if not already initialized
if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
else
  echo "Git repository already initialized"
fi

# Configure git to ignore file mode changes
git config core.fileMode false

# Add remote if it doesn't exist
if ! git remote | grep -q "^origin$"; then
  echo "Adding remote repository..."
  git remote add origin https://github.com/OrionX6/Training-Hub.git
else
  echo "Remote 'origin' already exists"
fi

# Create initial commit if there isn't one
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "Creating initial commit..."
  
  # Add all files except those in .gitignore
  git add .
  
  # Initial commit
  git commit -m "Initial commit: Training Hub application setup with Supabase integration

- Added React TypeScript application structure
- Implemented Supabase authentication
- Added study guide and quiz components
- Set up admin dashboard
- Added Docker support
- Configured GitHub workflows"
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "
Repository has been initialized and pushed to GitHub!

Next steps:
1. Visit https://github.com/OrionX6/Training-Hub to verify the push
2. Set up branch protection rules in GitHub repository settings
3. Configure GitHub Actions in the repository settings
4. Update the repository description and topics

For security, remember to:
- Never commit .env files
- Change the default super admin password after first login
- Keep your Supabase credentials secure
"
