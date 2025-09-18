#!/bin/bash

# One-Command Gymmawy VPS Setup
# Just run this script and answer a few questions!

set -e

echo "🚀 Gymmawy One-Command VPS Setup"
echo "================================="
echo ""

# Get VPS IP
read -p "Enter your VPS IP address: " VPS_IP

# Get GitHub repo
read -p "Enter your GitHub repo URL: " GITHUB_REPO

# Get email
read -p "Enter your email: " ADMIN_EMAIL

echo ""
echo "Setting up your Gymmawy application..."
echo "This will take a few minutes..."
echo ""

# Install Docker
echo "📦 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo "📦 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Setup project
echo "📁 Setting up project..."
mkdir -p /opt/gymmawy
cd /opt/gymmawy
git clone "$GITHUB_REPO" .

# Generate secrets
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Create backend .env
echo "⚙️  Creating backend configuration..."
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

# Create frontend .env
echo "⚙️  Creating frontend configuration..."
cat > gymmawy-frontend/.env << EOF
VITE_API_BASE_URL=http://$VPS_IP:5000
VITE_APP_NAME=Gymmawy
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
VITE_DEFAULT_LANGUAGE=en
EOF

# Setup firewall
echo "🔥 Setting up firewall..."
apt update -qq
apt install -y ufw
ufw --force enable
ufw allow ssh
ufw allow 3000
ufw allow 5000

# Deploy application
echo "🚀 Deploying application..."
chmod +x deploy.sh
./deploy.sh deploy

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check status
echo "🔍 Checking application status..."
docker-compose ps

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your Gymmawy application is now running!"
echo ""
echo "🌐 Access your app:"
echo "   Frontend: http://$VPS_IP:3000"
echo "   Backend:  http://$VPS_IP:5000"
echo ""
echo "📋 To manage your app:"
echo "   cd /opt/gymmawy"
echo "   ./deploy.sh logs      # View logs"
echo "   ./deploy.sh restart   # Restart services"
echo "   ./deploy.sh update    # Update application"
echo ""
echo "🔧 Configuration files:"
echo "   Backend:  /opt/gymmawy/gymmawy-backend/.env"
echo "   Frontend: /opt/gymmawy/gymmawy-frontend/.env"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Update email credentials in backend .env"
echo "   2. Set up a domain name (optional)"
echo "   3. Configure SSL certificates (optional)"
echo ""
echo "Happy coding! 🚀"
