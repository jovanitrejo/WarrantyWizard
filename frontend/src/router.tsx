import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Dashboard from "./pages/Dashboard.tsx";
import AddItem from "./pages/AddItem.tsx";
import Alerts from "./pages/Alerts.tsx";
import NotFound from "./pages/NotFound.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "add", element: <AddItem /> },
      { path: "alerts", element: <Alerts /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
