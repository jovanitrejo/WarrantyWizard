import express from 'express';
import upload from '../middleware/upload.js';
import UploadController from '../controllers/uploadController.js';

const router = express.Router();

// Upload invoice and extract warranty info (doesn't create warranty)
router.post('/invoice', upload.single('invoice'), UploadController.uploadInvoice);

// Upload invoice and automatically create warranty
router.post('/invoice/create', upload.single('invoice'), UploadController.uploadAndCreateWarranty);

export default router;
