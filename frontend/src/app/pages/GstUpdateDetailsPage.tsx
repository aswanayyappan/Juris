import { ArrowLeft, ExternalLink, Calendar, Link as LinkIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

interface Article {
  id: string;
  date: string;
  title: string;
  url: string;
  content: string;
}

export function GstUpdateDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const article = location.state?.article as Article | undefined;

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl" style={{ color: "#E8EBF0" }}>Article Data Not Found</h2>
        <p className="text-sm" style={{ color: "#9CA3AF" }}>The circular details could not be loaded into memory.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium transition-colors"
          style={{ color: "#C9A84C" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#E5C058")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#C9A84C")}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs w-fit transition-colors mb-8"
        style={{ color: "#9CA3AF" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#E8EBF0")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
      >
        <ArrowLeft size={14} /> Back to Updates
      </button>

      {/* Article Content Container */}
      <div 
        className="rounded-2xl p-6 md:p-10 shadow-lg" 
        style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span
            className="px-3 py-1.5 rounded-md text-xs flex items-center gap-2 font-medium"
            style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}
          >
            <Calendar size={14} /> {article.date || "Live Tracking"}
          </span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 leading-tight" style={{ color: "#E8EBF0" }}>
          {article.title}
        </h1>

        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors mb-10 px-4 py-2 rounded-lg"
          style={{ background: "rgba(255,255,255,0.03)", color: "#C9A84C", border: "1px solid rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
        >
          <LinkIcon size={14} /> Open Original Document Link <ExternalLink size={14} />
        </a>

        {/* Massive Paragraph Reader */}
        <div 
          className="text-base leading-loose max-w-none" 
          style={{ 
            color: "#D1D5DB", 
            whiteSpace: "pre-wrap", 
            wordBreak: "break-word"
          }}
        >
          {article.content ? article.content : "No parsed text available. Please read the official document link."}
        </div>
      </div>
    </div>
  );
}
