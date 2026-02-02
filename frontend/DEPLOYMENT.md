# Modern Office System - Deployment Guide

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)
Recommended for quick deployment with minimal configuration.

### Option 2: Docker (Self-hosted)
For full control and self-hosted environments.

---

## Environment Variables

### Frontend (.env.production)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend-url.com
```

### Backend (.env.production)
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
CORS_ORIGIN=https://your-frontend-url.com
```

---

## Vercel + Railway Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Set environment variables
3. Deploy `backend` folder

---

## Docker Deployment

### Build & Run
```bash
# Backend
cd backend
docker build -t mos-backend .
docker run -p 3001:3001 --env-file .env.production mos-backend

# Frontend
cd frontend
npm run build
# Serve with nginx or similar
```

---

## Production Checklist

- [ ] Set production environment variables
- [ ] Run `004_notifications_table.sql` in Supabase
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring (optional)

---

## Quick Commands

| Task | Command |
|------|---------|
| Build Frontend | `cd frontend && npm run build` |
| Build Backend | `cd backend && npm run build` |
| Start Backend | `npm start` |
| Run Tests | `npm run test` |
