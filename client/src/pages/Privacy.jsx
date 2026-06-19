import { useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { FiShield, FiLock, FiEye, FiServer } from 'react-icons/fi';

const Privacy = () => {
  useEffect(() => {
    document.title = 'Gymmix | Privacy Policy';
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'introduction', label: '1. Introduction', icon: <FiShield size={16} /> },
    { id: 'collection', label: '2. Information We Collect', icon: <FiEye size={16} /> },
    { id: 'usage', label: '3. How We Use Information', icon: <FiServer size={16} /> },
    { id: 'protection', label: '4. Data Protection', icon: <FiLock size={16} /> },
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
              <FiShield size={32} />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, marginBottom: '12px' }}>Privacy Policy</h1>
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

            {/* Privacy Document Body */}
            <article style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div id="introduction" style={{ scrollMarginTop: '100px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid #1F2535', paddingBottom: '12px', marginBottom: '16px' }}>1. Introduction</h3>
                <p>Welcome to Gymmix. We value your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website, use our fitness tracking tools, and tell you about your privacy rights and how the law protects you.</p>
                <p>By using the Gymmix platform, you consent to the data practices described in this policy statement. If you do not agree with these practices, please discontinue use immediately.</p>
              </div>

              <div id="collection" style={{ scrollMarginTop: '100px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid #1F2535', paddingBottom: '12px', marginBottom: '16px' }}>2. Information We Collect</h3>
                <p>We collect personal information that you voluntarily provide to us when registering, such as your name, username, email, and password. Additionally, to provide custom workout plans, macro targets, and metric logs, we collect fitness-related metrics:</p>
                <ul style={{ paddingLeft: '20px', color: '#9CA3AF', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <li>Body weight, height, body fat percentage, and body measurements.</li>
                  <li>Logged exercises, repetitions, weights, and workout duration statistics.</li>
                  <li>Logged foods, snacks, and corresponding macro calculations.</li>
                </ul>
              </div>

              <div id="usage" style={{ scrollMarginTop: '100px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid #1F2535', paddingBottom: '12px', marginBottom: '16px' }}>3. How We Use Information</h3>
                <p>Your information allows us to provide a customized, premium fitness experience. Specifically, we use your data to:</p>
                <ul style={{ paddingLeft: '20px', color: '#9CA3AF', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <li>Generate tailored nutrition summaries and workout frequency charts.</li>
                  <li>Deliver real-time notifications about streak milestones and goal alerts.</li>
                  <li>Process checkout payments securely via our Paymongo integrations.</li>
                  <li>Send newsletter broadcasts with fitness insights and platform updates.</li>
                </ul>
              </div>

              <div id="protection" style={{ scrollMarginTop: '100px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid #1F2535', paddingBottom: '12px', marginBottom: '16px' }}>4. Data Protection</h3>
                <p>We implement a variety of security measures to maintain the safety of your personal information. We use advanced encryption methods for password storage (bcrypt) and secure token exchange mechanisms (JWT with access and refresh tokens). Your payment information is securely processed by Paymongo and is never stored on our servers.</p>
                <p>Although we use industry-standard measures to safeguard your information, no transmission over the internet or storage system can be guaranteed 100% secure. You are responsible for keeping your login credentials confidential.</p>
              </div>
            </article>
          </div>

          {/* Simple layout for mobile */}
          <div className="card hide-desktop" style={{ padding: '24px', background: '#12151C', border: '1px solid #1F2535' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>1. Introduction</h3>
            <p style={{ marginBottom: '24px' }}>Welcome to Gymmix. We value your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website, use our fitness tracking tools, and tell you about your privacy rights.</p>

            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>2. Information We Collect</h3>
            <p style={{ marginBottom: '24px' }}>We collect personal information that you voluntarily provide to us when registering (name, username, email). We also log fitness details like body weight, height, exercises, repetitions, food diaries, and active duration to populate progress graphs.</p>

            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>3. How We Use Information</h3>
            <p style={{ marginBottom: '24px' }}>Your info is used to generate personalized analytics dashboards, streak updates, and support communications. We also process payments securely via Paymongo API calls.</p>

            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>4. Data Protection</h3>
            <p>We use hashing and encrypted tokens to safeguard your account data. Payments are processed externally. Please maintain secure passwords to protect your dashboard access.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
