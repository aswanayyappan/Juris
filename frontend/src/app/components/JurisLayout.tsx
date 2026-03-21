import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { ThreeBackground } from "./ThreeBackground";
import {
  Search,
  Bell,
  Coins,
  CircleUser,
  Scale,
  ChevronRight,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "../utils/auth";

export function JurisLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchVal, setSearchVal] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p === "/") return null;
    if (p === "/chat")
      return [{ label: "AI Legal Assistant", path: "/chat" }];
    if (p === "/mentors")
      return [{ label: "Live Mentors", path: "/mentors" }];
    if (p.startsWith("/mentors/"))
      return [
        { label: "Live Mentors", path: "/mentors" },
        { label: "Mentor Chat", path: p },
      ];
    if (p === "/profile")
      return [{ label: "Profile", path: "/profile" }];
    return null;
  };

  const crumbs = getBreadcrumb();

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ background: "#060B18" }}
    >
      <ThreeBackground />

      {/* Top Bar */}
      <header
        className="relative flex items-center h-12 px-6 border-b"
        style={{
          zIndex: 10,
          background: "rgba(6,11,24,0.85)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <button
          className="flex items-center gap-2 mr-8 flex-shrink-0"
          onClick={() => navigate("/dashboard")}
        >
          <div
            className="w-6 h-6 flex items-center justify-center rounded"
            style={{ background: "rgba(201,168,76,0.15)" }}
          >
            <Scale size={14} style={{ color: "#C9A84C" }} />
          </div>
          <span
            className="tracking-widest text-xs uppercase"
            style={{ color: "#C9A84C", letterSpacing: "0.2em" }}
          >
            JURIS
          </span>
        </button>

        {/* Breadcrumb */}
        {crumbs && (
          <div className="flex items-center gap-1 mr-6 flex-shrink-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs"
              style={{ color: "#6B7280" }}
            >
              Home
            </button>
            {crumbs.map((c, i) => (
              <div key={i} className="flex items-center gap-1">
                <ChevronRight
                  size={10}
                  style={{ color: "#6B7280" }}
                />
                <button
                  className="text-xs"
                  style={{
                    color:
                      i === crumbs.length - 1
                        ? "#E8EBF0"
                        : "#6B7280",
                  }}
                  onClick={() => navigate(c.path)}
                >
                  {c.label}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-sm">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#6B7280" }}
            />
            <input
              type="text"
              placeholder="Search modules, cases, advisors..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 text-xs rounded-md outline-none"
              style={{
                background: "rgba(13,21,38,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#E8EBF0",
              }}
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 ml-6">
          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-1.5 rounded flex items-center justify-center"
              style={{ color: "#6B7280" }}
              onClick={() => {
                setNotifOpen(!notifOpen);
                setShowProfile(false);
              }}
            >
              <Bell size={15} />
              <span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                style={{ background: "#C9A84C" }}
              />
            </button>
            {notifOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-lg border p-4"
                style={{
                  background: "#0D1526",
                  borderColor: "rgba(255,255,255,0.08)",
                  zIndex: 50,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs"
                    style={{ color: "#E8EBF0" }}
                  >
                    Notifications
                  </span>
                  <button onClick={() => setNotifOpen(false)}>
                    <X size={12} style={{ color: "#6B7280" }} />
                  </button>
                </div>
                {[
                  {
                    title: "GST Return Due",
                    time: "2 hrs ago",
                    dot: "#EF4444",
                  },
                  {
                    title: "ROC Filing Reminder",
                    time: "1 day ago",
                    dot: "#F59E0B",
                  },
                  {
                    title: "Labour Law Update",
                    time: "2 days ago",
                    dot: "#C9A84C",
                  },
                ].map((n, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 py-2 border-b"
                    style={{
                      borderColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: n.dot }}
                    />
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "#E8EBF0" }}
                      >
                        {n.title}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "#6B7280" }}
                      >
                        {n.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Credits */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
            style={{
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.2)",
            }}
          >
            <Coins size={12} style={{ color: "#C9A84C" }} />
            <span
              className="text-xs"
              style={{ color: "#C9A84C" }}
            >
              {user?.credits ?? 0}
            </span>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              className="flex items-center gap-2"
              onClick={() => {
                setShowProfile(!showProfile);
                setNotifOpen(false);
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(13,21,38,0.9)",
                  border: "1px solid rgba(201,168,76,0.3)",
                }}
              >
                <CircleUser
                  size={14}
                  style={{ color: "#C9A84C" }}
                />
              </div>
              <span
                className="text-xs"
                style={{ color: "#E8EBF0" }}
              >
                {user?.name?.split(' ')[0] || "User"}
              </span>
            </button>
            {showProfile && (
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-lg border overflow-hidden"
                style={{
                  background: "#0D1526",
                  borderColor: "rgba(255,255,255,0.08)",
                  zIndex: 50,
                }}
              >
                {[
                  {
                    icon: <CircleUser size={13} />,
                    label: "Profile",
                    action: () => navigate("/profile"),
                  },
                  {
                    icon: <Settings size={13} />,
                    label: "Settings",
                    action: () => navigate("/profile"),
                  },
                  {
                    icon: <LogOut size={13} />,
                    label: "Sign Out",
                    action: handleSignOut,
                  },
                ].map((item, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-left transition-colors"
                    style={{ color: "#6B7280" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#E8EBF0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#6B7280")
                    }
                    onClick={() => {
                      item.action?.();
                      setShowProfile(false);
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative" style={{ zIndex: 5 }}>
        <Outlet />
      </main>
    </div>
  );
}