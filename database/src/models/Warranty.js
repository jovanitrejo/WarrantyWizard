import { query } from '../config/database.js';

class Warranty {
  // Get all warranties with optional filters
  static async getAll(filters = {}) {
    let queryText = `
      SELECT w.*, 
             CASE 
               WHEN w.warranty_end < CURRENT_DATE THEN 'expired'
               WHEN w.warranty_end <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
               ELSE 'active'
             END as computed_status
      FROM warranties w
      WHERE 1=1
    `;
    const params = [];
    let paramCounter = 1;

    // Apply filters
    if (filters.status) {
      if (filters.status === 'expired') {
        queryText += ` AND w.warranty_end < CURRENT_DATE`;
      } else if (filters.status === 'expiring_soon') {
        queryText += ` AND w.warranty_end <= CURRENT_DATE + INTERVAL '30 days' AND w.warranty_end >= CURRENT_DATE`;
      } else if (filters.status === 'active') {
        queryText += ` AND w.warranty_end > CURRENT_DATE + INTERVAL '30 days'`;
      }
    }

    if (filters.category) {
      queryText += ` AND w.category = $${paramCounter}`;
      params.push(filters.category);
      paramCounter++;
    }

    if (filters.supplier) {
      queryText += ` AND w.supplier = $${paramCounter}`;
      params.push(filters.supplier);
      paramCounter++;
    }

    if (filters.search) {
      queryText += ` AND (w.product_name ILIKE $${paramCounter} OR w.serial_number ILIKE $${paramCounter})`;
      params.push(`%${filters.search}%`);
      paramCounter++;
    }

    queryText += ` ORDER BY w.warranty_end ASC`;

    const result = await query(queryText, params);
    return result.rows;
  }

  // Get single warranty by ID
  static async getById(id) {
    const result = await query(
      'SELECT * FROM warranties WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Create new warranty
  static async create(warrantyData) {
    const {
      product_name,
      category,
      serial_number,
      purchase_date,
      warranty_start,
      warranty_end,
      warranty_length_months,
      purchase_cost,
      supplier,
      notes,
      invoice_url,
      location,
      department
    } = warrantyData;

    const result = await query(
      `INSERT INTO warranties (
        product_name, category, serial_number, purchase_date,
        warranty_start, warranty_end, warranty_length_months,
        purchase_cost, supplier, notes, invoice_url, location, department
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        product_name,
        category,
        serial_number,
        purchase_date,
        warranty_start,
        warranty_end,
        warranty_length_months,
        purchase_cost,
        supplier || 'Grainger',
        notes,
        invoice_url,
        location,
        department
      ]
    );

    return result.rows[0];
  }

  // Update warranty
  static async update(id, warrantyData) {
    const fields = [];
    const values = [];
    let paramCounter = 1;

    Object.keys(warrantyData).forEach((key) => {
      if (warrantyData[key] !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(warrantyData[key]);
        paramCounter++;
      }
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE warranties SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Delete warranty
  static async delete(id) {
    const result = await query(
      'DELETE FROM warranties WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // Get warranties expiring soon (within X days)
  static async getExpiringSoon(days = 30) {
    const result = await query(
      `SELECT * FROM warranties 
       WHERE warranty_end <= CURRENT_DATE + INTERVAL '${days} days'
       AND warranty_end >= CURRENT_DATE
       ORDER BY warranty_end ASC`,
      []
    );
    return result.rows;
  }

  // Get expired warranties
  static async getExpired() {
    const result = await query(
      `SELECT * FROM warranties 
       WHERE warranty_end < CURRENT_DATE
       ORDER BY warranty_end DESC`,
      []
    );
    return result.rows;
  }

  // File a claim
  static async fileClaim(id, claimData) {
    const { claim_amount, claim_description } = claimData;
    
    const result = await query(
      `UPDATE warranties 
       SET claim_filed = true, 
           claim_date = CURRENT_DATE,
           claim_amount = $1,
           claim_description = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [claim_amount, claim_description, id]
    );

    return result.rows[0];
  }

  // Get analytics/statistics
  static async getAnalytics() {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_warranties,
        COUNT(*) FILTER (WHERE warranty_end >= CURRENT_DATE) as active_count,
        COUNT(*) FILTER (WHERE warranty_end < CURRENT_DATE) as expired_count,
        COUNT(*) FILTER (WHERE warranty_end <= CURRENT_DATE + INTERVAL '30 days' AND warranty_end >= CURRENT_DATE) as expiring_soon_count,
        COUNT(*) FILTER (WHERE claim_filed = true) as claims_filed,
        SUM(purchase_cost) as total_value,
        SUM(purchase_cost) FILTER (WHERE warranty_end >= CURRENT_DATE) as active_value,
        SUM(claim_amount) as total_claims_value,
        SUM(purchase_cost) FILTER (WHERE warranty_end < CURRENT_DATE AND claim_filed = false) as missed_claims_value
      FROM warranties
    `);

    const byCategory = await query(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(purchase_cost) as total_value
      FROM warranties
      WHERE warranty_end >= CURRENT_DATE
      GROUP BY category
      ORDER BY count DESC
    `);

    const monthlyExpiring = await query(`
      SELECT 
        DATE_TRUNC('month', warranty_end) as month,
        COUNT(*) as count,
        SUM(purchase_cost) as value
      FROM warranties
      WHERE warranty_end >= CURRENT_DATE
      AND warranty_end <= CURRENT_DATE + INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', warranty_end)
      ORDER BY month ASC
    `);

    return {
      overview: stats.rows[0],
      byCategory: byCategory.rows,
      monthlyExpiring: monthlyExpiring.rows
    };
  }
}

export default Warranty;
