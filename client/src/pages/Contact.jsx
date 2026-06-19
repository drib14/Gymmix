import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { FiMail, FiPhone, FiMapPin, FiSend, FiUser, FiFileText, FiMessageSquare } from 'react-icons/fi';
import api from '../services/api';
import useToast from '../hooks/useToast';

const Contact = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    document.title = 'Gymmix | Contact Us';
    window.scrollTo(0, 0);

    // Dynamic script injection for Leaflet map
    let cssLink = document.getElementById('leaflet-css');
    if (!cssLink) {
      cssLink = document.createElement('link');
      cssLink.id = 'leaflet-css';
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);
    }

    const scriptId = 'leaflet-js';
    let leafletScript = document.getElementById(scriptId);
    if (!leafletScript) {
      leafletScript = document.createElement('script');
      leafletScript.id = scriptId;
      leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.body.appendChild(leafletScript);
    }

    const initMap = () => {
      if (window.L && mapRef.current && !mapInstance.current) {
        // LocationIQ / CartoDB dark mode coordinates: BGC Manila (14.5496, 121.0452)
        const lat = 14.5496;
        const lng = 121.0452;
        
        mapInstance.current = window.L.map(mapRef.current, {
          zoomControl: false,
          scrollWheelZoom: false
        }).setView([lat, lng], 15);

        // Dark theme tile layer
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        }).addTo(mapInstance.current);

        // Add Leaflet zoom control to top-right
        window.L.control.zoom({ position: 'topright' }).addTo(mapInstance.current);

        // Custom Gymmix neon lime icon marker
        const gymIcon = window.L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #0D0F14; border: 2.5px solid #C8F135; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(200, 241, 53, 0.4);"><span style="font-size: 14px;">🏋️</span></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        window.L.marker([lat, lng], { icon: gymIcon })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="background: #12151C; color: #F0F2F8; font-family: 'Outfit', sans-serif; padding: 4px;">
              <h5 style="margin: 0 0 4px 0; color: #C8F135; font-weight: 700;">Gymmix HQ</h5>
              <p style="margin: 0; font-size: 11px; color: #9CA3AF;">Bonifacio Global City, Metro Manila</p>
            </div>
          `, { closeButton: false })
          .openPopup();
      }
    };

    if (window.L) {
      initMap();
    } else {
      leafletScript.onload = () => {
        initMap();
      };
    }

    return () => {
      // Keep map cleanup clean
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill out all fields.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/support/contact', form);
      toast.success('Thank you! Your message has been sent successfully.', '📬 Message Sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D0F14' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '120px 24px 80px' }}>
        <div className="container container-lg">
          <div style={{ textAlign: 'center', marginBottom: '56px' }} className="animate-fade-in-down">
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, marginBottom: '12px' }}>Get In Touch</h1>
            <p style={{ color: '#6B7280', maxWidth: '520px', margin: '0 auto' }}>Have a question about subscriptions, workout logs, or partnership inquiries? Drop us a line below.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', alignItems: 'stretch' }} className="grid-responsive">
            {/* Contact Info and Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in-left">
              <div className="card" style={{ background: '#12151C', border: '1px solid #1F2535', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>Contact Information</h4>
                
                {[
                  { icon: <FiMail size={18} />, label: 'Email Us', val: 'support@gymmix.com' },
                  { icon: <FiPhone size={18} />, label: 'Call Us', val: '+63 (2) 8888-9999' },
                  { icon: <FiMapPin size={18} />, label: 'Headquarters', val: 'Bonifacio High Street, Taguig, Metro Manila' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.15)',
                      display: 'flex', alignItems: 'center', justify: 'center',
                      color: '#C8F135', flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0 0 2px 0' }}>{item.label}</p>
                      <p style={{ fontSize: '0.9rem', color: '#F0F2F8', margin: 0, fontWeight: 600 }}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Leaflet map container */}
              <div style={{
                height: '280px',
                borderRadius: '14px',
                border: '1px solid #1F2535',
                overflow: 'hidden',
                position: 'relative',
                background: '#12151C'
              }}>
                <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
              </div>
            </div>

            {/* Contact Form */}
            <div className="card animate-fade-in-right" style={{ background: '#12151C', border: '1px solid #1F2535', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontFamily: 'Outfit, sans-serif' }}>Send a Message</h4>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-wrapper">
                  <label className="input-label" htmlFor="contact-name">Full Name</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon"><FiUser size={15} /></span>
                    <input
                      id="contact-name"
                      type="text"
                      className="input"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="input-wrapper">
                  <label className="input-label" htmlFor="contact-email">Email Address</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon"><FiMail size={15} /></span>
                    <input
                      id="contact-email"
                      type="email"
                      className="input"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="input-wrapper">
                  <label className="input-label" htmlFor="contact-subject">Subject</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon"><FiFileText size={15} /></span>
                    <input
                      id="contact-subject"
                      type="text"
                      className="input"
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="input-wrapper">
                  <label className="input-label" htmlFor="contact-message">Message</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon" style={{ top: '16px', transform: 'none' }}><FiMessageSquare size={15} /></span>
                    <textarea
                      id="contact-message"
                      className="input"
                      placeholder="Write your message here..."
                      style={{ paddingLeft: '42px', minHeight: '120px' }}
                      value={form.message}
                      onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px', marginTop: '6px' }}
                  id="contact-submit-btn"
                >
                  {loading ? (
                    <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Sending...</>
                  ) : (
                    <>Send Message <FiSend size={15} /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
