import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Star,
  MessageCircle,
  CalendarClock,
  BookmarkPlus,
  Search,
  SlidersHorizontal,
  Users,
  CheckCheck,
} from "lucide-react";

import { useLocation } from "react-router";

export interface Mentor {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  rating: number;
  chats: number;
  available: boolean;
  availableUntil?: string;
  avatar: string;
  experience: string;
  languages: string[];
  fee: string;
  category: "legal" | "mentor";
}

export const mentors: Mentor[] = [
  // --- LEGAL DIRECTORY ---
  {
    id: "1",
    name: "Justice (Retd.) Anil Desai",
    title: "Former High Court Judge",
    expertise: ["Constitutional Law", "Arbitration", "Litigation"],
    rating: 5.0,
    chats: 142,
    available: true,
    availableUntil: "6:00 PM",
    avatar: "https://images.unsplash.com/photo-1556157382-97eda2d62296?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    experience: "35 yrs",
    languages: ["English", "Marathi"],
    fee: "₹5,000/hr",
    category: "legal",
  },
  {
    id: "2",
    name: "Adv. Priya Sharma",
    title: "Corporate Law Specialist",
    expertise: ["ROC / MCA", "Company Law", "M&A"],
    rating: 4.8,
    chats: 278,
    available: true,
    availableUntil: "7:30 PM",
    avatar: "https://images.unsplash.com/photo-1736939666660-d4c776e0532c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    experience: "12 yrs",
    languages: ["English", "Hindi"],
    fee: "₹1,000/hr",
    category: "legal",
  },
  {
    id: "3",
    name: "Adv. Rahul Mehta",
    title: "Senior Tax Advocate",
    expertise: ["GST", "Income Tax", "Tax Litigation"],
    rating: 4.9,
    chats: 312,
    available: false,
    avatar: "https://images.unsplash.com/photo-1624670319970-37aa780d4874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    experience: "18 yrs",
    languages: ["English", "Hindi", "Gujarati"],
    fee: "₹800/hr",
    category: "legal",
  },
  // --- MENTOR DIRECTORY ---
  {
    id: "4",
    name: "Prof. Dr. Sameer Patil",
    title: "Business Professor & Coach",
    expertise: ["Startup Strategy", "Operations", "Fundraising"],
    rating: 4.9,
    chats: 450,
    available: true,
    availableUntil: "9:00 PM",
    avatar: "https://images.unsplash.com/photo-1652565436975-5ac0c22fb3ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    experience: "25 yrs",
    languages: ["English", "Hindi"],
    fee: "₹500/hr",
    category: "mentor",
  },
  {
    id: "5",
    name: "Neha Gupta",
    title: "Founder Growth Mentor",
    expertise: ["Marketing", "Team Scaling", "Leadership"],
    rating: 4.7,
    chats: 189,
    available: true,
    availableUntil: "8:00 PM",
    avatar: "https://images.unsplash.com/photo-1736939678218-bd648b5ef3bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    experience: "10 yrs",
    languages: ["English"],
    fee: "₹0 (Community)",
    category: "mentor",
  },
  {
    id: "6",
    name: "Arun Kumar",
    title: "Agile Teacher & Tech Advisor",
    expertise: ["Software Dev", "Agile Training", "Roadmapping"],
    rating: 4.8,
    chats: 203,
    available: false,
    avatar: "https://images.unsplash.com/photo-1763598461615-610264129bea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    experience: "14 yrs",
    languages: ["English", "Tamil"],
    fee: "₹600/hr",
    category: "mentor",
  },
];

const filterTabs = ["All", "Online", "GST & Tax", "Labour Law", "Corporate"];

export function MentorsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const categoryFilter = location.state?.category || "legal"; // default to legal advisory

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const filtered = mentors.filter((m) => {
    // 1. Enforce strict category match (Legal vs Mentor)
    if (m.category !== categoryFilter) return false;

    // 2. Process secondary search matches
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.expertise.some((e) => e.toLowerCase().includes(search.toLowerCase()));
    
    // 3. Process secondary tab matches
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "Online" && m.available) ||
      m.expertise.some((e) =>
        e.toLowerCase().includes(activeFilter.toLowerCase())
      );
      
    return matchSearch && matchFilter;
  });

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen px-6 py-8" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#C9A84C", letterSpacing: "0.18em" }}>
          Live Directory
        </p>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl" style={{ color: "#E8EBF0", fontWeight: 500 }}>
              {categoryFilter === "legal" ? "Live Legal Advisory" : "Live Mentors"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
              {categoryFilter === "legal" 
                ? "Connect with verified Advocates, Judges, and Legal Experts" 
                : "Connect with Teachers, Coaches, and Business Strategy Mentors"}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
            <span className="text-xs" style={{ color: "#6B7280" }}>
              <span style={{ color: "#22C55E" }}>{mentors.filter((m) => m.available).length}</span> mentors online now
            </span>
          </div>
        </div>
        <div className="mt-6 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
          <input
            type="text"
            placeholder="Search mentors or expertise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-xs rounded-lg outline-none"
            style={{
              background: "#0D1526",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#E8EBF0",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
          />
        </div>
        <div className="flex items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className="px-3 py-1.5 text-xs rounded-lg transition-all"
              style={{
                background: activeFilter === tab ? "rgba(201,168,76,0.12)" : "#0D1526",
                border: `1px solid ${activeFilter === tab ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.05)"}`,
                color: activeFilter === tab ? "#C9A84C" : "#6B7280",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          className="p-2 rounded-lg"
          style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)", color: "#6B7280" }}
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Mentor Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Users size={32} style={{ color: "#374151" }} />
          <p className="mt-3 text-sm" style={{ color: "#6B7280" }}>No mentors found</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              isBookmarked={bookmarked.has(mentor.id)}
              onBookmark={() => toggleBookmark(mentor.id)}
              onChat={() => navigate(`/mentors/${mentor.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MentorCardProps {
  mentor: Mentor;
  isBookmarked: boolean;
  onBookmark: () => void;
  onChat: () => void;
}

function MentorCard({ mentor, isBookmarked, onBookmark, onChat }: MentorCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0D1526",
        border: `1px solid ${hovered ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.05)"}`,
        transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "0 4px 20px rgba(201,168,76,0.06)" : "none",
      }}
    >
      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
          style={{
            background: mentor.available
              ? "rgba(34,197,94,0.1)"
              : "rgba(107,114,128,0.1)",
            border: `1px solid ${mentor.available ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.2)"}`,
            color: mentor.available ? "#22C55E" : "#6B7280",
          }}
        >
          <div
            className="w-1 h-1 rounded-full"
            style={{
              background: mentor.available ? "#22C55E" : "#6B7280",
            }}
          />
          {mentor.available ? "Online" : "Offline"}
        </div>
      </div>

      {/* Header */}
      <div
        className="p-5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-start gap-3">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
            style={{ border: "2px solid rgba(201,168,76,0.2)" }}
          />
          <div className="pt-1">
            <h3 className="text-sm" style={{ color: "#E8EBF0", fontWeight: 500 }}>
              {mentor.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
              {mentor.title}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {mentor.expertise.slice(0, 2).map((exp, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{
                    background: "rgba(201,168,76,0.08)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    color: "#C9A84C",
                  }}
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between text-xs" style={{ color: "#6B7280" }}>
          <div className="flex items-center gap-1.5">
            <Star size={12} style={{ color: "#F59E0B" }} />
            <span style={{ color: "#E8EBF0" }}>{mentor.rating}</span>
            <span>Rating</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle size={12} />
            <span>{mentor.chats} Chats</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: "#E8EBF0" }}>{mentor.experience}</span>
            <span>Exp</span>
          </div>
        </div>

        {mentor.available && mentor.availableUntil && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
            <CalendarClock size={12} />
            <span>Available today · Until {mentor.availableUntil}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
          <span style={{ color: "#374151" }}>Languages:</span>
          <span style={{ color: "#9CA3AF" }}>{mentor.languages.join(", ")}</span>
          <span className="ml-auto" style={{ color: "#C9A84C" }}>{mentor.fee}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onChat}
            disabled={!mentor.available}
            className="flex-1 py-2 rounded-lg text-xs transition-all disabled:opacity-40"
            style={{
              border: `1px solid ${mentor.available ? "#C9A84C" : "rgba(201,168,76,0.3)"}`,
              color: mentor.available ? "#C9A84C" : "rgba(201,168,76,0.4)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              if (mentor.available) {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.1)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            {mentor.available ? "Join Live Chat" : "Unavailable"}
          </button>
          <button
            onClick={onBookmark}
            className="p-2 rounded-lg transition-all"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              color: isBookmarked ? "#C9A84C" : "#6B7280",
              background: isBookmarked ? "rgba(201,168,76,0.08)" : "transparent",
            }}
          >
            {isBookmarked ? <CheckCheck size={14} /> : <BookmarkPlus size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}