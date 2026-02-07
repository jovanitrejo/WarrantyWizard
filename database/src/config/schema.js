import pool from './database.js';

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create warranties table
    await client.query(`
      CREATE TABLE IF NOT EXISTS warranties (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        serial_number VARCHAR(100),
        purchase_date DATE NOT NULL,
        warranty_start DATE NOT NULL,
        warranty_end DATE NOT NULL,
        warranty_length_months INTEGER,
        purchase_cost DECIMAL(10, 2),
        supplier VARCHAR(100) DEFAULT 'Grainger',
        status VARCHAR(50) DEFAULT 'active',
        claim_filed BOOLEAN DEFAULT false,
        claim_date DATE,
        claim_amount DECIMAL(10, 2),
        claim_description TEXT,
        notes TEXT,
        invoice_url TEXT,
        location VARCHAR(255),
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create alerts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        warranty_id INTEGER REFERENCES warranties(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL,
        alert_date DATE NOT NULL,
        sent BOOLEAN DEFAULT false,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create ai_insights table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_insights (
        id SERIAL PRIMARY KEY,
        warranty_id INTEGER REFERENCES warranties(id) ON DELETE CASCADE,
        insight_type VARCHAR(100) NOT NULL,
        confidence_score DECIMAL(3, 2),
        message TEXT NOT NULL,
        recommendation TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create chat_history table (for AI chatbot)
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_warranties_warranty_end ON warranties(warranty_end);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_warranties_category ON warranties(category);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_alerts_warranty_id ON alerts(warranty_id);
    `);

    await client.query('COMMIT');
    console.log('Database tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Function to drop all tables (for development reset)
const dropTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS chat_history CASCADE');
    await client.query('DROP TABLE IF EXISTS ai_insights CASCADE');
    await client.query('DROP TABLE IF EXISTS alerts CASCADE');
    await client.query('DROP TABLE IF EXISTS warranties CASCADE');
    await client.query('COMMIT');
    console.log('Database tables dropped successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error dropping tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

export { createTables, dropTables };
