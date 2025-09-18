#!/bin/bash

# Gymmawy Deployment Script
# This script helps deploy the application to your VPS

set -e

echo "🚀 Starting Gymmawy deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

# Function to deploy
deploy() {
    print_status "Building and starting containers..."
    docker-compose up -d --build
    
    print_status "Waiting for services to start..."
    sleep 10
    
    print_status "Checking service status..."
    docker-compose ps
    
    print_status "Checking service health..."
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_status "✅ Frontend is running on http://localhost:3000"
    else
        print_warning "⚠️  Frontend might not be ready yet. Check logs with: docker-compose logs frontend"
    fi
    
    # Check backend
    if curl -f http://localhost:5000 > /dev/null 2>&1; then
        print_status "✅ Backend is running on http://localhost:5000"
    else
        print_warning "⚠️  Backend might not be ready yet. Check logs with: docker-compose logs backend"
    fi
    
    # Check database
    if docker-compose exec -T db pg_isready -U gymmawy > /dev/null 2>&1; then
        print_status "✅ Database is running and ready"
    else
        print_warning "⚠️  Database might not be ready yet. Check logs with: docker-compose logs db"
    fi
    
    print_status "🎉 Deployment completed!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:5000"
}

# Function to stop services
stop() {
    print_status "Stopping services..."
    docker-compose down
    print_status "Services stopped."
}

# Function to restart services
restart() {
    print_status "Restarting services..."
    docker-compose restart
    print_status "Services restarted."
}

# Function to view logs
logs() {
    docker-compose logs -f
}

# Function to update and redeploy
update() {
    print_status "Pulling latest changes..."
    git pull origin main
    
    print_status "Rebuilding and restarting services..."
    docker-compose up -d --build
    
    print_status "Update completed!"
}

# Function to manage database
db() {
    case "${2:-help}" in
        "migrate")
            print_status "Running database migrations..."
            docker-compose exec backend npx prisma migrate deploy
            ;;
        "seed")
            print_status "Seeding database..."
            docker-compose exec backend npx prisma db seed
            ;;
        "status")
            print_status "Checking migration status..."
            docker-compose exec backend npx prisma migrate status
            ;;
        "backup")
            print_status "Creating database backup..."
            docker-compose exec db pg_dump -U gymmawy gymmawy_db > backup-$(date +%Y%m%d-%H%M%S).sql
            print_status "Backup created: backup-$(date +%Y%m%d-%H%M%S).sql"
            ;;
        "shell")
            print_status "Opening database shell..."
            docker-compose exec db psql -U gymmawy -d gymmawy_db
            ;;
        *)
            echo "Database management commands:"
            echo "  migrate  - Run database migrations"
            echo "  seed     - Seed the database"
            echo "  status   - Check migration status"
            echo "  backup   - Create database backup"
            echo "  shell    - Open database shell"
            ;;
    esac
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "stop")
        stop
        ;;
    "restart")
        restart
        ;;
    "logs")
        logs
        ;;
    "update")
        update
        ;;
    "db")
        db "$@"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Build and start services (default)"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - View logs from all services"
        echo "  update   - Pull latest changes and redeploy"
        echo "  db       - Database management (migrate, seed, status, backup, shell)"
        echo "  help     - Show this help message"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for available commands."
        exit 1
        ;;
esac
