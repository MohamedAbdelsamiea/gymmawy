#!/bin/bash

# Quick Gymmawy VPS Setup Script
# For users who just want to get started quickly

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[QUICK SETUP]${NC} $1"
}

# Get basic info
echo "🚀 Quick Gymmawy VPS Setup"
echo ""
read -p "Enter your VPS IP address: " VPS_IP
read -p "Enter your GitHub repo URL: " GITHUB_REPO
read -p "Enter your email (for SSL): " ADMIN_EMAIL

# Generate secrets
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

print_header "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

print_header "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

print_header "Setting up project..."
mkdir -p /opt/gymmawy
cd /opt/gymmawy
git clone "$GITHUB_REPO" .

print_header "Creating environment files..."

# Backend .env
cat > gymmawy-backend/.env << EOF
DATABASE_URL="postgresql://gymmawy:gymmawy123@db:5432/gymmawy_db"
JWT_SECRET="$JWT_SECRET"
JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
PORT=5000
NODE_ENV=production
CORS_ORIGIN="http://$VPS_IP:3000"
EOF

# Frontend .env
cat > gymmawy-frontend/.env << EOF
VITE_API_BASE_URL=http://$VPS_IP:5000
VITE_APP_NAME=Gymmawy
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
VITE_DEFAULT_LANGUAGE=en
EOF

print_header "Setting up firewall..."
apt update
apt install -y ufw
ufw --force enable
ufw allow ssh
ufw allow 3000
ufw allow 5000

print_header "Deploying application..."
chmod +x deploy.sh
./deploy.sh deploy

print_header "Setup Complete! 🎉"
echo ""
echo "Your Gymmawy app is now running!"
echo "Frontend: http://$VPS_IP:3000"
echo "Backend: http://$VPS_IP:5000"
echo ""
echo "To manage your app:"
echo "cd /opt/gymmawy"
echo "./deploy.sh logs"
echo ""
