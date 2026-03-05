import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Scale, Mail, Lock, User, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signUp } from '../utils/auth';

type Role = 'user' | 'legal_assistant';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, name, role);
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(245,158,11,0.4)';
    e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.10)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg, #060B18 0%, #0A1020 50%, #0D1526 100%)' }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
        }}
      />
      {/* Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-8 pointer-events-none" style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-6 pointer-events-none" style={{ background: 'radial-gradient(circle, #10B981, transparent)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/30 mb-4">
            <Scale className="h-7 w-7 text-slate-900" />
          </div>
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            JURIS
          </h1>
          <p className="text-slate-500 text-xs tracking-widest uppercase mt-1">Legal Platform</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-sm text-slate-400">Join JURIS and access legal guidance instantly</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Toggle */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'user' as Role, icon: User, label: 'User', sub: 'Seeking legal help' },
                  { val: 'legal_assistant' as Role, icon: Scale, label: 'Legal Assistant', sub: 'Providing expertise' },
                ].map(({ val, icon: Icon, label, sub }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRole(val)}
                    className="p-3.5 rounded-xl text-center transition-all duration-200"
                    style={{
                      background: role === val ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                      border: role === val ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: role === val ? '0 0 0 3px rgba(245,158,11,0.06)' : 'none',
                    }}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-1.5 ${role === val ? 'text-amber-400' : 'text-slate-500'}`} />
                    <div className={`text-sm font-semibold ${role === val ? 'text-amber-300' : 'text-slate-300'}`}>{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  onFocus={onFocus}
                  onBlur={onBlur}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  onFocus={onFocus}
                  onBlur={onBlur}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-slate-900 transition-all mt-2"
              style={{
                background: loading ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #FCD34D, #F59E0B, #D97706)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(245,158,11,0.25)',
              }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-900/50 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>

        <p className="text-center text-xs text-slate-600 mt-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
