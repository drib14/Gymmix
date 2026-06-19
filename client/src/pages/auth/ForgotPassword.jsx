import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { LogoFull } from '../../components/ui/Logo';
import api from '../../services/api';
import useToast from '../../hooks/useToast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [userId, setUserId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Gymmix | Forgot Password';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.data?.userId) {
        setUserId(res.data.data.userId);
        setSent(true);
        toast.success('OTP sent! Check your email.', 'Email Sent');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }} className="animate-scale-bounce">
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📧</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>Check your email</h2>
          <p style={{ color: '#9CA3AF', marginBottom: '24px', fontSize: '0.875rem' }}>
            We sent a password reset OTP to <strong style={{ color: '#C8F135' }}>{email}</strong>. It expires in 10 minutes.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/reset-password', { state: { userId, email } })} style={{ width: '100%', padding: '13px' }}>
            Enter OTP <FiArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(200,241,53,0.06), transparent)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-block', textDecoration: 'none', marginBottom: '24px' }}>
            <LogoFull size={24} fontSize="1.3rem" />
          </Link>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '6px' }}>Forgot password?</h2>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Enter your email and we'll send you a reset OTP.</p>
        </div>

        <div className="card" style={{ background: '#12151C', border: '1px solid #1F2535' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="forgot-email">Email Address</label>
              <div className="input-icon-wrapper">
                <span className="input-icon"><FiMail size={15} /></span>
                <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="input" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '13px' }} id="forgot-password-submit">
              {loading ? <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Sending...</> : <>Send Reset OTP <FiArrowRight size={16} /></>}
            </button>
          </form>
          <Link to="/login" className="btn btn-ghost" style={{ width: '100%', marginTop: '12px', justifyContent: 'center', gap: '6px' }}>
            <FiArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
