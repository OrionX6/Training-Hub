#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Environment options
ENVIRONMENTS=("development" "staging" "production")
DEFAULT_ENV="development"

# Function to print step message
print_step() {
    echo -e "\n${CYAN}=== $1 ===${NC}"
}

# Function to validate environment
validate_environment() {
    local valid=0
    for env in "${ENVIRONMENTS[@]}"; do
        if [ "$env" == "$1" ]; then
            valid=1
            break
        fi
    done
    
    if [ $valid -eq 0 ]; then
        echo -e "${RED}Invalid environment: $1${NC}"
        echo "Valid environments are: ${ENVIRONMENTS[*]}"
        exit 1
    fi
}

# Function to check for uncommitted changes
check_git_status() {
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠ Warning: You have uncommitted changes${NC}"
        read -p "Do you want to continue? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to validate environment configuration
validate_config() {
    local env=$1
    print_step "Validating $env configuration"
    
    # Run environment validation script
    ./scripts/validate-env.sh || exit 1
    
    # Check required environment variables for deployment
    if [ -z "$REACT_APP_SUPABASE_URL" ]; then
        echo -e "${RED}❌ REACT_APP_SUPABASE_URL is not set${NC}"
        exit 1
    fi
    
    if [ -z "$REACT_APP_SUPABASE_ANON_KEY" ]; then
        echo -e "${RED}❌ REACT_APP_SUPABASE_ANON_KEY is not set${NC}"
        exit 1
    fi
}

# Function to build the application
build_app() {
    local env=$1
    print_step "Building application for $env"
    
    # Set environment
    export NODE_ENV=$env
    
    # Clean previous build
    npm run clean
    
    # Install dependencies
    npm ci
    
    # Run tests
    npm run test:coverage
    
    # Build application
    npm run build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Build completed successfully${NC}"
}

# Function to deploy to environment
deploy() {
    local env=$1
    print_step "Deploying to $env"
    
    case $env in
        "development")
            echo "Deploying to development environment..."
            # Add development deployment commands
            ;;
        "staging")
            echo "Deploying to staging environment..."
            # Add staging deployment commands
            ;;
        "production")
            echo "Deploying to production environment..."
            # Add production deployment commands
            ;;
    esac
}

# Main script
main() {
    # Get environment argument or use default
    ENV=${1:-$DEFAULT_ENV}
    
    # Print banner
    echo -e "${CYAN}"
    echo "=============================="
    echo "   Training Hub Deployment"
    echo "=============================="
    echo -e "${NC}"
    
    # Validate environment
    validate_environment $ENV
    
    # Check git status
    check_git_status
    
    # Validate configuration
    validate_config $ENV
    
    # Build application
    build_app $ENV
    
    # Deploy
    deploy $ENV
    
    print_step "Deployment Summary"
    echo -e "${GREEN}✓ Successfully deployed to $ENV${NC}"
    
    # Print post-deployment information
    case $ENV in
        "development")
            echo -e "\nApplication is available at: http://localhost:3000"
            ;;
        "staging")
            echo -e "\nApplication is available at: https://staging.your-domain.com"
            ;;
        "production")
            echo -e "\nApplication is available at: https://your-domain.com"
            ;;
    esac
}

# Run main function with environment argument
main "$1"
