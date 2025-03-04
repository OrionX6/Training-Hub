#!/bin/bash

# Exit on error
set -e

# Make push script executable
chmod +x scripts/push-to-github.sh

# Execute the push script
./scripts/push-to-github.sh

echo "
If the push was successful, your code is now on GitHub!

Important next steps:
1. Check your repository at https://github.com/OrionX6/Training-Hub
2. Verify all files were pushed correctly
3. Keep your new PAT token secure and never share it

If you encounter any errors, they will be displayed above.
"
