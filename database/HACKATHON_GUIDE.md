# WarrantyWizard Backend - Quick Start Guide for Hackathon

## ⚡ 5-Minute Setup

### 1. Prerequisites Check
```bash
node --version    # Should be v18+
psql --version    # Should have PostgreSQL installed
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Create database
createdb warrantywizard

# Or using psql
psql -U postgres -c "CREATE DATABASE warrantywizard;"
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env and add:
# - Your PostgreSQL credentials
# - OpenAI API key
```

### 5. Seed Database
```bash
npm run seed
```

### 6. Start Server
```bash
npm run dev
```

Server runs at: `http://localhost:5000` ✅

---

## 🎯 Hackathon Demo Checklist

### Before Demo
- [ ] Server is running (`npm run dev`)
- [ ] Database has sample data (`npm run seed`)
- [ ] OpenAI API key is working (test chat endpoint)
- [ ] Have sample invoice PDF ready for upload demo

### Demo Flow (3 minutes)
1. **Show Dashboard** (30 sec)
   - `GET /api/warranties` - Show all warranties
   - `GET /api/warranties/analytics` - Show business value

2. **AI Chatbot** (60 sec) 🌟 MOST IMPRESSIVE
   - `POST /api/ai/chat` with question
   - Example: "Which warranties expire this month?"
   - Show natural language response

3. **Invoice Upload** (45 sec)
   - `POST /api/upload/invoice` with PDF
   - Show auto-extraction of warranty data
   - Demo AI parsing invoice → structured data

4. **Predictive Insights** (30 sec)
   - `POST /api/warranties/:id/insights`
   - Show risk score and recommendations

5. **Analytics** (15 sec)
   - Show cost savings
   - Highlight enterprise value

---

## 🔥 Must-Know Endpoints for Demo

### 1. Get Analytics (Shows business value)
```bash
curl http://localhost:5000/api/warranties/analytics
```

### 2. AI Chat (Most impressive)
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Which warranties are at high risk?"}'
```

### 3. Expiring Soon (Shows proactive management)
```bash
curl http://localhost:5000/api/warranties/expiring/soon?days=30
```

### 4. Generate Insights (Shows AI prediction)
```bash
curl -X POST http://localhost:5000/api/warranties/2/insights
```

---

## 🐛 Common Issues & Quick Fixes

### Database Connection Error
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill
# Or change PORT in .env
```

### OpenAI API Error
```bash
# Check API key in .env
# Make sure you have credits
# Test with: curl https://api.openai.com/v1/models \
#   -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 📊 Sample Data Overview

After running `npm run seed`, you'll have:
- **20 warranties** across 4 categories
- **15 active** warranties
- **3 expiring soon** (within 30 days)
- **2 expired** warranties
- **$450,000** total warranty value

Categories:
- Material Handling (Forklifts, Pallet Jacks)
- HVAC (Air Conditioners, Heat Pumps, Chillers)
- Power Generation (Generators)
- Compressed Air (Compressors)

---

## 🎤 Elevator Pitch (30 seconds)

"WarrantyWizard is an AI-powered warranty management system for enterprises. 

**The Problem**: Businesses lose billions annually on expired warranties.

**Our Solution**: 
- AI chatbot that answers warranty questions instantly
- Auto-extracts warranty info from invoices using OCR
- Predicts which equipment needs service before warranty expires
- Prevents missed claims and saves enterprises 15-20% on maintenance costs

**For Grainger**: Perfect for enterprise customers managing hundreds of equipment warranties."

---

## 💡 Talking Points for Judges

### Innovation & Impact
- "AI-powered insights predict warranty claims before they happen"
- "Saved $34,000 in our demo scenario by catching expiring warranties"
- "Reduces warranty management time from hours to minutes"

### Technical Implementation
- "Built with Node.js, PostgreSQL, and GPT-4"
- "RESTful API with 15+ endpoints"
- "Real-time AI analysis of warranty risk"
- "OCR extraction from invoices for zero manual data entry"

### Design & Usability
- "Clean, accessible API design"
- "Natural language interface - no training needed"
- "One-click warranty creation from invoice"

### Grainger Integration
- "Built specifically for Grainger's B2B customers"
- "Handles enterprise-scale warranty tracking"
- "Accessible design for users of all ages"

---

## 🚀 Deployment (If Time Permits)

### Deploy to Aedify (for bonus points!)
1. Push code to GitHub
2. Connect repo to Aedify
3. Add environment variables
4. Deploy!

### Or Quick Deploy to Render
1. Create account at render.com
2. New Web Service → Connect GitHub
3. Select Node environment
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

---

## 📝 Last-Minute Checklist

**30 Minutes Before Demo:**
- [ ] Server running without errors
- [ ] Test all demo endpoints
- [ ] Prepare sample chat questions
- [ ] Have invoice PDF ready
- [ ] Clear any test data clutter
- [ ] Practice demo flow 2-3 times

**5 Minutes Before Demo:**
- [ ] Restart server (fresh start)
- [ ] Have terminal with endpoints ready
- [ ] Have browser tabs open:
  - localhost:5000/health
  - localhost:5000/api/warranties
- [ ] Deep breath! You got this! 💪

---

## 🎯 Judge Questions & Answers

**Q: "How does the AI work?"**
A: "We use GPT-4 to analyze warranty data and provide natural language insights. It can predict failure risk based on equipment age, category, and warranty timeline."

**Q: "How do you handle invoice extraction?"**
A: "We extract text from PDFs using pdf-parse, then use GPT-4 to intelligently extract structured warranty information - product name, dates, serial numbers, costs."

**Q: "Why is this better than a spreadsheet?"**
A: "Spreadsheets are passive. WarrantyWizard actively monitors, predicts risks, and alerts you before warranties expire. The AI chatbot means anyone can query the system without knowing SQL."

**Q: "How does this scale?"**
A: "Our PostgreSQL backend handles thousands of warranties efficiently. The architecture supports horizontal scaling with load balancers and database replication."

**Q: "What's the business value?"**
A: "Enterprises typically lose 10-15% of warranty value through expiration. Our system prevents that, pays for itself in the first quarter."

---

## 🏆 Winning Strategy

1. **Lead with AI** - The chatbot is your killer feature
2. **Show ROI** - "Saved $34K" gets attention
3. **Emphasize Accessibility** - Easy for any user
4. **Highlight Scale** - Built for enterprise
5. **Be Confident** - You built something impressive!

---

## 📞 Emergency Contact

If something breaks during demo:
1. Restart server: `npm run dev`
2. Check health: `curl localhost:5000/health`
3. Fallback: Use API_EXAMPLES.md commands
4. Last resort: Show code and explain architecture

Good luck! 🚀
