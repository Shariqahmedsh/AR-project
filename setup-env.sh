#!/bin/bash

# Environment Setup Script for AR Cybersecurity Platform
# Usage: ./scripts/setup-env.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  AR Cybersecurity Platform${NC}"
    echo -e "${BLUE}  Environment Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Available environments
ENVIRONMENTS=("development" "production" "local" "staging")

# Function to show usage
show_usage() {
    echo "Usage: $0 [environment]"
    echo ""
    echo "Available environments:"
    for env in "${ENVIRONMENTS[@]}"; do
        echo "  - $env"
    done
    echo ""
    echo "Examples:"
    echo "  $0 development  # Use production API for development"
    echo "  $0 local        # Use local backend"
    echo "  $0 production   # Use production settings"
}

# Function to setup environment
setup_environment() {
    local env=$1
    
    print_header
    
    if [[ ! " ${ENVIRONMENTS[@]} " =~ " ${env} " ]]; then
        print_error "Invalid environment: $env"
        show_usage
        exit 1
    fi
    
    print_status "Setting up environment: $env"
    
    # Copy environment file
    if [[ -f "env-configs/.env.$env" ]]; then
        cp "env-configs/.env.$env" ".env"
        print_status "Environment file copied: env-configs/.env.$env -> .env"
    else
        print_error "Environment file not found: env-configs/.env.$env"
        exit 1
    fi
    
    # Show current configuration
    print_status "Current configuration:"
    echo "  API URL: $(grep VITE_API_URL .env | cut -d'=' -f2)"
    echo "  App Title: $(grep VITE_APP_TITLE .env | cut -d'=' -f2)"
    echo "  Environment: $(grep VITE_APP_ENV .env | cut -d'=' -f2)"
    
    # Environment-specific setup
    case $env in
        "local")
            print_warning "Local environment requires backend to be running on port 5001"
            print_status "To start local backend: cd AR-project-backend && npm start"
            ;;
        "development"|"staging"|"production")
            print_status "Using production API: https://ar-project-5ojn.onrender.com"
            ;;
    esac
    
    print_status "Environment setup complete!"
    print_status "Run 'npm run dev' to start the development server"
}

# Main execution
if [[ $# -eq 0 ]]; then
    show_usage
    exit 1
fi

setup_environment $1
