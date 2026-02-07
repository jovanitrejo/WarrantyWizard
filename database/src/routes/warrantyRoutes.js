import express from 'express';
import WarrantyController from '../controllers/warrantyController.js';

const router = express.Router();

// Get all warranties with optional filters
// Query params: ?status=active&category=HVAC&search=forklift
router.get('/', WarrantyController.getAll);

// Get warranty analytics
router.get('/analytics', WarrantyController.getAnalytics);

// Get expiring warranties
// Query params: ?days=30
router.get('/expiring/soon', WarrantyController.getExpiringSoon);

// Get expired warranties
router.get('/expired', WarrantyController.getExpired);

// Get single warranty by ID
router.get('/:id', WarrantyController.getById);

// Create new warranty
router.post('/', WarrantyController.create);

// Update warranty
router.put('/:id', WarrantyController.update);

// Delete warranty
router.delete('/:id', WarrantyController.delete);

// File a warranty claim
router.post('/:id/claim', WarrantyController.fileClaim);

// Generate AI insights for warranty
router.post('/:id/insights', WarrantyController.generateInsights);

export default router;
