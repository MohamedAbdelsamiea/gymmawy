#!/bin/bash

# Gymmawy VPS Setup Script
# This script automates the entire VPS deployment process

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
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Configuration variables
PROJECT_DIR="/opt/gymmawy"
GITHUB_REPO=""
VPS_IP=""
DOMAIN=""
ADMIN_EMAIL=""
JWT_SECRET=""
JWT_REFRESH_SECRET=""
EMAIL_HOST=""
EMAIL_USER=""
EMAIL_PASS=""

# Function to get user input
get_input() {
    local prompt="$1"
    local var_name="$2"
    local default="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\${input:-$default}"
    else
        read -p "$prompt: " input
        eval "$var_name=\"$input\""
    fi
}

# Function to generate random secrets
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root or with sudo"
        exit 1
    fi
}

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_status "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    else
        print_status "Docker is already installed"
    fi
}

# Function to check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_status "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    else
        print_status "Docker Compose is already installed"
    fi
}

# Function to get configuration from user
get_configuration() {
    print_header "Configuration Setup"
    echo "This script will help you configure your Gymmawy deployment."
    echo ""
    
    get_input "GitHub repository URL (e.g., https://github.com/username/gymmawy.git)" GITHUB_REPO
    get_input "VPS IP address" VPS_IP
    get_input "Domain name (optional, leave empty for IP access)" DOMAIN ""
    get_input "Admin email for SSL certificates" ADMIN_EMAIL
    
    # Generate secrets if not provided
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(generate_secret)
        print_status "Generated JWT secret: $JWT_SECRET"
    fi
    
    if [ -z "$JWT_REFRESH_SECRET" ]; then
        JWT_REFRESH_SECRET=$(generate_secret)
        print_status "Generated JWT refresh secret: $JWT_REFRESH_SECRET"
    fi
    
    get_input "Email SMTP host (e.g., smtp.gmail.com)" EMAIL_HOST "smtp.gmail.com"
    get_input "Email username" EMAIL_USER
    get_input "Email password/app password" EMAIL_PASS
    
    echo ""
    print_status "Configuration complete!"
    echo "VPS IP: $VPS_IP"
    echo "Domain: ${DOMAIN:-'Not set (will use IP access)'}"
    echo "Admin Email: $ADMIN_EMAIL"
    echo ""
}

# Function to setup project directory
setup_project() {
    print_header "Setting up project directory"
    
    if [ -d "$PROJECT_DIR" ]; then
        print_warning "Project directory already exists. Backing up..."
        mv "$PROJECT_DIR" "${PROJECT_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    
    print_status "Cloning repository..."
    git clone "$GITHUB_REPO" .
    
    print_status "Setting proper permissions..."
    chown -R $SUDO_USER:$SUDO_USER "$PROJECT_DIR"
    chmod -R 755 "$PROJECT_DIR"
}

# Function to create environment files
create_environment_files() {
    print_header "Creating environment files"
    
    # Backend .env
    print_status "Creating backend .env file..."
    cat > "$PROJECT_DIR/gymmawy-backend/.env" << EOF
# Database (automatically configured by docker-compose)
DATABASE_URL="postgresql://gymmawy:gymmawy123@db:5432/gymmawy_db"

# JWT Secrets
JWT_SECRET="$JWT_SECRET"
JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"

# Email Configuration
EMAIL_HOST="$EMAIL_HOST"
EMAIL_PORT=587
EMAIL_USER="$EMAIL_USER"
EMAIL_PASS="$EMAIL_PASS"

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN="${DOMAIN:+https://$DOMAIN,https://www.$DOMAIN}http://$VPS_IP:3000"
EOF

    # Frontend .env
    print_status "Creating frontend .env file..."
    if [ -n "$DOMAIN" ]; then
        API_URL="https://$DOMAIN/api"
    else
        API_URL="http://$VPS_IP:5000"
    fi
    
    cat > "$PROJECT_DIR/gymmawy-frontend/.env" << EOF
# API Configuration
VITE_API_BASE_URL="$API_URL"

# App Configuration
VITE_APP_NAME=Gymmawy
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false

# Default Language
VITE_DEFAULT_LANGUAGE=en
EOF

    print_status "Environment files created successfully!"
}

# Function to setup nginx
setup_nginx() {
    if [ -n "$DOMAIN" ]; then
        print_header "Setting up Nginx with domain: $DOMAIN"
        
        # Install nginx
        apt update
        apt install -y nginx
        
        # Create nginx configuration
        cat > /etc/nginx/sites-available/gymmawy << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

        # Enable site
        ln -sf /etc/nginx/sites-available/gymmawy /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        # Test and restart nginx
        nginx -t
        systemctl restart nginx
        systemctl enable nginx
        
        print_status "Nginx configured for domain: $DOMAIN"
    else
        print_status "Skipping Nginx setup (no domain provided)"
    fi
}

# Function to setup SSL with Let's Encrypt
setup_ssl() {
    if [ -n "$DOMAIN" ] && [ -n "$ADMIN_EMAIL" ]; then
        print_header "Setting up SSL with Let's Encrypt"
        
        # Install certbot
        apt install -y certbot python3-certbot-nginx
        
        # Get SSL certificate
        certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$ADMIN_EMAIL" --agree-tos --non-interactive
        
        # Setup auto-renewal
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        print_status "SSL certificate installed for $DOMAIN"
    else
        print_status "Skipping SSL setup (no domain or email provided)"
    fi
}

# Function to setup firewall
setup_firewall() {
    print_header "Setting up firewall"
    
    # Install UFW if not present
    apt install -y ufw
    
    # Configure firewall
    ufw --force enable
    ufw allow ssh
    ufw allow 80
    ufw allow 443
    
    # Allow Docker ports if no domain
    if [ -z "$DOMAIN" ]; then
        ufw allow 3000
        ufw allow 5000
    fi
    
    print_status "Firewall configured"
}

# Function to deploy application
deploy_application() {
    print_header "Deploying application"
    
    cd "$PROJECT_DIR"
    
    # Make deploy script executable
    chmod +x deploy.sh
    
    # Deploy the application
    ./deploy.sh deploy
    
    print_status "Application deployed successfully!"
}

# Function to setup monitoring and backups
setup_monitoring() {
    print_header "Setting up monitoring and backups"
    
    # Create backup directory
    mkdir -p /opt/backups
    
    # Create backup script
    cat > /opt/backups/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
cd /opt/gymmawy

# Backup database
docker-compose exec -T db pg_dump -U gymmawy gymmawy_db > /opt/backups/db-backup-$DATE.sql

# Backup uploads
tar -czf /opt/backups/uploads-backup-$DATE.tar.gz gymmawy-backend/uploads/

# Keep only last 7 days of backups
find /opt/backups -name "*.sql" -mtime +7 -delete
find /opt/backups -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

    chmod +x /opt/backups/backup.sh
    
    # Setup cron jobs
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/backups/backup.sh") | crontab -
    (crontab -l 2>/dev/null; echo "0 3 * * 0 cd /opt/gymmawy && docker-compose restart") | crontab -
    
    print_status "Monitoring and backup setup complete"
}

# Function to display final information
show_final_info() {
    print_header "Deployment Complete! 🎉"
    echo ""
    echo "Your Gymmawy application is now running!"
    echo ""
    
    if [ -n "$DOMAIN" ]; then
        echo "🌐 Access your application:"
        echo "   Frontend: https://$DOMAIN"
        echo "   Backend API: https://$DOMAIN/api"
    else
        echo "🌐 Access your application:"
        echo "   Frontend: http://$VPS_IP:3000"
        echo "   Backend API: http://$VPS_IP:5000"
    fi
    
    echo ""
    echo "📋 Management commands:"
    echo "   cd $PROJECT_DIR"
    echo "   ./deploy.sh deploy    # Deploy/update"
    echo "   ./deploy.sh logs      # View logs"
    echo "   ./deploy.sh db backup # Backup database"
    echo ""
    echo "🔧 Configuration files:"
    echo "   Backend: $PROJECT_DIR/gymmawy-backend/.env"
    echo "   Frontend: $PROJECT_DIR/gymmawy-frontend/.env"
    echo ""
    echo "📊 Monitoring:"
    echo "   docker-compose ps     # Check status"
    echo "   docker-compose logs   # View logs"
    echo ""
}

# Main execution
main() {
    print_header "Gymmawy VPS Setup Script"
    echo "This script will set up your Gymmawy application on this VPS."
    echo ""
    
    # Check if running as root
    check_root
    
    # Get configuration
    get_configuration
    
    # Confirm before proceeding
    echo ""
    read -p "Do you want to proceed with the setup? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        print_status "Setup cancelled."
        exit 0
    fi
    
    # Run setup steps
    check_docker
    check_docker_compose
    setup_project
    create_environment_files
    setup_nginx
    setup_ssl
    setup_firewall
    deploy_application
    setup_monitoring
    show_final_info
}

# Run main function
main "$@"
