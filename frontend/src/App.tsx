import { Link, Outlet } from "react-router-dom";
<<<<<<< HEAD

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/">Dashboard</Link>
        <Link to="/add">Add Item</Link>
        <Link to="/alerts">Alerts</Link>
      </nav>
      <hr />
      <Outlet />
=======
import './App.css';

export default function App() {
  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-brand">
          <Link to="/">WarrantyWizard</Link>
        </div>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/equipment">Equipment</Link>
          <Link to="/upload">Upload Orders</Link>
          <Link to="/chat">AI Chat</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/alerts">Alerts</Link>
          <Link to="/settings">Settings</Link>
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
>>>>>>> cc96240 (updates)
    </div>
  );
}
