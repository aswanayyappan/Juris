import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Check, Sparkles, Phone, Mail, Zap, Crown, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { motion } from 'motion/react';

interface PricingPlan {
  id: string;
  name: string;
  credits: number;
  price: string;
  priceNum: number;
  popular?: boolean;
  icon: React.ElementType;
  tagline: string;
  features: string[];
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 25,
    price: '₹499',
    priceNum: 499,
    icon: Zap,
    tagline: 'Perfect for occasional queries',
    features: [
      '25 AI Assistant queries',
      '2 Expert consultations',
      'Basic case search',
      'Legal library access',
      'Email support',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    credits: 100,
    price: '₹1,499',
    priceNum: 1499,
    popular: true,
    icon: Crown,
    tagline: 'Most popular for individuals',
    features: [
      '100 AI Assistant queries',
      '10 Expert consultations',
      'Unlimited case search',
      'Full legal library access',
      'Business compliance tracker',
      'Priority support',
      'Document templates',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 250,
    price: '₹2,999',
    priceNum: 2999,
    icon: Shield,
    tagline: 'Best for growing businesses',
    features: [
      '250 AI Assistant queries',
      '25 Expert consultations',
      'Unlimited case search',
      'Full legal library access',
      'Advanced compliance tools',
      'Priority phone support',
      'Document templates',
      'Monthly compliance report',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    credits: 500,
    price: '₹4,999',
    priceNum: 4999,
    icon: Sparkles,
    tagline: 'For power users & firms',
    features: [
      '500 AI Assistant queries',
      'Unlimited expert consultations',
      'Unlimited case search',
      'Full legal library access',
      'Advanced compliance tools',
      'Dedicated account manager',
      'All document templates',
      'Weekly compliance reports',
      'Custom legal research',
    ],
  },
];

const faqs = [
  { q: 'Can I upgrade or downgrade my plan?', a: 'Yes! You can purchase additional credits anytime. Your existing credits will remain in your account.' },
  { q: 'Do credits expire?', a: 'No, your credits never expire and roll over indefinitely until used.' },
  { q: 'What payment methods are accepted?', a: 'All major credit/debit cards, UPI, net banking, and popular digital wallets.' },
];

export const BuyCredits: React.FC = () => {
  const { accessToken, refreshAuth } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (plan: PricingPlan) => {
      setLoading(plan.id);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      await api.post('/update-credits', { amount: plan.credits });
      await refreshAuth();
      alert(`Success! ${plan.credits} credits have been added to your account.`);
    } catch (err) {
      console.error('Error purchasing credits:', err);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Buy Credits
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Choose the perfect plan for your legal needs</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* How Credits Work */}
          <div
            className="rounded-2xl p-5 flex items-start gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.10), rgba(37,99,235,0.05))',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-2">How Credits Work</h3>
              <ul className="space-y-1 text-sm text-slate-400">
                {[
                  '1 credit = 1 AI query or 1 document download',
                  'Expert consultations deduct credits based on duration',
                  'Credits never expire and roll over month to month',
                  'All plans include case search and legal library access',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {plans.map((plan, i) => {
              const Icon = plan.icon;
              const isPopular = plan.popular;
              const isLoading = loading === plan.id;

              return (
                <motion.div
                  key={plan.id}
                  className="relative rounded-2xl flex flex-col overflow-hidden"
                  style={
                    isPopular
                      ? {
                          background: 'linear-gradient(145deg, rgba(245,158,11,0.12), rgba(217,119,6,0.07))',
                          border: '1.5px solid rgba(245,158,11,0.35)',
                          boxShadow: '0 0 40px rgba(245,158,11,0.08)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }
                  }
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div
                      className="absolute top-0 left-0 right-0 py-1.5 text-center text-xs font-bold text-slate-900 tracking-wider"
                      style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)' }}
                    >
                      MOST POPULAR
                    </div>
                  )}

                  <div className={`p-5 flex flex-col h-full ${isPopular ? 'pt-9' : ''}`}>
                    {/* Icon + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={
                          isPopular
                            ? { background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }
                            : { background: 'rgba(255,255,255,0.08)' }
                        }
                      >
                        <Icon className={`h-4 w-4 ${isPopular ? 'text-slate-900' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${isPopular ? 'text-amber-300' : 'text-white'}`}>{plan.name}</div>
                        <div className="text-[11px] text-slate-500 leading-tight">{plan.tagline}</div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-end gap-1 mb-1">
                        <span
                          className="text-3xl font-bold"
                          style={{
                            fontFamily: 'Playfair Display, serif',
                            color: isPopular ? '#FCD34D' : '#F1F5F9',
                          }}
                        >
                          {plan.price}
                        </span>
                      </div>
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={
                          isPopular
                            ? { background: 'rgba(245,158,11,0.15)', color: '#FCD34D' }
                            : { background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }
                        }
                      >
                        <Zap className="h-3 w-3" />
                        {plan.credits} credits
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 flex-1 mb-5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isPopular ? 'text-amber-400' : 'text-emerald-400'}`} />
                          <span className="text-slate-300">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => handlePurchase(plan)}
                      disabled={loading !== null}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      style={
                        isPopular
                          ? {
                              background: loading ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #FCD34D, #F59E0B)',
                              color: '#1e293b',
                              boxShadow: loading ? 'none' : '0 4px 16px rgba(245,158,11,0.3)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.07)',
                              color: '#E2E8F0',
                              border: '1px solid rgba(255,255,255,0.12)',
                            }
                      }
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : 'Purchase Plan'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Enterprise */}
          <div
            className="rounded-2xl p-8 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.10), rgba(139,92,246,0.06))',
              border: '1px solid rgba(168,85,247,0.2)',
            }}
          >
            <div className="relative z-10">
              <h3
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Enterprise Solutions
              </h3>
              <p className="text-slate-400 text-sm mb-6 max-w-lg mx-auto">
                Need a custom plan for your organization? Tailored solutions with dedicated support, custom integrations, and SLA guarantees.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.35)' }}
                >
                  <Mail className="h-4 w-4" />
                  Contact Sales
                </button>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 transition-all hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                  <Phone className="h-4 w-4" />
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3
              className="text-xl font-bold text-white mb-5 text-center"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Frequently Asked Questions
            </h3>
            <div className="space-y-3 max-w-2xl mx-auto">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-xl p-5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <h4 className="text-sm font-semibold text-white mb-1.5">{faq.q}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
