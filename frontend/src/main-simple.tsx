// Ultra-simple test - no router, no dependencies
import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('🚀 Simple main.tsx loading...');
console.log('React version:', React.version);

const App = () => {
  console.log('✅ App component rendering');
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#007bff', fontSize: '3rem' }}>🎉 IT WORKS!</h1>
      <p style={{ fontSize: '1.5rem' }}>React is rendering correctly!</p>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        border: '2px solid #007bff'
      }}>
        <h2>WarrantyWizard Dashboard</h2>
        <p>If you see this, everything is working!</p>
        <p>Time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('✅ Creating root...');
    root.render(<App />);
    console.log('✅ App rendered!');
  } catch (error) {
    console.error('❌ Error:', error);
    rootElement.innerHTML = `<div style="padding: 40px; color: red;">
      <h1>Error!</h1>
      <pre>${error}</pre>
    </div>`;
  }
} else {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<h1 style="color: red;">Root element not found!</h1>';
}

