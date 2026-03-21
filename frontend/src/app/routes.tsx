import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { CaseSearch } from "./pages/CaseSearch";
import { Library } from "./pages/Library";
import { Business } from "./pages/Business";
import { BuyCredits } from "./pages/BuyCredits";
import { GstUpdatesPage } from "./pages/GstUpdatesPage";
import { GstUpdateDetailsPage } from "./pages/GstUpdateDetailsPage";
import { EsicUpdatesPage } from "./pages/EsicUpdatesPage";
import { ChatPage } from "./pages/ChatPage";
import { MentorsPage } from "./pages/MentorsPage";
import { MentorChatPage } from "./pages/MentorChatPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ScrapedData } from "./pages/ScrapedData";
import { Purchase } from "./pages/Purchase";
import { ApiTest } from "./pages/ApiTest";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { JurisLayout } from "./components/JurisLayout";

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
    element: (
      <ProtectedRoute>
        <JurisLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "gst-updates",
        element: <GstUpdatesPage />,
      },
      {
        path: "gst-updates/details",
        element: <GstUpdateDetailsPage />,
      },      
      {
        path: "esic-updates",
        element: <EsicUpdatesPage />,
      },
      {
        path: "mentors",
        element: <MentorsPage />,
      },
      {
        path: "mentors/:id",
        element: <MentorChatPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "case-search",
        element: <CaseSearch />,
      },
      {
        path: "library",
        element: <Library />,
      },
      {
        path: "business",
        element: <Business />,
      },
      {
        path: "scraped-data",
        element: <ScrapedData />,
      },
      {
        path: "buy-credits",
        element: <BuyCredits />,
      },
      {
        path: "api-test",
        element: <ApiTest />,
      },
      {
        path: "purchase",
        element: <Purchase />,
      },
    ],
  },
  {
    path: "*",
    element: <div className="flex items-center justify-center h-screen text-2xl">404 - Page Not Found</div>,
  },
]);
