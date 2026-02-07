import { useEffect, useState } from 'react';
import { api, type Analytics, type Warranty } from '../services/api';
import './Reports.css';

export default function Reports() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, warrantiesRes] = await Promise.all([
        api.getAnalytics(),
        api.getWarranties(),
      ]);
      setAnalytics(analyticsRes);
      setWarranties(warrantiesRes.warranties);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="reports-loading">Loading...</div>;
  }

  if (!analytics) {
    return <div className="reports-loading">No data available</div>;
  }

  const totalValue = analytics.estimated.coverage_value;
  const claimsValue = analytics.claims.total_claim_amount;
  const costSaved = claimsValue; // Simplified calculation
  const expiringValue = warranties
    .filter(w => w.status === 'expiring_soon')
    .reduce((sum, w) => sum + (w.purchase_cost || 0), 0);

  const categoryBreakdown = warranties.reduce((acc, w) => {
    const cat = w.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const supplierBreakdown = warranties.reduce((acc, w) => {
    const sup = w.supplier || 'Unknown';
    acc[sup] = (acc[sup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="reports">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Comprehensive warranty insights and statistics</p>
      </div>

      <div className="reports-grid">
        {/* Key Metrics */}
        <div className="report-card">
          <h2>Key Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-label">Total Warranties</div>
              <div className="metric-value">{analytics.totals.total}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Active Warranties</div>
              <div className="metric-value success">{analytics.totals.active}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Expiring Soon</div>
              <div className="metric-value warning">{analytics.totals.expiring}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Expired</div>
              <div className="metric-value error">{analytics.totals.expired}</div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="report-card">
          <h2>Financial Overview</h2>
          <div className="financial-grid">
            <div className="financial-item">
              <div className="financial-label">Total Coverage Value</div>
              <div className="financial-value">${totalValue.toLocaleString()}</div>
            </div>
            <div className="financial-item">
              <div className="financial-label">Cost Saved (Claims)</div>
              <div className="financial-value success">${costSaved.toLocaleString()}</div>
            </div>
            <div className="financial-item">
              <div className="financial-label">Claims Filed</div>
              <div className="financial-value">{analytics.claims.filed}</div>
            </div>
            <div className="financial-item">
              <div className="financial-label">Total Claim Amount</div>
              <div className="financial-value">${analytics.claims.total_claim_amount.toLocaleString()}</div>
            </div>
            <div className="financial-item">
              <div className="financial-label">Expiring Value (30 days)</div>
              <div className="financial-value warning">${expiringValue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="report-card">
          <h2>By Category</h2>
          <div className="breakdown-list">
            {Object.entries(categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <div key={category} className="breakdown-item">
                  <span className="breakdown-label">{category}</span>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{ width: `${(count / analytics.totals.total) * 100}%` }}
                    />
                  </div>
                  <span className="breakdown-value">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Supplier Breakdown */}
        <div className="report-card">
          <h2>By Supplier</h2>
          <div className="breakdown-list">
            {Object.entries(supplierBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([supplier, count]) => (
                <div key={supplier} className="breakdown-item">
                  <span className="breakdown-label">{supplier}</span>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{ width: `${(count / analytics.totals.total) * 100}%` }}
                    />
                  </div>
                  <span className="breakdown-value">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="report-card full-width">
        <h2>Status Distribution</h2>
        <div className="status-chart">
          <div className="status-bar">
            <div
              className="status-segment active"
              style={{ width: `${(analytics.totals.active / analytics.totals.total) * 100}%` }}
            >
              <span>Active: {analytics.totals.active}</span>
            </div>
            <div
              className="status-segment expiring"
              style={{ width: `${(analytics.totals.expiring / analytics.totals.total) * 100}%` }}
            >
              <span>Expiring: {analytics.totals.expiring}</span>
            </div>
            <div
              className="status-segment expired"
              style={{ width: `${(analytics.totals.expired / analytics.totals.total) * 100}%` }}
            >
              <span>Expired: {analytics.totals.expired}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

