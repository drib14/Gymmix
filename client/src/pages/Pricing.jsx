import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Modal from '../components/ui/Modal';
import { FiCheck, FiArrowRight, FiCreditCard, FiLock, FiAlertCircle } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import useToast from '../hooks/useToast';
import api from '../services/api';
import axios from 'axios';

const Pricing = () => {
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [checkoutTier, setCheckoutTier] = useState(null); // 'pro' | 'elite'
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'gcash' | 'paymaya'
  const [loading, setLoading] = useState(false);
  const [mySubscription, setMySubscription] = useState(null);

  // Card Form State
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });

  useEffect(() => {
    document.title = 'Gymmix | Pricing';
    window.scrollTo(0, 0);

    if (searchParams.get('success') === 'true') {
      toast.success('Your subscription has been processed successfully! Enjoy premium access.', '🎉 Payment Successful');
      // Refresh user details if logged in
      if (isAuthenticated) {
        api.get('/users/me').then((res) => {
          updateUser(res.data.data.user);
        }).catch(() => {});
      }
      setSearchParams({});
    }

    if (isAuthenticated) {
      api.get('/subscriptions/my')
        .then((res) => setMySubscription(res.data?.data?.subscription))
        .catch(() => {});
    }
  }, [searchParams, isAuthenticated]);

  const plans = [
    {
      tier: 'free',
      name: 'Starter Plan',
      price: { monthly: 0, annual: 0 },
      desc: 'Essential tracking for individual athletes.',
      features: ['Basic workout tracking', 'Exercise library (view only)', 'Nutrition logging (limited)', 'Up to 3 workout plans', 'Basic streaks & stats'],
      color: '#6B7280'
    },
    {
      tier: 'pro',
      name: 'Pro Tracker',
      price: { monthly: 299, annual: 2990 },
      desc: 'For individuals seeking serious gains & detail.',
      features: ['Unlimited workout plans', 'Full interactive exercise library', 'Advanced charts & analytics', 'Nutrition macro tracking', 'Target goals setting', 'Priority support & notifications'],
      color: '#C8F135'
    },
    {
      tier: 'elite',
      name: 'Elite Coach',
      price: { monthly: 599, annual: 5990 },
      desc: 'Comprehensive training, nutrition, & guidance.',
      features: ['Everything in Pro Plan', 'Custom macro targets calculation', 'Access to Elite analytics', 'Personalized workout AI suggestion', 'Weekly progress audits', 'Direct 1-on-1 coach support'],
      color: '#3B82F6'
    }
  ];

  const handleCheckoutInit = (tier) => {
    if (!isAuthenticated) {
      toast.info('Please sign in or create an account to subscribe.');
      navigate('/login');
      return;
    }
    if (user?.subscriptionTier === tier) {
      toast.info(`You are already subscribed to the ${tier.toUpperCase()} plan.`);
      return;
    }
    setCheckoutTier(tier);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutTier) return;
    setLoading(true);

    try {
      // 1. Create Checkout Session on Gymmix Backend
      const checkoutRes = await api.post('/subscriptions/checkout', {
        tier: checkoutTier,
        billingCycle
      });

      const { clientKey, subscriptionId } = checkoutRes.data.data;
      const paymentIntentId = clientKey.split('_client_key_')[0];

      // 2. Create Payment Method via Paymongo API
      const paymongoPublicKey = import.meta.env.VITE_PAYMONGO_PUBLIC_KEY || 'pk_test_TCXR9vXiUWdfCbYeQGQQ5T1F';
      const authHeader = `Basic ${btoa(paymongoPublicKey + ':')}`;

      let paymentMethodPayload = {
        data: {
          attributes: {
            type: paymentMethod,
            billing: {
              name: card.name || `${user.firstName} ${user.lastName}`,
              email: user.email
            }
          }
        }
      };

      if (paymentMethod === 'card') {
        const [expMonth, expYear] = card.expiry.split('/');
        if (!card.number || !expMonth || !expYear || !card.cvc) {
          toast.error('Please enter valid credit card details.');
          setLoading(false);
          return;
        }
        paymentMethodPayload.data.attributes.details = {
          card_number: card.number.replace(/\s+/g, ''),
          exp_month: parseInt(expMonth.trim()),
          exp_year: parseInt('20' + expYear.trim()),
          cvc: card.cvc.trim()
        };
      }

      const pmRes = await axios.post('https://api.paymongo.com/v1/payment_methods', paymentMethodPayload, {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json'
        }
      });

      const paymentMethodId = pmRes.data.data.id;

      // 3. Attach Payment Method via Gymmix Backend
      const attachRes = await api.post('/subscriptions/attach', {
        paymentIntentId,
        paymentMethodId
      });

      const intentData = attachRes.data.data.intent;
      const nextAction = intentData.attributes.next_action;

      // 4. Handle redirect (3D Secure for cards / GCash / PayMaya logs)
      if (nextAction && nextAction.type === 'redirect') {
        window.location.href = nextAction.redirect.url;
      } else {
        toast.success(`Subscription to ${checkoutTier.toUpperCase()} activated successfully!`, '🎉 Congratulations!');
        setCheckoutTier(null);
        // Refresh User state
        const meRes = await api.get('/users/me');
        updateUser(meRes.data.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Payment processing failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D0F14' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '120px 24px 80px' }}>
        <div className="container">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }} className="animate-fade-in-down">
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, marginBottom: '12px' }}>Choose Your Tier</h1>
            <p style={{ color: '#6B7280', maxWidth: '520px', margin: '0 auto 24px' }}>Unlock full workouts analytics, custom meal macros logs, and priority updates to accelerate your results.</p>
            
            {/* Toggle Switch */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#12151C', border: '1px solid #1F2535',
              padding: '4px', borderRadius: '100px'
            }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '6px 16px', borderRadius: '100px', border: 'none',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  background: billingCycle === 'monthly' ? '#C8F135' : 'transparent',
                  color: billingCycle === 'monthly' ? '#0D0F14' : '#6B7280',
                  transition: 'all 0.2s'
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '6px 16px', borderRadius: '100px', border: 'none',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  background: billingCycle === 'annual' ? '#C8F135' : 'transparent',
                  color: billingCycle === 'annual' ? '#0D0F14' : '#6B7280',
                  transition: 'all 0.2s'
                }}
              >
                Annually <span style={{ color: billingCycle === 'annual' ? '#0D0F14' : '#C8F135', fontSize: '0.7rem' }}>(-15%)</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '56px' }} className="grid-responsive animate-fade-in-up">
            {plans.map((p) => {
              const isCurrent = user?.subscriptionTier === p.tier;
              const isPro = p.tier === 'pro';
              const isElite = p.tier === 'elite';
              
              const price = billingCycle === 'monthly' ? p.price.monthly : p.price.annual;
              const cycleText = billingCycle === 'monthly' ? '/mo' : '/yr';

              return (
                <div
                  key={p.tier}
                  className={`card ${isPro ? 'card-accent' : ''}`}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    background: '#12151C', border: `1.5px solid ${isPro ? '#C8F135' : '#1F2535'}`,
                    padding: '32px 24px', position: 'relative'
                  }}
                >
                  {isPro && (
                    <span style={{
                      position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                      background: '#C8F135', color: '#0D0F14', fontSize: '0.7rem', fontWeight: 800,
                      padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.5px'
                    }}>
                      POPULAR CHOICE
                    </span>
                  )}
                  
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', marginBottom: '4px' }}>{p.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '20px' }}>{p.desc}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: p.tier === 'free' ? '#F0F2F8' : (isPro ? '#C8F135' : '#3B82F6') }}>
                      ₱{price}
                    </span>
                    {p.tier !== 'free' && <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>{cycleText}</span>}
                  </div>

                  <button
                    onClick={() => handleCheckoutInit(p.tier)}
                    className={`btn ${p.tier === 'free' ? 'btn-secondary' : 'btn-primary'}`}
                    style={{
                      width: '100%', padding: '12px', marginBottom: '28px',
                      background: isCurrent ? '#1A1F2C' : '',
                      borderColor: isCurrent ? '#2A3045' : '',
                      color: isCurrent ? '#9CA3AF' : ''
                    }}
                    disabled={isCurrent || p.tier === 'free'}
                  >
                    {isCurrent ? 'Current Plan' : (p.tier === 'free' ? 'Default Access' : 'Upgrade Plan')}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
                    {p.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <span style={{ color: p.tier === 'free' ? '#6B7280' : (isPro ? '#C8F135' : '#3B82F6'), display: 'inline-flex', marginTop: '3px' }}>
                          <FiCheck size={14} />
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison Table */}
          <div className="card animate-fade-in-up" style={{ background: '#12151C', border: '1px solid #1F2535', padding: '24px 0', overflowHidden: 'hidden' }}>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', padding: '0 24px 16px', borderBottom: '1px solid #1F2535' }}>Plan Comparison</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1F2535' }}>
                    <th style={{ padding: '12px 24px', fontSize: '0.8rem', color: '#6B7280' }}>FEATURES</th>
                    <th style={{ padding: '12px 24px', fontSize: '0.8rem', color: '#6B7280' }}>FREE</th>
                    <th style={{ padding: '12px 24px', fontSize: '0.8rem', color: '#C8F135' }}>PRO</th>
                    <th style={{ padding: '12px 24px', fontSize: '0.8rem', color: '#3B82F6' }}>ELITE</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { f: 'Active Session Log Timer', free: '✓', pro: '✓', elite: '✓' },
                    { f: 'Max Saved Workout Plans', free: '3 Plans', pro: 'Unlimited', elite: 'Unlimited' },
                    { f: 'Analytics Dashboard', free: 'Basic', pro: 'Full Trend', elite: 'Elite Deep Dive' },
                    { f: 'Nutrition Macro target goals', free: '✗', pro: '✓', elite: '✓' },
                    { f: 'Goal Achievement Milestones', free: '✗', pro: '✓', elite: '✓' },
                    { f: 'Personalized AI advice', free: '✗', pro: '✗', elite: '✓' },
                    { f: 'Support Response Time', free: '48h email', pro: '24h priority', elite: '1-on-1 direct' },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1F2535' }}>
                      <td style={{ padding: '14px 24px', fontSize: '0.85rem', fontWeight: 600, color: '#F0F2F8' }}>{row.f}</td>
                      <td style={{ padding: '14px 24px', fontSize: '0.85rem', color: '#9CA3AF' }}>{row.free}</td>
                      <td style={{ padding: '14px 24px', fontSize: '0.85rem', color: '#C8F135', fontWeight: 600 }}>{row.pro}</td>
                      <td style={{ padding: '14px 24px', fontSize: '0.85rem', color: '#3B82F6', fontWeight: 600 }}>{row.elite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      <Modal isOpen={!!checkoutTier} onClose={() => setCheckoutTier(null)} title="Secure Checkout" size="sm">
        <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 4px 0' }}>SELECTED PLAN</p>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', textTransform: 'capitalize', color: '#C8F135' }}>
              Gymmix {checkoutTier} Plan ({billingCycle})
            </h4>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F0F2F8', marginTop: '4px' }}>
              ₱{checkoutTier === 'pro' ? (billingCycle === 'monthly' ? 299 : 2990) : (billingCycle === 'monthly' ? 599 : 5990)}
            </p>
          </div>

          <div className="divider"></div>

          {/* Payment Method Selector */}
          <div className="input-wrapper">
            <label className="input-label">Payment Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { id: 'card', label: 'Credit Card', icon: <FiCreditCard size={14} /> },
                { id: 'gcash', label: 'GCash', icon: <span>🇵🇭</span> },
                { id: 'paymaya', label: 'Maya', icon: <span>🇵🇭</span> }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  style={{
                    padding: '10px', borderRadius: '8px', border: '1.5px solid',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    background: paymentMethod === m.id ? 'rgba(200,241,53,0.1)' : '#1A1F2C',
                    borderColor: paymentMethod === m.id ? '#C8F135' : '#2A3045',
                    color: paymentMethod === m.id ? '#C8F135' : '#9CA3AF'
                  }}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Payment Fields */}
          {paymentMethod === 'card' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-wrapper">
                <label className="input-label">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input"
                  value={card.name}
                  onChange={(e) => setCard(c => ({ ...c, name: e.target.value }))}
                  required
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Card Number</label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="input"
                  value={card.number}
                  onChange={(e) => {
                    const formatted = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                    setCard(c => ({ ...c, number: formatted.slice(0, 19) }));
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-wrapper">
                  <label className="input-label">Expiration (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="12/30"
                    className="input"
                    value={card.expiry}
                    onChange={(e) => {
                      const formatted = e.target.value.replace(/\D/g, '').replace(/(.{2})/g, '$1/').trim();
                      setCard(c => ({ ...c, expiry: formatted.slice(0, 5) }));
                    }}
                    required
                  />
                </div>
                <div className="input-wrapper">
                  <label className="input-label">CVC / CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="input"
                    value={card.cvc}
                    onChange={(e) => setCard(c => ({ ...c, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: '8px', padding: '12px', display: 'flex', gap: '10px'
            }}>
              <FiAlertCircle size={18} style={{ color: '#3B82F6', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: 0 }}>
                You will be redirected to standard Paymongo hosted checkout to log into your account and complete your payment securely.
              </p>
            </div>
          )}

          <div className="divider"></div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px' }}
            id="checkout-submit-btn"
          >
            {loading ? (
              <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Processing...</>
            ) : (
              <>Pay with {paymentMethod === 'card' ? 'Card' : paymentMethod.toUpperCase()} <FiLock size={14} style={{ marginLeft: '4px' }} /></>
            )}
          </button>
        </form>
      </Modal>

      <Footer />
    </div>
  );
};

export default Pricing;
