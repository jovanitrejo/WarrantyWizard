import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import warrantyRoutes from './src/routes/warrantyRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';

// Import middleware
import { errorHandler, notFound } from './src/middleware/errorHandler.js';

// Import config
import pool from './src/config/database.js';
import { createTables } from './src/config/schema.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  'http://localhost:3000,http://localhost:5173'
)
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server, curl, Postman (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WarrantyWizard API',
    version: '1.0.0',
    endpoints: {
      warranties: '/api/v1/warranties',
      ai: '/api/v1/ai',
      upload: '/api/v1/upload'
    }
  });
});


app.get('/api', (req, res) => {
  res.json({ ok: true });
});


// API Routes
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/warranties`, warrantyRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);
app.use(`${API_PREFIX}/upload`, uploadRoutes);


// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🔧 Initializing database...');
    await createTables();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`\n📋 Available endpoints:`);
      console.log(`   - GET    /api/warranties`);
      console.log(`   - POST   /api/warranties`);
      console.log(`   - GET    /api/warranties/:id`);
      console.log(`   - PUT    /api/warranties/:id`);
      console.log(`   - DELETE /api/warranties/:id`);
      console.log(`   - GET    /api/warranties/analytics`);
      console.log(`   - POST   /api/ai/chat`);
      console.log(`   - POST   /api/upload/invoice`);
      console.log(`\n AI Features:`);
      console.log(`   - Chatbot Assistant`);
      console.log(`   - Invoice OCR & Extraction`);
      console.log(`   - Predictive Insights`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, closing server...');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();

export default app;
