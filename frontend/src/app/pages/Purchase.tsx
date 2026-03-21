import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Check, AlertCircle, Zap, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PlanOption {
  id: string;
  credits: number;
  price: number; // in rupees
  label: string;
  badge?: string;
  description: string;
  saving?: number;
  popular?: boolean;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'starter',
    credits: 100,
    price: 499,
    label: 'Starter',
    description: 'Perfect for getting started',
    popular: false,
  },
  {
    id: 'essentials',
    credits: 500,
    price: 2099,
    label: 'Essentials',
    description: 'Most popular plan',
    badge: 'Save ₹300',
    saving: 300,
    popular: true,
  },
  {
    id: 'professional',
    credits: 1000,
    price: 3999,
    label: 'Professional',
    description: 'For power users',
    badge: 'Save ₹1001',
    saving: 1001,
    popular: false,
  },
  {
    id: 'enterprise',
    credits: 2500,
    price: 8999,
    label: 'Enterprise',
    description: 'Maximum value',
    badge: 'Save ₹3500',
    saving: 3500,
    popular: false,
  },
];

export function Purchase() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('essentials');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedOption = PLAN_OPTIONS.find((p) => p.id === selectedPlan);
  const pricePerCredit = selectedOption ? selectedOption.price / selectedOption.credits : 0;

  const handlePurchase = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setProcessing(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/dashboard');
    }, 3000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#05080D', color: '#E8EBF0', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginLeft: 'auto' }}>Buy Credits</h1>
      </div>

      {/* Current Credits */}
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div
          style={{
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '0.5rem' }}>Current Balance</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#C9A84C' }}>{user?.credits ?? 0} Credits</div>
          </div>
          <div style={{ fontSize: '48px' }}>💎</div>
        </div>

        {/* Plans Grid */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1.5rem' }}>Choose Your Plan</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {PLAN_OPTIONS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  position: 'relative',
                  border: selectedPlan === plan.id ? '2px solid #C9A84C' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  background: selectedPlan === plan.id ? 'rgba(201,168,76,0.08)' : '#0D1526',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  transform: selectedPlan === plan.id ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (selectedPlan !== plan.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPlan !== plan.id) {
                    e.currentTarget.style.background = '#0D1526';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  }
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-1rem',
                      right: '1rem',
                      background: '#C9A84C',
                      color: '#000',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Sparkles size={12} />
                    Most Popular
                  </div>
                )}

                {/* Badge */}
                {plan.badge && (
                  <div
                    style={{
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      color: '#22C55E',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 500,
                      marginBottom: '0.75rem',
                      display: 'inline-block',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Plan Name */}
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>{plan.label}</h3>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '1.5rem' }}>{plan.description}</p>

                {/* Credits */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#3D8EFF' }}>{plan.credits}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Credits</div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>₹{plan.price.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    ₹{pricePerCredit.toFixed(2)}/credit
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedPlan === plan.id && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#C9A84C',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    <Check size={14} />
                    Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div
          style={{
            background: '#0D1526',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '1.5rem' }}>Order Summary</h3>

          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#9CA3AF' }}>{selectedOption?.label} Plan</span>
              <span style={{ fontWeight: 600 }}>₹{selectedOption?.price.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#9CA3AF' }}>Subtotal</span>
              <span>₹{selectedOption?.price.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#9CA3AF' }}>Tax (18% GST)</span>
              <span>₹{(((selectedOption?.price || 0) * 18) / 100).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Total Amount</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#3D8EFF' }}>
                ₹{(((selectedOption?.price || 0) * 118) / 100).toFixed(0)}
              </span>
            </div>
          </div>

          {/* Credits After Purchase */}
          <div
            style={{
              background: 'rgba(61,142,255,0.1)',
              border: '1px solid rgba(61,142,255,0.2)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={16} style={{ color: '#3D8EFF', flexShrink: 0 }} />
            <div style={{ fontSize: '12px' }}>
              You will have <span style={{ color: '#3D8EFF', fontWeight: 600 }}>{(user?.credits || 0) + (selectedOption?.credits || 0)} credits</span> after purchase
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '1rem' }}>Payment Methods</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
            }}
          >
            {['Credit Card', 'Debit Card', 'UPI', 'NetBanking', 'Wallet'].map((method) => (
              <div
                key={method}
                style={{
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(61,142,255,0.1)';
                  e.currentTarget.style.borderColor = '#3D8EFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 500 }}>{method}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={handlePurchase}
          disabled={processing || showSuccess}
          style={{
            width: '100%',
            padding: '1rem',
            background: processing || showSuccess ? '#6B7280' : '#C9A84C',
            color: processing || showSuccess ? '#E8EBF0' : '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: processing || showSuccess ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={(e) => {
            if (!processing && !showSuccess) {
              e.currentTarget.style.background = '#B8953F';
            }
          }}
          onMouseLeave={(e) => {
            if (!processing && !showSuccess) {
              e.currentTarget.style.background = '#C9A84C';
            }
          }}
        >
          {processing && (
            <>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #E8EBF0',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Processing...
            </>
          )}
          {showSuccess && (
            <>
              <Check size={18} />
              Success! Redirecting...
            </>
          )}
          {!processing && !showSuccess && (
            <>
              <Award size={18} />
              Complete Purchase - ₹{(((selectedOption?.price || 0) * 118) / 100).toFixed(0)}
            </>
          )}
        </button>

        {/* Info Section */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(201,168,76,0.05)',
            border: '1px solid rgba(201,168,76,0.1)',
            borderRadius: '8px',
          }}
        >
          <h4 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', color: '#C9A84C' }}>ℹ️ Credits Information</h4>
          <ul style={{ fontSize: '12px', color: '#9CA3AF', lineHeight: 1.6, listStyle: 'none', padding: 0 }}>
            <li>✓ Credits never expire</li>
            <li>✓ Use credits for all premium features</li>
            <li>✓ Instant activation after purchase</li>
            <li>✓ Refunds available within 7 days</li>
            <li>✓ 100% secure payment gateway</li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
