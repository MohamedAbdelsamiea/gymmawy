# 🚀 Gymmawy VPS Setup Scripts

This repository includes automated setup scripts to deploy your Gymmawy application on a VPS with just one command!

## 📋 Prerequisites

- Ubuntu/Debian VPS
- Root access or sudo privileges
- GitHub repository with your code
- Domain name (optional, but recommended for production)

## 🎯 Quick Start (Recommended)

For a fast setup with IP access:

```bash
# Download and run the quick setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/gymmawy/main/quick-setup.sh | bash
```

Or if you have the files locally:

```bash
# Make executable and run
chmod +x quick-setup.sh
./quick-setup.sh
```

**What it does:**
- Installs Docker and Docker Compose
- Clones your repository
- Creates environment files
- Sets up firewall
- Deploys your application
- **Access**: `http://your-vps-ip:3000`

## 🔧 Full Setup (Production)

For production with domain and SSL:

```bash
# Download and run the full setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/gymmawy/main/setup-vps.sh | bash
```

Or locally:

```bash
chmod +x setup-vps.sh
./setup-vps.sh
```

**What it does:**
- Everything from quick setup, plus:
- Nginx reverse proxy
- SSL certificates (Let's Encrypt)
- Domain configuration
- Monitoring and backups
- **Access**: `https://yourdomain.com`

## 📝 What You'll Need

### For Quick Setup:
- VPS IP address
- GitHub repository URL
- Email address (for SSL)

### For Full Setup:
- VPS IP address
- GitHub repository URL
- Domain name
- Email address
- SMTP credentials (Gmail, etc.)

## 🎛️ Manual Configuration

If you prefer to set up manually, follow the detailed guide in `DEPLOYMENT.md`.

## 🔍 After Setup

### Check Status:
```bash
cd /opt/gymmawy
docker-compose ps
```

### View Logs:
```bash
./deploy.sh logs
```

### Update Application:
```bash
git pull origin main
./deploy.sh update
```

### Backup Database:
```bash
./deploy.sh db backup
```

## 🛠️ Troubleshooting

### If containers won't start:
```bash
docker-compose logs
docker-compose down
docker-compose up -d --build
```

### If frontend can't reach backend:
1. Check frontend `.env` file:
   ```bash
   cat /opt/gymmawy/gymmawy-frontend/.env
   ```
2. Verify `VITE_API_BASE_URL` is correct
3. Rebuild frontend:
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

### If database issues:
```bash
docker-compose logs db
docker-compose restart db
```

## 📞 Support

If you encounter issues:

1. Check the logs: `./deploy.sh logs`
2. Verify all environment variables are set
3. Ensure ports 3000 and 5000 are open
4. Check firewall settings

## 🎉 Success!

Once setup is complete, you'll have:

- ✅ Frontend running on port 3000 (or your domain)
- ✅ Backend API running on port 5000 (or /api)
- ✅ PostgreSQL database
- ✅ Automatic restarts
- ✅ SSL certificates (if using domain)
- ✅ Monitoring and backups

Your Gymmawy application is now live! 🚀
