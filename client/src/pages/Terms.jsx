import { useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { FiFileText, FiUserCheck, FiDollarSign, FiAlertCircle } from 'react-icons/fi';

const Terms = () => {
  useEffect(() => {
    document.title = 'Gymmix | Terms of Service';
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'acceptance', label: '1. Acceptance', icon: <FiUserCheck size={16} /> },
    { id: 'accounts', label: '2. User Accounts', icon: <FiFileText size={16} /> },
    { id: 'payments', label: '3. Payments & Billing', icon: <FiDollarSign size={16} /> },
    { id: 'disclaimer', label: '4. Health Disclaimer', icon: <FiAlertCircle size={16} /> },
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
              <FiFileText size={32} />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, marginBottom: '12px' }}>Terms of Service</h1>
            <p style={{ color: '#6B7280' }}>Last updated: June 20, 2026</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '40px', alignItems: 'flex-start' }} className="hide-mobile">
            {/* Sidebar Navigation */}
            <aside style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Sections</p>
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 14px', borderRadius: '8px',
                    fontSize: '0.85rem', color: '#9CA3AF',
                    textDecoration: 'none', transition: 'all 0.2s',
                    border: '1px solid transparent'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#C8F135'; e.currentTarget.style.background = '#1A1F2C'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
                >
                  {sec.icon} {sec.label}
                </a>
              ))}
            </aside>

            {/* Terms Document Body */}
            <article style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div id="acceptance" style={{ scrollMarginTop: '100px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid #1F2535', paddingBottom: '12px', marginBottom: '16px' }}>1. Acceptance of Terms</h3>
                <p>By registering for or using Gymmix, you agree to comply with and be bound by these Terms of Service. If you do not accept these terms in full, you must not use or access Gymmix. These Terms constitute a binding agreement between you and the Gymmix platform owners.</p>
                <p>We reserve the right to modify these terms at any time. Changes will take effect immediately upon being posted on this page. Your continued use of the platform constitutes agreement to the modified terms.</p>
              </div>

              <div id="accounts" style={{ scrollMarginTop: '100px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid #1F2535', paddingBottom: '12px', marginBottom: '16px' }}>2. User Accounts</h3>
                <p>To use most features of the platform, you must register and create an active account. You must provide true, accurate, and current information. You are solely responsible for:</p>
                <ul style={{ paddingLeft: '20px', color: '#9CA3AF', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <li>Maintaining the confidentiality of your account credentials.</li>
                  <li>All activities occurring under your username and profile.</li>
                  <li>Notifying support immediately of any unauthorized breach of security or access.</li>
                </ul>
              </div>

              <div id="payments" style={{ scrollMarginTop: '100px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid #1F2535', paddingBottom: '12px', marginBottom: '16px' }}>3. Payments, Billing & Subscriptions</h3>
                <p>Gymmix offers Free, Pro, and Elite tiers. Premium tiers are billed on a subscription basis (monthly or annually) via the Paymongo checkout system. Subscriptions grant access to expanded metrics logging, premium workout plans, and deeper analytics tools.</p>
                <p>Payments are non-refundable. You may cancel your subscription at any time; your subscription remains active until the end of the current billing cycle, at which point it degrades to the Free tier.</p>
              </div>

              <div id="disclaimer" style={{ scrollMarginTop: '100px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid #1F2535', paddingBottom: '12px', marginBottom: '16px' }}>4. Health & Fitness Disclaimer</h3>
                <p style={{ color: '#F59E0B', fontWeight: 600 }}>Gymmix is a fitness tracking tool and does not provide medical or professional health advice.</p>
                <p>Any workout routines, nutritional calculations, or guides generated by the platform are for informational purposes only. Consult with a qualified physician before starting any exercise program or changing your diet, especially if you have pre-existing cardiovascular or muscular conditions. You assume all risks associated with your training sessions.</p>
              </div>
            </article>
          </div>

          {/* Simple layout for mobile */}
          <div className="card hide-desktop" style={{ padding: '24px', background: '#12151C', border: '1px solid #1F2535' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>1. Acceptance of Terms</h3>
            <p style={{ marginBottom: '24px' }}>By logging into or accessing Gymmix, you accept these Terms of Service. We reserve the right to revise these rules at any time.</p>

            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>2. User Accounts</h3>
            <p style={{ marginBottom: '24px' }}>You are responsible for keeping your login credentials confidential and monitoring account exercises, logs, and billing details.</p>

            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>3. Payments & Billing</h3>
            <p style={{ marginBottom: '24px' }}>Premium access is processed through Paymongo checkout. Cancellations apply at the end of the paid term, returning the account to the Free tier.</p>

            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px', color: '#F59E0B' }}>4. Health Disclaimer</h3>
            <p>Gymmix is not a medical advisor. Consult a physician before beginning any training routines or restrictive macro targets. You train at your own risk.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
