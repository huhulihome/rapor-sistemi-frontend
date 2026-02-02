# Production Deployment Guide

## Overview

This guide covers deploying the Modern Office System to production using free-tier services:
- **Frontend**: Vercel (Free tier)
- **Backend**: Railway (Free tier)
- **Database**: Supabase (Free tier)

## Prerequisites

- GitHub account with repository access
- Vercel account (sign up at https://vercel.com)
- Railway account (sign up at https://railway.app)
- Supabase account (sign up at https://supabase.com)
- Node.js 18+ installed locally

## Part 1: Supabase Database Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - Name: `modern-office-system`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 1.2 Run Database Migrations

1. Go to SQL Editor in Supabase dashboard
2. Run the initial schema migration:
   ```sql
   -- Copy content from backend/supabase/migrations/001_initial_schema.sql
   -- Paste and execute
   ```
3. Run the RLS policies migration:
   ```sql
   -- Copy content from backend/supabase/migrations/002_row_level_security.sql
   -- Paste and execute
   ```

### 1.3 Get Supabase Credentials

1. Go to Project Settings > API
2. Copy these values (you'll need them later):
   - Project URL: `https://xxxxx.supabase.co`
   - `anon` public key
   - `service_role` secret key (keep this secure!)

### 1.4 Configure Authentication

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates (optional)
4. Set Site URL to your frontend URL (will update after Vercel deployment)

## Part 2: Backend Deployment (Railway)

### 2.1 Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2.2 Login to Railway

```bash
railway login
```

### 2.3 Create Railway Project

```bash
cd backend
railway init
```

Follow prompts:
- Create new project: Yes
- Project name: `modern-office-system-backend`

### 2.4 Create Service

```bash
railway service create backend
```

### 2.5 Configure Environment Variables

Set these variables in Railway dashboard or via CLI:

```bash
# Database
railway variables set SUPABASE_URL=https://xxxxx.supabase.co
railway variables set SUPABASE_SERVICE_KEY=your_service_role_key

# Email (Gmail)
railway variables set GMAIL_USER=your-email@gmail.com
railway variables set GMAIL_APP_PASSWORD=your_app_password

# Application
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set FRONTEND_URL=https://your-app.vercel.app

# CORS
railway variables set CORS_ORIGIN=https://your-app.vercel.app
```

#### Getting Gmail App Password:

1. Go to Google Account settings
2. Security > 2-Step Verification (enable if not already)
3. App passwords > Generate new app password
4. Select "Mail" and "Other (Custom name)"
5. Copy the 16-character password

### 2.6 Deploy Backend

```bash
railway up
```

### 2.7 Get Backend URL

```bash
railway status
```

Copy the deployment URL (e.g., `https://your-app.railway.app`)

### 2.8 Verify Deployment

```bash
curl https://your-app.railway.app/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## Part 3: Frontend Deployment (Vercel)

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Login to Vercel

```bash
vercel login
```

### 3.3 Link Project

```bash
cd frontend
vercel link
```

Follow prompts:
- Set up and deploy: Yes
- Scope: Your account
- Link to existing project: No
- Project name: `modern-office-system`
- Directory: `./`

### 3.4 Configure Environment Variables

#### Via Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add these variables for **Production**:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://your-app.railway.app
```

#### Via CLI:

```bash
vercel env add VITE_SUPABASE_URL production
# Paste value when prompted

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste value when prompted

vercel env add VITE_API_URL production
# Paste value when prompted
```

### 3.5 Deploy Frontend

```bash
vercel --prod
```

### 3.6 Get Frontend URL

After deployment completes, you'll see:
```
✅ Production: https://your-app.vercel.app
```

## Part 4: Post-Deployment Configuration

### 4.1 Update Backend CORS

Update Railway environment variable:

```bash
railway variables set CORS_ORIGIN=https://your-actual-app.vercel.app
railway variables set FRONTEND_URL=https://your-actual-app.vercel.app
```

Redeploy backend:

```bash
railway up
```

### 4.2 Update Supabase Site URL

1. Go to Supabase dashboard
2. Authentication > URL Configuration
3. Set Site URL: `https://your-actual-app.vercel.app`
4. Add Redirect URLs:
   - `https://your-actual-app.vercel.app/auth/callback`
   - `https://your-actual-app.vercel.app/login`

### 4.3 Update GitHub Secrets

Add these secrets to your GitHub repository for CI/CD:

1. Go to GitHub repository > Settings > Secrets and variables > Actions
2. Add these secrets:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
RAILWAY_TOKEN=your_railway_token
FRONTEND_URL=https://your-actual-app.vercel.app
BACKEND_URL=https://your-actual-app.railway.app
```

#### Getting Vercel Token:
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Copy and save

#### Getting Vercel IDs:
```bash
cd frontend
vercel project ls
```

#### Getting Railway Token:
1. Go to https://railway.app/account/tokens
2. Create new token
3. Copy and save

## Part 5: Create Admin User

### 5.1 Sign Up First User

1. Go to your deployed frontend: `https://your-app.vercel.app`
2. Click "Register"
3. Create account with email and password
4. Check email for verification link (if enabled)

### 5.2 Promote to Admin

1. Go to Supabase dashboard
2. Table Editor > profiles
3. Find your user
4. Edit the `role` field to `admin`
5. Save changes

### 5.3 Verify Admin Access

1. Logout and login again
2. You should now see admin features:
   - Admin Dashboard
   - Issue Management
   - User Management

## Part 6: Verification Checklist

### Frontend Checks
- [ ] Frontend loads at Vercel URL
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Dashboard displays correctly
- [ ] Can create tasks
- [ ] Can create issues
- [ ] PWA install prompt appears (mobile)
- [ ] Offline mode works

### Backend Checks
- [ ] Health endpoint responds: `/health`
- [ ] API endpoints accessible
- [ ] CORS configured correctly
- [ ] Authentication works
- [ ] Database queries execute
- [ ] Email notifications send

### Database Checks
- [ ] Tables created correctly
- [ ] RLS policies active
- [ ] Users can only see their data
- [ ] Admins can see all data
- [ ] Real-time subscriptions work

### Integration Checks
- [ ] Frontend connects to backend
- [ ] Backend connects to database
- [ ] Email notifications work
- [ ] Real-time updates work
- [ ] File uploads work (if implemented)

## Part 7: Monitoring Setup

### 7.1 Vercel Analytics

1. Go to Vercel dashboard
2. Select project > Analytics
3. Enable Web Analytics (free)

### 7.2 Railway Metrics

1. Go to Railway dashboard
2. Select project > Metrics
3. Monitor CPU, Memory, Network usage

### 7.3 Supabase Monitoring

1. Go to Supabase dashboard
2. Database > Usage
3. Monitor database size, connections, queries

## Troubleshooting

### Frontend Issues

**Build fails on Vercel:**
```bash
# Test build locally
cd frontend
npm ci
npm run build
```

**Environment variables not working:**
- Ensure variables start with `VITE_`
- Redeploy after adding variables
- Check Vercel deployment logs

**CORS errors:**
- Verify `VITE_API_URL` is correct
- Check backend CORS configuration
- Ensure Railway backend is running

### Backend Issues

**Railway deployment fails:**
```bash
# Check logs
railway logs

# Test build locally
cd backend
npm ci
npm run build
npm start
```

**Database connection fails:**
- Verify Supabase URL and keys
- Check Supabase project is active
- Test connection from Railway logs

**Email not sending:**
- Verify Gmail credentials
- Check app password is correct
- Enable "Less secure app access" if needed
- Check Railway logs for errors

### Database Issues

**RLS policies blocking queries:**
- Check user is authenticated
- Verify JWT token is valid
- Check RLS policies in Supabase

**Migrations not applied:**
- Run migrations manually in SQL Editor
- Check for syntax errors
- Verify table structure

## Rollback Procedure

### Rollback Frontend
```bash
# Via Vercel dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

# Via CLI
vercel rollback
```

### Rollback Backend
```bash
# Via Railway dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click "Redeploy"

# Via CLI
railway rollback
```

## Cost Monitoring

### Free Tier Limits

**Vercel:**
- 100 GB bandwidth/month
- Unlimited deployments
- 100 GB-hours compute time

**Railway:**
- $5 free credit/month
- ~500 hours runtime
- 1 GB RAM, 1 vCPU

**Supabase:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

### Monitoring Usage

1. **Vercel**: Dashboard > Usage
2. **Railway**: Dashboard > Usage
3. **Supabase**: Dashboard > Usage

## Scaling Considerations

When you outgrow free tiers:

1. **Vercel Pro** ($20/month):
   - More bandwidth
   - Better performance
   - Team collaboration

2. **Railway Pro** ($20/month):
   - More resources
   - Better uptime
   - Priority support

3. **Supabase Pro** ($25/month):
   - More database storage
   - Daily backups
   - Better performance

## Support Resources

- **Vercel**: https://vercel.com/docs
- **Railway**: https://docs.railway.app
- **Supabase**: https://supabase.com/docs
- **GitHub Actions**: https://docs.github.com/actions

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic on Vercel)
3. Set up monitoring alerts
4. Create backup strategy
5. Document operational procedures
6. Train users on the system
