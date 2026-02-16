# Vercel Deployment Management Guide

## 🗑️ How to Delete Existing Vercel Deployment

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Login to your account

2. **Find Your Project**
   - Look for "99-sellers" or your project name
   - Click on the project

3. **Delete the Project**
   - Click on "Settings" tab
   - Scroll down to "Danger Zone"
   - Click "Delete Project"
   - Confirm deletion

4. **Verify Deletion**
   - Project should disappear from dashboard
   - URL should become inaccessible

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# List your projects
vercel ls

# Delete the specific project
vercel rm 99-sellers
```

## 🚀 How to Create New Vercel Deployment

### Step 1: Prepare Your Code

1. **Ensure Your Code is Ready**
   ```bash
   # Make sure you're on the correct branch
   git checkout main
   
   # Pull latest changes
   git pull origin main
   
   # Verify your backend structure
   ls -la backend/
   ```

2. **Check Vercel Configuration**
   - Verify `vercel.json` exists in root directory
   - Check `package.json` has correct build scripts

### Step 2: Deploy to Vercel

#### Option A: Via Vercel CLI (Recommended)
```bash
# Navigate to your project root
cd c:\Users\nyash\99sellers

# Deploy to Vercel
vercel --prod

# Follow the prompts:
# - Link to existing project? NO
# - Project name: 99-sellers-new (or your choice)
# - Directory: backend
# - Build command: npm run build
# - Output directory: .
# - Development settings: NO
```

#### Option B: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. "Import Git Repository"
4. Select your GitHub repository
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** backend
   - **Build Command:** npm run build
   - **Output Directory:** .
   - **Install Command:** npm install
6. Click "Deploy"

### Step 3: Configure Environment Variables

1. **Go to Project Settings**
   - In Vercel dashboard, click your new project
   - Go to "Settings" → "Environment Variables"

2. **Add Required Variables**
   ```
   NODE_ENV=production
   DB_HOST=gondola.proxy.rlwy.net
   DB_USER=root
   DB_PASSWORD=oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW
   DB_NAME=railway
   DB_PORT=32219
   JWT_SECRET=your_jwt_secret_here
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### Step 4: Verify Deployment

1. **Check Deployment URL**
   - Vercel will provide a new URL
   - Format: `https://your-project-name.vercel.app`

2. **Test Health Endpoint**
   ```bash
   curl https://your-project-name.vercel.app/health
   ```

3. **Test API Endpoints**
   ```bash
   curl https://your-project-name.vercel.app/api/admin/owners
   ```

## 🔧 Vercel Configuration File

Ensure your `vercel.json` is properly configured:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/index.js"
    }
  ],
  "functions": {
    "backend/index.js": {
      "maxDuration": 10
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

## ⚠️ Important Notes

### Railway Database Connection
- Your Vercel app will connect to Railway database
- Ensure Railway database is accessible from external services
- Check Railway firewall settings if needed

### Domain Configuration
- After deployment, you can add custom domain
- Go to Vercel project → Settings → Domains
- Add your custom domain and configure DNS

### Monitoring
- Check Vercel logs for any deployment issues
- Monitor Railway logs for database connection issues
- Use Vercel Analytics for performance monitoring

## 🚨 Troubleshooting

### Common Issues:
1. **Build Failures:** Check package.json scripts
2. **Database Connection:** Verify Railway credentials
3. **CORS Issues:** Update FRONTEND_URL
4. **Timeout Errors:** Increase maxDuration in vercel.json

### Quick Fixes:
```bash
# Clear Vercel cache
vercel --prod --force

# Redeploy latest changes
git add .
git commit -m "Update for Vercel deployment"
git push origin main
vercel --prod
```

## 📋 Deployment Checklist

Before deploying:
- [ ] Railway database is accessible
- [ ] Environment variables are set
- [ ] vercel.json is configured
- [ ] package.json has build script
- [ ] All dependencies are in package.json

After deploying:
- [ ] Health endpoint responds
- [ ] API endpoints work
- [ ] Database connection successful
- [ ] No errors in Vercel logs

This should give you a fresh Vercel deployment connected to your Railway database! 🚀
