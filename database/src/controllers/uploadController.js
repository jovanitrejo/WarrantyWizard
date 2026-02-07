import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import AIService from '../services/AIService.js';
import Warranty from '../models/Warranty.js';

class UploadController {
  // POST /api/upload/invoice - Upload and process invoice
  static async uploadInvoice(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const file = req.file;
      let extractedText = '';

      // If PDF, extract text
      if (file.mimetype === 'application/pdf') {
        const dataBuffer = await fs.readFile(file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      } else {
        // For images, you would use OCR here (Tesseract, Google Vision, etc.)
        // For hackathon, we'll simulate it
        extractedText = `
          INVOICE
          Product: Simulated Product from Image
          Date: 2024-01-15
          Warranty: 24 months
          Amount: $1,500.00
        `;
      }

      // Use AI to extract structured warranty data
      const warrantyData = await AIService.extractWarrantyFromInvoice(extractedText);

      // Clean up uploaded file
      await fs.unlink(file.path);

      res.json({
        success: true,
        message: 'Invoice processed successfully',
        data: {
          extracted_text: extractedText.substring(0, 500), // First 500 chars
          warranty_data: warrantyData
        }
      });
    } catch (error) {
      console.error('Upload invoice error:', error);
      
      // Clean up file if exists
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to process invoice',
        error: error.message
      });
    }
  }

  // POST /api/upload/invoice/create - Upload invoice and create warranty in one step
  static async uploadAndCreateWarranty(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const file = req.file;
      let extractedText = '';

      // Extract text from PDF
      if (file.mimetype === 'application/pdf') {
        const dataBuffer = await fs.readFile(file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      } else {
        // Simulated OCR for images
        extractedText = `Simulated invoice text from image`;
      }

      // Extract warranty data using AI
      const warrantyData = await AIService.extractWarrantyFromInvoice(extractedText);

      // Calculate warranty dates if we have the info
      if (warrantyData.purchase_date && warrantyData.warranty_length_months) {
        const purchaseDate = new Date(warrantyData.purchase_date);
        const warrantyEnd = new Date(purchaseDate);
        warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyData.warranty_length_months);
        
        warrantyData.warranty_start = warrantyData.purchase_date;
        warrantyData.warranty_end = warrantyEnd.toISOString().split('T')[0];
      }

      // Save invoice file (optional - keep for records)
      const invoiceUrl = `/uploads/${file.filename}`;
      warrantyData.invoice_url = invoiceUrl;

      // Create warranty in database
      const warranty = await Warranty.create(warrantyData);

      res.json({
        success: true,
        message: 'Invoice processed and warranty created successfully',
        data: warranty
      });
    } catch (error) {
      console.error('Upload and create warranty error:', error);
      
      // Clean up file if exists
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to process invoice and create warranty',
        error: error.message
      });
    }
  }
}

export default UploadController;
