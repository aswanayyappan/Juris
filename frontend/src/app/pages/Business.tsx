import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import {
  Building2, TrendingUp, AlertTriangle, CheckCircle2, Clock,
  ChevronRight, Plus, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface Business {
  name: string;
  type: string;
  state: string;
  employeeCount: string;
  healthScore: number;
}

interface ComplianceTask {
  id: string;
  name: string;
  dueDate: string;
  status: 'Pending' | 'Overdue' | 'Done';
  category: string;
}

const taskStatusStyle = {
  Done:    { bg: 'rgba(16,185,129,0.12)',  text: '#6EE7B7',  border: 'rgba(16,185,129,0.25)',  dot: '#10B981' },
  Overdue: { bg: 'rgba(239,68,68,0.12)',   text: '#FCA5A5',  border: 'rgba(239,68,68,0.25)',   dot: '#EF4444' },
  Pending: { bg: 'rgba(245,158,11,0.12)',  text: '#FCD34D',  border: 'rgba(245,158,11,0.25)',  dot: '#F59E0B' },
};

const categoryColors: Record<string, string> = {
  'GST':    '#93C5FD',
  'ROC':    '#D8B4FE',
  'ITR':    '#6EE7B7',
  'TDS':    '#FCD34D',
  'PF/ESI': '#F9A8D4',
};

function HealthRing({ score }: { score: number }) {
  const size = 120;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dashoffset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          {score}%
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
};

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'rgba(245,158,11,0.4)';
  e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.06)';
  e.target.style.outline = 'none';
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'rgba(255,255,255,0.10)';
  e.target.style.boxShadow = 'none';
};

export const Business: React.FC = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<any | null>(null);
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: '', state: '', employeeCount: '', gstRegistered: false });

  useEffect(() => { 
    fetchInitialData(); 
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const bizData = await api.get<{ business: any }>('/businesses').catch(() => ({ business: null }));
      
      if (bizData.business) {
        setBusiness(bizData.business);
        const taskData = await api.get<{ tasks: any[] }>(`/tasks/${bizData.business.businessId}`);
        
        const mappedTasks: ComplianceTask[] = (taskData.tasks || []).map(t => ({
          id: t.taskId,
          name: t.name,
          dueDate: t.dueDate,
          status: (t.status.charAt(0).toUpperCase() + t.status.slice(1)) as any,
          category: t.category
        }));
        setTasks(mappedTasks);
      } else {
        setShowForm(true);
      }
    } catch (err) {
      console.error('Error fetching business data:', err);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post<any>('/businesses', formData);
      await fetchInitialData();
      setShowForm(false);
    } catch (err) {
      console.error('Error creating business:', err);
      alert('Failed to register business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Done' ? 'pending' : 'done';
    try {
      await api.patch(`/tasks/${business.businessId}/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (
        t.id === taskId 
          ? { ...t, status: (newStatus.charAt(0).toUpperCase() + newStatus.slice(1)) as any } 
          : t
      )));
      const bizData = await api.get<{ business: any }>('/businesses');
      if (bizData.business) setBusiness(bizData.business);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-10 h-10 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (showForm || !business) {
    return (
      <AppLayout>
        <div className="flex flex-col h-full">
          <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Business Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Register your business to track compliance</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center">
            <div className="w-full max-w-lg">
              <div
                className="rounded-2xl p-8"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Register Your Business
                    </h2>
                    <p className="text-xs text-slate-500">We'll set up your compliance tracker</p>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { label: 'Business Name', id: 'name', type: 'text', placeholder: 'Acme Pvt Ltd', key: 'name' as const },
                    { label: 'State', id: 'state', type: 'text', placeholder: 'e.g., Maharashtra', key: 'state' as const },
                  ].map(({ label, id, type, placeholder, key }) => (
                    <div key={id}>
                      <label className="text-sm font-medium text-slate-300 block mb-1.5">{label}</label>
                      <input
                        id={id}
                        type={type}
                        placeholder={placeholder}
                        value={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        required
                        onFocus={onFocus}
                        onBlur={onBlur}
                        className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 transition-all"
                        style={inputStyle}
                      />
                    </div>
                  ))}

                  {/* Business Type */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-1.5">Business Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      onFocus={onFocus}
                      onBlur={onBlur}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white transition-all appearance-none"
                      style={inputStyle}
                    >
                      <option value="" style={{ background: '#0A1020' }}>Select business type</option>
                      {['Pvt Ltd', 'LLP', 'Partnership', 'Sole Proprietorship', 'Public Ltd'].map((t) => (
                        <option key={t} value={t} style={{ background: '#0A1020' }}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Employees */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-1.5">Number of Employees</label>
                    <select
                      value={formData.employeeCount}
                      onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                      required
                      onFocus={onFocus}
                      onBlur={onBlur}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white transition-all appearance-none"
                      style={inputStyle}
                    >
                      <option value="" style={{ background: '#0A1020' }}>Select range</option>
                      {['1-10', '11-50', '51-200', '201-500', '500+'].map((r) => (
                        <option key={r} value={r} style={{ background: '#0A1020' }}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-900 mt-2 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
                      boxShadow: '0 4px 20px rgba(245,158,11,0.25)',
                    }}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-slate-900/50 border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Register Business
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const doneTasks = tasks.filter((t) => t.status === 'Done').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const overdueTasks = tasks.filter((t) => t.status === 'Overdue').length;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                {business.name}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">{business.type} · {business.state} · {business.employeeCount} employees</p>
            </div>
            <button
              onClick={() => { fetchInitialData(); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Health Score */}
            <div
              className="col-span-2 rounded-2xl p-6 flex items-center gap-6"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(217,119,6,0.06))',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
            >
              <HealthRing score={business.healthScore} />
              <div>
                <h3 className="text-base font-bold text-white mb-1">Compliance Health</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {business.healthScore >= 80
                    ? 'Excellent compliance standing'
                    : business.healthScore >= 60
                    ? 'Good — complete pending tasks'
                    : 'Attention needed on compliance'}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Updated today</span>
                </div>
              </div>
            </div>

            {[
              { label: 'Completed', value: doneTasks, color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)', icon: CheckCircle2 },
              { label: 'Pending', value: pendingTasks, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', icon: Clock },
            ].map(({ label, value, color, bg, border, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl p-5 flex flex-col justify-between"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}20` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif', color }}>{value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label} tasks</div>
                </div>
              </div>
            ))}
          </div>

          {/* Overdue Alert */}
          {overdueTasks > 0 && (
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-300">
                <span className="font-semibold">{overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}</span> — action required immediately.
              </span>
            </div>
          )}

          {/* Compliance Checklist */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-base font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Compliance Checklist
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{tasks.length} total tasks</p>
            </div>
            <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as any}>
              {tasks.map((task) => {
                const sts = taskStatusStyle[task.status] ?? taskStatusStyle.Pending;
                const catColor = categoryColors[task.category] || '#CBD5E1';
                return (
                  <div
                    key={task.id}
                    className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    {/* Custom checkbox */}
                    <button
                      onClick={() => handleTaskToggle(task.id, task.status)}
                      className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all"
                      style={
                        task.status === 'Done'
                          ? { background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 8px rgba(16,185,129,0.3)' }
                          : { background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.15)' }
                      }
                    >
                      {task.status === 'Done' && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-sm font-medium ${task.status === 'Done' ? 'text-slate-500 line-through' : 'text-white'}`}>
                          {task.name}
                        </span>
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: sts.bg, color: sts.text, border: `1px solid ${sts.border}` }}
                        >
                          {task.status}
                        </span>
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(255,255,255,0.05)', color: catColor, border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          {task.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {task.status === 'Done' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      {task.status === 'Overdue' && <AlertTriangle className="h-4 w-4 text-red-400" />}
                      {task.status === 'Pending' && <Clock className="h-4 w-4 text-amber-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
