#!/bin/bash

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print step message
print_step() {
    echo -e "${CYAN}==>${NC} $1"
}

# Function to check command existence
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is required but not installed.${NC}"
        echo -e "Please install $1 and try again."
        exit 1
    fi
}

# Function to check environment
check_environment() {
    print_step "Checking environment..."
    
    # Check required tools
    check_command "node"
    check_command "npm"
    check_command "git"
    
    # Check if Docker is needed
    if [ "$USE_DOCKER" = true ]; then
        check_command "docker"
        check_command "docker-compose"
    fi
}

# Function to check Node.js version
check_node_version() {
    print_step "Checking Node.js version..."
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
    
    if [ $MAJOR_VERSION -lt 18 ]; then
        echo -e "${RED}Error: Node.js version 18 or higher is required.${NC}"
        echo "Current version: $NODE_VERSION"
        exit 1
    fi
}

# Function to setup environment files
setup_env_files() {
    print_step "Setting up environment files..."
    
    if [ ! -f .env ]; then
        if [ "$USE_DOCKER" = true ]; then
            cp docker/.env.example .env
            echo -e "${GREEN}Created .env file from docker template${NC}"
        else
            cp .env.example .env
            echo -e "${GREEN}Created .env file from local template${NC}"
        fi
    else
        echo -e "${YELLOW}Warning: .env file already exists, skipping...${NC}"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    npm install
}

# Function to setup development environment
setup_dev_environment() {
    if [ "$USE_DOCKER" = true ]; then
        print_step "Setting up Docker environment..."
        make setup-docker
    else
        print_step "Setting up local environment..."
        make setup
    fi
}

# Main setup function
main() {
    echo -e "${CYAN}Training Hub Setup${NC}"
    echo "=============================="
    
    # Check if user wants to use Docker
    read -p "Do you want to use Docker for development? (y/N) " docker_choice
    case $docker_choice in
        [Yy]* ) USE_DOCKER=true ;;
        * ) USE_DOCKER=false ;;
    esac
    
    # Run setup steps
    check_environment
    check_node_version
    setup_env_files
    install_dependencies
    setup_dev_environment
    
    echo -e "\n${GREEN}Setup completed successfully!${NC}"
    
    # Print next steps
    echo -e "\n${CYAN}Next steps:${NC}"
    if [ "$USE_DOCKER" = true ]; then
        echo "1. Update the .env file with your Supabase credentials"
        echo "2. Run 'make docker-dev' to start the development environment"
    else
        echo "1. Update the .env file with your Supabase credentials"
        echo "2. Run 'make dev' to start the development server"
    fi
    echo "3. Visit http://localhost:3000 to view the application"
}

# Run main function
main
