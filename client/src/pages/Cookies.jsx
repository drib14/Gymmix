import { useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { FiDatabase, FiSettings, FiActivity, FiLock } from 'react-icons/fi';

const Cookies = () => {
  useEffect(() => {
    document.title = 'Gymmix | Cookies Policy';
    window.scrollTo(0, 0);
  }, []);

  const cookieTypes = [
    { name: 'Authentication & Session Cookies', desc: 'Used to identify your user session and keep you securely logged in as you move through your dashboard, log plans, or manage metrics.', icon: <FiLock size={20} style={{ color: '#C8F135' }} /> },
    { name: 'User Preferences', desc: 'Stores UI state settings, active charts selection, active workout log timer, and custom filters.', icon: <FiSettings size={20} style={{ color: '#3B82F6' }} /> },
    { name: 'Analytics & Performance', desc: 'Enables aggregate tracking of page views and feature usage, helping us optimize page speed and layout rendering.', icon: <FiActivity size={20} style={{ color: '#A855F7' }} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D0F14' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '120px 24px 80px' }}>
        <div className="container container-md">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fade-in-down">
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#C8F135', margin: '0 auto 16px'
            }}>
              <FiDatabase size={32} />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, marginBottom: '12px' }}>Cookies Policy</h1>
            <p style={{ color: '#6B7280' }}>Last updated: June 20, 2026</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in-up">
            <div className="card" style={{ background: '#12151C', border: '1px solid #1F2535' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>What are cookies?</h3>
              <p style={{ margin: 0 }}>Cookies are small text files stored in your web browser directory when you visit websites. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site. Gymmix uses cookies primarily to manage your authentication state and enhance your navigation flow.</p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>How we use cookies</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cookieTypes.map((type, i) => (
                  <div key={i} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#12151C', border: '1px solid #1F2535' }}>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      {type.icon}
                    </div>
                    <div>
                      <h5 style={{ fontFamily: 'Outfit, sans-serif', margin: '0 0 6px' }}>{type.name}</h5>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>{type.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ background: '#12151C', border: '1px solid #1F2535' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>Managing Cookies</h3>
              <p>Most web browsers allow you to control cookies through their settings preferences. You can configure your browser to block cookies or alert you when cookies are sent. Please note that if you disable essential cookies, the authentication mechanism will break, and you will not be able to log in or use your personalized dashboard.</p>
              <p style={{ margin: 0, marginTop: '12px' }}>If you have any questions about our cookie usage, please reach out via our <a href="/contact" style={{ color: '#C8F135' }}>Contact Us</a> page.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cookies;
