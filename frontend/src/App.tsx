import { Link, Outlet } from "react-router-dom";

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
    </div>
  );
}
