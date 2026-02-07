// Ultra-minimal dashboard that will definitely render
export default function MinimalDashboard() {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#007bff', fontSize: '2.5rem', marginBottom: '20px' }}>
        🎉 WarrantyWizard Dashboard
      </h1>
      <div style={{ 
        backgroundColor: '#f0f8ff', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>✅ React is Working!</h2>
        <p>If you see this, the Dashboard is rendering correctly.</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{
          backgroundColor: '#d4edda',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #c3e6cb'
        }}>
          <h3>Active Warranties</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>15</div>
        </div>
        <div style={{
          backgroundColor: '#fff3cd',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <h3>Expiring Soon</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>3</div>
        </div>
        <div style={{
          backgroundColor: '#f8d7da',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <h3>Expired</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#721c24' }}>2</div>
        </div>
      </div>
      <div style={{ marginTop: '30px' }}>
        <a href="/equipment" style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          marginRight: '10px'
        }}>
          View Equipment →
        </a>
        <a href="/reports" style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#6c757d',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px'
        }}>
          View Reports →
        </a>
      </div>
    </div>
  );
}

