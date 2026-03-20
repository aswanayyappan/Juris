import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import {
  BookOpen, ChevronDown, ChevronUp, AlertCircle, Calendar, Bell, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface LibraryArticle {
  id: string;
  title: string;
  category: string;
  description: string;
  duePattern: string;
  penalty: string;
  content: string;
}

const categoryStyle: Record<string, { bg: string; text: string; border: string }> = {
  'GST':    { bg: 'rgba(59,130,246,0.12)',  text: '#93C5FD', border: 'rgba(59,130,246,0.25)' },
  'ROC':    { bg: 'rgba(168,85,247,0.12)',  text: '#D8B4FE', border: 'rgba(168,85,247,0.25)' },
  'ITR':    { bg: 'rgba(16,185,129,0.12)',  text: '#6EE7B7', border: 'rgba(16,185,129,0.25)' },
  'TDS':    { bg: 'rgba(245,158,11,0.12)',  text: '#FCD34D', border: 'rgba(245,158,11,0.25)' },
  'PF/ESI': { bg: 'rgba(236,72,153,0.12)', text: '#F9A8D4', border: 'rgba(236,72,153,0.25)' },
};

const defaultCatStyle = { bg: 'rgba(255,255,255,0.08)', text: '#CBD5E1', border: 'rgba(255,255,255,0.15)' };

function getCatStyle(cat: string) {
  return categoryStyle[cat] ?? defaultCatStyle;
}

export const Library: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<LibraryArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => { fetchLibrary(); }, []);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ articles: any[] }>('/library');
      
      const mappedArticles: LibraryArticle[] = (data.articles || []).map((art) => ({
        id: art.slug,
        title: art.title,
        category: art.topic,
        description: art.summary,
        duePattern: art.duePattern,
        penalty: art.penaltyInfo,
        content: art.summary
      }));

      setArticles(mappedArticles);
    } catch (err) {
      console.error('Error fetching legal library:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(categoryStyle);
  const filtered = activeCategory ? articles.filter((a) => a.category === activeCategory) : articles;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className="px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Legal Library
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Compliance insights & filing guides for Indian businesses</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={!activeCategory
                ? { background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' }
                : { background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              All
            </button>
            {categories.map((cat) => {
              const s = getCatStyle(cat);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={isActive
                    ? { background: s.bg, color: s.text, border: `1px solid ${s.border}` }
                    : { background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="h-4 bg-white/8 rounded w-20 mb-4" />
                  <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-white/6 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((article) => {
                const catStyle = getCatStyle(article.category);
                const isExpanded = expandedArticle === article.id;
                return (
                  <div
                    key={article.id}
                    className="rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isExpanded ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    {/* Card Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                            </div>
                            <span
                              className="text-xs px-2.5 py-1 rounded-full font-semibold"
                              style={{ background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}
                            >
                              {article.category}
                            </span>
                          </div>
                          <h3
                            className="text-base font-bold text-white mb-1.5"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                          >
                            {article.title}
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed">{article.description}</p>
                        </div>
                        <button
                          onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div
                        className="px-5 pb-5 space-y-4"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="h-4" />

                        {/* Due Pattern */}
                        <div
                          className="rounded-xl p-4"
                          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Due Pattern</span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">{article.duePattern}</p>
                        </div>

                        {/* Penalty */}
                        <div
                          className="rounded-xl p-4"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Penalty for Non-Compliance</span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">{article.penalty}</p>
                        </div>

                        {/* Content */}
                        <div
                          className="rounded-xl p-4"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Detailed Information</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{article.content}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 transition-all"
                            style={{
                              background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
                              boxShadow: '0 4px 12px rgba(245,158,11,0.2)',
                            }}
                          >
                            <Bell className="h-4 w-4" />
                            Set Reminder
                          </button>
                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                          >
                            <Download className="h-4 w-4" />
                            Download Guide
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Help Card */}
          {!loading && (
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.08) 100%)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
            >
              <div className="relative z-10">
                <h3
                  className="text-lg font-bold text-white mb-2"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Need Personalized Guidance?
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Our verified legal experts provide tailored compliance advice for your specific business needs.
                </p>
                <button
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-900 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
                    boxShadow: '0 4px 12px rgba(245,158,11,0.25)',
                  }}
                >
                  Connect with Expert
                </button>
              </div>
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-2xl opacity-10"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
