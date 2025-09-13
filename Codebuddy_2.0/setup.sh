#!/bin/bash
set -e

# CodeBuddy Setup Script
# This script sets up the development environment

echo "🚀 Setting up CodeBuddy development environment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check system requirements
log_info "Checking system requirements..."

# Check Python version
if command -v python3.11 &> /dev/null; then
    PYTHON_CMD=python3.11
elif command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    if [ "$(echo "$PYTHON_VERSION >= 3.11" | bc)" -eq 1 ]; then
        PYTHON_CMD=python3
    else
        log_error "Python 3.11+ is required. Found: $PYTHON_VERSION"
        exit 1
    fi
else
    log_error "Python 3.11+ is not installed"
    exit 1
fi

log_success "Python: $($PYTHON_CMD --version)"

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    log_error "This script should be run from the CodeBuddy project root directory"
    exit 1
fi

# Create virtual environment
log_info "Creating virtual environment..."
$PYTHON_CMD -m venv venv

# Activate virtual environment
log_info "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
log_info "Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
log_info "Installing Python dependencies..."
pip install -r requirements.txt

# Create environment file
if [ ! -f ".env" ]; then
    log_info "Creating environment file..."
    cp .env.example .env
    log_warning "Please edit .env file with your configuration before running the server"
fi

# Setup pre-commit hooks (if available)
if command -v pre-commit &> /dev/null; then
    log_info "Setting up pre-commit hooks..."
    pre-commit install
fi

# Database setup instructions
log_info "Database setup:"
log_info "1. Install PostgreSQL and create database:"
log_info "   createdb codebuddy_dev"
log_info "2. Update DATABASE_URL in .env file"
log_info "3. Run migrations: python manage.py migrate"

# Redis setup instructions
log_info "Redis setup:"
log_info "1. Install Redis server"
log_info "2. Start Redis: redis-server"
log_info "3. Update REDIS_URL in .env file (if needed)"

# Final instructions
log_success "🎉 Setup completed!"
log_info "Next steps:"
log_info "1. Edit .env file with your configuration"
log_info "2. Setup PostgreSQL database"
log_info "3. Start Redis server"
log_info "4. Run: source venv/bin/activate"
log_info "5. Run: python manage.py migrate"
log_info "6. Run: python manage.py createsuperuser"
log_info "7. Run: python manage.py runserver"
log_info ""
log_info "For Docker setup, run: docker-compose up -d"
