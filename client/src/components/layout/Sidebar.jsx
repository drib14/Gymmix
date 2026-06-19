import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome, FiActivity, FiTarget, FiBookOpen,
  FiTrendingUp, FiUser, FiSettings, FiShield,
  FiBarChart2, FiHeart
} from 'react-icons/fi';
import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';
import { MdOutlineFoodBank } from 'react-icons/md';
import { LogoIcon } from '../ui/Logo';
import useAuthStore from '../../store/authStore';

const navItems = [
  { label: 'Dashboard', icon: <FiHome size={18} />, to: '/dashboard' },
  { label: 'Exercises', icon: <GiMuscleUp size={18} />, to: '/exercises' },
  { label: 'Workout Plans', icon: <GiWeightLiftingUp size={18} />, to: '/workouts' },
  { label: 'Workout History', icon: <FiActivity size={18} />, to: '/workout-history' },
  { label: 'Nutrition', icon: <MdOutlineFoodBank size={18} />, to: '/nutrition' },
  { label: 'Body Metrics', icon: <FiTrendingUp size={18} />, to: '/metrics' },
  { label: 'Goals', icon: <FiTarget size={18} />, to: '/goals' },
  { label: 'Analytics', icon: <FiBarChart2 size={18} />, to: '/analytics' },
];

const bottomItems = [
  { label: 'Blog & FAQ', icon: <FiBookOpen size={18} />, to: '/blog' },
  { label: 'Pricing', icon: <FiHeart size={18} />, to: '/pricing' },
  { label: 'Profile', icon: <FiUser size={18} />, to: '/profile' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const navLinkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 14px',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#C8F135' : '#6B7280',
    background: isActive ? 'rgba(200,241,53,0.1)' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    borderLeft: isActive ? '3px solid #C8F135' : '3px solid transparent',
    marginLeft: '0',
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 90,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'none',
          }}
          id="sidebar-overlay"
        />
      )}

      <aside
        id="main-sidebar"
        style={{
          position: 'fixed',
          top: 'var(--navbar-height)',
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          background: '#12151C',
          borderRight: '1px solid #1F2535',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 91,
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Subscription tier banner */}
        {user?.subscriptionTier && user.subscriptionTier !== 'free' && (
          <div style={{
            margin: '12px 14px',
            background: 'linear-gradient(135deg, rgba(200,241,53,0.15), rgba(200,241,53,0.05))',
            border: '1px solid rgba(200,241,53,0.3)',
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <LogoIcon size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C8F135', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {user.subscriptionTier} Plan
            </span>
          </div>
        )}

        {/* Main nav */}
        <nav style={{ padding: '12px', flex: 1 }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4B5563', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '4px 14px 8px' }}>
            Main
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => navLinkStyle(isActive)}
              onMouseEnter={(e) => { if (!location.pathname.startsWith(item.to)) { e.currentTarget.style.color = '#F0F2F8'; e.currentTarget.style.background = '#1A1F2C'; } }}
              onMouseLeave={(e) => { if (!location.pathname.startsWith(item.to)) { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'transparent'; } }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Admin section */}
          {isAdmin && (
            <>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4B5563', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '16px 14px 8px' }}>
                Admin
              </p>
              <NavLink
                to="/admin"
                style={({ isActive }) => ({ ...navLinkStyle(isActive), color: isActive ? '#C8F135' : '#A855F7' })}
              >
                <FiShield size={18} /> Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        {/* Bottom nav */}
        <div style={{ padding: '12px', borderTop: '1px solid #1F2535' }}>
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => navLinkStyle(isActive)}
              onMouseEnter={(e) => { if (!location.pathname.startsWith(item.to)) { e.currentTarget.style.color = '#F0F2F8'; e.currentTarget.style.background = '#1A1F2C'; } }}
              onMouseLeave={(e) => { if (!location.pathname.startsWith(item.to)) { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'transparent'; } }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* User streak */}
        {user?.currentStreak > 0 && (
          <div style={{
            margin: '12px 14px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '1.2rem' }}>🔥</span>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', margin: 0 }}>{user.currentStreak} Day Streak</p>
              <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>Keep it going!</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
