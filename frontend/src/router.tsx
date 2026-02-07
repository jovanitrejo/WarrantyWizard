import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Dashboard from "./pages/Dashboard.tsx";
import AddItem from "./pages/AddItem.tsx";
import Alerts from "./pages/Alerts.tsx";
<<<<<<< HEAD
import NotFound from "./pages/NotFound.tsx";
=======
import UploadOrders from "./pages/UploadOrders.tsx";
import AIChat from "./pages/AIChat.tsx";
import EquipmentDatabase from "./pages/EquipmentDatabase.tsx";
import WarrantyCalendar from "./pages/WarrantyCalendar.tsx";
import Reports from "./pages/Reports.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";
import SimpleTest from "./pages/SimpleTest.tsx";
import DebugInfo from "./DebugInfo.tsx";
>>>>>>> cc96240 (updates)

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
<<<<<<< HEAD
      { path: "add", element: <AddItem /> },
      { path: "alerts", element: <Alerts /> },
=======
      { path: "test", element: <SimpleTest /> },
      { path: "debug", element: <DebugInfo /> },
      { path: "add", element: <AddItem /> },
      { path: "upload", element: <UploadOrders /> },
      { path: "chat", element: <AIChat /> },
      { path: "equipment", element: <EquipmentDatabase /> },
      { path: "calendar", element: <WarrantyCalendar /> },
      { path: "reports", element: <Reports /> },
      { path: "alerts", element: <Alerts /> },
      { path: "settings", element: <Settings /> },
>>>>>>> cc96240 (updates)
      { path: "*", element: <NotFound /> },
    ],
  },
]);
