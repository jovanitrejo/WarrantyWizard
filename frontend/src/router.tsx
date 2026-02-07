import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Dashboard from "./pages/Dashboard.tsx";
import AddItem from "./pages/AddItem.tsx";
import Alerts from "./pages/Alerts.tsx";
import UploadOrders from "./pages/UploadOrders.tsx";
import AIChat from "./pages/AIChat.tsx";
import EquipmentDatabase from "./pages/EquipmentDatabase.tsx";
import WarrantyCalendar from "./pages/WarrantyCalendar.tsx";
import Reports from "./pages/Reports.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "add", element: <AddItem /> },
      { path: "upload", element: <UploadOrders /> },
      { path: "chat", element: <AIChat /> },
      { path: "equipment", element: <EquipmentDatabase /> },
      { path: "calendar", element: <WarrantyCalendar /> },
      { path: "reports", element: <Reports /> },
      { path: "alerts", element: <Alerts /> },
      { path: "settings", element: <Settings /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
