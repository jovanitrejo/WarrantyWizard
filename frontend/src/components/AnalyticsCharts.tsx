import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Warranty, Analytics } from '../services/api';
import './AnalyticsCharts.css';

interface AnalyticsChartsProps {
  warranties: Warranty[];
  analytics: Analytics | null;
}

export default function AnalyticsCharts({ warranties, analytics }: AnalyticsChartsProps) {
  if (!analytics) {
    return (
      <div className="analytics-charts">
        <h2 className="charts-title">📊 Analytics & Insights</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading analytics data...
        </div>
      </div>
    );
  }

  // Prepare data for pie chart (Status Distribution)
  const statusData = [
    { name: 'Active', value: analytics.totals.active, color: '#4caf50' },
    { name: 'Expiring Soon', value: analytics.totals.expiring, color: '#ff9800' },
    { name: 'Expired', value: analytics.totals.expired, color: '#d32f2f' },
  ];

  // Prepare data for supplier breakdown
  const supplierData = warranties.reduce((acc, w) => {
    const sup = w.supplier || 'Unknown';
    const existing = acc.find(item => item.name === sup);
    if (existing) {
      existing.value += 1;
      existing.cost += w.purchase_cost || 0;
    } else {
      acc.push({ name: sup, value: 1, cost: w.purchase_cost || 0 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; cost: number }>);

  // Sort by value for better visualization
  supplierData.sort((a, b) => b.value - a.value);

  // Enhanced color palette with gradients
  const COLORS = [
    '#4caf50', // Green
    '#ff9800', // Orange  
    '#d32f2f', // Red
    '#1976d2', // Blue
    '#9c27b0', // Purple
    '#00bcd4', // Cyan
    '#ff5722', // Deep Orange
    '#795548', // Brown
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="analytics-charts">
      <h2 className="charts-title">📊 Analytics & Insights</h2>
      
      <div className="charts-grid">
        {/* Status Distribution Pie Chart */}
        <div className="chart-card">
          <h3>Warranty Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-stats">
            <div className="stat-item">
              <span className="stat-dot" style={{ backgroundColor: '#4caf50' }}></span>
              <span>Active: {analytics.totals.active}</span>
            </div>
            <div className="stat-item">
              <span className="stat-dot" style={{ backgroundColor: '#ff9800' }}></span>
              <span>Expiring: {analytics.totals.expiring}</span>
            </div>
            <div className="stat-item">
              <span className="stat-dot" style={{ backgroundColor: '#d32f2f' }}></span>
              <span>Expired: {analytics.totals.expired}</span>
            </div>
          </div>
        </div>

        {/* Supplier Breakdown */}
        <div className="chart-card bar-chart-card">
          <h3>Warranties by Supplier</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={supplierData.slice(0, 6)} margin={{ bottom: 60, top: 20, left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={0}
                textAnchor="middle"
                height={80}
                fontSize={13}
                interval={0}
                tick={{ fill: '#4a5568', fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e0', strokeWidth: 1 }}
              />
              <YAxis 
                fontSize={13} 
                tick={{ fill: '#4a5568', fontWeight: 500 }}
                axisLine={{ stroke: '#cbd5e0', strokeWidth: 1 }}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(211, 47, 47, 0.1)' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
              />
              <Bar 
                dataKey="value" 
                radius={[12, 12, 0, 0]}
                barSize={60}
              >
                {supplierData.slice(0, 6).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

