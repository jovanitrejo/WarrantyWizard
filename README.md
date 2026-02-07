<<<<<<< HEAD
# WarrantyWizard Backend

AI-powered warranty management system for enterprises. Never lose money on expired warranties again.

## 🚀 Features

- **Warranty Management**: Track all equipment warranties in one place
- **AI Chatbot**: Natural language queries about warranties
- **Invoice OCR**: Upload invoices and auto-extract warranty info
- **Predictive Insights**: AI-powered risk assessment for warranties
- **Expiration Alerts**: Never miss a warranty deadline
- **Analytics Dashboard**: Comprehensive warranty analytics

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- OpenAI API key (for AI features)

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd warrantywizard-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up PostgreSQL database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE warrantywizard;

# Exit psql
\q
```

### 4. Configure environment variables
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your credentials
nano .env
```

**Required environment variables:**
- `DB_USER`: Your PostgreSQL username
- `DB_PASSWORD`: Your PostgreSQL password
- `OPENAI_API_KEY`: Your OpenAI API key

### 5. Initialize database
```bash
npm run seed
```

This will:
- Create all necessary tables
- Populate database with 20 sample warranties
- Display database summary

### 6. Start the server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Warranties

```
GET    /api/warranties              Get all warranties (with filters)
GET    /api/warranties/:id          Get single warranty
POST   /api/warranties              Create new warranty
PUT    /api/warranties/:id          Update warranty
DELETE /api/warranties/:id          Delete warranty
GET    /api/warranties/analytics    Get analytics/statistics
GET    /api/warranties/expiring/soon  Get expiring warranties
GET    /api/warranties/expired      Get expired warranties
POST   /api/warranties/:id/claim    File a warranty claim
POST   /api/warranties/:id/insights Generate AI insights
```

### AI Features

```
POST   /api/ai/chat                 Chat with AI assistant
POST   /api/ai/extract-invoice      Extract warranty from invoice text
GET    /api/ai/chat/history/:session_id  Get chat history
DELETE /api/ai/chat/history/:session_id  Clear chat history
```

### File Upload

```
POST   /api/upload/invoice          Upload and extract invoice data
POST   /api/upload/invoice/create   Upload invoice and create warranty
```

### Health Check

```
GET    /health                      Check API and database status
```

## 📝 Example API Usage

### Create a Warranty
```bash
curl -X POST http://localhost:5000/api/warranties \
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
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Which equipment warranties expire in the next 30 days?"
  }'
```

### Get Analytics
```bash
curl http://localhost:5000/api/warranties/analytics
```

## 🗄️ Database Schema

### warranties
- id, product_name, category, serial_number
- purchase_date, warranty_start, warranty_end
- warranty_length_months, purchase_cost
- supplier, status, claim_filed, claim_date
- claim_amount, notes, location, department

### alerts
- id, warranty_id, alert_type, alert_date
- sent, sent_at

### ai_insights
- id, warranty_id, insight_type
- confidence_score, message, recommendation

### chat_history
- id, session_id, role, content

## 🧪 Testing

Test the API with the included sample data:

```bash
# Get all warranties
curl http://localhost:5000/api/warranties

# Get expiring soon
curl http://localhost:5000/api/warranties/expiring/soon?days=30

# Get analytics
curl http://localhost:5000/api/warranties/analytics
```

## 🔧 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running
```bash
# On macOS
brew services start postgresql

# On Linux
sudo systemctl start postgresql
```

### OpenAI API Error
```
Error: Invalid API key
```
**Solution**: Add valid OpenAI API key to `.env` file

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in `.env` or kill process using port 5000

## 📦 Project Structure

```
warrantywizard-backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Database connection
│   │   └── schema.js        # Database schema
│   ├── controllers/
│   │   ├── warrantyController.js
│   │   ├── aiController.js
│   │   └── uploadController.js
│   ├── models/
│   │   ├── Warranty.js
│   │   └── Alert.js
│   ├── routes/
│   │   ├── warrantyRoutes.js
│   │   ├── aiRoutes.js
│   │   └── uploadRoutes.js
│   ├── services/
│   │   └── AIService.js     # OpenAI integration
│   ├── middleware/
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── seed.js          # Database seeding
│   └── server.js            # Main server file
├── uploads/                  # Uploaded files
├── .env                      # Environment variables
├── .gitignore
├── package.json
└── README.md
```


## 📄 License

MIT

## 👥 Contributors

Sailesh Senthilkumar, 
Nathan Thokkudubiyyapu, 
Jovani Trejo

---

Track 3: Shop Savvy with Grainger
=======
# WarrantyWizard - AI-Powered Warranty Management System

Never lose money on expired warranties again. Track, manage, and optimize your equipment warranties with AI-powered insights.

## 🚀 Features

- **📊 Dashboard** - Comprehensive overview of all warranties
- **🔍 Equipment Database** - Search, filter, and manage warranties
- **📅 Warranty Calendar** - Visual timeline of expirations
- **🤖 AI Chat Assistant** - Natural language queries about warranties
- **📤 Upload Orders** - CSV import or manual entry
- **📈 Reports & Analytics** - Financial insights and statistics
- **⚠️ Alerts** - Never miss an expiration
- **⚙️ Settings** - Customize alerts and team management

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Styling**: CSS3 with modern design

## 📦 Installation

### Prerequisites
- Node.js 20.11+ 
- npm or yarn

### Setup

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Start Backend Server**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:3001`

4. **Start Frontend Server**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

## 🌐 Deployment

### Build for Production

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Deploy**
- Frontend: Deploy the `dist` folder to any static hosting (Vercel, Netlify, etc.)
- Backend: Deploy to any Node.js hosting (Railway, Render, etc.)

### Environment Variables

**Backend** (`.env`):
```
PORT=3001
```

**Frontend**: Update `vite.config.ts` proxy target for production API URL.

## 📡 API Endpoints

- `GET /api/warranties` - Get all warranties
- `GET /api/warranties/expiring?days=30` - Get expiring warranties
- `GET /api/analytics` - Get analytics
- `POST /api/warranties` - Create warranty
- `POST /api/ai-chat` - AI chat assistant

## 🎯 Usage

1. Open `http://localhost:5173` in your browser
2. View the dashboard with warranty overview
3. Navigate through different sections using the top menu
4. Add warranties manually or upload CSV files
5. Use AI chat to ask questions about warranties
6. View calendar for visual timeline
7. Check reports for analytics

## 📝 License

MIT

---

Built with ❤️ for efficient warranty management
>>>>>>> cc96240 (updates)
