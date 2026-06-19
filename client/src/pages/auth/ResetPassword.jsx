import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { HiLightningBolt } from 'react-icons/hi';
import api from '../../services/api';
import useToast from '../../hooks/useToast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { userId } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  if (!userId) {
    navigate('/forgot-password');
    return null;
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter the full 6-digit OTP.'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirm) { toast.error('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { userId, otp: code, newPassword });
      toast.success('Password reset! Please log in with your new password.', '✅ Success!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(200,241,53,0.06), transparent)' }}>
      <div style={{ width: '100%', maxWidth: '420px' }} className="animate-fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #C8F135, #A8D020)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D0F14' }}>
              <HiLightningBolt size={18} />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.3rem', letterSpacing: '2px', color: '#F0F2F8' }}>GYM<span style={{ color: '#C8F135' }}>MIX</span></span>
          </Link>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '6px' }}>Reset your password</h2>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Enter your OTP and choose a new password.</p>
        </div>

        <div className="card" style={{ background: '#12151C', border: '1px solid #1F2535' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '12px' }}>6-Digit OTP</label>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text" inputMode="numeric" value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    id={`reset-otp-${i}`}
                    style={{
                      width: '44px', height: '52px', textAlign: 'center',
                      fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                      background: '#1A1F2C', border: `2px solid ${digit ? '#C8F135' : '#2A3045'}`,
                      borderRadius: '10px', color: '#F0F2F8', outline: 'none',
                    }}
                    maxLength={1}
                  />
                ))}
              </div>
            </div>

            <div className="input-wrapper">
              <label className="input-label">New Password</label>
              <div className="input-icon-wrapper">
                <span className="input-icon"><FiLock size={15} /></span>
                <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 characters" className="input" />
                <span className="input-icon-right" onClick={() => setShowPass(!showPass)}>{showPass ? <FiEye size={15} /> : <FiEyeOff size={15} />}</span>
              </div>
            </div>

            <div className="input-wrapper">
              <label className="input-label">Confirm New Password</label>
              <div className="input-icon-wrapper">
                <span className="input-icon"><FiLock size={15} /></span>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" className="input" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '13px' }} id="reset-password-submit">
              {loading ? <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Resetting...</> : <>Reset Password <FiArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
