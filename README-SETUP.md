# 🚀 Gymmawy - One-Command VPS Deployment

Deploy your Gymmawy application to any VPS with just one command!

## ⚡ Quick Start

```bash
# Deploy to your VPS in one command
curl -fsSL https://raw.githubusercontent.com/yourusername/gymmawy/main/one-command-setup.sh | bash
```

**What you need:**
- VPS IP address
- GitHub repository URL
- Email address

**What you get:**
- ✅ Frontend running on port 3000
- ✅ Backend API running on port 5000
- ✅ PostgreSQL database
- ✅ Automatic restarts
- ✅ Firewall configured
- ✅ Environment files created

## 🎯 Access Your App

After deployment:
- **Frontend**: `http://your-vps-ip:3000`
- **Backend**: `http://your-vps-ip:5000`

## 🛠️ Management

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Navigate to project
cd /opt/gymmawy

# Check status
docker-compose ps

# View logs
./deploy.sh logs

# Restart services
./deploy.sh restart

# Update application
./deploy.sh update
```

## 📋 Setup Options

| Script | Use Case | Time | Access |
|--------|----------|------|--------|
| `one-command-setup.sh` | Quick testing | 5-10 min | `http://ip:3000` |
| `quick-setup.sh` | Development | 5-10 min | `http://ip:3000` |
| `setup-vps.sh` | Production | 10-15 min | `https://domain.com` |

## 📚 Documentation

- **Full Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Setup Scripts Guide**: [SETUP-README.md](./SETUP-README.md)

## 🆘 Troubleshooting

If something goes wrong:

1. **Check logs**: `./deploy.sh logs`
2. **Restart services**: `./deploy.sh restart`
3. **Check status**: `docker-compose ps`
4. **View detailed guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🎉 Success!

Your Gymmawy application is now live and ready to use! 🚀
