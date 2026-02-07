import { useEffect, useState } from 'react';
import { api, type Warranty } from '../services/api';
import './EquipmentDatabase.css';

export default function EquipmentDatabase() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [filteredWarranties, setFilteredWarranties] = useState<Warranty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarranties();
  }, []);

  useEffect(() => {
    filterWarranties();
  }, [warranties, searchTerm, statusFilter]);

  const loadWarranties = async () => {
    try {
      setLoading(true);
      const response = await api.getWarranties();
      setWarranties(response.warranties);
    } catch (error) {
      console.error('Failed to load warranties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWarranties = () => {
    let filtered = [...warranties];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => w.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(w =>
        w.product_name.toLowerCase().includes(term) ||
        w.serial_number?.toLowerCase().includes(term) ||
        w.supplier?.toLowerCase().includes(term) ||
        w.category?.toLowerCase().includes(term)
      );
    }

    setFilteredWarranties(filtered);
  };

  if (loading) {
    return <div className="equipment-loading">Loading...</div>;
  }

  return (
    <div className="equipment-database">
      <div className="equipment-header">
        <h1>Equipment Database</h1>
        <div className="equipment-actions">
          <input
            type="text"
            placeholder="Search by name, serial, supplier, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="equipment-content">
        <div className="equipment-list">
          <div className="list-header">
            <span>Found {filteredWarranties.length} items</span>
          </div>
          {filteredWarranties.map(warranty => (
            <div
              key={warranty.id}
              className={`equipment-item ${warranty.status} ${selectedWarranty?.id === warranty.id ? 'selected' : ''}`}
              onClick={() => setSelectedWarranty(warranty)}
            >
              <div className="item-main">
                <h3>{warranty.product_name}</h3>
                <div className="item-meta">
                  {warranty.category && <span className="badge">{warranty.category}</span>}
                  {warranty.serial_number && <span>SN: {warranty.serial_number}</span>}
                  {warranty.supplier && <span>Supplier: {warranty.supplier}</span>}
                </div>
              </div>
              <div className="item-status">
                <span className={`status-badge status-${warranty.status}`}>
                  {warranty.status.replace('_', ' ')}
                </span>
                <div className="item-date">
                  Expires: {new Date(warranty.warranty_end).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedWarranty && (
          <div className="equipment-details">
            <button
              onClick={() => setSelectedWarranty(null)}
              className="close-btn"
            >
              ×
            </button>
            <h2>{selectedWarranty.product_name}</h2>
            <div className="details-grid">
              <div className="detail-item">
                <label>Status</label>
                <span className={`status-badge status-${selectedWarranty.status}`}>
                  {selectedWarranty.status.replace('_', ' ')}
                </span>
              </div>
              <div className="detail-item">
                <label>Category</label>
                <span>{selectedWarranty.category || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Serial Number</label>
                <span>{selectedWarranty.serial_number || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Supplier</label>
                <span>{selectedWarranty.supplier || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Purchase Date</label>
                <span>{new Date(selectedWarranty.purchase_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Warranty Start</label>
                <span>{new Date(selectedWarranty.warranty_start).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Warranty End</label>
                <span>{new Date(selectedWarranty.warranty_end).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Purchase Cost</label>
                <span>{selectedWarranty.purchase_cost ? `$${selectedWarranty.purchase_cost.toLocaleString()}` : 'N/A'}</span>
              </div>
              {selectedWarranty.notes && (
                <div className="detail-item full-width">
                  <label>Notes</label>
                  <span>{selectedWarranty.notes}</span>
                </div>
              )}
              {selectedWarranty.claim_filed && (
                <div className="detail-item full-width">
                  <label>Claim Information</label>
                  <span>
                    Filed on {selectedWarranty.claim_date ? new Date(selectedWarranty.claim_date).toLocaleDateString() : 'N/A'}
                    {selectedWarranty.claim_amount && ` - Amount: $${selectedWarranty.claim_amount.toLocaleString()}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

