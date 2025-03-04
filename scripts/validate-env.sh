#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Status tracking
ERRORS=0
WARNINGS=0

# Function to print section header
print_header() {
    echo -e "\n${CYAN}=== $1 ===${NC}"
}

# Function to check command version
check_version() {
    local command=$1
    local min_version=$2
    local version_command=$3
    
    if ! command -v $command &> /dev/null; then
        echo -e "${RED}❌ $command not found${NC}"
        ((ERRORS++))
        return 1
    fi
    
    local version
    version=$($version_command)
    echo -e "${GREEN}✓ $command version: $version${NC}"
    return 0
}

# Function to check file existence
check_file() {
    local file=$1
    local required=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file exists${NC}"
        return 0
    else
        if [ "$required" = true ]; then
            echo -e "${RED}❌ Required file $file not found${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ Optional file $file not found${NC}"
            ((WARNINGS++))
        fi
        return 1
    fi
}

# Function to check directory existence
check_directory() {
    local dir=$1
    local required=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ $dir directory exists${NC}"
        return 0
    else
        if [ "$required" = true ]; then
            echo -e "${RED}❌ Required directory $dir not found${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ Optional directory $dir not found${NC}"
            ((WARNINGS++))
        fi
        return 1
    fi
}

# Function to check environment variables
check_env_var() {
    local var_name=$1
    local required=$2
    
    if [ -n "${!var_name}" ]; then
        echo -e "${GREEN}✓ $var_name is set${NC}"
        return 0
    else
        if [ "$required" = true ]; then
            echo -e "${RED}❌ Required environment variable $var_name is not set${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ Optional environment variable $var_name is not set${NC}"
            ((WARNINGS++))
        fi
        return 1
    fi
}

# Check Node.js setup
print_header "Node.js Environment"
check_version "node" "18.0.0" "node --version"
check_version "npm" "6.0.0" "npm --version"

# Check Docker setup (optional)
print_header "Docker Environment"
if ! check_version "docker" "20.10.0" "docker --version"; then
    ((WARNINGS++))
    ((ERRORS--))
fi
if ! check_version "docker-compose" "2.0.0" "docker-compose --version"; then
    ((WARNINGS++))
    ((ERRORS--))
fi

# Check required files
print_header "Required Files"
check_file "package.json" true
check_file "tsconfig.json" true
check_file ".env" true
check_file ".gitignore" true
check_file "README.md" true

# Check required directories
print_header "Required Directories"
check_directory "src" true
check_directory "public" true
check_directory "scripts" true
check_directory "supabase" true

# Check environment variables
print_header "Environment Variables"
source .env 2>/dev/null
check_env_var "REACT_APP_SUPABASE_URL" true
check_env_var "REACT_APP_SUPABASE_ANON_KEY" true
check_env_var "NODE_ENV" false

# Check development dependencies
print_header "Development Dependencies"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules exists${NC}"
    if [ -f "package-lock.json" ]; then
        echo -e "${GREEN}✓ Dependencies are locked (package-lock.json)${NC}"
    else
        echo -e "${YELLOW}⚠ Dependencies are not locked (no package-lock.json)${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ node_modules not found. Run 'npm install'${NC}"
    ((ERRORS++))
fi

# Print summary
print_header "Summary"
echo -e "Found ${RED}$ERRORS errors${NC} and ${YELLOW}$WARNINGS warnings${NC}"

if [ $ERRORS -gt 0 ]; then
    echo -e "\n${RED}❌ Environment validation failed${NC}"
    echo "Please fix the errors above before continuing"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "\n${YELLOW}⚠ Environment validation passed with warnings${NC}"
    exit 0
else
    echo -e "\n${GREEN}✓ Environment validation passed successfully${NC}"
    exit 0
fi
