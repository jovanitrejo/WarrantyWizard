import Warranty from '../models/Warranty.js';
import AIService from '../services/AIService.js';

class WarrantyController {
  // GET /api/warranties - Get all warranties with optional filters
  static async getAll(req, res) {
    try {
      const filters = {
        status: req.query.status,
        category: req.query.category,
        supplier: req.query.supplier,
        search: req.query.search
      };

      const warranties = await Warranty.getAll(filters);
      
      res.json({
        success: true,
        count: warranties.length,
        data: warranties
      });
    } catch (error) {
      console.error('Get warranties error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch warranties',
        error: error.message
      });
    }
  }

  // GET /api/warranties/:id - Get single warranty
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const warranty = await Warranty.getById(id);

      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: 'Warranty not found'
        });
      }

      res.json({
        success: true,
        data: warranty
      });
    } catch (error) {
      console.error('Get warranty error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch warranty',
        error: error.message
      });
    }
  }

  // POST /api/warranties - Create new warranty
  static async create(req, res) {
    try {
      const warrantyData = req.body;

      // Validate required fields
      if (!warrantyData.product_name || !warrantyData.purchase_date || !warrantyData.warranty_end) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: product_name, purchase_date, warranty_end'
        });
      }

      // Set warranty_start if not provided (defaults to purchase_date)
      if (!warrantyData.warranty_start) {
        warrantyData.warranty_start = warrantyData.purchase_date;
      }

      // Calculate warranty_length_months if not provided
      if (!warrantyData.warranty_length_months) {
        const start = new Date(warrantyData.warranty_start);
        const end = new Date(warrantyData.warranty_end);
        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                          (end.getMonth() - start.getMonth());
        warrantyData.warranty_length_months = monthsDiff;
      }

      const warranty = await Warranty.create(warrantyData);

      res.status(201).json({
        success: true,
        message: 'Warranty created successfully',
        data: warranty
      });
    } catch (error) {
      console.error('Create warranty error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create warranty',
        error: error.message
      });
    }
  }

  // PUT /api/warranties/:id - Update warranty
  static async update(req, res) {
    try {
      const { id } = req.params;
      const warrantyData = req.body;

      const warranty = await Warranty.update(id, warrantyData);

      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: 'Warranty not found'
        });
      }

      res.json({
        success: true,
        message: 'Warranty updated successfully',
        data: warranty
      });
    } catch (error) {
      console.error('Update warranty error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update warranty',
        error: error.message
      });
    }
  }

  // DELETE /api/warranties/:id - Delete warranty
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const warranty = await Warranty.delete(id);

      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: 'Warranty not found'
        });
      }

      res.json({
        success: true,
        message: 'Warranty deleted successfully',
        data: warranty
      });
    } catch (error) {
      console.error('Delete warranty error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete warranty',
        error: error.message
      });
    }
  }

  // GET /api/warranties/expiring/soon - Get expiring warranties
  static async getExpiringSoon(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const warranties = await Warranty.getExpiringSoon(days);

      res.json({
        success: true,
        count: warranties.length,
        data: warranties
      });
    } catch (error) {
      console.error('Get expiring warranties error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expiring warranties',
        error: error.message
      });
    }
  }

  // GET /api/warranties/expired - Get expired warranties
  static async getExpired(req, res) {
    try {
      const warranties = await Warranty.getExpired();

      res.json({
        success: true,
        count: warranties.length,
        data: warranties
      });
    } catch (error) {
      console.error('Get expired warranties error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expired warranties',
        error: error.message
      });
    }
  }

  // POST /api/warranties/:id/claim - File a warranty claim
  static async fileClaim(req, res) {
    try {
      const { id } = req.params;
      const { claim_amount, claim_description } = req.body;

      if (!claim_amount || !claim_description) {
        return res.status(400).json({
          success: false,
          message: 'claim_amount and claim_description are required'
        });
      }

      const warranty = await Warranty.fileClaim(id, {
        claim_amount,
        claim_description
      });

      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: 'Warranty not found'
        });
      }

      res.json({
        success: true,
        message: 'Claim filed successfully',
        data: warranty
      });
    } catch (error) {
      console.error('File claim error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to file claim',
        error: error.message
      });
    }
  }

  // GET /api/warranties/analytics - Get warranty analytics
  static async getAnalytics(req, res) {
    try {
      const analytics = await Warranty.getAnalytics();

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message
      });
    }
  }

  // POST /api/warranties/:id/insights - Generate AI insights for a warranty
  static async generateInsights(req, res) {
    try {
      const { id } = req.params;
      const warranty = await Warranty.getById(id);

      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: 'Warranty not found'
        });
      }

      const insights = await AIService.generateInsight(warranty);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Generate insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate insights',
        error: error.message
      });
    }
  }
}

export default WarrantyController;
