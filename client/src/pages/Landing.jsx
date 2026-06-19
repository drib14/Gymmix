import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiArrowRight, FiStar, FiZap, FiTarget, FiTrendingUp, FiActivity, FiMenu, FiX } from 'react-icons/fi';
import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';
import { MdOutlineFoodBank } from 'react-icons/md';
import { LogoIcon } from '../components/ui/Logo';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../services/api';
import useToast from '../hooks/useToast';

const FEATURES = [
  { icon: <GiWeightLiftingUp size={28} />, title: 'Workout Builder', description: 'Create custom workout plans with 50+ exercises. Track sets, reps, and volume with a live session timer.', color: '#C8F135' },
  { icon: <MdOutlineFoodBank size={28} />, title: 'Nutrition Tracker', description: 'Log meals and track macros (protein, carbs, fats, calories). Visualize your daily intake at a glance.', color: '#22C55E' },
  { icon: <FiTrendingUp size={28} />, title: 'Body Metrics', description: 'Track weight, body fat %, BMI, and body measurements over time. See your transformation visually.', color: '#3B82F6' },
  { icon: <FiTarget size={28} />, title: 'Goal Tracking', description: 'Set fitness goals with deadlines and milestones. Get notified when you hit each achievement.', color: '#A855F7' },
  { icon: <FiActivity size={28} />, title: 'Analytics Dashboard', description: 'Deep insights: workout frequency, volume trends, macro averages, streak tracking, and more.', color: '#F59E0B' },
  { icon: <FiZap size={28} />, title: 'Real-time Notifications', description: 'Instant alerts for goal achievements, streak milestones, and subscription updates via Socket.IO.', color: '#EC4899' },
];

const TESTIMONIALS = [
  { name: 'Maria Santos', role: 'Competitive bodybuilder', rating: 5, text: 'Gymmix completely transformed how I track my progress. The analytics are incredibly detailed and the workout builder is intuitive.' },
  { name: 'James Cruz', role: 'Personal Trainer', rating: 5, text: 'I recommend Gymmix to all my clients. The exercise library is comprehensive and the nutrition tracker makes macros easy.' },
  { name: 'Ana Reyes', role: 'Fitness enthusiast', rating: 5, text: 'Finally a fitness app that looks as good as it works! The dark theme and design are stunning. My streak is at 45 days!' },
];

const STATS = [
  { value: '50+', label: 'Exercise Library' },
  { value: '10K+', label: 'Workouts Logged' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9★', label: 'User Rating' },
];

const Landing = () => {
  const [newsEmail, setNewsEmail] = useState('');
  const [newsLoading, setNewsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    document.title = 'Gymmix';
  }, []);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsEmail) return;
    setNewsLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email: newsEmail, source: 'landing' });
      toast.success('You\'re subscribed! Check your email for a welcome message.', '🎉 Subscribed!');
      setNewsEmail('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Subscription failed. Try again.';
      if (msg.includes('already')) toast.info(msg, 'Already subscribed');
      else toast.error(msg);
    } finally {
      setNewsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Hero Section ─────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 'var(--navbar-height)',
        background: 'radial-gradient(ellipse 70% 60% at 50% -10%, rgba(200,241,53,0.08), transparent)',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(#1F2535 1px, transparent 1px), linear-gradient(90deg, #1F2535 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.3,
        }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(200,241,53,0.06), transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)', zIndex: 0 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="animate-fade-in-down" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.3)',
            borderRadius: '100px', padding: '6px 16px', marginBottom: '32px',
          }}>
            <LogoIcon size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C8F135', letterSpacing: '1px' }}>
              THE ULTIMATE FITNESS PLATFORM
            </span>
          </div>

          <h1 className="animate-fade-in-up" style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 900,
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            lineHeight: 1.1, marginBottom: '24px',
            background: 'linear-gradient(135deg, #F0F2F8 0%, #9CA3AF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Train Smarter.<br />
            <span style={{ background: 'linear-gradient(135deg, #C8F135, #A8D020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Live Stronger.
            </span>
          </h1>

          <p className="animate-fade-in-up delay-100" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#9CA3AF', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Track workouts, log nutrition, monitor body metrics, set goals, and crush every milestone — all in one beautifully designed platform.
          </p>

          <div className="animate-fade-in-up delay-200" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-xl hover-glow" id="hero-cta-register">
              Start for Free <FiArrowRight />
            </Link>
            <Link to="/exercises" className="btn btn-secondary btn-xl">
              Browse Exercises
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up delay-300" style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '64px', paddingTop: '40px', borderTop: '1px solid #1F2535' }}>
            {STATS.map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#C8F135' }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────── */}
      <section className="section" style={{ background: '#12151C' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="badge badge-accent" style={{ marginBottom: '16px' }}>Features</span>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '16px' }}>Everything you need to level up</h2>
            <p style={{ color: '#9CA3AF', maxWidth: '500px', margin: '0 auto' }}>From beginner-friendly tracking to elite athlete analytics — Gymmix has it all.</p>
          </div>
          <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card hover-lift" style={{ cursor: 'default' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '12px',
                  background: `${feature.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: feature.color, marginBottom: '16px',
                }}>
                  {feature.icon}
                </div>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>{feature.title}</h4>
                <p style={{ fontSize: '0.875rem', color: '#9CA3AF', lineHeight: 1.7 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof / Testimonials ────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-accent" style={{ marginBottom: '16px' }}>Testimonials</span>
            <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>Loved by athletes worldwide</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FiStar key={i} size={14} style={{ color: '#C8F135', fill: '#C8F135' }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.875rem', color: '#9CA3AF', lineHeight: 1.7, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                  <div className="avatar-placeholder avatar-md" style={{ background: 'rgba(200,241,53,0.15)', color: '#C8F135', fontFamily: 'Outfit, sans-serif' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#F0F2F8', fontSize: '0.9rem', margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA ─────────────────────────────────── */}
      <section className="section-sm" style={{ background: '#12151C' }}>
        <div className="container container-md">
          <div style={{
            background: 'linear-gradient(135deg, #1A1F2C, #242A3A)',
            border: '1px solid rgba(200,241,53,0.2)',
            borderRadius: '24px',
            padding: '60px 48px',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(200,241,53,0.08)',
          }}>
            <span className="badge badge-accent" style={{ marginBottom: '20px' }}>Newsletter</span>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>Get fitness tips in your inbox</h2>
            <p style={{ color: '#9CA3AF', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
              Weekly workout plans, nutrition advice, and exclusive deals. No spam, unsubscribe anytime.
            </p>
            <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '480px', margin: '0 auto' }}>
              <input
                type="email"
                value={newsEmail}
                onChange={(e) => setNewsEmail(e.target.value)}
                placeholder="Enter your email"
                className="input"
                style={{ flex: 1, minWidth: '240px' }}
                id="landing-newsletter-email"
              />
              <button type="submit" className="btn btn-primary" disabled={newsLoading} id="landing-newsletter-submit">
                {newsLoading ? <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '16px', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            Ready to start your journey?
          </h2>
          <p style={{ color: '#9CA3AF', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
            Join thousands of athletes already training smarter with Gymmix.
          </p>
          <Link to="/register" className="btn btn-primary btn-xl animate-glow" id="landing-bottom-cta">
            Create Free Account <FiArrowRight />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
