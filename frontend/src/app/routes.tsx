import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { CaseSearch } from "./pages/CaseSearch";
import { Library } from "./pages/Library";
import { Business } from "./pages/Business";
import { BuyCredits } from "./pages/BuyCredits";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/case-search",
    element: (
      <ProtectedRoute>
        <CaseSearch />
      </ProtectedRoute>
    ),
  },
  {
    path: "/library",
    element: (
      <ProtectedRoute>
        <Library />
      </ProtectedRoute>
    ),
  },
  {
    path: "/business",
    element: (
      <ProtectedRoute>
        <Business />
      </ProtectedRoute>
    ),
  },
  {
    path: "/buy-credits",
    element: (
      <ProtectedRoute>
        <BuyCredits />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <div className="flex items-center justify-center h-screen text-2xl">404 - Page Not Found</div>,
  },
]);
