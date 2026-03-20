import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Search, FileText, Download, ChevronDown, ChevronUp, Scale, Calendar, Hash } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface Case {
  id: string;
  title: string;
  court: string;
  caseNumber: string;
  petitioner: string;
  respondent: string;
  crime: string;
  firNumber: string;
  summary: string;
  date: string;
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Ongoing: { bg: 'rgba(59,130,246,0.12)', text: '#93C5FD', dot: '#3B82F6' },
  Closed:  { bg: 'rgba(16,185,129,0.12)', text: '#6EE7B7', dot: '#10B981' },
  default: { bg: 'rgba(245,158,11,0.12)',  text: '#FCD34D',  dot: '#F59E0B' },
};

function getStatusStyle(status: string) {
  return statusConfig[status] ?? statusConfig.default;
}

export const CaseSearch: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const quickSuggestions = ['murder', 'fraud', 'theft', 'corruption', 'assault'];

  useEffect(() => { searchCases(''); }, []);

  const searchCases = async (query: string) => {
    setLoading(true);
    try {
      const data = await api.get<{ results: any[] }>(`/cases/search?query=${encodeURIComponent(query)}`);
      
      const mappedCases: Case[] = (data.results || []).map((row, idx) => ({
        id: row.case_number || `case-${idx}`,
        title: `${row.petitioner_name} v. ${row.prosecutor_name || 'State'}`,
        court: row.court_name,
        caseNumber: row.case_number,
        petitioner: row.petitioner_name,
        respondent: row.prosecutor_name || 'State',
        crime: row.case_type || 'Legal Case',
        firNumber: row.crime_number || 'N/A',
        summary: row.case_details || 'No details available.',
        date: new Date().toISOString(),
        status: row.status || 'Pending'
      }));

      setCases(mappedCases);
    } catch (err) {
      console.error('Error searching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCases(searchQuery);
  };

  const handleDownloadPDF = (caseItem: Case) => {
    alert(`Downloading PDF for case: ${caseItem.caseNumber}\n\nIn production, this would download the actual case PDF.`);
  };

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
            Case Search
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Search and explore Indian legal case records</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Search Bar */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by case name, crime type, FIR number, court…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(245,158,11,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.06)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-900 transition-all flex-shrink-0"
                style={{
                  background: loading ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #FCD34D, #F59E0B)',
                  boxShadow: loading ? 'none' : '0 4px 15px rgba(245,158,11,0.25)',
                }}
              >
                {loading ? 'Searching…' : 'Search'}
              </button>
            </form>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-slate-600 uppercase tracking-widest">Quick:</span>
              {quickSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSearchQuery(s); searchCases(s); }}
                  className="px-3 py-1 rounded-full text-xs text-slate-400 hover:text-amber-300 transition-all capitalize"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)'; e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="h-5 bg-white/10 rounded-lg w-2/3 mb-3" />
                  <div className="flex gap-3 mb-4">
                    <div className="h-4 bg-white/8 rounded-full w-24" />
                    <div className="h-4 bg-white/8 rounded-full w-16" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-4 bg-white/6 rounded w-full" />
                    <div className="h-4 bg-white/6 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : cases.length === 0 ? (
            <div
              className="rounded-2xl p-16 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-600" />
              </div>
              <p className="text-slate-400 text-base mb-1">No cases found</p>
              <p className="text-slate-600 text-sm">Try different search terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 uppercase tracking-widest">
                {cases.length} result{cases.length !== 1 ? 's' : ''} found
              </p>
              {cases.map((caseItem) => {
                const sts = getStatusStyle(caseItem.status);
                const isExpanded = expandedCase === caseItem.id;
                return (
                  <div
                    key={caseItem.id}
                    className="rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isExpanded ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-white mb-2 leading-tight">{caseItem.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-xs px-2.5 py-1 rounded-full font-medium"
                              style={{ background: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.2)' }}
                            >
                              {caseItem.court}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Hash className="h-3 w-3" />
                              {caseItem.caseNumber}
                            </span>
                            <span
                              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                              style={{ background: sts.bg, color: sts.text }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sts.dot }} />
                              {caseItem.status}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedCase(isExpanded ? null : caseItem.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Basic parties */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-600 mb-1 uppercase tracking-wider">Petitioner</p>
                          <p className="text-sm text-slate-200 font-medium">{caseItem.petitioner}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1 uppercase tracking-wider">Respondent</p>
                          <p className="text-sm text-slate-200 font-medium">{caseItem.respondent}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div
                        className="px-5 pb-5 pt-4 space-y-4"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {/* Crime / FIR */}
                        <div
                          className="rounded-xl p-4"
                          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Scale className="h-4 w-4 text-amber-400" />
                            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Crime / FIR</span>
                          </div>
                          <p className="text-sm text-slate-200 font-medium">{caseItem.crime}</p>
                          <p className="text-xs text-amber-500/70 mt-1">{caseItem.firNumber}</p>
                        </div>

                        {/* Summary */}
                        <div>
                          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wider">Case Summary</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{caseItem.summary}</p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Calendar className="h-4 w-4" />
                            {new Date(caseItem.date).toLocaleDateString('en-IN', {
                              year: 'numeric', month: 'long', day: 'numeric',
                            })}
                          </div>
                          <button
                            onClick={() => handleDownloadPDF(caseItem)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 transition-all"
                            style={{
                              background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
                              boxShadow: '0 4px 12px rgba(245,158,11,0.2)',
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
