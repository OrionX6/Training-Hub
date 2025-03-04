#!/bin/bash

# Exit on error
set -e

echo "Initializing Git repository and pushing to GitHub..."

# Ensure we're in the training-hub directory
cd "$(dirname "$0")/.."

# Initialize git if not already initialized
if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
else
  echo "Git repository already initialized"
fi

# Ensure we have a main branch
git checkout -b main 2>/dev/null || git checkout main

# Add remote if it doesn't exist
if ! git remote | grep -q "^origin$"; then
  echo "Adding remote repository..."
  git remote add origin https://github.com/OrionX6/Training-Hub.git
else
  echo "Remote 'origin' already exists"
fi

# Add all files
echo "Adding files to git..."
git add .

# Create initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: Training Hub application

- React TypeScript application setup
- Supabase integration
- Study guide and quiz components
- Admin dashboard
- Docker support"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "
Repository has been pushed to GitHub!

Next steps:
1. Visit https://github.com/OrionX6/Training-Hub to verify your code
2. Delete any exposed tokens and generate new ones
3. Update your .env file with your new tokens
"
