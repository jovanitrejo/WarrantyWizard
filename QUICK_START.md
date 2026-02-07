# WarrantyWizard - Quick Start Guide

## ✅ Your Application is Ready!

Your full-featured WarrantyWizard application is now complete and ready for deployment.

## 🎯 What You Have

A complete warranty management system with:

### ✨ Features
- **Dashboard** - Overview of all warranties with statistics
- **Equipment Database** - Search, filter, and view warranty details
- **Warranty Calendar** - Visual timeline of expirations
- **AI Chat Assistant** - Ask questions about warranties
- **Upload Orders** - CSV import or manual entry
- **Reports & Analytics** - Financial insights and breakdowns
- **Alerts** - Expiring and expired warranty notifications
- **Settings** - Customize alerts and team management

### 🏗️ Architecture
- **Frontend**: React 19 + TypeScript + Vite (Port 5173)
- **Backend**: Node.js + Express + TypeScript (Port 3001)
- **Data**: In-memory storage (20 sample warranties included)

## 🚀 Running Locally

### Start Backend
```bash
cd backend
npm install  # if not already done
npm run dev
```

### Start Frontend
```bash
cd frontend
npm install  # if not already done
npm run dev
```

### Access Application
Open your browser to: **http://localhost:5173**

## 🌐 Deploy to Production

### Step 1: Deploy Backend

**Option A: Railway.app** (Recommended)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo, choose `backend` folder
4. Deploy!

**Option B: Render.com**
1. Go to https://render.com
2. New Web Service
3. Connect GitHub repo
4. Root Directory: `backend`
5. Build: `npm install`
6. Start: `npm start`

### Step 2: Deploy Frontend

**Option A: Vercel** (Recommended)
1. Go to https://vercel.com
2. Import Project → Select your repo
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL=https://your-backend-url.com`
7. Deploy!

**Option B: Netlify**
1. Go to https://netlify.com
2. Add new site → Deploy manually
3. Build command: `cd frontend && npm run build`
4. Publish directory: `frontend/dist`
5. Add Environment Variable:
   - `VITE_API_URL=https://your-backend-url.com`

### Step 3: Update API URL

After backend is deployed, update frontend environment variable:
- `VITE_API_URL=https://your-backend-url.railway.app` (or your backend URL)

## 📦 Build for Production

```bash
# Frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend (no build needed)
cd backend
npm start
```

## 🎨 Customization

- **Colors**: Edit CSS files in `frontend/src/pages/*.css`
- **Branding**: Update title in `frontend/index.html`
- **API**: Modify endpoints in `frontend/src/services/api.ts`

## 📊 Sample Data

The app comes with 20 sample warranties including:
- Active warranties
- Expiring soon (next 30 days)
- Expired warranties
- Various categories (HVAC, Material Handling, etc.)

## 🔧 Troubleshooting

**Blank Page?**
- Check browser console (F12) for errors
- Verify backend is running on port 3001
- Check API calls in Network tab

**API Errors?**
- Verify backend URL in `vite.config.ts` or `VITE_API_URL`
- Check CORS settings in backend
- Ensure backend is accessible

## 📝 Next Steps

1. ✅ Test locally: `http://localhost:5173`
2. ✅ Deploy backend to Railway/Render
3. ✅ Deploy frontend to Vercel/Netlify
4. ✅ Update API URL in frontend
5. ✅ Test production deployment
6. ✅ Add custom domain (optional)

## 🎉 You're All Set!

Your WarrantyWizard application is production-ready and can be deployed to any hosting platform.

---

**Need Help?** Check `DEPLOYMENT.md` for detailed deployment instructions.

