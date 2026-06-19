import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiLightningBolt } from 'react-icons/hi';
import { FiRefreshCw, FiArrowRight, FiMail } from 'react-icons/fi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';

const VerifyEmail = () => {
  const { registrationUserId, login, setRegistrationUserId } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!registrationUserId) navigate('/register');
    inputRefs.current[0]?.focus();
  }, [registrationUserId]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const newOtp = [...otp];
    pasted.forEach((char, i) => { if (i < 6) newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Please enter the complete 6-digit OTP.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { userId: registrationUserId, otp: code });
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      setRegistrationUserId(null);
      toast.success('Email verified! Welcome to Gymmix! 🎉', 'Verified!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { userId: registrationUserId });
      toast.success('A new OTP has been sent to your email.', 'OTP Sent!');
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(200,241,53,0.06), transparent)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }} className="animate-fade-in-up">
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #C8F135, #A8D020)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D0F14' }}>
            <HiLightningBolt size={22} />
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '2px', color: '#F0F2F8' }}>
            GYM<span style={{ color: '#C8F135' }}>MIX</span>
          </span>
        </Link>

        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(200,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#C8F135' }}>
          <FiMail size={28} />
        </div>

        <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>Verify your email</h2>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '32px', lineHeight: 1.6 }}>
          We sent a 6-digit code to your email. Enter it below to verify your account.
        </p>

        <div className="card" style={{ background: '#12151C', border: '1px solid #1F2535' }}>
          {/* OTP inputs */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                id={`otp-input-${i}`}
                style={{
                  width: '48px', height: '56px', textAlign: 'center',
                  fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                  background: '#1A1F2C', border: `2px solid ${digit ? '#C8F135' : '#2A3045'}`,
                  borderRadius: '10px', color: '#F0F2F8', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#C8F135')}
                onBlur={(e) => (e.target.style.borderColor = digit ? '#C8F135' : '#2A3045')}
                maxLength={1}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            className="btn btn-primary"
            disabled={loading || otp.join('').length < 6}
            style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}
            id="verify-otp-btn"
          >
            {loading ? (
              <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Verifying...</>
            ) : (
              <>Verify Email <FiArrowRight size={16} /></>
            )}
          </button>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>Didn't receive it?</span>
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              style={{ background: 'none', border: 'none', color: '#C8F135', fontSize: '0.82rem', fontWeight: 600, cursor: cooldown > 0 ? 'not-allowed' : 'pointer', opacity: cooldown > 0 ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
              id="resend-otp-btn"
            >
              {resending ? <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} /> : <FiRefreshCw size={12} />}
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
