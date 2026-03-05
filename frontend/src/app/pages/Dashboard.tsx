import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Send, Bot, User as UserIcon, Star, Zap, Circle, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Expert {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  reviews: number;
  isOnline: boolean;
  experience: string;
  rate: string;
}

const suggestedQueries = [
  'What is the process for GST registration?',
  'How to file an FIR in India?',
  'What are the penalties for late ROC filing?',
  'Explain trademark registration process',
];

export const Dashboard: React.FC = () => {
  const { user, accessToken } = useAuth();
  
  // Initialize state from localStorage
  const [activeTab, setActiveTab] = useState<'ai-chat' | 'live-experts'>(() => {
    return (localStorage.getItem('juris_dashboard_tab') as any) || 'ai-chat';
  });
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('juris_chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: "Hello! I'm your AI Legal Assistant. How can I help you with your legal questions today?" },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [experts, setExpert] = useState<Expert[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('juris_dashboard_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('juris_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => { fetchExperts(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleClearChat = () => {
    const defaultMsg = [{ role: 'assistant' as const, content: "Hello! I'm your AI Legal Assistant. How can I help you with your legal questions today?" }];
    setMessages(defaultMsg);
    localStorage.removeItem('juris_chat_history');
  };

  const fetchExperts = async () => {
    try {
      const data = await api.get<{ experts: Expert[] }>('/experts').catch(() => ({ experts: [] }));
      setExpert(data.experts || []);
    } catch (err) {
      console.error('Error fetching experts:', err);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post<{ reply: string }>('/chat', { message: msg });
      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting to the legal server. Please try again later." 
      }]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <AppLayout>
      <div className="flex flex-col h-screen bg-[#070B14]">
        {/* Page Header */}
        <div
          className="px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7, 11, 20, 0.8)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold text-white tracking-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Legal Assistant
              </h1>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">
                AI-powered guidance & verified expert connections
              </p>
            </div>
            <div className="flex items-center gap-4">
              {messages.length > 1 && activeTab === 'ai-chat' && (
                <button
                  onClick={handleClearChat}
                  className="text-xs font-semibold text-slate-500 hover:text-amber-400 transition-colors uppercase tracking-wider"
                >
                  Clear History
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs shadow-sm shadow-amber-500/10" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span className="text-amber-400 font-bold uppercase tracking-tight">AI Premium</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              { key: 'ai-chat', label: 'AI Assistant', icon: Bot },
              { key: 'live-experts', label: 'Live Experts', icon: Users },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeTab === key
                    ? 'text-amber-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                style={activeTab === key ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } : {}}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* AI Chat Tab */}
          {activeTab === 'ai-chat' && (
            <div className="flex flex-col h-full">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 mt-1">
                        <Bot className="h-5 w-5 text-slate-900" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'rounded-tr-sm text-slate-900 shadow-xl shadow-amber-500/10'
                          : 'rounded-tl-sm text-slate-200 shadow-xl shadow-black/20'
                      }`}
                      style={
                        message.role === 'user'
                          ? { 
                              background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }
                          : { 
                              background: 'rgba(255,255,255,0.03)', 
                              border: '1px solid rgba(255,255,255,0.08)',
                              backdropFilter: 'blur(16px)',
                              WebkitBackdropFilter: 'blur(16px)'
                            }
                      }
                    >
                      <div className="prose prose-invert prose-sm max-w-none 
                        prose-p:leading-relaxed prose-p:mb-3 last:prose-p:mb-0
                        prose-headings:text-amber-300 prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-5 first:prose-headings:mt-0
                        prose-strong:text-white prose-strong:font-bold
                        prose-ul:my-3 prose-li:my-1
                        prose-table:border-collapse prose-table:my-4 prose-table:w-full
                        prose-th:bg-white/5 prose-th:px-4 prose-th:py-2.5 prose-th:text-left prose-th:text-amber-200 prose-th:text-xs prose-th:uppercase prose-th:tracking-wider prose-th:border prose-th:border-white/10
                        prose-td:border prose-td:border-white/10 prose-td:px-4 prose-td:py-2.5 prose-td:text-slate-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-black/20" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                      <Bot className="h-5 w-5 text-slate-900" />
                    </div>
                    <div
                      className="rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl shadow-black/20"
                      style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {[0, 0.15, 0.3].map((delay, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-bounce"
                            style={{ animationDelay: `${delay}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested queries */}
              {messages.length === 1 && (
                <div className="px-6 pb-6 mt-auto">
                  <p className="text-[10px] font-bold text-slate-600 mb-4 uppercase tracking-[0.2em] ml-1">Premium Consultation Samples</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedQueries.map((query) => (
                      <button
                        key={query}
                        onClick={() => handleSendMessage(query)}
                        className="text-left px-5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:text-amber-200 transition-all duration-300 group shadow-sm hover:shadow-amber-500/10"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/5 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                            <Zap className="h-4 w-4 text-amber-500/60 group-hover:text-amber-400" />
                          </div>
                          <span>{query}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="px-6 pb-8 pt-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7, 11, 20, 0.5)', backdropFilter: 'blur(10px)' }}>
                <div className="flex gap-4 max-w-5xl mx-auto items-end">
                  <div className="flex-1 relative group">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Consult with JURIS AI Assistant..."
                      rows={1}
                      className="w-full resize-none rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-300 pr-14"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        minHeight: '56px',
                        maxHeight: '200px'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(245,158,11,0.3)';
                        e.target.style.background = 'rgba(255,255,255,0.05)';
                        e.target.style.boxShadow = '0 0 0 4px rgba(245,158,11,0.03)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.target.style.background = 'rgba(255,255,255,0.03)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div className="absolute right-4 bottom-4 flex items-center gap-2">
                       <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
                        <span className="text-xs">↵</span>
                      </kbd>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={loading || !input.trim()}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0"
                    style={{
                      background: loading || !input.trim()
                        ? 'rgba(255,255,255,0.04)'
                        : 'linear-gradient(135deg, #F59E0B, #D97706)',
                      boxShadow: loading || !input.trim() ? 'none' : '0 8px 25px rgba(217,119,6,0.25)',
                    }}
                  >
                    <Send className={`h-5 w-5 ${loading || !input.trim() ? 'text-slate-700' : 'text-slate-950'}`} />
                  </button>
                </div>
                <p className="text-[10px] text-center text-slate-600 mt-4 font-medium uppercase tracking-[0.1em]">
                  Confidential & Encrypted Legal Assistance
                </p>
              </div>
            </div>
          )}

          {/* Live Experts Tab */}
          {activeTab === 'live-experts' && (
            <div className="p-8 overflow-y-auto h-full bg-[#070B14]">
              <div className="mb-10 max-w-5xl mx-auto">
                <h2
                  className="text-3xl font-bold text-white mb-2 tracking-tight"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Verified Legal Counsel
                </h2>
                <p className="text-slate-400 text-sm font-medium">Connect with top-tier legal professionals for direct representation</p>
              </div>

              {experts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/5 flex items-center justify-center mb-6 border border-amber-500/10">
                    <Users className="h-10 w-10 text-amber-500/60" />
                  </div>
                  <p className="text-slate-500 font-semibold text-lg">Initializing expert network...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                  {experts.map((expert) => (
                    <div
                      key={expert.id}
                      className="rounded-3xl p-6 transition-all duration-500 cursor-pointer group hover:-translate-y-1"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                      }}
                    >
                      {/* Avatar + Status */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-amber-500/20">
                            {expert.name.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#070B14] ${expert.isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        </div>
                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${expert.isOnline ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 'text-slate-500 bg-white/5 border border-white/5'}`}>
                          {expert.isOnline ? 'Active Now' : 'Away'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1 tracking-tight group-hover:text-amber-300 transition-colors">{expert.name}</h3>
                      <div className="flex gap-2 mb-5">
                         <span
                          className="text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wide"
                          style={{ background: 'rgba(245,158,11,0.08)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.15)' }}
                        >
                          {expert.specialization}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-6 bg-white/5 w-fit px-3 py-1.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < Math.floor(expert.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                            />
                          ))}
                        </div>
                        <span className="text-white text-xs font-bold">{expert.rating}</span>
                        <span className="text-slate-500 text-[10px]">({expert.reviews} Reviews)</span>
                      </div>

                      {/* Info */}
                      <div className="space-y-3 mb-8 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="text-slate-500 font-medium">Expertise</span>
                          <span className="text-slate-200 font-bold">{expert.experience}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Professional Rate</span>
                          <span className="text-amber-400 font-black text-sm">{expert.rate}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-950 transition-all duration-300 shadow-lg shadow-amber-500/10"
                        style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)' }}
                      >
                        Request Consultation
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
