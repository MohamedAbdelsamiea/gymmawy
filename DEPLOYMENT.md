# Gymmawy Docker Deployment Guide

This guide provides step-by-step instructions for deploying your Gymmawy application using Docker and docker-compose.

## 🚀 Quick Start (Recommended)

**For the fastest deployment, use our automated setup script:**

```bash
# One-command setup (easiest)
curl -fsSL https://raw.githubusercontent.com/MohamedAbdelsamiea/gymmawy/main/one-command-setup.sh | bash
```

**What you need:**
- VPS IP address
- GitHub repository URL
- Email address

**What it does:**
- Installs Docker & Docker Compose
- Clones your repository
- Creates all environment files
- Sets up firewall
- Deploys your application
- **Done!** Access at `http://your-vps-ip:3000`

## 📚 Quick Reference

| Task | Command |
|------|---------|
| **Deploy to VPS** | `curl -fsSL https://raw.githubusercontent.com/yourusername/gymmawy/main/one-command-setup.sh \| bash` |
| **Check Status** | `docker-compose ps` |
| **View Logs** | `./deploy.sh logs` |
| **Restart App** | `./deploy.sh restart` |
| **Update App** | `./deploy.sh update` |
| **Backup DB** | `./deploy.sh db backup` |
| **Access Frontend** | `http://your-vps-ip:3000` |
| **Access Backend** | `http://your-vps-ip:5000` |

## 📋 Prerequisites

- Ubuntu/Debian VPS
- Root access or sudo privileges
- Git configured
- GitHub repository with your code

## 🏗️ Project Structure

```
gymmawy/
├── gymmawy-frontend/          # React app
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ...
├── gymmawy-backend/           # Node.js API
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── init-db.sql
│   └── ...
├── docker-compose.yml         # Root docker-compose file
├── one-command-setup.sh       # Automated setup script
├── quick-setup.sh            # Quick setup script
├── setup-vps.sh              # Full production setup
└── DEPLOYMENT.md             # This file
```

## 🌐 Services

- **Frontend**: React app served with nginx (Port 3000)
- **Backend**: Node.js/Express API (Port 5000)
- **Database**: PostgreSQL 15 (Port 5434)

## 🛠️ Setup Options

### Option 1: One-Command Setup (Easiest)
```bash
curl -fsSL https://raw.githubusercontent.com/MohamedAbdelsamiea/gymmawy/main/one-command-setup.sh | bash
```
- **Best for**: Quick testing, development
- **Time**: 5-10 minutes
- **Access**: `http://your-vps-ip:3000`

### Option 2: Quick Setup (Fast)
```bash
./quick-setup.sh
```
- **Best for**: Testing with more control
- **Time**: 5-10 minutes
- **Access**: `http://your-vps-ip:3000`

### Option 3: Full Production Setup
```bash
./setup-vps.sh
```
- **Best for**: Production with domain and SSL
- **Time**: 10-15 minutes
- **Access**: `https://yourdomain.com`

### Option 4: Manual Setup
Follow the detailed steps below for complete control.

## 📱 Step 1: Building Locally

### 1.1 Test the build locally

```bash
# Navigate to your project root
cd /home/mohamed/gymmawy

# Build and start the containers
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 1.2 Verify the deployment

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 1.3 Stop the containers

```bash
docker-compose down
```

## Step 2: Pushing Code to GitHub

### 2.1 Initialize Git repository (if not already done)

```bash
# Navigate to project root
cd /home/mohamed/gymmawy

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Add Docker deployment configuration"

# Add remote origin (replace with your GitHub repo URL)
git remote add origin https://github.com/MohamedAbdelsamiea/gymmawy.git

# Push to main branch
git push -u origin main
```

### 2.2 Update .gitignore

Make sure your `.gitignore` includes:

```gitignore
# Docker
.dockerignore

# Environment files
.env
.env.local
.env.production

# Logs
logs/
*.log

# Dependencies
node_modules/

# Build outputs
dist/
build/

# Database
*.db
*.sqlite
```

## 🖥️ Step 3: VPS Deployment

### 3.1 Automated Setup (Recommended)

**Connect to your VPS and run the automated setup:**

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Run one-command setup
curl -fsSL https://raw.githubusercontent.com/MohamedAbdelsamiea/gymmawy/main/one-command-setup.sh | bash
```

**That's it!** Your app will be running at `http://your-vps-ip:3000`

### 3.2 Manual Setup (Advanced)

If you prefer manual control, follow these steps:

#### 3.2.1 Connect to your VPS

```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

#### 3.2.2 Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (if not root)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### 3.2.3 Clone your repository

```bash
# Create project directory
mkdir -p /opt/gymmawy
cd /opt/gymmawy

# Clone your repository
git clone https://github.com/MohamedAbdelsamiea/gymmawy.git .

# Or if you want to pull updates later
git pull origin main
```

## Step 4: Environment Configuration

### 4.1 Create environment files

#### Backend Environment File

```bash
# Navigate to backend directory
cd /opt/gymmawy/gymmawy-backend

# Create .env file
nano .env
```

Add your environment variables:

```env
# Database (automatically configured by docker-compose)
# DATABASE_URL="postgresql://gymmawy:gymmawy123@db:5432/gymmawy_db"

# JWT Secrets (REPLACE WITH YOUR ACTUAL SECRETS)
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here-make-it-long-and-random"

# Email Configuration (REPLACE WITH YOUR EMAIL SETTINGS)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration (for production with domain)
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"

# Add other required environment variables
```

#### Frontend Environment File

```bash
# Navigate to frontend directory
cd /opt/gymmawy/gymmawy-frontend

# Create .env file
nano .env
```

Add your environment variables:

```env
# API Configuration (IMPORTANT: Update this for your VPS)
# For VPS IP access:
VITE_API_BASE_URL=http://your-vps-ip:5000

# For domain access (recommended for production):
# VITE_API_BASE_URL=https://yourdomain.com/api

# App Configuration
VITE_APP_NAME=Gymmawy
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false

# Default Language
VITE_DEFAULT_LANGUAGE=en
```

**Important Notes:**
- The database connection is automatically configured in docker-compose.yml
- Update `VITE_API_BASE_URL` based on how you want to access your app
- Update `CORS_ORIGIN` in backend .env to match your frontend URL

### 4.2 Set proper permissions

```bash
# Set ownership
sudo chown -R $USER:$USER /opt/gymmawy

# Set proper permissions
chmod -R 755 /opt/gymmawy
```

## Step 5: Deploy with Docker Compose

### 5.1 Deploy the application

```bash
# Navigate to project root
cd /opt/gymmawy

# Build and start containers
docker-compose up -d --build
```

### 5.2 Verify deployment

```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs frontend
docker-compose logs backend

# Check if services are running
curl http://localhost:3000  # Frontend
curl http://localhost:5000  # Backend
```

### 5.3 Access Your Application

After deployment, you can access your application in two ways:

#### **Option A: Direct Access (Quick Test)**
- **Frontend**: `http://your-vps-ip:3000`
- **Backend API**: `http://your-vps-ip:5000`

**Note**: Make sure to update your frontend `.env` file:
```env
VITE_API_BASE_URL=http://your-vps-ip:5000
```

#### **Option B: With Domain (Production)**
- **Frontend**: `https://yourdomain.com`
- **Backend API**: `https://yourdomain.com/api`

### 5.4 Configure Nginx (Recommended for Production)

If you want to use a domain name, install nginx:

```bash
# Install nginx
sudo apt install nginx -y

# Create nginx configuration
sudo nano /etc/nginx/sites-available/gymmawy
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gymmawy /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

**Important**: After setting up nginx, update your frontend `.env`:
```env
VITE_API_BASE_URL=https://yourdomain.com/api
```

## Step 6: Managing the Deployment

### 6.1 Useful commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Update and rebuild
git pull origin main
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v

# Database management
docker-compose exec backend npx prisma migrate status
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

# Access database directly
docker-compose exec db psql -U gymmawy -d gymmawy_db

# Backup database
docker-compose exec db pg_dump -U gymmawy gymmawy_db > backup.sql

# Restore database
docker-compose exec -T db psql -U gymmawy -d gymmawy_db < backup.sql
```

### 6.2 Monitoring

```bash
# Check container status
docker-compose ps

# Check resource usage
docker stats

# Check logs for errors
docker-compose logs backend | grep ERROR
docker-compose logs frontend | grep ERROR
```

### 6.3 Backup

```bash
# Backup uploads directory
tar -czf gymmawy-backup-$(date +%Y%m%d).tar.gz /opt/gymmawy/gymmawy-backend/uploads

# Backup database (if using local database)
# Add your database backup commands here
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :5000
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Permission denied**
   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER /opt/gymmawy
   ```

3. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs [service-name]
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Database connection issues**
   - Check your DATABASE_URL in .env
   - Ensure database is accessible from the container
   - Run database migrations if needed

### Logs Location

- Application logs: `/opt/gymmawy/gymmawy-backend/logs/`
- Docker logs: `docker-compose logs`

## Security Considerations

1. **Firewall**: Configure UFW or iptables to only allow necessary ports
2. **SSL**: Set up SSL certificates (Let's Encrypt recommended)
3. **Environment variables**: Never commit .env files to git
4. **Updates**: Regularly update Docker images and system packages

## Next Steps

1. Set up SSL certificates with Let's Encrypt
2. Configure domain name and DNS
3. Set up monitoring and logging
4. Implement automated backups
5. Set up CI/CD pipeline for automated deployments

## 🤖 Automated Setup Scripts

This repository includes several automated setup scripts to make deployment easier:

### 🚀 One-Command Setup
```bash
curl -fsSL https://raw.githubusercontent.com/MohamedAbdelsamiea/gymmawy/main/one-command-setup.sh | bash
```
- **Best for**: Quick testing, development
- **Time**: 5-10 minutes
- **Access**: `http://your-vps-ip:3000`

### ⚡ Quick Setup
```bash
./quick-setup.sh
```
- **Best for**: Testing with more control
- **Time**: 5-10 minutes
- **Access**: `http://your-vps-ip:3000`

### 🔧 Full Production Setup
```bash
./setup-vps.sh
```
- **Best for**: Production with domain and SSL
- **Time**: 10-15 minutes
- **Access**: `https://yourdomain.com`

### 📋 What the Scripts Do

1. **Install Docker & Docker Compose**
2. **Clone your repository**
3. **Create environment files**
4. **Set up firewall**
5. **Deploy your application**
6. **Configure monitoring and backups** (full setup only)

### 🎯 After Running Any Script

Your application will be available at:
- **Frontend**: `http://your-vps-ip:3000` (or your domain)
- **Backend**: `http://your-vps-ip:5000` (or `/api` with domain)

### 📱 Management Commands

```bash
cd /opt/gymmawy

# Check status
docker-compose ps

# View logs
./deploy.sh logs

# Restart services
./deploy.sh restart

# Update application
./deploy.sh update

# Database management
./deploy.sh db backup
./deploy.sh db migrate
```

---

For support or questions, check the logs first and ensure all environment variables are properly configured.
