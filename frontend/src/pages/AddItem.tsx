import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './AddItem.css';

export default function AddItem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    serial_number: '',
    supplier: '',
    purchase_date: '',
    warranty_start: '',
    warranty_end: '',
    warranty_length_months: '',
    purchase_cost: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await api.createWarranty({
        product_name: formData.product_name,
        category: formData.category || undefined,
        serial_number: formData.serial_number || undefined,
        supplier: formData.supplier || undefined,
        purchase_date: formData.purchase_date,
        warranty_start: formData.warranty_start || formData.purchase_date,
        warranty_end: formData.warranty_end,
        warranty_length_months: formData.warranty_length_months ? parseInt(formData.warranty_length_months) : undefined,
        purchase_cost: formData.purchase_cost ? parseFloat(formData.purchase_cost) : undefined,
        notes: formData.notes || undefined,
      });
      setMessage({ type: 'success', text: 'Warranty added successfully!' });
      setTimeout(() => {
        navigate('/equipment');
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add warranty. Please check all required fields.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-item">
      <h1>Add Warranty Item</h1>
      <p className="subtitle">Enter warranty information manually</p>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-item-form">
        <div className="form-section">
          <h2>Product Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., HVAC, Material Handling"
              />
            </div>
            <div className="form-group">
              <label>Serial Number</label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g., Grainger, Fastenal"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Warranty Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Purchase Date *</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Warranty Start Date</label>
              <input
                type="date"
                value={formData.warranty_start}
                onChange={(e) => setFormData({ ...formData, warranty_start: e.target.value })}
              />
              <span className="hint">Leave blank to use purchase date</span>
            </div>
            <div className="form-group">
              <label>Warranty End Date *</label>
              <input
                type="date"
                value={formData.warranty_end}
                onChange={(e) => setFormData({ ...formData, warranty_end: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Warranty Length (Months)</label>
              <input
                type="number"
                value={formData.warranty_length_months}
                onChange={(e) => setFormData({ ...formData, warranty_length_months: e.target.value })}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Purchase Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.purchase_cost}
                onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          <div className="form-group full-width">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Any additional notes about this warranty..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/equipment')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Adding...' : 'Add Warranty'}
          </button>
        </div>
      </form>
    </div>
  );
}
