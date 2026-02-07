import { query } from '../config/database.js';

class Alert {
  // Create alert
  static async create(alertData) {
    const { warranty_id, alert_type, alert_date } = alertData;

    const result = await query(
      `INSERT INTO alerts (warranty_id, alert_type, alert_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [warranty_id, alert_type, alert_date]
    );

    return result.rows[0];
  }

  // Get all alerts
  static async getAll() {
    const result = await query(
      `SELECT a.*, w.product_name, w.category, w.warranty_end
       FROM alerts a
       JOIN warranties w ON a.warranty_id = w.id
       ORDER BY a.alert_date DESC`,
      []
    );

    return result.rows;
  }

  // Get unsent alerts
  static async getUnsent() {
    const result = await query(
      `SELECT a.*, w.product_name, w.category, w.warranty_end
       FROM alerts a
       JOIN warranties w ON a.warranty_id = w.id
       WHERE a.sent = false AND a.alert_date <= CURRENT_DATE
       ORDER BY a.alert_date ASC`,
      []
    );

    return result.rows;
  }

  // Mark alert as sent
  static async markAsSent(id) {
    const result = await query(
      `UPDATE alerts 
       SET sent = true, sent_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows[0];
  }

  // Get alerts for a specific warranty
  static async getByWarrantyId(warrantyId) {
    const result = await query(
      `SELECT * FROM alerts 
       WHERE warranty_id = $1
       ORDER BY alert_date DESC`,
      [warrantyId]
    );

    return result.rows;
  }

  // Delete alert
  static async delete(id) {
    const result = await query(
      'DELETE FROM alerts WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows[0];
  }

  // Check and create alerts for upcoming expiries
  static async generateAlertsForExpiring() {
    const alertDays = [30, 7, 1]; // Days before expiry to create alerts
    const createdAlerts = [];

    for (const days of alertDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);

      // Find warranties expiring on target date that don't have alerts yet
      const result = await query(
        `SELECT w.id, w.warranty_end
         FROM warranties w
         WHERE DATE(w.warranty_end) = DATE($1)
         AND w.warranty_end >= CURRENT_DATE
         AND NOT EXISTS (
           SELECT 1 FROM alerts a 
           WHERE a.warranty_id = w.id 
           AND a.alert_type = $2
         )`,
        [targetDate, `${days}_day_warning`]
      );

      // Create alerts for these warranties
      for (const warranty of result.rows) {
        const alert = await this.create({
          warranty_id: warranty.id,
          alert_type: `${days}_day_warning`,
          alert_date: targetDate
        });
        createdAlerts.push(alert);
      }
    }

    return createdAlerts;
  }
}

export default Alert;
