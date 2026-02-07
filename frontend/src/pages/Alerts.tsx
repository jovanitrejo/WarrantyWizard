import { useEffect, useState } from 'react';
import { api, type Warranty } from '../services/api';
import './Alerts.css';

export default function Alerts() {
  const [expiringWarranties, setExpiringWarranties] = useState<Warranty[]>([]);
  const [expiredWarranties, setExpiredWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const [expiringRes, allRes] = await Promise.all([
        api.getExpiringWarranties(30),
        api.getWarranties('expired'),
      ]);
      setExpiringWarranties(expiringRes.warranties);
      setExpiredWarranties(allRes.warranties.filter(w => w.status === 'expired'));
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="alerts-loading">Loading...</div>;
  }

  return (
    <div className="alerts">
      <div className="alerts-header">
        <h1>Warranty Alerts</h1>
        <p>Stay informed about expiring and expired warranties</p>
      </div>

      {expiringWarranties.length === 0 && expiredWarranties.length === 0 ? (
        <div className="no-alerts">
          <div className="no-alerts-icon">✓</div>
          <h2>All Clear!</h2>
          <p>No active alerts at this time.</p>
        </div>
      ) : (
        <>
          {expiringWarranties.length > 0 && (
            <div className="alert-section">
              <h2>
                <span className="alert-icon warning">⚠️</span>
                Expiring Soon ({expiringWarranties.length})
              </h2>
              <div className="alert-list">
                {expiringWarranties.map(warranty => (
                  <div key={warranty.id} className="alert-item warning">
                    <div className="alert-item-main">
                      <h3>{warranty.product_name}</h3>
                      <div className="alert-item-meta">
                        {warranty.category && <span>{warranty.category}</span>}
                        {warranty.serial_number && <span>SN: {warranty.serial_number}</span>}
                        {warranty.supplier && <span>{warranty.supplier}</span>}
                      </div>
                    </div>
                    <div className="alert-item-date">
                      <div className="date-label">Expires</div>
                      <div className="date-value">
                        {new Date(warranty.warranty_end).toLocaleDateString()}
                      </div>
                      <div className="days-remaining">
                        {Math.ceil((new Date(warranty.warranty_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiredWarranties.length > 0 && (
            <div className="alert-section">
              <h2>
                <span className="alert-icon error">❌</span>
                Expired ({expiredWarranties.length})
              </h2>
              <div className="alert-list">
                {expiredWarranties.map(warranty => (
                  <div key={warranty.id} className="alert-item error">
                    <div className="alert-item-main">
                      <h3>{warranty.product_name}</h3>
                      <div className="alert-item-meta">
                        {warranty.category && <span>{warranty.category}</span>}
                        {warranty.serial_number && <span>SN: {warranty.serial_number}</span>}
                        {warranty.supplier && <span>{warranty.supplier}</span>}
                      </div>
                    </div>
                    <div className="alert-item-date">
                      <div className="date-label">Expired</div>
                      <div className="date-value">
                        {new Date(warranty.warranty_end).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
