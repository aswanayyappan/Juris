import { useState } from "react";
import { useNavigate } from "react-router";
import {
  FileText,
  Building2,
  Calculator,
  Briefcase,
  ClipboardList,
  ShieldAlert,
  Activity,
  Bot,
  Users,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Gavel,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface Module {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: string;
  statusType?: "warning" | "ok" | "alert";
  path?: string;
  accent?: boolean;
}

const modules: Module[] = [
  {
    id: "gst",
    icon: <FileText size={18} />,
    title: "GST & Tax Compliance",
    description: "Manage GST returns, invoices, and tax filings",
    path: "/gst-updates",
    status: "2 pending",
    statusType: "warning",
  },
  {
    id: "roc",
    icon: <Building2 size={18} />,
    title: "ROC / MCA",
    description: "Company registrations, annual returns, MCA filings",
    status: "Up to date",
    statusType: "ok",
  },
  {
    id: "income-tax",
    icon: <Calculator size={18} />,
    title: "Income Tax",
    description: "ITR filing, TDS management, advance tax planning",
    status: "1 due soon",
    statusType: "warning",
  },
  {
    id: "labour",
    icon: <Briefcase size={18} />,
    title: "Labour Law",
    description: "PF, ESI, gratuity, and employment regulations",
    path: "/esic-updates",
    status: "3 alerts",
    statusType: "alert",
  },
  {
    id: "licenses",
    icon: <ClipboardList size={18} />,
    title: "Licenses & Registrations",
    description: "Track all business licenses and renewal dates",
    status: "1 expiring",
    statusType: "warning",
  },
  {
    id: "risk",
    icon: <ShieldAlert size={18} />,
    title: "Risk & Alerts",
    description: "Real-time compliance risk monitoring and alerts",
    status: "High priority",
    statusType: "alert",
  },
  {
    id: "health",
    icon: <Activity size={18} />,
    title: "Compliance Health",
    description: "Overall compliance score and health dashboard",
    status: "Score: 82/100",
    statusType: "ok",
  },
  {
    id: "legal-advisory",
    icon: <Gavel size={18} />,
    title: "Live Legal Advisory",
    description: "Connect with real expert lawyers in real time",
    path: "/mentors",
    accent: true,
  },
  {
    id: "mentors",
    icon: <Users size={18} />,
    title: "Live Mentors",
    description: "Connect with experienced CAs and business mentors",
    path: "/mentors",
    accent: true,
  },
  {
    id: "ai-assistant",
    icon: <Bot size={18} />,
    title: "AI Legal Assistant",
    description: "Ask legal questions and get instant compliance guidance from the AI",
    path: "/chat",
    accent: true,
  },
];

const statusColors: Record<string, string> = {
  warning: "#F59E0B",
  ok: "#22C55E",
  alert: "#EF4444",
};

const stats = [
  { label: "Compliance Score", value: "82%", icon: <TrendingUp size={14} />, color: "#22C55E" },
  { label: "Pending Actions", value: "7", icon: <AlertTriangle size={14} />, color: "#F59E0B" },
  { label: "Modules Active", value: "9", icon: <CheckCircle2 size={14} />, color: "#C9A84C" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);

  const handleModuleClick = (mod: Module) => {
    if (mod.path) {
      const state = mod.id === "legal-advisory" ? { category: 'legal' } : mod.id === "mentors" ? { category: 'mentor' } : undefined;
      navigate(mod.path, { state });
    }
  };

  return (
    <div className="min-h-screen px-6 py-8" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#C9A84C", letterSpacing: "0.18em" }}>
              Compliance OS
            </p>
            <h1
              className="text-2xl"
              style={{ color: "#E8EBF0", fontWeight: 500, lineHeight: 1.3 }}
            >
              Good morning, {user?.name?.split(' ')[0] || "User"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
              Saturday, 21 March 2026 · FY 2025–26
            </p>
          </div>
          {/* Stats Row */}
          <div className="hidden md:flex items-center gap-3">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: "#0D1526",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span style={{ color: s.color }}>{s.icon}</span>
                <div>
                  <p className="text-xs" style={{ color: "#6B7280" }}>{s.label}</p>
                  <p className="text-sm" style={{ color: "#E8EBF0", fontWeight: 500 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="mt-6 h-px"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
      </div>

      {/* Module Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => {
          const isHovered = hovered === mod.id;
          const isClickable = !!mod.path;

          return (
            <div
              key={mod.id}
              onClick={() => handleModuleClick(mod)}
              onMouseEnter={() => setHovered(mod.id)}
              onMouseLeave={() => setHovered(null)}
              className="relative rounded-lg p-6 flex flex-col gap-3 select-none"
              style={{
                background: "#0D1526",
                border: `1px solid ${isHovered ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.05)"}`,
                cursor: isClickable ? "pointer" : "default",
                transform: isHovered ? "translateY(-2px)" : "translateY(0px)",
                transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                boxShadow: isHovered
                  ? "0 4px 24px rgba(201,168,76,0.06)"
                  : "none",
              }}
            >
              {/* Gold accent line for AI & Mentors */}
              {mod.accent && (
                <div
                  className="absolute top-0 left-6 right-6 h-px"
                  style={{ background: "rgba(201,168,76,0.4)" }}
                />
              )}

              {/* Icon + Title Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: mod.accent
                        ? "rgba(201,168,76,0.12)"
                        : "rgba(255,255,255,0.04)",
                      color: mod.accent ? "#C9A84C" : "#9CA3AF",
                    }}
                  >
                    {mod.icon}
                  </div>
                  <h3
                    className="text-sm"
                    style={{
                      color: "#E8EBF0",
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {mod.title}
                  </h3>
                </div>
                {isClickable && (
                  <ChevronRight
                    size={14}
                    style={{
                      color: isHovered ? "#C9A84C" : "#6B7280",
                      transition: "color 0.2s",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                {mod.description}
              </p>

              {/* Status */}
              {mod.status && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: statusColors[mod.statusType!] }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: statusColors[mod.statusType!] }}
                  >
                    {mod.status}
                  </span>
                </div>
              )}

              {/* Gold accent dot for AI & Mentors */}
              {mod.accent && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#C9A84C" }}
                  />
                  <span className="text-xs" style={{ color: "#C9A84C" }}>
                    {mod.id === "ai" ? "Always available" : "Mentors online"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <p className="text-xs text-center" style={{ color: "#374151" }}>
          JURIS Compliance OS · v2.1.0 · All data encrypted and secure
        </p>
      </div>
    </div>
  );
}