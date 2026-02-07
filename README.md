# WarrantyWizard - AI-Powered Warranty Management System

**Never lose money on expired warranties again.** Track, manage, and optimize your equipment warranties with AI-powered insights.

Built for **Track 3: Shop Savvy with Grainger**

---

## Overview

WarrantyWizard is a comprehensive warranty management system designed for enterprises. It helps businesses track equipment warranties, receive proactive alerts, and leverage AI to maximize warranty benefits - preventing the millions of dollars lost annually to expired warranties.

### Key Highlights
- **AI-Powered**: GPT-4 integration for natural language queries and intelligent invoice extraction
- **Real-Time Analytics**: Comprehensive dashboard with financial insights
- **Proactive Alerts**: Never miss a warranty expiration
- **Zero Manual Entry**: AI extracts warranty data from PDF invoices automatically
- **Predictive Analytics**: Risk assessment to prevent warranty losses
- **Accessible Design**: Built for users of all ages and technical levels

---

## Features

### Core Features
- **Dashboard** - Real-time overview of all warranties with statistics
- **Equipment Database** - Search, filter, and manage warranties
- **Warranty Calendar** - Visual timeline of warranty expirations
- **AI Chat Assistant** - Natural language queries about warranties
- **Upload Orders** - CSV import, PDF upload, or manual entry
- **Reports & Analytics** - Financial insights and predictive analytics
- **Alerts** - Automatic notifications for expiring warranties
- **Settings** - Customize alerts and team management

### AI Features
- **Natural Language Chat** - Ask questions in plain English
- **Intelligent PDF Extraction** - Automatically extract warranty data from invoices
- **Predictive Risk Scoring** - Identify equipment at risk before warranty expires
- **Smart Recommendations** - AI-powered maintenance suggestions

---

## Architecture

### Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- React Router (navigation)
- Axios (API calls)
- Recharts (data visualization)
- CSS3 (styling)

**Backend:**
- Node.js + Express
- TypeScript
- In-memory storage (demo) or PostgreSQL (production)
- Multer (file uploads)
- pdf-parse (PDF text extraction)
- OpenAI API (GPT-4 integration)

**Database (Optional):**
- PostgreSQL 14+
- Full CRUD operations
- Optimized queries

---

## Prerequisites

- **Node.js** 20.11+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **PostgreSQL** 14+ (optional, for production database)
- **OpenAI API Key** (for AI features) - [Get one here](https://platform.openai.com/api-keys)

---

## Installation & Setup

### Quick Start (In-Memory Storage - Demo Mode)

This setup uses in-memory storage and is perfect for quick demos and testing.

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd WarrantyWizard-main
```

#### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

#### 4. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
cd ../backend
# Create .env file
touch .env
```

Add to `backend/.env`:
```env
PORT=3001
OPENAI_API_KEY=your-openai-api-key-here
```

**Note**: The backend includes 12 sample warranties by default (no database setup needed for demo mode).

#### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

#### 6. Open in Browser
Navigate to: **http://localhost:5173**

---

### Full Setup (With PostgreSQL Database)

For production use with persistent data storage.

#### 1. Set Up PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE warrantywizard;

# Exit psql
\q
```

#### 2. Configure Database Backend

If using the `database/` folder backend:

```bash
cd database
npm install
```

Create `database/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=warrantywizard
OPENAI_API_KEY=your-openai-api-key-here
PORT=3001
```

#### 3. Initialize Database
```bash
cd database
npm run seed
```

#### 4. Start Database Backend
```bash
npm run dev
```

#### 5. Update Frontend Configuration

Update `frontend/vite.config.ts` to point to the database backend:
```typescript
proxy: {
  "/api": {
    target: "http://localhost:3001", // Database backend
    changeOrigin: true,
  },
}
```

---

## API Endpoints

### Warranties

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/warranties` | Get all warranties (with optional filters) |
| `GET` | `/api/warranties/expiring?days=30` | Get warranties expiring soon |
| `GET` | `/api/analytics` | Get analytics and statistics |
| `POST` | `/api/warranties` | Create new warranty |
| `DELETE` | `/api/warranties/:id` | Delete warranty |

### AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai-chat` | Chat with AI assistant |
| `POST` | `/api/upload/invoice/create` | Upload PDF and extract warranties |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check API status |

---

## Example API Usage

### Create a Warranty
```bash
curl -X POST http://localhost:3001/api/warranties \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Industrial Air Compressor",
    "category": "Compressed Air",
    "serial_number": "AC-2024-999",
    "purchase_date": "2024-01-15",
    "warranty_end": "2027-01-15",
    "purchase_cost": 15000,
    "supplier": "Grainger"
  }'
```

### Chat with AI
```bash
curl -X POST http://localhost:3001/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Which warranties expire in the next 30 days?"
  }'
```

### Get Analytics
```bash
curl http://localhost:3001/api/analytics
```

### Upload PDF Invoice
```bash
curl -X POST http://localhost:3001/api/upload/invoice/create \
  -F "invoice=@/path/to/invoice.pdf"
```

---

## Database Schema

### Warranties Table
```sql
CREATE TABLE warranties (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  serial_number VARCHAR(100),
  supplier VARCHAR(100),
  purchase_date DATE NOT NULL,
  warranty_start DATE NOT NULL,
  warranty_end DATE NOT NULL,
  warranty_length_months INTEGER,
  purchase_cost DECIMAL(10, 2),
  status VARCHAR(50), -- active, expiring_soon, expired
  claim_filed BOOLEAN DEFAULT false,
  claim_date DATE,
  claim_amount DECIMAL(10, 2),
  notes TEXT,
  invoice_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Alerts Table
```sql
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  warranty_id INTEGER REFERENCES warranties(id) ON DELETE CASCADE,
  alert_type VARCHAR(50), -- 30_day, 7_day, expired
  alert_date DATE NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Project Structure

```
WarrantyWizard-main/
├── backend/                 # Backend API (In-memory storage)
│   ├── src/
│   │   └── index.ts        # Main server file
│   ├── .env                # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── database/                # Alternative backend (PostgreSQL)
│   ├── src/
│   │   ├── server.js       # Database server
│   │   ├── config/
│   │   │   └── database.js # DB connection
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   └── services/
│   │       └── AIService.js # OpenAI integration
│   ├── .env
│   └── package.json
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── UploadModal.tsx
│   │   │   ├── AnalyticsCharts.tsx
│   │   │   └── PredictiveAnalytics.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EquipmentDatabase.tsx
│   │   │   ├── WarrantyCalendar.tsx
│   │   │   ├── AIChat.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── Alerts.tsx
│   │   ├── services/
│   │   │   └── api.ts      # API client
│   │   ├── router.tsx       # Routing
│   │   └── main.tsx        # Entry point
│   ├── vite.config.ts      # Vite configuration
│   ├── package.json
│   └── tsconfig.json
│
├── README.md               # This file
├── DEMO_VIDEO_SCRIPT.md    # Demo presentation script
└── QUICK_START.md          # Quick start guide
```

---

## Usage Guide

### Adding Warranties

1. **Manual Entry:**
   - Click "Upload Orders" in navigation
   - Select "Manual Entry"
   - Fill in warranty details
   - Click "Add Warranty"

2. **CSV Upload:**
   - Click "Upload Orders"
   - Select "CSV Upload"
   - Upload CSV file with warranty data

3. **PDF Invoice Upload:**
   - Click "Upload Orders"
   - Select "PDF Invoice"
   - Upload PDF invoice
   - AI automatically extracts warranty data
   - Multiple warranties created from table data

### Using AI Chat

1. Navigate to "AI Chat" in the menu
2. Type questions in plain English:
   - "Which warranties expire this month?"
   - "What's the total value of all active warranties?"
   - "Which equipment has the highest risk?"
3. Get instant, intelligent responses

### Viewing Analytics

1. Go to "Dashboard" for overview
2. Navigate to "Reports" for detailed analytics:
   - Total warranties and value
   - Warranties by supplier
   - Predictive analytics for at-risk items

### Calendar View

1. Click "Calendar" in navigation
2. See visual timeline of warranty expirations
3. Click on dates to see warranties expiring

---

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel:**
   - Connect GitHub repository
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Update API URL:**
   - Set environment variable: `VITE_API_URL=https://your-backend-url.com`

### Backend Deployment (Railway/Render)

1. **Deploy to Railway:**
   - Connect GitHub repository
   - Root directory: `backend`
   - Add environment variables from `.env`
   - Deploy!

2. **Or deploy to Render:**
   - New Web Service
   - Connect GitHub repo
   - Root directory: `backend`
   - Build: `npm install`
   - Start: `npm start`

### Database Setup (Production)

1. Set up PostgreSQL database (Railway, Render, or AWS RDS)
2. Update `DATABASE_URL` in backend `.env`
3. Run migrations/seeding if needed

---

### Sample Data

The application comes pre-loaded with **12-13 sample warranties** including:
- Active warranties
- Expiring soon (next 30 days)
- Expired warranties
- Various categories (HVAC, Material Handling, Power Tools, etc.)

---

## Key Features Explained

### AI-Powered PDF Extraction
- Upload a PDF invoice
- AI (GPT-4) extracts text and intelligently parses table data
- Automatically creates multiple warranties (one per row)
- Zero manual data entry required

### Predictive Analytics
- Calculates risk scores for each warranty
- Identifies equipment likely to need service
- Recommends proactive maintenance
- Prevents warranty losses

### Natural Language Chat
- Ask questions in plain English
- No SQL or technical knowledge needed
- AI understands context and provides insights
- Accessible to all users
