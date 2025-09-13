#!/bin/bash
set -e

# CodeBuddy Deployment Script
# Usage: ./scripts/deploy.sh [environment]

ENVIRONMENT=${1:-production}
PROJECT_ROOT=$(dirname $(dirname $(readlink -f $0)))

echo "🚀 Deploying CodeBuddy to $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment file exists
if [ ! -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]; then
    log_error "Environment file .env.$ENVIRONMENT not found!"
    log_info "Please create .env.$ENVIRONMENT with your configuration"
    exit 1
fi

# Load environment variables
source "$PROJECT_ROOT/.env.$ENVIRONMENT"

log_info "Environment: $ENVIRONMENT"
log_info "Project root: $PROJECT_ROOT"

# Check for required tools
command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed. Aborting."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { log_error "Docker Compose is required but not installed. Aborting."; exit 1; }

# Navigate to project root
cd "$PROJECT_ROOT"

# Pull latest changes (if deploying from git)
if [ "$ENVIRONMENT" = "production" ]; then
    log_info "Pulling latest changes from main branch..."
    git fetch origin
    git reset --hard origin/main
fi

# Build and deploy with Docker Compose
log_info "Building and deploying containers..."

if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
else
    COMPOSE_FILE="docker-compose.yml"
fi

# Stop existing containers
log_info "Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" down

# Build new images
log_info "Building new images..."
docker-compose -f "$COMPOSE_FILE" build --no-cache

# Start containers in background
log_info "Starting containers..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for database to be ready
log_info "Waiting for database to be ready..."
sleep 15

# Run database migrations
log_info "Running database migrations..."
docker-compose -f "$COMPOSE_FILE" exec -T web python manage.py migrate --noinput

# Collect static files
log_info "Collecting static files..."
docker-compose -f "$COMPOSE_FILE" exec -T web python manage.py collectstatic --noinput

# Create superuser if needed (only in development)
if [ "$ENVIRONMENT" != "production" ]; then
    log_info "Creating superuser (if needed)..."
    docker-compose -f "$COMPOSE_FILE" exec -T web python manage.py shell << EOF
from apps.authentication.models import CustomUser
if not CustomUser.objects.filter(is_superuser=True).exists():
    CustomUser.objects.create_superuser(
        username='admin',
        email='admin@codebuddy.dev',
        password='admin123',
        role='admin'
    )
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
EOF
fi

# Health check
log_info "Performing health check..."
sleep 5

if curl -f -s http://localhost:8000/health/ > /dev/null; then
    log_success "Health check passed!"
else
    log_warning "Health check failed. Check logs with: docker-compose -f $COMPOSE_FILE logs"
fi

# Show status
log_info "Container status:"
docker-compose -f "$COMPOSE_FILE" ps

log_success "🎉 CodeBuddy deployment completed!"
log_info "Access the application at: http://localhost:8000"
log_info "Admin interface: http://localhost:8000/admin"

if [ "$ENVIRONMENT" != "production" ]; then
    log_info "Development credentials: admin/admin123"
fi

log_info "To view logs: docker-compose -f $COMPOSE_FILE logs -f"
log_info "To stop: docker-compose -f $COMPOSE_FILE down"
