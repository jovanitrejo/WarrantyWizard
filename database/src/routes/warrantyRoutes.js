import express from 'express';
import WarrantyController from '../controllers/warrantyController.js';

const router = express.Router();

// Static/specific routes FIRST
router.get('/analytics', WarrantyController.getAnalytics);
router.get('/expiring/soon', WarrantyController.getExpiringSoon);
router.get('/expired', WarrantyController.getExpired);

// Then generic ones
router.get('/', WarrantyController.getAll);
router.get('/:id', WarrantyController.getById);

router.post('/', WarrantyController.create);
router.put('/:id', WarrantyController.update);
router.delete('/:id', WarrantyController.delete);

router.post('/:id/claim', WarrantyController.fileClaim);
router.post('/:id/insights', WarrantyController.generateInsights);

export default router;
