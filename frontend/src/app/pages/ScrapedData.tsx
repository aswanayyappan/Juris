import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { api } from '../utils/api';

interface Article {
  date?: string;
  title?: string;
  url?: string;
  content?: string;
  consolNo?: string;
  branch?: string;
  attachments?: Array<{ name: string; url: string }>;
}

export const ScrapedData: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as any)?.tab || 'gst';
  const [activeTab, setActiveTab] = useState<'gst' | 'esic'>(initialTab);
  const [gstArticles, setGstArticles] = useState<Article[]>([]);
  const [esicArticles, setEsicArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const fetchScrapedData = async () => {
      try {
        setLoading(true);
        console.log('[ScrapedData] Fetching GST and ESIC data...');
        const gstRes = await api.get<any>('/gst-news');
        const esicRes = await api.get<any>('/esic-news');
        
        console.log('[ScrapedData] GST response:', gstRes);
        console.log('[ScrapedData] ESIC response:', esicRes);
        
        // Handle both wrapped and unwrapped responses
        const gstArticles = gstRes?.articles || gstRes?.data?.articles || [];
        const esicArticles = esicRes?.articles || esicRes?.data?.articles || [];
        
        console.log('[ScrapedData] Loaded GST articles:', gstArticles.length);
        console.log('[ScrapedData] Loaded ESIC articles:', esicArticles.length);
        
        setGstArticles(Array.isArray(gstArticles) ? gstArticles : []);
        setEsicArticles(Array.isArray(esicArticles) ? esicArticles : []);
      } catch (err: any) {
        console.error('[ScrapedData] Error fetching data:', err.message);
        setGstArticles([]);
        setEsicArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchScrapedData();
  }, []);

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const articles = activeTab === 'gst' ? gstArticles : esicArticles;
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedArticles = articles.slice(startIdx, endIdx);

  const tabColor = activeTab === 'gst' ? '#3D8EFF' : '#FF4455';
  const tabBg = activeTab === 'gst' ? 'rgba(61,142,255,0.05)' : 'rgba(255,68,85,0.05)';

  return (
    <div style={{ minHeight: '100vh', background: '#05080D', color: '#E8EBF0', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '14px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E8EBF0')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
        >
          <ChevronLeft size={18} />
          Back to Dashboard
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginLeft: 'auto' }}>Regulatory Updates</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', maxWidth: '1200px', margin: '0 auto' }}>
        {(['gst', 'esic'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === tab ? (tab === 'gst' ? '#3D8EFF' : '#FF4455') : '#6B7280',
              fontSize: '14px',
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer',
              paddingBottom: '0.75rem',
              borderBottom: activeTab === tab ? `2px solid ${tabColor}` : 'none',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {tab === 'gst' ? '📊 GST News' : '📋 ESIC Circulars'}
          </button>
        ))}
      </div>

      {/* Articles List */}
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Info Bar */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            Showing <span style={{ color: '#3D8EFF', fontWeight: 600 }}>{articles.length === 0 ? 0 : startIdx + 1}–{Math.min(endIdx, articles.length)}</span> of <span style={{ fontWeight: 600 }}>{articles.length}</span> {activeTab === 'gst' ? 'GST updates' : 'ESIC circulars'}
          </div>
          {totalPages > 1 && (
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Page <span style={{ color: '#E8EBF0', fontWeight: 600 }}>{currentPage}</span> of <span style={{ fontWeight: 600 }}>{totalPages}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>Loading...</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
            No {activeTab === 'gst' ? 'GST news' : 'ESIC circulars'} found.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {paginatedArticles.map((article, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid rgba(255,255,255,0.05)`,
                    borderRadius: '8px',
                    padding: '1.25rem',
                    background: '#0D1526',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = tabBg;
                    e.currentTarget.style.borderColor = tabColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0D1526';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  }}
                >
                  {/* Date and Branch */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 500 }}>
                      {article.date || article.consolNo || 'N/A'}
                    </div>
                    {article.branch && (
                      <div style={{ fontSize: '10px', color: '#6B7280', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '4px' }}>
                        {article.branch}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {article.title}
                  </h3>

                  {/* Content Preview */}
                  {article.content && (
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                      {article.content.substring(0, 150)}...
                    </p>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '11px',
                          color: tabColor,
                          textDecoration: 'none',
                          padding: '0.5rem 0.75rem',
                          background: `rgba(${tabColor === '#3D8EFF' ? '61,142,255' : '255,68,85'},0.1)`,
                          borderRadius: '4px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `rgba(${tabColor === '#3D8EFF' ? '61,142,255' : '255,68,85'},0.2)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `rgba(${tabColor === '#3D8EFF' ? '61,142,255' : '255,68,85'},0.1)`;
                        }}
                      >
                        <ExternalLink size={12} />
                        View Details
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(61,142,255,0.15)',
                    border: `1px solid ${currentPage === 1 ? 'rgba(255,255,255,0.05)' : '#3D8EFF'}`,
                    color: currentPage === 1 ? '#6B7280' : '#3D8EFF',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage > 1) {
                      e.currentTarget.style.background = 'rgba(61,142,255,0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage > 1) {
                      e.currentTarget.style.background = 'rgba(61,142,255,0.15)';
                    }
                  }}
                >
                  ← Previous
                </button>

                {/* Page Numbers */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: currentPage === pageNum ? '#3D8EFF' : 'rgba(61,142,255,0.1)',
                          border: `1px solid ${currentPage === pageNum ? '#3D8EFF' : 'rgba(255,255,255,0.05)'}`,
                          color: currentPage === pageNum ? '#fff' : '#9CA3AF',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: currentPage === pageNum ? 600 : 400,
                          minWidth: '32px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== pageNum) {
                            e.currentTarget.style.background = 'rgba(61,142,255,0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== pageNum) {
                            e.currentTarget.style.background = 'rgba(61,142,255,0.1)';
                          }
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(61,142,255,0.15)',
                    border: `1px solid ${currentPage === totalPages ? 'rgba(255,255,255,0.05)' : '#3D8EFF'}`,
                    color: currentPage === totalPages ? '#6B7280' : '#3D8EFF',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage < totalPages) {
                      e.currentTarget.style.background = 'rgba(61,142,255,0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage < totalPages) {
                      e.currentTarget.style.background = 'rgba(61,142,255,0.15)';
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '3rem', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: '#6B7280' }}>
          JURIS Compliance OS · Regulatory data sourced from GST Portal & ESIC Portal
        </p>
      </div>
    </div>
  );
};
