// Debug component to check if React is working
import { useEffect } from 'react';

export default function DebugInfo() {
  useEffect(() => {
    console.log('✅ React component mounted!');
    console.log('✅ useEffect is working!');
  }, []);

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      border: '2px solid #007bff'
    }}>
      <h1 style={{ color: '#007bff', fontSize: '2.5rem', marginBottom: '20px' }}>
        🎉 WarrantyWizard Debug Page
      </h1>
      <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>✅ React is Working!</h2>
        <p>If you see this message, React has successfully mounted.</p>
        <p>Check the browser console (F12) for debug messages.</p>
      </div>
      <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px' }}>
        <h3>Next Steps:</h3>
        <ol>
          <li>Open browser console (F12 or Cmd+Option+I)</li>
          <li>Look for any red error messages</li>
          <li>Try navigating to <a href="/">/</a> to see the Dashboard</li>
          <li>If Dashboard doesn't load, check console for API errors</li>
        </ol>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ 
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px'
        }}>
          Go to Dashboard →
        </a>
      </div>
    </div>
  );
}

