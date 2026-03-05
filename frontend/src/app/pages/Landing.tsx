import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Scale, MessageSquare, Shield, ArrowRight, CheckCircle,
  Star, Users, FileText, TrendingUp, Zap, Lock
} from 'lucide-react';

/* ─── Stat data ─────────────────────────────── */
const stats = [
  { value: '50K+', label: 'Cases Resolved' },
  { value: '2K+',  label: 'Legal Experts' },
  { value: '98%',  label: 'Satisfaction Rate' },
  { value: '24/7', label: 'AI Availability' },
];

const features = [
  {
    icon: MessageSquare,
    title: 'AI Legal Assistant',
    desc: 'Get instant, accurate answers to complex Indian legal queries. Powered by advanced LLMs trained on Indian law.',
    bullets: ['GST & taxation guidance', 'Criminal & civil law', 'Company law compliance'],
    color: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/20',
    iconBg: 'from-amber-400 to-amber-600',
  },
  {
    icon: Scale,
    title: 'Verified Legal Experts',
    desc: 'Connect with India\'s top advocates, chartered accountants, and legal professionals on demand.',
    bullets: ['1-on-1 consultations', 'Verified credentials', 'Multiple specializations'],
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/20',
    iconBg: 'from-blue-400 to-blue-600',
  },
  {
    icon: TrendingUp,
    title: 'Business Compliance',
    desc: 'Never miss a compliance deadline. Track ROC filings, GST returns, and more in one unified dashboard.',
    bullets: ['Automated reminders', 'Health score tracking', 'State-wise compliance'],
    color: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/20',
    iconBg: 'from-emerald-400 to-emerald-600',
  },
];

const steps = [
  {
    num: '01',
    icon: Users,
    title: 'Create Your Account',
    desc: 'Sign up free in under 60 seconds. Choose your role—individual user or legal professional.',
  },
  {
    num: '02',
    icon: MessageSquare,
    title: 'Ask or Search',
    desc: 'Type any legal query, browse case records, or connect directly with verified experts.',
  },
  {
    num: '03',
    icon: CheckCircle,
    title: 'Stay Compliant',
    desc: 'Register your business, track filings, and receive automated compliance reminders.',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Founder, TechStartup Pvt Ltd',
    text: 'JURIS saved me thousands in compliance penalties. The AI assistant explained my GST obligations in plain language.',
    rating: 5,
  },
  {
    name: 'Adv. Rajesh Kumar',
    role: 'Senior Advocate, Delhi HC',
    text: 'As a legal professional, the case search feature is invaluable. Comprehensive database with excellent filtering.',
    rating: 5,
  },
  {
    name: 'Meera Nair',
    role: 'CFO, Manufacturing Co.',
    text: 'The business compliance tracker is exceptional. We\'ve never missed a ROC filing since we started using JURIS.',
    rating: 5,
  },
];

/* ─── Floating Orb ─────────────────────────── */
const FloatingOrb: React.FC<{
  size: number; color: string; delay?: number; className?: string;
}> = ({ size, color, delay = 0, className = '' }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    style={{ width: size, height: size, background: color }}
    animate={{ y: [0, -20, 0], opacity: [0.15, 0.25, 0.15] }}
    transition={{ duration: 8 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

export const Landing: React.FC = () => {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(150deg, #060B18 0%, #0A1020 40%, #0D1526 70%, #060B18 100%)' }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
        }}
      />

      {/* ─── HEADER ─────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(6,11,24,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/30">
              <Scale className="h-4 w-4 text-slate-900" />
            </div>
            <span
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              JURIS
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/[0.05] transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ───────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Orbs */}
        <FloatingOrb size={600} color="radial-gradient(circle, rgba(245,158,11,0.12), transparent)" delay={0} className="top-0 left-1/2 -translate-x-1/2" />
        <FloatingOrb size={400} color="radial-gradient(circle, rgba(59,130,246,0.08), transparent)" delay={2} className="top-20 left-10" />
        <FloatingOrb size={300} color="radial-gradient(circle, rgba(16,185,129,0.07), transparent)" delay={4} className="top-40 right-20" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm font-medium mb-8">
              <Zap className="h-3.5 w-3.5" />
              <span>India's Most Advanced Legal Platform</span>
            </div>
          </motion.div>

          <motion.h1
            className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="text-white">Navigate Legal</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Complexities
            </span>
            <br />
            <span className="text-white">With Confidence</span>
          </motion.h1>

          <motion.p
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            AI-powered legal assistance, verified expert connections, and business compliance
            tracking — all in one beautifully crafted platform for India.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              to="/register"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 hover:from-amber-300 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-medium text-base text-slate-300 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] hover:text-white transition-all"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="flex items-center justify-center gap-6 mt-12 text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {['No credit card required', 'Free 10 queries on signup', 'Cancel anytime'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ──────────────────────────── */}
      <section className="py-16 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center py-8 px-4"
                style={{ background: 'rgba(10,16,32,0.8)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#F59E0B' }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-amber-500 text-sm font-semibold tracking-widest uppercase mb-4">
                Platform Features
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Everything You Need
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                A complete legal intelligence suite built for the Indian market.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className={`group relative rounded-2xl p-6 bg-gradient-to-br ${feature.color} border ${feature.border} hover:scale-[1.02] transition-all duration-300 cursor-default`}
                  style={{ backdropFilter: 'blur(12px)' }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-5 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-3"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────── */}
      <section id="how-it-works" className="py-24 px-6 relative">
        {/* Section bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(245,158,11,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="text-amber-500 text-sm font-semibold tracking-widest uppercase mb-4">
              Simple Process
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              How JURIS Works
            </h2>
            <p className="text-slate-400 text-lg">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  className="relative text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/25 flex items-center justify-center mx-auto">
                      <Icon className="h-8 w-8 text-amber-400" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-xs shadow-md shadow-amber-500/30">
                      {step.num}
                    </div>
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-3"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="relative rounded-3xl p-12 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.10) 100%)',
              border: '1px solid rgba(245,158,11,0.25)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(245,158,11,0.12), transparent 70%)' }}
            />
            <div className="relative z-10">
              <Lock className="h-10 w-10 text-amber-400 mx-auto mb-5" />
              <h2
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Start Your Legal Journey
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto">
                Join 50,000+ users who rely on JURIS for confident legal decisions.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 hover:from-amber-300 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/30"
              >
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-slate-500 text-sm mt-4">
                Free tier includes 10 AI queries and basic case search.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────── */}
      <footer
        className="py-8 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Scale className="h-3.5 w-3.5 text-slate-900" />
            </div>
            <span
              className="text-base font-bold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              JURIS
            </span>
          </div>
          <p className="text-slate-500 text-sm text-center">
            © 2026 JURIS. All rights reserved. Legal Guidance, Simplified.
          </p>
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
