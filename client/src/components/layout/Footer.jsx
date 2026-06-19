import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiYoutube, FiFacebook, FiArrowRight } from 'react-icons/fi';
import { HiLightningBolt } from 'react-icons/hi';
import api from '../../services/api';
import useToast from '../../hooks/useToast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email, source: 'footer' });
      toast.success('You\'ve subscribed to the Gymmix newsletter!', '🎉 Subscribed!');
      setEmail('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Subscription failed. Try again.';
      if (msg.includes('already subscribed')) toast.info(msg, 'Already subscribed');
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer style={{
      background: '#0A0C11',
      borderTop: '1px solid #1F2535',
      marginTop: 'auto',
    }}>
      <div className="container" style={{ padding: '60px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '48px' }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '16px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #C8F135, #A8D020)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D0F14',
              }}>
                <HiLightningBolt size={20} />
              </div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.3rem', letterSpacing: '2px', color: '#F0F2F8' }}>
                GYM<span style={{ color: '#C8F135' }}>MIX</span>
              </span>
            </Link>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.7, maxWidth: '240px' }}>
              Train smarter. Live stronger. The all-in-one platform for serious athletes and fitness beginners.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {[
                { icon: <FiInstagram size={16} />, href: '#' },
                { icon: <FiTwitter size={16} />, href: '#' },
                { icon: <FiYoutube size={16} />, href: '#' },
                { icon: <FiFacebook size={16} />, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: '#1A1F2C', border: '1px solid #2A3045',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#6B7280', textDecoration: 'none', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A3045'; e.currentTarget.style.color = '#6B7280'; }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h6 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#F0F2F8', marginBottom: '16px', fontSize: '0.9rem' }}>Platform</h6>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Exercise Library', to: '/exercises' },
                { label: 'Workout Builder', to: '/workouts' },
                { label: 'Nutrition Tracker', to: '/nutrition' },
                { label: 'Analytics', to: '/analytics' },
                { label: 'Pricing', to: '/pricing' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} style={{ color: '#6B7280', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C8F135')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h6 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#F0F2F8', marginBottom: '16px', fontSize: '0.9rem' }}>Company</h6>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Blog', to: '/blog' },
                { label: 'FAQ', to: '/faq' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Contact Us', to: '/contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} style={{ color: '#6B7280', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C8F135')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h6 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#F0F2F8', marginBottom: '8px', fontSize: '0.9rem' }}>Stay in the loop</h6>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '16px', lineHeight: 1.6 }}>
              Weekly fitness tips, workout plans, and exclusive deals.
            </p>
            <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '9px 12px' }}
                  id="footer-newsletter-email"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ padding: '9px 12px', flexShrink: 0 }}
                  id="footer-newsletter-submit"
                >
                  {loading ? <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : <FiArrowRight size={16} />}
                </button>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#4B5563' }}>No spam. Unsubscribe anytime.</p>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #1F2535', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '0.8rem', color: '#4B5563', margin: 0 }}>
            © {new Date().getFullYear()} Gymmix. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} style={{ fontSize: '0.8rem', color: '#4B5563', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4B5563')}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
