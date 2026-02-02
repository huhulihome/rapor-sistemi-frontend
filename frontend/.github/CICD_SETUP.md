# CI/CD Pipeline Setup Guide

## Overview

This project uses GitHub Actions for continuous integration and deployment. The pipeline automatically tests, builds, and deploys both frontend and backend applications.

## Workflows

### 1. CI Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **Frontend Tests**: Linting, unit tests, and build verification
- **Backend Tests**: Linting, unit tests, and build verification
- **Security Audit**: Dependency vulnerability scanning

### 2. Production Deployment (`deploy-production.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**
- **Test**: Runs full CI pipeline
- **Deploy Frontend**: Deploys to Vercel production
- **Deploy Backend**: Deploys to Railway production
- **Health Check**: Verifies deployment success

### 3. Staging Deployment (`deploy-staging.yml`)

**Triggers:**
- Push to `develop` branch
- Manual workflow dispatch

**Jobs:**
- **Test**: Runs full CI pipeline
- **Deploy Frontend**: Deploys to Vercel preview
- **Deploy Backend**: Deploys to Railway staging

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Vercel Secrets
```
VERCEL_TOKEN          # Vercel authentication token
VERCEL_ORG_ID         # Your Vercel organization ID
VERCEL_PROJECT_ID     # Your Vercel project ID
```

### Railway Secrets
```
RAILWAY_TOKEN         # Railway authentication token
```

### Health Check URLs
```
FRONTEND_URL          # Production frontend URL (e.g., https://your-app.vercel.app)
BACKEND_URL           # Production backend URL (e.g., https://your-api.railway.app)
```

## Setup Instructions

### 1. Vercel Setup

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   cd frontend
   vercel link
   ```

4. Get your Vercel token:
   - Go to https://vercel.com/account/tokens
   - Create a new token
   - Add it as `VERCEL_TOKEN` secret in GitHub

5. Get project IDs:
   ```bash
   vercel project ls
   ```
   - Add `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` as GitHub secrets

### 2. Railway Setup

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Create a new project:
   ```bash
   cd backend
   railway init
   ```

4. Get your Railway token:
   - Go to https://railway.app/account/tokens
   - Create a new token
   - Add it as `RAILWAY_TOKEN` secret in GitHub

5. Configure Railway service:
   ```bash
   railway service create backend
   railway service create backend-staging
   ```

### 3. Environment Variables

#### Frontend (Vercel)

Set these in Vercel dashboard or via CLI:

```bash
# Production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_API_URL production

# Preview (Staging)
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview
vercel env add VITE_API_URL preview
```

#### Backend (Railway)

Set these in Railway dashboard or via CLI:

```bash
# Production
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set SUPABASE_URL=your_supabase_url
railway variables set SUPABASE_SERVICE_KEY=your_service_key
railway variables set GMAIL_USER=your_email
railway variables set GMAIL_APP_PASSWORD=your_app_password
railway variables set FRONTEND_URL=your_frontend_url

# Staging (switch to staging service first)
railway service use backend-staging
railway variables set NODE_ENV=staging
# ... repeat for other variables
```

## Workflow Behavior

### On Pull Request
1. Runs all tests (frontend + backend)
2. Performs security audit
3. Comments build status on PR
4. Does NOT deploy

### On Push to `develop`
1. Runs all tests
2. Deploys to staging environment
3. Comments deployment URLs

### On Push to `main`
1. Runs all tests
2. Deploys to production
3. Runs health checks
4. Notifies on failure

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select workflow (Production or Staging)
3. Click "Run workflow"
4. Select branch and run

## Monitoring Deployments

### Vercel
- Dashboard: https://vercel.com/dashboard
- Deployment logs: Available in Vercel dashboard
- Rollback: Use Vercel dashboard to rollback to previous deployment

### Railway
- Dashboard: https://railway.app/dashboard
- Deployment logs: Available in Railway dashboard
- Rollback: Use Railway dashboard to redeploy previous version

## Troubleshooting

### Build Failures

**Frontend build fails:**
```bash
# Test locally
cd frontend
npm ci
npm run build
```

**Backend build fails:**
```bash
# Test locally
cd backend
npm ci
npm run build
```

### Deployment Failures

**Vercel deployment fails:**
- Check Vercel token is valid
- Verify project is linked correctly
- Check environment variables are set

**Railway deployment fails:**
- Check Railway token is valid
- Verify service exists
- Check environment variables are set

### Health Check Failures

**Backend health check fails:**
- Verify backend is running: `curl https://your-api.railway.app/health`
- Check Railway logs for errors
- Verify database connection

**Frontend health check fails:**
- Verify frontend is accessible
- Check Vercel deployment logs
- Verify API URL is correct

## Best Practices

1. **Always test locally before pushing:**
   ```bash
   npm run test
   npm run build
   ```

2. **Use feature branches:**
   - Create feature branch from `develop`
   - Open PR to `develop` for review
   - Merge to `develop` for staging deployment
   - Merge to `main` for production deployment

3. **Monitor deployments:**
   - Check GitHub Actions for build status
   - Verify deployment in Vercel/Railway dashboards
   - Test deployed application

4. **Handle secrets securely:**
   - Never commit secrets to repository
   - Rotate tokens regularly
   - Use environment-specific secrets

## Rollback Procedure

### Frontend Rollback (Vercel)
1. Go to Vercel dashboard
2. Select your project
3. Go to Deployments tab
4. Find previous working deployment
5. Click "Promote to Production"

### Backend Rollback (Railway)
1. Go to Railway dashboard
2. Select your project
3. Go to Deployments tab
4. Find previous working deployment
5. Click "Redeploy"

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Railway CLI Documentation](https://docs.railway.app/develop/cli)
