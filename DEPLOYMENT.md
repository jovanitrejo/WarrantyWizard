# WarrantyWizard Deployment Guide

## 🚀 Quick Deploy to Vercel (Frontend) + Railway/Render (Backend)

### Option 1: Vercel (Recommended for Frontend)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy Frontend**
```bash
cd frontend
vercel
```

3. **Update API Proxy**
   - After deployment, update `vite.config.ts` with your backend URL
   - Or set environment variable `VITE_API_URL` in Vercel dashboard

### Option 2: Netlify

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Deploy**
   - Drag and drop the `dist` folder to Netlify
   - Or connect GitHub repo for auto-deploy

### Backend Deployment (Railway/Render)

1. **Create Account** on Railway.app or Render.com

2. **Connect Repository**
   - Link your GitHub repo
   - Select the `backend` folder

3. **Set Environment Variables**
   - `PORT=3001` (or let platform assign)

4. **Deploy**
   - Platform will auto-detect Node.js
   - Deploy!

### Environment Setup

**Frontend** (Vercel/Netlify):
- `VITE_API_URL=https://your-backend-url.com` (if not using proxy)

**Backend** (Railway/Render):
- `PORT=3001` (optional, platform usually assigns)

## 📦 Build Commands

### Frontend Build
```bash
cd frontend
npm run build
```
Output: `frontend/dist/`

### Backend (No build needed for Node.js)
Just ensure `npm start` works:
```bash
cd backend
npm start
```

## 🔗 After Deployment

1. **Update Frontend API URL**
   - In `vite.config.ts`, change proxy target to your backend URL
   - Or use environment variable `VITE_API_URL`

2. **Test**
   - Visit your frontend URL
   - Check browser console for errors
   - Test API calls

## 🌍 Custom Domain

1. **Frontend**: Add domain in Vercel/Netlify settings
2. **Backend**: Add domain in Railway/Render settings
3. **Update CORS**: Allow your frontend domain in backend CORS settings

---

**Your app is now live! 🎉**

