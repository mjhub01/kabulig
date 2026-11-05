# Hostinger VPS Deployment Guide

This guide will help you deploy Kabulig.net to a Hostinger VPS.

## Prerequisites

- Hostinger VPS with Ubuntu/Debian
- SSH access to the VPS
- Domain name pointed to your VPS IP
- Git repository with your code

## Step 1: Prepare Your Local Code

1. **Update deployment script with your git repository:**
   ```bash
   # Edit deploy.sh and replace:
   GIT_REPO="your-git-repo-url-here"
   # with your actual git repository URL
   ```

2. **Update nginx configuration with your domain:**
   ```bash
   # Edit nginx.conf and replace:
   server_name your-domain.com www.your-domain.com;
   # with your actual domain name
   ```

3. **Push your code to git:**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

## Step 2: Connect to Your VPS

```bash
ssh root@your-vps-ip
```

## Step 3: Upload Deployment Files

Option A: Using SCP
```bash
# From your local machine
scp deploy.sh nginx.conf ecosystem.config.js .env.production.example root@your-vps-ip:/root/
```

Option B: Create files directly on VPS
```bash
# Use nano or vim to create the files on the VPS
nano deploy.sh
# Paste the content and save
```

## Step 4: Make Deploy Script Executable

```bash
chmod +x deploy.sh
```

## Step 5: Run Deployment Script

```bash
./deploy.sh
```

This script will:
- Update system packages
- Install Node.js, PostgreSQL, Nginx, and PM2
- Clone your repository
- Install dependencies
- Run database migrations
- Build the Next.js application
- Configure PM2 to run the app
- Setup Nginx as a reverse proxy

## Step 6: Configure Environment Variables

After deployment, edit the environment file:

```bash
nano /var/www/kabulig/.env
```

Update with your production values:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_URL` - Your domain URL (e.g., https://kabulig.net)
- `NEXTAUTH_SECRET` - Generate a secure random string
- Stripe keys (if using Stripe in production)

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 7: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE kabulig;
CREATE USER kabulig_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE kabulig TO kabulig_user;
\q
```

Update your `.env` file with the new database credentials.

## Step 8: Run Migrations

```bash
cd /var/www/kabulig
npx prisma generate
npx prisma migrate deploy
```

## Step 9: Restart Application

```bash
cd /var/www/kabulig
pm2 restart kabulig
```

## Step 10: Setup SSL Certificate (HTTPS)

Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

Obtain SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Update nginx.conf to enable SSL (uncomment the SSL section).

## Step 11: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check application logs
pm2 logs kabulig

# Test the application
curl http://localhost:3000
```

## Manual Deployment (Alternative)

If you prefer manual deployment instead of using the script:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 5. Install PM2
sudo npm install -g pm2

# 6. Clone repository
cd /var/www
git clone your-git-repo-url kabulig
cd kabulig

# 7. Install dependencies
npm ci

# 8. Setup environment
cp .env.production.example .env
nano .env  # Edit with your values

# 9. Run migrations
npx prisma generate
npx prisma migrate deploy

# 10. Build application
npm run build

# 11. Start with PM2
pm2 start npm --name "kabulig" -- start
pm2 save
pm2 startup

# 12. Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/kabulig
sudo ln -sf /etc/nginx/sites-available/kabulig /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Troubleshooting

### Application not starting
```bash
pm2 logs kabulig
# Check for errors in the logs
```

### Database connection errors
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check DATABASE_URL in .env file
- Ensure database and user exist

### Nginx 502 Bad Gateway
- Check if Next.js app is running: `pm2 status`
- Verify port 3000 is accessible
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Permission issues
```bash
sudo chown -R $USER:$USER /var/www/kabulig
```

## Maintenance Commands

```bash
# Update application
cd /var/www/kabulig
git pull
npm ci
npm run build
pm2 restart kabulig

# View logs
pm2 logs kabulig

# Monitor resources
pm2 monit

# Restart Nginx
sudo systemctl restart nginx

# Backup database
pg_dump -U kabulig_user kabulig > backup.sql
```

## Security Recommendations

1. Use strong passwords for database and NEXTAUTH_SECRET
2. Enable firewall (UFW)
3. Keep system updated regularly
4. Use SSL/TLS for all connections
5. Regular database backups
6. Monitor logs for suspicious activity
