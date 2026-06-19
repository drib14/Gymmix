import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAtSign, FiArrowRight } from 'react-icons/fi';
import { HiLightningBolt } from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';

const Register = () => {
  const navigate = useNavigate();
  const { setRegistrationUserId } = useAuthStore();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '',
    email: '', password: '', confirmPassword: '',
    acceptedTerms: false, acceptedPrivacy: false,
    newsletterSubscribed: false,
  });

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.username.trim() || form.username.length < 3) e.username = 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Username: letters, numbers, underscores only';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.acceptedTerms) e.acceptedTerms = 'You must accept the Terms of Service';
    if (!form.acceptedPrivacy) e.acceptedPrivacy = 'You must accept the Privacy Policy';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        ...form,
        acceptedTerms: form.acceptedTerms.toString(),
        acceptedPrivacy: form.acceptedPrivacy.toString(),
      });
      setRegistrationUserId(res.data.data.userId);
      toast.success('Account created! Please verify your email.', '🎉 Almost there!');
      navigate('/verify-email');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, type = 'text', icon, placeholder, rightIcon }) => (
    <div className="input-wrapper">
      <label className="input-label" htmlFor={`register-${name}`}>{label}</label>
      <div className="input-icon-wrapper">
        <span className="input-icon">{icon}</span>
        <input
          id={`register-${name}`}
          name={name}
          type={type}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`input ${errors[name] ? 'input-error' : ''}`}
          autoComplete={name}
        />
        {rightIcon && <span className="input-icon-right" onClick={rightIcon.onClick}>{rightIcon.el}</span>}
      </div>
      {errors[name] && <span className="input-error-msg">⚠ {errors[name]}</span>}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', paddingTop: '80px',
      background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(200,241,53,0.06), transparent)',
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }} className="animate-fade-in-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #C8F135, #A8D020)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D0F14' }}>
              <HiLightningBolt size={22} />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '2px', color: '#F0F2F8' }}>
              GYM<span style={{ color: '#C8F135' }}>MIX</span>
            </span>
          </Link>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '6px' }}>Create your account</h2>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Start your fitness journey today</p>
        </div>

        <div className="card" style={{ background: '#12151C', border: '1px solid #1F2535' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field name="firstName" label="First Name" icon={<FiUser size={15} />} placeholder="John" />
              <Field name="lastName" label="Last Name" icon={<FiUser size={15} />} placeholder="Doe" />
            </div>

            <Field name="username" label="Username" icon={<FiAtSign size={15} />} placeholder="johndoe" />
            <Field name="email" label="Email Address" type="email" icon={<FiMail size={15} />} placeholder="john@example.com" />

            <Field
              name="password" label="Password" type={showPass ? 'text' : 'password'}
              icon={<FiLock size={15} />} placeholder="Min. 6 characters"
              rightIcon={{ el: showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />, onClick: () => setShowPass(!showPass) }}
            />
            <Field
              name="confirmPassword" label="Confirm Password" type={showConfirm ? 'text' : 'password'}
              icon={<FiLock size={15} />} placeholder="Re-enter password"
              rightIcon={{ el: showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />, onClick: () => setShowConfirm(!showConfirm) }}
            />

            {/* Legal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: '#1A1F2C', borderRadius: '10px', border: '1px solid #2A3045' }}>
              <label className="checkbox-wrapper" htmlFor="register-terms">
                <input type="checkbox" id="register-terms" name="acceptedTerms" checked={form.acceptedTerms} onChange={handleChange} />
                <span style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
                  I agree to the <Link to="/terms" target="_blank" style={{ color: '#C8F135' }}>Terms of Service</Link>
                </span>
              </label>
              {errors.acceptedTerms && <span className="input-error-msg">⚠ {errors.acceptedTerms}</span>}

              <label className="checkbox-wrapper" htmlFor="register-privacy">
                <input type="checkbox" id="register-privacy" name="acceptedPrivacy" checked={form.acceptedPrivacy} onChange={handleChange} />
                <span style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
                  I agree to the <Link to="/privacy" target="_blank" style={{ color: '#C8F135' }}>Privacy Policy</Link>
                </span>
              </label>
              {errors.acceptedPrivacy && <span className="input-error-msg">⚠ {errors.acceptedPrivacy}</span>}

              <label className="checkbox-wrapper" htmlFor="register-newsletter">
                <input type="checkbox" id="register-newsletter" name="newsletterSubscribed" checked={form.newsletterSubscribed} onChange={handleChange} />
                <span style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>Subscribe to newsletter for fitness tips and offers</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '13px', fontSize: '0.95rem', marginTop: '4px' }}
              id="register-submit-btn"
            >
              {loading ? (
                <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Creating account...</>
              ) : (
                <>Create Account <FiArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="divider-text" style={{ marginTop: '20px', fontSize: '0.8rem' }}>
            Already have an account?
          </div>
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>
            Log in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
