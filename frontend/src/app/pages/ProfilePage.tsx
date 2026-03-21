import { useState } from "react";
import {
  CircleUser,
  Mail,
  Phone,
  Building2,
  MapPin,
  Shield,
  Star,
  Clock,
  FileText,
  Edit3,
  Camera,
  Check,
  X,
  Bell,
  Lock,
  Globe,
  CreditCard,
  ChevronRight,
  Activity,
  Award,
  BookOpen,
  TrendingUp,
  Coins,
  LogOut,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const AVATAR_URL =
  "https://images.unsplash.com/photo-1624670319970-37aa780d4874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (v: string) => void;
  type?: string;
}

function EditableField({ label, value, onSave, type = "text" }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => {
    onSave(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-wider" style={{ color: "#374151", letterSpacing: "0.1em" }}>
        {label}
      </label>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg outline-none"
            style={{
              background: "#060B18",
              border: "1px solid rgba(201,168,76,0.4)",
              color: "#E8EBF0",
            }}
          />
          <button
            onClick={save}
            className="p-1.5 rounded-lg"
            style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C" }}
          >
            <Check size={13} />
          </button>
          <button
            onClick={cancel}
            className="p-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", color: "#6B7280" }}
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div
          className="flex items-center justify-between group px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          onClick={() => setEditing(true)}
        >
          <span className="text-sm" style={{ color: "#E8EBF0" }}>{value}</span>
          <Edit3
            size={12}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "#C9A84C" }}
          />
        </div>
      )}
    </div>
  );
}

const activityLog = [
  { action: "GST Return GSTR-3B filed", time: "2 hours ago", type: "ok" },
  { action: "Consulted Adv. Rahul Mehta", time: "Yesterday, 4:30 PM", type: "info" },
  { action: "ROC Form MGT-7A submitted", time: "2 days ago", type: "ok" },
  { action: "Labour Law audit triggered", time: "3 days ago", type: "warning" },
  { action: "Compliance score updated to 82%", time: "4 days ago", type: "ok" },
  { action: "PF challan payment processed", time: "5 days ago", type: "ok" },
];

const badges = [
  { label: "GST Expert", icon: <Star size={13} />, color: "#F59E0B" },
  { label: "100+ Filings", icon: <CheckCircle2 size={13} />, color: "#22C55E" },
  { label: "Compliance Pro", icon: <Shield size={13} />, color: "#C9A84C" },
  { label: "Early Adopter", icon: <Award size={13} />, color: "#818CF8" },
];

const stats = [
  { label: "Compliance Score", value: "82%", icon: <TrendingUp size={15} />, color: "#22C55E", sub: "+4% this month" },
  { label: "Filings Done", value: "124", icon: <FileText size={15} />, color: "#C9A84C", sub: "Since Jan 2024" },
  { label: "Sessions Used", value: "38", icon: <Clock size={15} />, color: "#818CF8", sub: "With mentors" },
  { label: "Credits Left", value: "240", icon: <Coins size={15} />, color: "#F59E0B", sub: "Top up anytime" },
];

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: <Bell size={14} />, label: "Notification Preferences" },
      { icon: <Lock size={14} />, label: "Security & Password" },
      { icon: <Globe size={14} />, label: "Language & Region" },
    ],
  },
  {
    title: "Billing",
    items: [
      { icon: <CreditCard size={14} />, label: "Subscription Plan", badge: "Pro" },
      { icon: <Coins size={14} />, label: "Credits & Top-Up" },
      { icon: <FileText size={14} />, label: "Billing History" },
    ],
  },
  {
    title: "Legal",
    items: [
      { icon: <BookOpen size={14} />, label: "Terms of Service" },
      { icon: <Shield size={14} />, label: "Privacy Policy" },
    ],
  },
];

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "User",
    email: user?.email || "",
    phone: "+91 98765 43210",
    company: "Verma & Associates LLP",
    location: "Mumbai, Maharashtra",
    role: user?.role === 'legal_assistant' ? 'Legal Assistant' : "Business User",
    gstin: "27AABCV1234M1Z5",
    pan: "AABCV1234M",
    bio: "Compliance professional with 8+ years in GST, ROC filings, and labour law. Passionate about making legal compliance accessible for Indian SMEs.",
  });

  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "settings">("overview");

  const update = (key: keyof typeof profile) => (val: string) =>
    setProfile((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen px-4 md:px-8 py-8" style={{ maxWidth: "1200px", margin: "0 auto" }}>

      {/* ── Profile Hero Card ── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6"
        style={{
          background: "#0D1526",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Gold banner strip */}
        <div
          className="h-28 w-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(13,21,38,0.6) 60%, #0D1526 100%)",
            borderBottom: "1px solid rgba(201,168,76,0.1)",
          }}
        >
          {/* Decorative hex shapes */}
          <svg className="absolute top-0 right-0 opacity-10" width="340" height="112" viewBox="0 0 340 112">
            {[0,1,2].map((i) => {
              const cx = 300 - i * 70;
              const cy = 56;
              const r = 50 - i * 8;
              const pts = Array.from({ length: 6 }, (_, k) => {
                const a = (k / 6) * Math.PI * 2 - Math.PI / 6;
                return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
              }).join(" ");
              return <polygon key={i} points={pts} fill="none" stroke="#C9A84C" strokeWidth="1" />;
            })}
          </svg>
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={AVATAR_URL}
                alt={profile.name}
                className="w-24 h-24 rounded-2xl object-cover"
                style={{ border: "3px solid rgba(201,168,76,0.4)" }}
              />
              <button
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "#C9A84C", color: "#060B18" }}
              >
                <Camera size={13} />
              </button>
            </div>

            {/* Name / role */}
            <div className="flex-1 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-xl" style={{ color: "#E8EBF0", fontWeight: 600 }}>
                  {profile.name}
                </h1>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    color: "#C9A84C",
                  }}
                >
                  <Shield size={10} />
                  Pro Plan
                </div>
              </div>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                {profile.role} · {profile.company}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
                  <MapPin size={11} /> {profile.location}
                </span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
                  <Mail size={11} /> {profile.email}
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 sm:pb-1">
              {badges.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                  style={{
                    background: `${b.color}14`,
                    border: `1px solid ${b.color}33`,
                    color: b.color,
                  }}
                >
                  {b.icon}
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center border-t px-6"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          {(["overview", "activity", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-4 py-3 text-xs capitalize transition-colors"
              style={{
                color: activeTab === tab ? "#C9A84C" : "#6B7280",
                borderBottom: activeTab === tab ? "2px solid #C9A84C" : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="rounded-xl p-4 flex items-start gap-3"
            style={{
              background: "#0D1526",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}14`, color: s.color }}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-lg" style={{ color: "#E8EBF0", fontWeight: 600, lineHeight: 1.2 }}>
                {s.label === 'Credits Left' ? (user?.credits ?? 0) : s.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color: s.color }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div
            className="lg:col-span-2 rounded-xl p-6"
            style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm" style={{ color: "#E8EBF0", fontWeight: 500 }}>
                Personal Information
              </h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(201,168,76,0.08)", color: "#C9A84C" }}>
                Click any field to edit
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditableField label="Full Name" value={profile.name} onSave={update("name")} />
              <EditableField label="Role / Title" value={profile.role} onSave={update("role")} />
              <EditableField label="Email Address" value={profile.email} onSave={update("email")} type="email" />
              <EditableField label="Phone Number" value={profile.phone} onSave={update("phone")} type="tel" />
              <EditableField label="Company / Firm" value={profile.company} onSave={update("company")} />
              <EditableField label="Location" value={profile.location} onSave={update("location")} />
            </div>

            <div className="mt-5 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#374151", letterSpacing: "0.1em" }}>
                Bio
              </p>
              <EditableField label="" value={profile.bio} onSave={update("bio")} />
            </div>
          </div>

          {/* Legal Identifiers + Compliance */}
          <div className="flex flex-col gap-5">
            {/* Legal IDs */}
            <div
              className="rounded-xl p-5"
              style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <h2 className="text-sm mb-4" style={{ color: "#E8EBF0", fontWeight: 500 }}>
                Legal Identifiers
              </h2>
              <div className="flex flex-col gap-3">
                <EditableField label="GSTIN" value={profile.gstin} onSave={update("gstin")} />
                <EditableField label="PAN" value={profile.pan} onSave={update("pan")} />
              </div>
            </div>

            {/* Compliance Health */}
            <div
              className="rounded-xl p-5"
              style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <h2 className="text-sm mb-4" style={{ color: "#E8EBF0", fontWeight: 500 }}>
                Compliance Health
              </h2>

              {/* Score ring */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="26"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="6"
                      strokeDasharray={`${(82 / 100) * 163.4} 163.4`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className="absolute inset-0 flex items-center justify-center text-sm"
                    style={{ color: "#22C55E", fontWeight: 600 }}
                  >
                    82
                  </span>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#E8EBF0", fontWeight: 500 }}>Good Standing</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>+4 pts from last month</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: "GST Compliance", pct: 90, color: "#22C55E" },
                  { label: "Labour Law", pct: 68, color: "#F59E0B" },
                  { label: "ROC / MCA", pct: 95, color: "#22C55E" },
                  { label: "Licenses", pct: 75, color: "#C9A84C" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: "#6B7280" }}>{item.label}</span>
                      <span className="text-xs" style={{ color: item.color }}>{item.pct}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Log */}
          <div
            className="lg:col-span-2 rounded-xl p-6"
            style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <h2 className="text-sm mb-5" style={{ color: "#E8EBF0", fontWeight: 500 }}>
              Recent Activity
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-2.5 top-0 bottom-0 w-px"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
              <div className="flex flex-col gap-5">
                {activityLog.map((item, i) => {
                  const dotColor =
                    item.type === "ok"
                      ? "#22C55E"
                      : item.type === "warning"
                      ? "#F59E0B"
                      : "#C9A84C";
                  return (
                    <div key={i} className="flex items-start gap-4 pl-1">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 z-10"
                        style={{ background: `${dotColor}18`, border: `1.5px solid ${dotColor}55` }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: "#E8EBF0" }}>{item.action}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="flex flex-col gap-5">
            <div
              className="rounded-xl p-5"
              style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <h2 className="text-sm mb-4" style={{ color: "#E8EBF0", fontWeight: 500 }}>
                Monthly Usage
              </h2>
              <div className="space-y-4">
                {[
                  { label: "AI Chat Queries", used: 38, total: 50, color: "#C9A84C" },
                  { label: "Mentor Sessions", used: 4, total: 10, color: "#818CF8" },
                  { label: "Documents Filed", used: 12, total: 20, color: "#22C55E" },
                ].map((u) => (
                  <div key={u.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs" style={{ color: "#6B7280" }}>{u.label}</span>
                      <span className="text-xs" style={{ color: "#9CA3AF" }}>
                        {u.used}<span style={{ color: "#374151" }}>/{u.total}</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(u.used / u.total) * 100}%`, background: u.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Credits card */}
            <div
              className="rounded-xl p-5 relative overflow-hidden"
              style={{
                background: "rgba(201,168,76,0.06)",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10" style={{ background: "#C9A84C" }} />
              <div className="flex items-center justify-between mb-3">
                <Coins size={18} style={{ color: "#C9A84C" }} />
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>
                  Active
                </span>
              </div>
              <p className="text-2xl" style={{ color: "#C9A84C", fontWeight: 700, lineHeight: 1 }}>{user?.credits ?? 0}</p>
              <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>Credits remaining</p>
              <button
                className="mt-4 w-full py-2 rounded-lg text-xs transition-all"
                style={{
                  background: "rgba(201,168,76,0.15)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#C9A84C",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.25)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.15)")}
              >
                Top Up Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">
            {settingsSections.map((section) => (
              <div
                key={section.title}
                className="rounded-xl overflow-hidden"
                style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div
                  className="px-5 py-3 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <p className="text-xs uppercase tracking-widest" style={{ color: "#374151", letterSpacing: "0.12em" }}>
                    {section.title}
                  </p>
                </div>
                {section.items.map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors group"
                    style={{ borderBottom: i < section.items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ color: "#6B7280" }}>{item.icon}</span>
                      <span className="text-sm" style={{ color: "#E8EBF0" }}>{item.label}</span>
                      {"badge" in item && item.badge && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ChevronRight size={14} style={{ color: "#374151" }} className="group-hover:text-gray-400 transition-colors" />
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Danger Zone */}
          <div className="flex flex-col gap-5">
            <div
              className="rounded-xl p-5"
              style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <h2 className="text-sm mb-4" style={{ color: "#E8EBF0", fontWeight: 500 }}>
                Subscription
              </h2>
              <div
                className="rounded-lg p-4"
                style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: "#C9A84C", fontWeight: 600 }}>Pro Plan</span>
                  <span className="text-xs" style={{ color: "#6B7280" }}>₹2,499/mo</span>
                </div>
                <p className="text-xs" style={{ color: "#6B7280" }}>Renews on April 21, 2026</p>
                <div className="flex flex-col gap-2 mt-3">
                  {["50 AI queries/mo", "10 Mentor sessions", "All modules", "Priority support"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs" style={{ color: "#9CA3AF" }}>
                      <CheckCircle2 size={11} style={{ color: "#22C55E" }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="mt-3 w-full py-2 rounded-lg text-xs transition-all"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  color: "#C9A84C",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.18)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.1)")}
              >
                Upgrade to Enterprise
              </button>
            </div>

            {/* Danger zone */}
            <div
              className="rounded-xl p-5"
              style={{ background: "#0D1526", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <h2 className="text-sm mb-4" style={{ color: "#EF4444", fontWeight: 500 }}>
                Danger Zone
              </h2>
              <div className="flex flex-col gap-2">
                <button
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs text-left transition-colors"
                  style={{ border: "1px solid rgba(239,68,68,0.15)", color: "#EF4444" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.05)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                >
                  <AlertTriangle size={13} />
                  Delete Account
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs text-left transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#6B7280" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#E8EBF0";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#6B7280";
                  }}
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
