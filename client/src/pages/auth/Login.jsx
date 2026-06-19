import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { HiLightningBolt } from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => { const n = { ...p }; delete n[e.target.name]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.firstName}!`, '👋 Hello!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      if (err.response?.status === 403 && msg.includes('verify')) {
        setTimeout(() => navigate('/verify-email'), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(200,241,53,0.06), transparent)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }} className="animate-fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #C8F135, #A8D020)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D0F14' }}>
              <HiLightningBolt size={22} />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '2px', color: '#F0F2F8' }}>
              GYM<span style={{ color: '#C8F135' }}>MIX</span>
            </span>
          </Link>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '6px' }}>Welcome back</h2>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Sign in to continue your journey</p>
        </div>

        <div className="card" style={{ background: '#12151C', border: '1px solid #1F2535' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="login-email">Email Address</label>
              <div className="input-icon-wrapper">
                <span className="input-icon"><FiMail size={15} /></span>
                <input id="login-email" name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="john@example.com" className={`input ${errors.email ? 'input-error' : ''}`} autoComplete="email" />
              </div>
              {errors.email && <span className="input-error-msg">⚠ {errors.email}</span>}
            </div>

            <div className="input-wrapper">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: '#C8F135', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <div className="input-icon-wrapper">
                <span className="input-icon"><FiLock size={15} /></span>
                <input id="login-password" name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange}
                  placeholder="••••••••" className={`input ${errors.password ? 'input-error' : ''}`} autoComplete="current-password" />
                <span className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </span>
              </div>
              {errors.password && <span className="input-error-msg">⚠ {errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '13px', fontSize: '0.95rem', marginTop: '8px' }} id="login-submit-btn">
              {loading ? (
                <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Signing in...</>
              ) : (
                <>Sign In <FiArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="divider-text" style={{ marginTop: '20px', fontSize: '0.8rem' }}>Don't have an account?</div>
          <Link to="/register" className="btn btn-secondary" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>
            Create free account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
