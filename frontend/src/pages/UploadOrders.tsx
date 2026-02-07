import { useState } from 'react';
import { api } from '../services/api';
import './UploadOrders.css';

export default function UploadOrders() {
  const [uploadType, setUploadType] = useState<'csv' | 'manual'>('csv');
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
      await api.createWarranty({
        product_name: manualData.product_name,
        category: manualData.category,
        serial_number: manualData.serial_number,
        supplier: manualData.supplier,
        purchase_date: manualData.purchase_date,
        warranty_end: manualData.warranty_end,
        purchase_cost: manualData.purchase_cost ? parseFloat(manualData.purchase_cost) : undefined,
      });
      setMessage({ type: 'success', text: 'Warranty added successfully!' });
      setManualData({
        product_name: '',
        category: '',
        serial_number: '',
        supplier: '',
        purchase_date: '',
        warranty_end: '',
        purchase_cost: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add warranty. Please try again.' });
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

    // For now, parse CSV manually (in production, you'd upload to backend)
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    try {
      // Parse CSV and create warranties
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const data: any = {};
        headers.forEach((header, index) => {
          data[header.toLowerCase().replace(/\s+/g, '_')] = values[index];
        });
        await api.createWarranty(data);
      }
      setMessage({ type: 'success', text: `Successfully imported ${lines.length - 1} warranties!` });
      setFile(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import CSV. Please check the format.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-orders">
      <h1>Upload Orders</h1>
      <p className="subtitle">Add warranties via CSV import or manual entry</p>

      <div className="upload-tabs">
        <button
          className={uploadType === 'csv' ? 'active' : ''}
          onClick={() => setUploadType('csv')}
        >
          CSV Upload
        </button>
        <button
          className={uploadType === 'manual' ? 'active' : ''}
          onClick={() => setUploadType('manual')}
        >
          Manual Entry
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {uploadType === 'csv' ? (
        <div className="upload-section">
          <div className="upload-box">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input"
              id="csv-file"
            />
            <label htmlFor="csv-file" className="file-label">
              {file ? file.name : 'Choose CSV file or drag and drop'}
            </label>
            <p className="upload-hint">
              CSV format: product_name, category, serial_number, supplier, purchase_date, warranty_end, purchase_cost
            </p>
            <button
              onClick={handleCSVUpload}
              disabled={!file || uploading}
              className="btn btn-primary"
            >
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="manual-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={manualData.product_name}
                onChange={(e) => setManualData({ ...manualData, product_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={manualData.category}
                onChange={(e) => setManualData({ ...manualData, category: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Serial Number</label>
              <input
                type="text"
                value={manualData.serial_number}
                onChange={(e) => setManualData({ ...manualData, serial_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <input
                type="text"
                value={manualData.supplier}
                onChange={(e) => setManualData({ ...manualData, supplier: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Purchase Date *</label>
              <input
                type="date"
                value={manualData.purchase_date}
                onChange={(e) => setManualData({ ...manualData, purchase_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Warranty End Date *</label>
              <input
                type="date"
                value={manualData.warranty_end}
                onChange={(e) => setManualData({ ...manualData, warranty_end: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Purchase Cost</label>
              <input
                type="number"
                step="0.01"
                value={manualData.purchase_cost}
                onChange={(e) => setManualData({ ...manualData, purchase_cost: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" disabled={uploading} className="btn btn-primary">
            {uploading ? 'Adding...' : 'Add Warranty'}
          </button>
        </form>
      )}
    </div>
  );
}

