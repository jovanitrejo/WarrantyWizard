# WarrantyWizard - Test Guide & Documentation

## 📋 Table of Contents
1. [Application Overview](#application-overview)
2. [Quick Start](#quick-start)
3. [Test Data](#test-data)
4. [API Endpoints](#api-endpoints)
5. [Testing Scenarios](#testing-scenarios)
6. [Deployment Guide](#deployment-guide)

---

## 🎯 Application Overview

**WarrantyWizard** is an AI-powered warranty management system that helps enterprises track, manage, and optimize equipment warranties.

### Key Features
- ✅ **Dashboard** - Real-time overview of all warranties
- ✅ **Equipment Database** - Search and filter warranties
- ✅ **Warranty Calendar** - Visual timeline of expirations
- ✅ **AI Chat Assistant** - Natural language queries
- ✅ **Upload Orders** - CSV import or manual entry
- ✅ **Reports & Analytics** - Financial insights
- ✅ **Alerts** - Expiration notifications
- ✅ **Settings** - Customizable preferences

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Storage**: In-memory (demo) or PostgreSQL (production)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.11+ installed
- npm or yarn package manager

### Installation Steps

#### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

#### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### 3. Start Backend Server
```bash
cd backend
npm run dev
```
**Backend runs on:** `http://localhost:3001`

#### 4. Start Frontend Server
```bash
cd frontend
npm run dev
```
**Frontend runs on:** `http://localhost:5173`

#### 5. Open in Browser
Navigate to: **http://localhost:5173**

---

## 📊 Test Data

The application comes pre-loaded with **20 sample warranties** for testing.

### Sample Warranty Items

#### Expiring Soon (Next 30 Days)

1. **Toyota 8FGU25 Forklift**
   - Category: Material Handling
   - Serial: FKL-2024-001
   - Supplier: Grainger
   - Purchase Date: 2023-06-15
   - Warranty End: ~10 days from today
   - Cost: $28,000
   - Status: Expiring Soon

2. **Carrier 50TC 10-Ton HVAC Unit**
   - Category: HVAC
   - Serial: HVAC-2022-445
   - Supplier: Grainger
   - Purchase Date: 2022-03-10
   - Warranty End: ~21 days from today
   - Cost: $12,500
   - Status: Expiring Soon

3. **Generac 150kW Diesel Generator**
   - Category: Power Generation
   - Serial: GEN-2021-889
   - Supplier: Grainger
   - Purchase Date: 2021-11-20
   - Warranty End: ~29 days from today
   - Cost: $45,000
   - Status: Expiring Soon
   - **Note:** Has a filed claim ($3,200)

#### Expired Warranties

4. **Ingersoll Rand Air Compressor (15HP)**
   - Category: Compressed Air
   - Serial: COMP-2019-113
   - Supplier: Fastenal
   - Purchase Date: 2019-02-01
   - Warranty End: Expired 40 days ago
   - Cost: $8,900
   - Status: Expired

5. **Honeywell Barcode Scanner**
   - Category: IT/Devices
   - Serial: SCN-2024-772
   - Supplier: CDW
   - Purchase Date: 2024-08-05
   - Warranty End: Expired 5 days ago
   - Cost: $399
   - Status: Expired

#### Active Warranties (15 Items)

6-20. **Equipment Items 1-15**
   - Various categories: HVAC, Material Handling, Power Tools, IT/Devices, Safety, Lighting
   - Various suppliers: Grainger, Fastenal, Uline, CDW, MSC
   - Expiration dates: 60-165 days from today
   - Costs: $500 - $1,550 (incremental)
   - Status: Active

### Data Statistics
- **Total Warranties**: 20
- **Active**: ~15
- **Expiring Soon**: 3
- **Expired**: 2
- **Total Coverage Value**: ~$110,174
- **Claims Filed**: 1
- **Total Claim Amount**: $3,200

---

## 🔌 API Endpoints

### Health Check
```
GET /health
Response: { "ok": true, "service": "warrantywizard-backend" }
```

### Warranties

#### Get All Warranties
```
GET /api/warranties
Query Parameters:
  - status: "active" | "expiring_soon" | "expired" (optional)
  - q: search string (optional)

Example: GET /api/warranties?status=active&q=forklift
```

#### Get Expiring Warranties
```
GET /api/warranties/expiring?days=30
Response: { count, days, warranties: [...] }
```

#### Create Warranty
```
POST /api/warranties
Body: {
  "product_name": "Required",
  "purchase_date": "YYYY-MM-DD",
  "warranty_end": "YYYY-MM-DD",
  "category": "Optional",
  "serial_number": "Optional",
  "supplier": "Optional",
  "purchase_cost": 0
}
```

### Analytics
```
GET /api/analytics
Response: {
  totals: { total, active, expiring, expired },
  claims: { filed, total_claim_amount },
  estimated: { coverage_value }
}
```

### AI Chat
```
POST /api/ai-chat
Body: { "message": "Which items expire next month?" }
Response: { "reply": "...", "data": {...} }
```

---

## 🧪 Testing Scenarios

### Scenario 1: View Dashboard
1. Open `http://localhost:5173`
2. Verify you see:
   - 4 main cards (Active, Expiring, Expired, Alerts)
   - Analytics section at bottom
   - Navigation bar at top

### Scenario 2: Search Equipment
1. Click "Equipment" in navigation
2. Use search box to search for "Forklift"
3. Verify Toyota Forklift appears
4. Click on item to see details

### Scenario 3: View Calendar
1. Click "Calendar" in navigation
2. Navigate through months
3. Click on dates with warranties
4. Verify warranty list appears

### Scenario 4: Add New Warranty
1. Click "Add Warranty" button
2. Fill in form:
   - Product Name: "Test Equipment"
   - Purchase Date: Today's date
   - Warranty End: 1 year from today
   - Cost: $1000
3. Submit form
4. Verify it appears in Equipment list

### Scenario 5: Test AI Chat
1. Click "AI Chat" in navigation
2. Type: "Which items expire next month?"
3. Verify AI responds with list
4. Try: "How many active warranties do I have?"

### Scenario 6: View Reports
1. Click "Reports" in navigation
2. Verify analytics display:
   - Key metrics
   - Financial overview
   - Category breakdown
   - Supplier breakdown
   - Status distribution

### Scenario 7: Upload CSV
1. Click "Upload Orders" in navigation
2. Switch to "CSV Upload" tab
3. Create a CSV file with format:
   ```
   product_name,category,serial_number,supplier,purchase_date,warranty_end,purchase_cost
   Test Item,IT/Devices,SN-9999,Grainger,2024-01-01,2025-01-01,500
   ```
4. Upload and verify item appears

### Scenario 8: View Alerts
1. Click "Alerts" in navigation
2. Verify expiring warranties listed
3. Verify expired warranties listed
4. Check days remaining countdown

---

## 🌐 Deployment Guide

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variable**
   - In Vercel dashboard, add:
   - `VITE_API_URL=https://your-backend-url.com`

### Backend Deployment (Railway)

1. **Create Account** at railway.app
2. **New Project** → Deploy from GitHub
3. **Select Repository** and `backend` folder
4. **Deploy** - Railway auto-detects Node.js

### Alternative: Render.com

1. **Create Account** at render.com
2. **New Web Service**
3. **Connect GitHub** repository
4. **Settings**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

---

## 📝 Test Checklist

- [ ] Backend server starts on port 3001
- [ ] Frontend server starts on port 5173
- [ ] Dashboard loads with 20 warranties
- [ ] Navigation works between pages
- [ ] Search functionality works
- [ ] Calendar displays warranties
- [ ] AI Chat responds to queries
- [ ] Can add new warranty
- [ ] Reports show correct analytics
- [ ] Alerts display correctly
- [ ] Settings page loads

---

## 🔧 Troubleshooting

### Issue: Blank Page
**Solution:**
1. Check browser console (F12)
2. Verify backend is running: `curl http://localhost:3001/health`
3. Check Network tab for failed requests

### Issue: API Errors
**Solution:**
1. Verify backend is running on port 3001
2. Check CORS settings
3. Verify API URL in `vite.config.ts`

### Issue: Data Not Showing
**Solution:**
1. Check backend console for errors
2. Verify seed data loaded (should see 20 items)
3. Hard refresh browser (Cmd+Shift+R)

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify all dependencies installed
4. Ensure Node.js version is 20.11+

---

## 🎉 Ready to Test!

Your WarrantyWizard application is ready for testing. Follow the scenarios above to verify all features work correctly.

**Happy Testing! 🚀**

---

*Generated: $(date)*
*Version: 1.0.0*

