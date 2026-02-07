// Ultra-simple test component
export default function SimpleTest() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#007bff', fontSize: '2rem' }}>✅ React is Working!</h1>
      <p style={{ fontSize: '1.2rem' }}>If you see this, the app is rendering correctly.</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

