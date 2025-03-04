#!/bin/bash

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Make scripts executable
chmod +x setup.sh
chmod +x scripts/run.js
chmod +x scripts/docker-dev.js
chmod +x scripts/make-executable.sh

echo -e "${GREEN}All scripts are now executable${NC}"
