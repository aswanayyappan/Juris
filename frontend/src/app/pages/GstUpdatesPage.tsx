import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "../utils/api";
import { usePagination } from "@/components/hooks/use-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Article {
  id: string;
  date: string;
  title: string;
  url: string;
  content: string;
}

export function GstUpdatesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'news' | 'returns'>('news');
  const [articles, setArticles] = useState<Article[]>([]);
  const [returnsArticles, setReturnsArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Derive the active array
  const activeData = activeTab === 'news' ? articles : returnsArticles;

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages: Math.ceil(activeData.length / itemsPerPage),
    paginationItemsToDisplay: 5,
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArticles = activeData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, returnsRes] = await Promise.all([
          api.get<{ articles: Article[] }>("/gst-news"),
          api.get<{ articles: Article[] }>("/gst-returns")
        ]);
        setArticles(newsRes.articles || []);
        setReturnsArticles(returnsRes.articles || []);
      } catch (err) {
        console.error("Failed to fetch GST updates", err);
        setError("Failed to load the latest GST updates or returns metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen px-6 py-8" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8 border-b pb-6" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs w-fit transition-colors mb-2"
          style={{ color: "#9CA3AF" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#E8EBF0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(201,168,76,0.12)" }}>
            <FileText size={20} style={{ color: "#C9A84C" }} />
          </div>
          <div>
            <h1 className="text-2xl" style={{ color: "#E8EBF0", fontWeight: 600 }}>GST News & Updates</h1>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Live scraped data from the official portal.</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <button
          onClick={() => { setActiveTab('news'); setCurrentPage(1); }}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2`}
          style={{ 
            color: activeTab === 'news' ? "#E8EBF0" : "#6B7280",
            borderColor: activeTab === 'news' ? "#C9A84C" : "transparent"
          }}
          onMouseEnter={(e) => activeTab !== 'news' && (e.currentTarget.style.color = "#9CA3AF")}
          onMouseLeave={(e) => activeTab !== 'news' && (e.currentTarget.style.color = "#6B7280")}
        >
          News / Updates
        </button>
        <button
          onClick={() => { setActiveTab('returns'); setCurrentPage(1); }}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2`}
          style={{ 
            color: activeTab === 'returns' ? "#E8EBF0" : "#6B7280",
            borderColor: activeTab === 'returns' ? "#C9A84C" : "transparent"
          }}
          onMouseEnter={(e) => activeTab !== 'returns' && (e.currentTarget.style.color = "#9CA3AF")}
          onMouseLeave={(e) => activeTab !== 'returns' && (e.currentTarget.style.color = "#6B7280")}
        >
          Returns
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(201,168,76,0.5)", borderTopColor: "transparent" }} />
          <p className="text-xs" style={{ color: "#9CA3AF" }}>Fetching latest regulations...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg p-6 text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : activeData.length === 0 ? (
        <div className="rounded-lg p-10 text-center" style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>No GST data found for this category. The scraper may need time to collect data.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {paginatedArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => navigate('/gst-updates/details', { state: { article } })}
              className="rounded-xl p-5 md:p-6 transition-all group cursor-pointer"
              style={{
                background: "#0D1526",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5"
                  style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}
                >
                  <Calendar size={12} /> {article.date}
                </span>
              </div>
              
              <h3 className="text-lg md:text-xl font-medium mb-3 leading-snug" style={{ color: "#E8EBF0" }}>
                {article.title}
              </h3>
              
              <p className="text-sm leading-relaxed line-clamp-3 mb-5" style={{ color: "#9CA3AF" }}>
                {article.content || "Click to view the full circular/notification details."}
              </p>
              
              {/* Optional: Prevents explicit click bubbling if they just want the direct link instead of details */}
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: "#C9A84C" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E5C058")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#C9A84C")}
              >
                Read Official Document <ExternalLink size={12} />
              </a>
            </div>
          ))}
          
          {/* Pagination Controls */}
          {activeData.length > itemsPerPage && (
            <div className="mt-8 mb-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {showLeftEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {pages.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {showRightEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(Math.ceil(activeData.length / itemsPerPage), p + 1))
                      }
                      aria-disabled={currentPage === Math.ceil(activeData.length / itemsPerPage)}
                      className={
                        currentPage === Math.ceil(activeData.length / itemsPerPage)
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
