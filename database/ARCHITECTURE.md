# WarrantyWizard Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  (Frontend - React, Mobile App, API Clients)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                             │
│                    (Port 5000)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   MIDDLEWARE LAYER                       │  │
│  │  - CORS                                                  │  │
│  │  - Body Parser (JSON/URL-encoded)                       │  │
│  │  - File Upload (Multer)                                 │  │
│  │  - Error Handler                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   ROUTES LAYER                           │  │
│  │                                                          │  │
│  │  /api/warranties  ──┐                                   │  │
│  │  /api/ai          ──┼──→ Controllers                    │  │
│  │  /api/upload      ──┘                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 CONTROLLERS LAYER                        │  │
│  │                                                          │  │
│  │  ┌───────────────┐  ┌───────────┐  ┌──────────────┐   │  │
│  │  │  Warranty     │  │    AI     │  │   Upload     │   │  │
│  │  │  Controller   │  │Controller │  │  Controller  │   │  │
│  │  └───────┬───────┘  └─────┬─────┘  └──────┬───────┘   │  │
│  └──────────┼────────────────┼────────────────┼───────────┘  │
│             │                │                │               │
│             ▼                ▼                ▼               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  SERVICES LAYER                          │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │           AI Service (OpenAI Integration)          │ │  │
│  │  │  - Chatbot (GPT-4)                                │ │  │
│  │  │  - Invoice OCR & Extraction                       │ │  │
│  │  │  - Predictive Insights                            │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │           PDF Processing Service                   │ │  │
│  │  │  - PDF Text Extraction (pdf-parse)                │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MODELS LAYER                          │  │
│  │                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐                    │  │
│  │  │   Warranty   │  │    Alert     │                    │  │
│  │  │    Model     │  │    Model     │                    │  │
│  │  └──────┬───────┘  └──────┬───────┘                    │  │
│  └─────────┼──────────────────┼───────────────────────────┘  │
│            │                  │                               │
└────────────┼──────────────────┼───────────────────────────────┘
             │                  │
             ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (PostgreSQL)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  warranties  │  │    alerts    │  │ ai_insights  │         │
│  │              │  │              │  │              │         │
│  │ - id         │  │ - id         │  │ - id         │         │
│  │ - product    │  │ - warranty_id│  │ - warranty_id│         │
│  │ - category   │  │ - alert_type │  │ - insight    │         │
│  │ - dates      │  │ - sent       │  │ - risk_score │         │
│  │ - costs      │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐                                              │
│  │chat_history  │                                              │
│  │              │                                              │
│  │ - id         │                                              │
│  │ - session_id │                                              │
│  │ - role       │                                              │
│  │ - content    │                                              │
│  └──────────────┘                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

             ▲
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │               OpenAI API (GPT-4)                       │    │
│  │  - Chat Completions                                    │    │
│  │  - Structured Data Extraction                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. Get All Warranties
```
Client Request
    │
    ▼
GET /api/warranties
    │
    ▼
warrantyRoutes.js
    │
    ▼
warrantyController.getAll()
    │
    ▼
Warranty.getAll() (Model)
    │
    ▼
PostgreSQL Query
    │
    ▼
Return JSON Response
```

### 2. AI Chat Flow
```
Client Request
    │
    ▼
POST /api/ai/chat
    │
    ▼
aiRoutes.js
    │
    ▼
aiController.chat()
    │
    ├──→ Load chat history from DB
    │
    ├──→ Get warranty data
    │
    ├──→ AIService.chat()
    │        │
    │        ▼
    │    OpenAI API Call
    │        │
    │        ▼
    │    GPT-4 Response
    │
    ├──→ Save to chat_history
    │
    ▼
Return AI Response
```

### 3. Invoice Upload & Processing Flow
```
Client Upload (PDF/Image)
    │
    ▼
POST /api/upload/invoice/create
    │
    ▼
Multer Middleware (file handling)
    │
    ▼
uploadController.uploadAndCreateWarranty()
    │
    ├──→ Extract text from PDF (pdf-parse)
    │
    ├──→ AIService.extractWarrantyFromInvoice()
    │        │
    │        ▼
    │    OpenAI API (structured extraction)
    │
    ├──→ Calculate warranty dates
    │
    ├──→ Warranty.create()
    │        │
    │        ▼
    │    Insert into PostgreSQL
    │
    ▼
Return Created Warranty
```

## Technology Stack

### Core
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Language**: JavaScript (ES6+ with modules)

### Key Dependencies
- `express` - Web framework
- `pg` - PostgreSQL client
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment configuration
- `openai` - OpenAI API integration
- `multer` - File upload handling
- `pdf-parse` - PDF text extraction
- `node-cron` - Scheduled tasks (optional)
- `date-fns` - Date utilities

## Database Design

### Entity Relationship
```
warranties (1) ─────< (N) alerts
    │
    │
    └─────< (N) ai_insights

chat_history (independent)
```

### Indexes
```sql
-- Performance optimization indexes
CREATE INDEX idx_warranties_status ON warranties(status);
CREATE INDEX idx_warranties_warranty_end ON warranties(warranty_end);
CREATE INDEX idx_warranties_category ON warranties(category);
CREATE INDEX idx_alerts_warranty_id ON alerts(warranty_id);
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... },
  "count": 10  // For list responses
}
```

### Error Response
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error details"
}
```

## Security Considerations

1. **Input Validation**: All inputs validated before processing
2. **SQL Injection Prevention**: Parameterized queries
3. **File Upload Limits**: 10MB max file size
4. **Allowed File Types**: PDF, JPEG, PNG only
5. **CORS Configuration**: Restricted to frontend URL
6. **Error Handling**: No sensitive data in error messages

## Performance Optimizations

1. **Database Connection Pooling**: Max 20 connections
2. **Indexed Queries**: Fast lookups on common filters
3. **Efficient Queries**: SELECT only needed columns
4. **Caching**: (Can be added) Redis for frequently accessed data

## Scalability Considerations

### Current Architecture (Hackathon MVP)
- Single server instance
- Direct database connections
- Synchronous file processing

### Production Improvements (Future)
- Load balancer for multiple server instances
- Message queue (RabbitMQ/Bull) for file processing
- Redis cache for warranty data
- CDN for uploaded files
- Database replication for read scaling

## Monitoring & Logging

### Current Logging
- Console logs for all operations
- Database query logging
- Error stack traces (dev mode)

### Production Monitoring (Recommended)
- APM tools (New Relic, DataDog)
- Error tracking (Sentry)
- Database query monitoring
- API response time metrics

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│           Aedify/Render/Railway             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │    Node.js Server (Express)           │ │
│  │    Port: 5000                         │ │
│  └───────────────┬───────────────────────┘ │
│                  │                          │
│                  │ Connection               │
│                  ▼                          │
│  ┌───────────────────────────────────────┐ │
│  │    PostgreSQL Database                │ │
│  │    Managed by platform                │ │
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
         ▲                     ▲
         │                     │
    HTTPS/REST            OpenAI API
         │                     │
    ┌────┴────┐           ┌────┴────┐
    │ Frontend│           │   GPT-4 │
    │  (React)│           │         │
    └─────────┘           └─────────┘
```

## File Structure
```
warrantywizard-backend/
├── src/
│   ├── config/           # Database & schema
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic & AI
│   ├── middleware/       # Express middleware
│   ├── utils/            # Helpers & seed data
│   └── server.js         # Application entry point
├── uploads/              # User uploaded files
├── .env                  # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Environment Variables

### Required
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `OPENAI_API_KEY`

### Optional
- `PORT` (default: 5000)
- `NODE_ENV` (development/production)
- `FRONTEND_URL` (for CORS)
- `ALERT_DAYS_BEFORE_EXPIRY`

## Future Enhancements

1. **Authentication & Authorization**
   - JWT tokens
   - Role-based access control
   - Multi-tenant support

2. **Advanced AI Features**
   - Image-based OCR (Google Vision API)
   - Predictive failure analysis
   - Automated claim filing

3. **Notifications**
   - Email alerts
   - SMS notifications
   - Webhook integrations

4. **Reporting**
   - PDF report generation
   - Excel export
   - Scheduled reports

5. **Integrations**
   - Grainger API integration
   - Calendar sync (Google/Outlook)
   - Maintenance management systems
