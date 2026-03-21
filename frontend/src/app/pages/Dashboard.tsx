import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  Briefcase,
  Bot,
  Users,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Gavel,
  Activity,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";

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
    id: "business",
    icon: <Briefcase size={18} />,
    title: "Business Operations",
    description: "Manage your company profile and core compliance filings",
    path: "/business",
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
  },
];

const statusColors: Record<string, string> = {
  warning: "#F59E0B",
  ok: "#22C55E",
  alert: "#EF4444",
};

const stats = [];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);
  const [gstNews, setGstNews] = useState<any[]>([]);
  const [esicNews, setEsicNews] = useState<any[]>([]);

  // Fetch scraped data on component mount
  useEffect(() => {
    const fetchScrapedData = async () => {
      try {
        console.log('[Dashboard] Fetching scraped data...');
        
        const gstRes = await api.get('/gst-news').catch((err: any) => {
          console.error('[Dashboard] GST API error:', err);
          return { articles: [] };
        });
        
        const esicRes = await api.get('/esic-news').catch((err: any) => {
          console.error('[Dashboard] ESIC API error:', err);
          return { articles: [] };
        });
        
        console.log('[Dashboard] GST response type:', typeof gstRes, 'has articles:', !!gstRes?.articles);
        console.log('[Dashboard] ESIC response type:', typeof esicRes, 'has articles:', !!esicRes?.articles);
        
        // Get articles from response - api.get returns JSON directly (not wrapped in data)
        const gstArticles = Array.isArray(gstRes?.articles) ? gstRes.articles : [];
        const esicArticles = Array.isArray(esicRes?.articles) ? esicRes.articles : [];
        
        console.log('[Dashboard] GST articles count:', gstArticles.length);
        console.log('[Dashboard] ESIC articles count:', esicArticles.length);
        
        if (gstArticles.length > 0) console.log('[Dashboard] First GST article:', gstArticles[0]);
        if (esicArticles.length > 0) console.log('[Dashboard] First ESIC article:', esicArticles[0]);
        
        setGstNews(gstArticles.slice(0, 2));
        setEsicNews(esicArticles.slice(0, 3));
      } catch (err: any) {
        console.error('[Dashboard] Unexpected error:', err);
      }
    };
    
    fetchScrapedData();
  }, []);

  const handleModuleClick = (mod: Module) => {
    if (mod.path) {
      const state = mod.id === "legal-advisory" ? { category: 'legal' } : mod.id === "mentors" ? { category: 'mentor' } : undefined;
      navigate(mod.path, { state });
    }
  };

  return (
    <div className="flex flex-col h-screen px-6 py-8" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <div className="flex-1 overflow-y-auto">
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
          </div>
        </div>

        {/* Divider */}
        <div
          className="mt-6 h-px"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
      </div>
      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 mt-6">
        {modules.map((mod) => {
          const isHovered = hovered === mod.id;
          const statusColor = mod.statusType
            ? statusColors[mod.statusType]
            : "transparent";

          return (
            <div
              key={mod.id}
              className="relative p-5 rounded-2xl cursor-pointer transition-all duration-300 group"
              style={{
                background: isHovered ? "rgba(255,255,255,0.03)" : "#0D1526",
                border: `1px solid ${
                  isHovered
                    ? mod.accent
                      ? "rgba(201,168,76,0.3)"
                      : "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.05)"
                }`,
                boxShadow: isHovered
                  ? "0 4px 24px rgba(201,168,76,0.06)"
                  : "none",
              }}
              onMouseEnter={() => setHovered(mod.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                if (mod.path) {
                  navigate(mod.path, { state: { persona: mod.id } });
                }
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
                {!!mod.path && (
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

      {/* Scraped Data Section */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#E8EBF0', marginBottom: '1rem' }}>Regulatory Updates</h3>
        
        {/* DEBUG INFO */}
        <div style={{  background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '11px', color: '#9CA3AF' }}>
          GST: {gstNews.length} articles | ESIC: {esicNews.length} articles
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* GST News */}
          <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', background: '#0D1526', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(61,142,255,0.05)')} onMouseLeave={(e) => (e.currentTarget.style.background = '#0D1526')} onClick={() => navigate('/scraped-data', { state: { tab: 'gst' } })}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#3D8EFF', marginBottom: '0.75rem', textTransform: 'uppercase', cursor: 'pointer' }}>✓ GST Updates</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {gstNews.length > 0 ? gstNews.map((article: any, idx: number) => (
                <div key={idx} style={{ paddingBottom: idx < gstNews.length - 1 ? '0.75rem' : '0', borderBottom: idx < gstNews.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                  <div style={{ fontSize: '11px', color: '#F59E0B', marginBottom: '0.25rem' }}>{article.date || 'Unknown'}</div>
                  <div style={{ fontSize: '12px', color: '#E8EBF0', fontWeight: 500, lineHeight: 1.3 }}>{article.title}</div>
                </div>
              )) : <div style={{ fontSize: '11px', color: '#6B7280' }}>No updates available</div>}
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '11px', color: '#3D8EFF', fontWeight: 500 }}>View All →</div>
          </div>

          {/* ESIC News */}
          <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', background: '#0D1526', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,68,85,0.05)')} onMouseLeave={(e) => (e.currentTarget.style.background = '#0D1526')} onClick={() => navigate('/scraped-data', { state: { tab: 'esic' } })}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#FF4455', marginBottom: '0.75rem', textTransform: 'uppercase', cursor: 'pointer' }}>✓ ESIC Circulars</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {esicNews.length > 0 ? esicNews.map((article: any, idx: number) => (
                <div key={idx} style={{ paddingBottom: idx < esicNews.length - 1 ? '0.75rem' : '0', borderBottom: idx < esicNews.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                  <div style={{ fontSize: '11px', color: '#F59E0B', marginBottom: '0.25rem' }}>{article.date || 'Unknown'}</div>
                  <div style={{ fontSize: '12px', color: '#E8EBF0', fontWeight: 500, lineHeight: 1.3 }}>{article.title}</div>
                </div>
              )) : <div style={{ fontSize: '11px', color: '#6B7280' }}>No updates available</div>}
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '11px', color: '#FF4455', fontWeight: 500 }}>View All →</div>
          </div>
        </div>
      </div>
      </div>

      {/* Footer - Always at bottom */}
      <div className="mt-auto pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <p className="text-xs text-center" style={{ color: "#374151" }}>
          JURIS Compliance OS · v2.1.0 · All data encrypted and secure
        </p>
      </div>
    </div>
  );
}