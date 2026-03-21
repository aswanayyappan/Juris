import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Briefcase, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "../utils/api";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { usePagination } from "@/components/hooks/use-pagination";

interface Article {
  id: string;
  date: string;
  title: string;
  url: string;
  content: string;
}

export function EsicUpdatesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;
  const paginationItemsToDisplay = 5;

  // Calculate pagination structures
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentArticles = articles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get<{ articles: Article[] }>("/esic-news");
        setArticles(res.articles || []);
      } catch (err) {
        console.error("Failed to fetch ESIC updates", err);
        setError("Failed to load the latest ESIC circulars.");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
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
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
            <Briefcase size={20} style={{ color: "#EF4444" }} />
          </div>
          <div>
            <h1 className="text-2xl" style={{ color: "#E8EBF0", fontWeight: 600 }}>ESIC / Labour Law Circulars</h1>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Live employment regulations scraped directly from official channels.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(239,68,68,0.5)", borderTopColor: "transparent" }} />
          <p className="text-xs" style={{ color: "#9CA3AF" }}>Fetching latest ESG/Labour updates...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg p-6 text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-lg p-10 text-center" style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>No ESIC circulars found. The scraper may need time to collect data logs.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {currentArticles.map((article) => (
            <div
              key={article.id}
              className="rounded-xl p-5 md:p-6 transition-all group hover:bg-[#111A2E]"
              style={{
                background: "#0D1526",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 font-medium"
                  style={{ background: "rgba(255,255,255,0.04)", color: "#EF4444" }}
                >
                  <Calendar size={12} /> {article.date}
                </span>
                <span className="text-xs" style={{ color: "#6B7280" }}>
                  {article.content}
                </span>
              </div>
              
              <h3 className="text-lg md:text-xl font-medium mb-4 leading-snug" style={{ color: "#E8EBF0" }}>
                {article.title}
              </h3>
              
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: "#3B82F6" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#60A5FA")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#3B82F6")}
              >
                View Circular PDF <ExternalLink size={12} />
              </a>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      style={{ background: "#0D1526", borderColor: "rgba(255,255,255,0.1)", color: "#E8EBF0" }}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      ←
                    </Button>
                  </PaginationItem>

                  {showLeftEllipsis && (
                    <>
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(1)} style={{ color: "#9CA3AF" }}>1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis style={{ color: "#9CA3AF" }} />
                      </PaginationItem>
                    </>
                  )}

                  {pages.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        style={{
                          background: currentPage === page ? "rgba(255,255,255,0.05)" : "transparent",
                          color: currentPage === page ? "#EF4444" : "#9CA3AF",
                          cursor: "pointer"
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {showRightEllipsis && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis style={{ color: "#9CA3AF" }} />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(totalPages)} style={{ color: "#9CA3AF" }}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      style={{ background: "#0D1526", borderColor: "rgba(255,255,255,0.1)", color: "#E8EBF0" }}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      →
                    </Button>
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
