import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Warranty, type Analytics } from '../services/api';
import UploadModal from '../components/UploadModal';
import AnalyticsCharts from '../components/AnalyticsCharts';
import './Dashboard.css';

export default function Dashboard() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [expiring, setExpiring] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [warrantiesRes, analyticsRes, expiringRes] = await Promise.all([
        api.getWarranties().catch(err => {
          console.error('Failed to load warranties:', err);
          return { count: 0, warranties: [] };
        }),
        api.getAnalytics().catch(err => {
          console.error('Failed to load analytics:', err);
          return null;
        }),
        api.getExpiringWarranties(30).catch(err => {
          console.error('Failed to load expiring:', err);
          return { count: 0, days: 30, warranties: [] };
        }),
      ]);
      setWarranties(warrantiesRes.warranties || []);
      setAnalytics(analyticsRes);
      setExpiring(expiringRes.warranties || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
          <div>Loading warranty data...</div>
        </div>
      </div>
    );
  }

  const activeWarranties = warranties.filter(w => w.status === 'active');
  const expiredWarranties = warranties.filter(w => w.status === 'expired');

  return (
    <div className="dashboard">
      <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
      
      <div className="dashboard-header">
        <div>
          <h1>WarrantyWizard Dashboard</h1>
          <p className="dashboard-subtitle">Powered by Grainger - Never lose money on expired warranties</p>
        </div>
        <div className="dashboard-actions">
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="btn btn-primary btn-large"
            aria-label="Add warranty"
          >
            ➕ Add Warranty
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Active Warranties Card */}
        <div className="dashboard-card">
          <h2>Active Warranties</h2>
          <div className="stat-large">{analytics?.totals.active || 0}</div>
          <div className="stat-label">Total Active</div>
          <div className="card-list">
            {activeWarranties.slice(0, 5).map(w => (
              <div key={w.id} className="list-item">
                <span className="item-name">{w.product_name}</span>
                <span className="item-date">Expires: {new Date(w.warranty_end).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <Link to="/equipment" className="card-link">View All →</Link>
        </div>

        {/* Expiring Soon Card */}
        <div className="dashboard-card warning">
          <h2>Expiring Soon</h2>
          <div className="stat-large">{analytics?.totals.expiring || 0}</div>
          <div className="stat-label">Next 30 Days</div>
          <div className="card-list">
            {expiring.slice(0, 5).map(w => (
              <div key={w.id} className="list-item">
                <span className="item-name">{w.product_name}</span>
                <span className="item-date">Expires: {new Date(w.warranty_end).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <Link to="/alerts" className="card-link">View Alerts →</Link>
        </div>

        {/* Expired Warranties Card */}
        <div className="dashboard-card error">
          <h2>Expired</h2>
          <div className="stat-large">{analytics?.totals.expired || 0}</div>
          <div className="stat-label">Requires Attention</div>
          <div className="card-list">
            {expiredWarranties.slice(0, 5).map(w => (
              <div key={w.id} className="list-item">
                <span className="item-name">{w.product_name}</span>
                <span className="item-date">Expired: {new Date(w.warranty_end).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <Link to="/equipment?status=expired" className="card-link">View All →</Link>
        </div>

        {/* Alerts Card */}
        <div className="dashboard-card">
          <h2>Alerts</h2>
          <div className="stat-large">{expiring.length}</div>
          <div className="stat-label">Active Alerts</div>
          <div className="card-list">
            {expiring.slice(0, 3).map(w => (
              <div key={w.id} className="list-item alert-item">
                <span className="alert-icon">⚠️</span>
                <span className="item-name">{w.product_name} expires soon</span>
              </div>
            ))}
          </div>
          <Link to="/alerts" className="card-link">Manage Alerts →</Link>
        </div>
      </div>

      {/* Analytics Charts - Always render to show loading state if needed */}
      <AnalyticsCharts warranties={warranties} analytics={analytics} />

      {/* Quick Analytics Summary */}
      {analytics && (
        <div className="dashboard-analytics">
          <h2>Quick Summary</h2>
          <div className="analytics-grid">
            <div className="analytics-item">
              <div className="analytics-label">Total Coverage Value</div>
              <div className="analytics-value">
                ${analytics.estimated.coverage_value.toLocaleString()}
              </div>
            </div>
            <div className="analytics-item">
              <div className="analytics-label">Claims Filed</div>
              <div className="analytics-value">{analytics.claims.filed}</div>
            </div>
            <div className="analytics-item">
              <div className="analytics-label">Total Claim Amount</div>
              <div className="analytics-value">
                ${analytics.claims.total_claim_amount.toLocaleString()}
              </div>
            </div>
            <div className="analytics-item">
              <div className="analytics-label">Total Warranties</div>
              <div className="analytics-value">{analytics.totals.total}</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/reports" className="btn btn-outline">View Full Reports →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
