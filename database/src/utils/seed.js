import pool from '../config/database.js';
import { createTables, dropTables } from '../config/schema.js';

const sampleWarranties = [
  {
    product_name: 'Toyota 8FGU25 Forklift',
    category: 'Material Handling',
    serial_number: 'FKL-2024-001',
    purchase_date: '2023-06-15',
    warranty_start: '2023-06-15',
    warranty_end: '2026-06-15',
    warranty_length_months: 36,
    purchase_cost: 28000.00,
    supplier: 'Grainger',
    location: 'Warehouse A',
    department: 'Logistics'
  },
  {
    product_name: 'Carrier 50TC 10-Ton HVAC Unit',
    category: 'HVAC',
    serial_number: 'HVAC-2022-445',
    purchase_date: '2022-03-10',
    warranty_start: '2022-03-10',
    warranty_end: '2026-03-10',
    warranty_length_months: 48,
    purchase_cost: 12500.00,
    supplier: 'Grainger',
    location: 'Building B - Roof',
    department: 'Facilities'
  },
  {
    product_name: 'Generac 150kW Diesel Generator',
    category: 'Power Generation',
    serial_number: 'GEN-2021-889',
    purchase_date: '2021-11-20',
    warranty_start: '2021-11-20',
    warranty_end: '2024-11-20',
    warranty_length_months: 36,
    purchase_cost: 45000.00,
    supplier: 'Grainger',
    location: 'Generator Building',
    department: 'Facilities',
    notes: 'Expired - needs extended warranty consideration'
  },
  {
    product_name: 'Atlas Copco GA30 Air Compressor',
    category: 'Compressed Air',
    serial_number: 'COMP-2023-227',
    purchase_date: '2023-09-05',
    warranty_start: '2023-09-05',
    warranty_end: '2028-09-05',
    warranty_length_months: 60,
    purchase_cost: 18500.00,
    supplier: 'Grainger',
    location: 'Shop Floor',
    department: 'Production'
  },
  {
    product_name: 'Crown RC 5500 Series Reach Truck',
    category: 'Material Handling',
    serial_number: 'RT-2024-103',
    purchase_date: '2024-01-12',
    warranty_start: '2024-01-12',
    warranty_end: '2027-01-12',
    warranty_length_months: 36,
    purchase_cost: 32000.00,
    supplier: 'Grainger',
    location: 'Warehouse B',
    department: 'Logistics'
  },
  {
    product_name: 'Trane XR16 5-Ton Heat Pump',
    category: 'HVAC',
    serial_number: 'HP-2023-558',
    purchase_date: '2023-04-20',
    warranty_start: '2023-04-20',
    warranty_end: '2033-04-20',
    warranty_length_months: 120,
    purchase_cost: 8900.00,
    supplier: 'Grainger',
    location: 'Office Building',
    department: 'Facilities'
  },
  {
    product_name: 'Cummins Onan 60kW Generator',
    category: 'Power Generation',
    serial_number: 'GEN-2024-442',
    purchase_date: '2024-02-01',
    warranty_start: '2024-02-01',
    warranty_end: '2029-02-01',
    warranty_length_months: 60,
    purchase_cost: 28000.00,
    supplier: 'Grainger',
    location: 'Data Center',
    department: 'IT Infrastructure'
  },
  {
    product_name: 'Sullair 375 Portable Air Compressor',
    category: 'Compressed Air',
    serial_number: 'PAC-2022-776',
    purchase_date: '2022-08-15',
    warranty_start: '2022-08-15',
    warranty_end: '2025-08-15',
    warranty_length_months: 36,
    purchase_cost: 15200.00,
    supplier: 'Grainger',
    location: 'Maintenance Yard',
    department: 'Facilities'
  },
  {
    product_name: 'Yale MPB040 Electric Pallet Jack',
    category: 'Material Handling',
    serial_number: 'EPJ-2023-334',
    purchase_date: '2023-11-10',
    warranty_start: '2023-11-10',
    warranty_end: '2026-11-10',
    warranty_length_months: 36,
    purchase_cost: 5200.00,
    supplier: 'Grainger',
    location: 'Warehouse C',
    department: 'Logistics'
  },
  {
    product_name: 'Lennox EL16XC1 Air Conditioner',
    category: 'HVAC',
    serial_number: 'AC-2024-998',
    purchase_date: '2024-05-15',
    warranty_start: '2024-05-15',
    warranty_end: '2034-05-15',
    warranty_length_months: 120,
    purchase_cost: 4800.00,
    supplier: 'Grainger',
    location: 'Admin Building',
    department: 'Facilities'
  },
  {
    product_name: 'Kohler 20RESCL Generator',
    category: 'Power Generation',
    serial_number: 'GEN-2023-112',
    purchase_date: '2023-07-22',
    warranty_start: '2023-07-22',
    warranty_end: '2028-07-22',
    warranty_length_months: 60,
    purchase_cost: 8500.00,
    supplier: 'Grainger',
    location: 'Facility Entrance',
    department: 'Security'
  },
  {
    product_name: 'Kaeser SM11 Rotary Screw Compressor',
    category: 'Compressed Air',
    serial_number: 'RSC-2024-221',
    purchase_date: '2024-03-08',
    warranty_start: '2024-03-08',
    warranty_end: '2027-03-08',
    warranty_length_months: 36,
    purchase_cost: 22000.00,
    supplier: 'Grainger',
    location: 'Manufacturing Floor',
    department: 'Production'
  },
  {
    product_name: 'Mitsubishi FBC25N Forklift',
    category: 'Material Handling',
    serial_number: 'FKL-2022-889',
    purchase_date: '2022-12-05',
    warranty_start: '2022-12-05',
    warranty_end: '2025-12-05',
    warranty_length_months: 36,
    purchase_cost: 24500.00,
    supplier: 'Grainger',
    location: 'Distribution Center',
    department: 'Logistics'
  },
  {
    product_name: 'Goodman GSX140481 Heat Pump',
    category: 'HVAC',
    serial_number: 'HP-2023-667',
    purchase_date: '2023-02-18',
    warranty_start: '2023-02-18',
    warranty_end: '2026-02-18',
    warranty_length_months: 36,
    purchase_cost: 6200.00,
    supplier: 'Grainger',
    location: 'Cafeteria',
    department: 'Facilities',
    notes: 'Expiring soon - schedule inspection'
  },
  {
    product_name: 'Caterpillar C4.4 Generator Set',
    category: 'Power Generation',
    serial_number: 'CAT-2024-556',
    purchase_date: '2024-01-30',
    warranty_start: '2024-01-30',
    warranty_end: '2027-01-30',
    warranty_length_months: 36,
    purchase_cost: 52000.00,
    supplier: 'Grainger',
    location: 'Primary Power Plant',
    department: 'Utilities'
  },
  {
    product_name: 'Ingersoll Rand R55i Compressor',
    category: 'Compressed Air',
    serial_number: 'IRC-2023-445',
    purchase_date: '2023-10-12',
    warranty_start: '2023-10-12',
    warranty_end: '2028-10-12',
    warranty_length_months: 60,
    purchase_cost: 19800.00,
    supplier: 'Grainger',
    location: 'Assembly Line',
    department: 'Production'
  },
  {
    product_name: 'Raymond 4250 Reach Truck',
    category: 'Material Handling',
    serial_number: 'RAY-2024-333',
    purchase_date: '2024-04-22',
    warranty_start: '2024-04-22',
    warranty_end: '2027-04-22',
    warranty_length_months: 36,
    purchase_cost: 28900.00,
    supplier: 'Grainger',
    location: 'Cold Storage',
    department: 'Logistics'
  },
  {
    product_name: 'York YT Chiller 250 Ton',
    category: 'HVAC',
    serial_number: 'CHILL-2023-112',
    purchase_date: '2023-06-30',
    warranty_start: '2023-06-30',
    warranty_end: '2028-06-30',
    warranty_length_months: 60,
    purchase_cost: 85000.00,
    supplier: 'Grainger',
    location: 'Central Plant',
    department: 'Facilities'
  },
  {
    product_name: 'Briggs & Stratton 8000W Generator',
    category: 'Power Generation',
    serial_number: 'BRS-2022-998',
    purchase_date: '2022-05-15',
    warranty_start: '2022-05-15',
    warranty_end: '2025-05-15',
    warranty_length_months: 36,
    purchase_cost: 3200.00,
    supplier: 'Grainger',
    location: 'Emergency Equipment',
    department: 'Safety'
  },
  {
    product_name: 'Quincy QGS-30 Rotary Screw Compressor',
    category: 'Compressed Air',
    serial_number: 'QGS-2024-887',
    purchase_date: '2024-02-28',
    warranty_start: '2024-02-28',
    warranty_end: '2029-02-28',
    warranty_length_months: 60,
    purchase_cost: 26500.00,
    supplier: 'Grainger',
    location: 'Tool Room',
    department: 'Maintenance'
  }
];

const seedDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seed...');
    
    // Reset database
    console.log('📦 Dropping existing tables...');
    await dropTables();
    
    console.log('🔨 Creating fresh tables...');
    await createTables();
    
    // Insert warranties
    console.log('📝 Inserting sample warranties...');
    await client.query('BEGIN');
    
    for (const warranty of sampleWarranties) {
      await client.query(
        `INSERT INTO warranties (
          product_name, category, serial_number, purchase_date,
          warranty_start, warranty_end, warranty_length_months,
          purchase_cost, supplier, location, department, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          warranty.product_name,
          warranty.category,
          warranty.serial_number,
          warranty.purchase_date,
          warranty.warranty_start,
          warranty.warranty_end,
          warranty.warranty_length_months,
          warranty.purchase_cost,
          warranty.supplier,
          warranty.location,
          warranty.department,
          warranty.notes || null
        ]
      );
    }
    
    await client.query('COMMIT');
    
    console.log(`✅ Successfully seeded ${sampleWarranties.length} warranties`);
    
    // Display summary
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE warranty_end >= CURRENT_DATE) as active,
        COUNT(*) FILTER (WHERE warranty_end < CURRENT_DATE) as expired,
        COUNT(*) FILTER (WHERE warranty_end <= CURRENT_DATE + INTERVAL '30 days' AND warranty_end >= CURRENT_DATE) as expiring_soon
      FROM warranties
    `);
    
    console.log('\n📊 Database Summary:');
    console.log(`   Total Warranties: ${stats.rows[0].total}`);
    console.log(`   Active: ${stats.rows[0].active}`);
    console.log(`   Expiring Soon (30 days): ${stats.rows[0].expiring_soon}`);
    console.log(`   Expired: ${stats.rows[0].expired}`);
    
    console.log('\n✨ Database seed completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the seed
seedDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
