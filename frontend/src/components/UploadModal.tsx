import { useState } from 'react';
import { api } from '../services/api';
import './UploadModal.css';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [uploadType, setUploadType] = useState<'manual' | 'csv' | 'pdf'>('manual');
  const [file, setFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState({
    product_name: '',
    category: '',
    serial_number: '',
    supplier: '',
    purchase_date: '',
    warranty_end: '',
    purchase_cost: '',
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    try {
      // Validate required fields
      if (!manualData.product_name.trim()) {
        setMessage({ type: 'error', text: 'Product name is required' });
        setUploading(false);
        return;
      }

      if (!manualData.purchase_date || !manualData.warranty_end) {
        setMessage({ type: 'error', text: 'Purchase date and warranty end date are required' });
        setUploading(false);
        return;
      }

      // HTML date inputs should already be in YYYY-MM-DD format
      // Just remove time portion if present and validate
      let purchaseDate = manualData.purchase_date.trim();
      let warrantyEnd = manualData.warranty_end.trim();
      
      // Remove time portion if present (from datetime-local inputs)
      if (purchaseDate.includes('T')) {
        purchaseDate = purchaseDate.split('T')[0];
      }
      if (warrantyEnd.includes('T')) {
        warrantyEnd = warrantyEnd.split('T')[0];
      }
      
      // Validate format (should be YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(purchaseDate)) {
        // If not in YYYY-MM-DD, try to convert from MM/DD/YYYY
        const mmddyyyy = purchaseDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (mmddyyyy) {
          const [, month, day, year] = mmddyyyy;
          purchaseDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          setMessage({ type: 'error', text: `Invalid purchase date format. Please use the date picker or enter dates as YYYY-MM-DD.` });
          setUploading(false);
          return;
        }
      }
      
      if (!dateRegex.test(warrantyEnd)) {
        // If not in YYYY-MM-DD, try to convert from MM/DD/YYYY
        const mmddyyyy = warrantyEnd.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (mmddyyyy) {
          const [, month, day, year] = mmddyyyy;
          warrantyEnd = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          setMessage({ type: 'error', text: `Invalid warranty end date format. Please use the date picker or enter dates as YYYY-MM-DD.` });
          setUploading(false);
          return;
        }
      }
      
      console.log('Sending dates to backend:', { purchaseDate, warrantyEnd });

      const warrantyData = {
        product_name: manualData.product_name.trim(),
        category: manualData.category.trim() || undefined,
        serial_number: manualData.serial_number.trim() || undefined,
        supplier: manualData.supplier.trim() || undefined,
        purchase_date: purchaseDate,
        warranty_end: warrantyEnd,
        purchase_cost: manualData.purchase_cost ? parseFloat(manualData.purchase_cost) : undefined,
      };
      
      console.log('Creating warranty with data:', warrantyData);
      
      await api.createWarranty(warrantyData);
      setMessage({ type: 'success', text: 'Warranty added successfully!' });
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error creating warranty:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to add warranty. Please check all required fields and try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setUploading(false);
    }
  };

  const handleCSVUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a CSV file' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const data: any = {};
        headers.forEach((header, index) => {
          data[header.toLowerCase().replace(/\s+/g, '_')] = values[index];
        });
        await api.createWarranty(data);
      }
      setMessage({ type: 'success', text: `Successfully imported ${lines.length - 1} warranties!` });
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import CSV. Please check the format.' });
    } finally {
      setUploading(false);
    }
  };

  const handlePDFUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a PDF file' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('invoice', file);

      const response = await fetch('/api/upload/invoice/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('PDF upload failed');
      }

      await response.json();
      setMessage({ type: 'success', text: 'PDF processed and warranty created!' });
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process PDF. Please try again or use manual entry.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <button className="upload-modal-close" onClick={onClose} aria-label="Close">×</button>
        
        <h2 className="upload-modal-title">Add Warranty</h2>
        <p className="upload-modal-subtitle">Choose how you'd like to add warranty information</p>

        <div className="upload-type-selector">
          <button
            className={`upload-type-btn ${uploadType === 'manual' ? 'active' : ''}`}
            onClick={() => setUploadType('manual')}
          >
            📝 Manual Entry
          </button>
          <button
            className={`upload-type-btn ${uploadType === 'csv' ? 'active' : ''}`}
            onClick={() => setUploadType('csv')}
          >
            📊 CSV Upload
          </button>
          <button
            className={`upload-type-btn ${uploadType === 'pdf' ? 'active' : ''}`}
            onClick={() => setUploadType('pdf')}
          >
            📄 PDF Invoice
          </button>
        </div>

        {message && (
          <div className={`upload-message upload-message-${message.type}`}>
            {message.text}
          </div>
        )}

        {uploadType === 'manual' && (
          <form onSubmit={handleManualSubmit} className="upload-form">
            <div className="upload-form-grid">
              <div className="upload-form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={manualData.product_name}
                  onChange={(e) => setManualData({ ...manualData, product_name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="upload-form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={manualData.category}
                  onChange={(e) => setManualData({ ...manualData, category: e.target.value })}
                  placeholder="e.g., HVAC, Material Handling"
                />
              </div>
              <div className="upload-form-group">
                <label>Serial Number</label>
                <input
                  type="text"
                  value={manualData.serial_number}
                  onChange={(e) => setManualData({ ...manualData, serial_number: e.target.value })}
                />
              </div>
              <div className="upload-form-group">
                <label>Supplier</label>
                <input
                  type="text"
                  value={manualData.supplier}
                  onChange={(e) => setManualData({ ...manualData, supplier: e.target.value })}
                  placeholder="e.g., Grainger"
                />
              </div>
              <div className="upload-form-group">
                <label>Purchase Date *</label>
                <input
                  type="date"
                  value={manualData.purchase_date}
                  onChange={(e) => {
                    // Ensure date is in YYYY-MM-DD format
                    const dateValue = e.target.value;
                    setManualData({ ...manualData, purchase_date: dateValue });
                  }}
                  required
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <div className="upload-form-group">
                <label>Warranty End Date *</label>
                <input
                  type="date"
                  value={manualData.warranty_end}
                  onChange={(e) => {
                    // Ensure date is in YYYY-MM-DD format
                    const dateValue = e.target.value;
                    setManualData({ ...manualData, warranty_end: dateValue });
                  }}
                  required
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <div className="upload-form-group">
                <label>Purchase Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={manualData.purchase_cost}
                  onChange={(e) => setManualData({ ...manualData, purchase_cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="upload-form-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={uploading} className="btn btn-primary">
                {uploading ? 'Adding...' : 'Add Warranty'}
              </button>
            </div>
          </form>
        )}

        {uploadType === 'csv' && (
          <div className="upload-file-section">
            <div className="upload-file-box">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="upload-file-input"
                id="csv-file"
              />
              <label htmlFor="csv-file" className="upload-file-label">
                {file ? file.name : 'Choose CSV file or drag and drop'}
              </label>
              <p className="upload-file-hint">
                CSV format: product_name, category, serial_number, supplier, purchase_date, warranty_end, purchase_cost
              </p>
            </div>
            <div className="upload-form-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleCSVUpload}
                disabled={!file || uploading}
                className="btn btn-primary"
              >
                {uploading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </div>
          </div>
        )}

        {uploadType === 'pdf' && (
          <div className="upload-file-section">
            <div className="upload-file-box">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="upload-file-input"
                id="pdf-file"
              />
              <label htmlFor="pdf-file" className="upload-file-label">
                {file ? file.name : 'Choose PDF invoice or drag and drop'}
              </label>
              <p className="upload-file-hint">
                Upload a PDF invoice and we'll automatically extract warranty information using AI
              </p>
            </div>
            <div className="upload-form-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handlePDFUpload}
                disabled={!file || uploading}
                className="btn btn-primary"
              >
                {uploading ? 'Processing...' : 'Upload & Extract'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

