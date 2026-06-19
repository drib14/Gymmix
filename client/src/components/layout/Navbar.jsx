import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiMenu, FiX, FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { LogoFull } from '../ui/Logo';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import useToast from '../../hooks/useToast';
import api from '../../services/api';

const Navbar = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount, notifications, markAsRead, markAllRead } = useNotificationStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handle = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!', 'Goodbye!');
    navigate('/');
  };

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'G';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 'var(--navbar-height)',
      background: 'rgba(13,15,20,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #1F2535',
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      gap: '16px',
    }}>
      {/* Mobile menu toggle */}
      {isAuthenticated && (
        <button
          onClick={onMenuToggle}
          className="btn btn-ghost btn-icon hide-desktop"
          style={{ display: 'none' }}
          id="navbar-menu-toggle"
        >
          {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      )}

      {/* Logo */}
      <Link to={isAuthenticated ? '/dashboard' : '/'} style={{ textDecoration: 'none', flexShrink: 0 }}>
        <LogoFull size={22} fontSize="1.3rem" />
      </Link>

      <div style={{ flex: 1 }} />

      {!isAuthenticated ? (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              style={{ position: 'relative' }}
              id="navbar-notifications"
            >
              <FiBell size={20} className={unreadCount > 0 ? 'animate-notification' : ''} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', right: '4px',
                  background: '#EF4444', color: 'white',
                  borderRadius: '50%', width: '16px', height: '16px',
                  fontSize: '0.6rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #0D0F14',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="animate-fade-in-down" style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#12151C', border: '1px solid #2A3045',
                borderRadius: '14px', width: '340px', maxHeight: '420px',
                overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              }}>
                <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1F2535' }}>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => { markAllRead(); api.put('/notifications/read-all').catch(() => {}); }}
                      style={{ background: 'none', border: 'none', color: '#C8F135', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '0.85rem' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</div>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        style={{
                          padding: '12px 16px', cursor: 'pointer',
                          background: n.isRead ? 'transparent' : 'rgba(200,241,53,0.04)',
                          borderLeft: n.isRead ? 'none' : '3px solid #C8F135',
                          borderBottom: '1px solid #1F2535',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#1A1F2C')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(200,241,53,0.04)')}
                      >
                        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F0F2F8', marginBottom: '2px' }}>{n.title}</p>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid #2A3045',
                borderRadius: '10px', padding: '6px 10px 6px 6px',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C8F135')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2A3045')}
              id="navbar-profile-btn"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="avatar avatar-sm" />
              ) : (
                <div className="avatar-placeholder avatar-sm">{initials}</div>
              )}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F0F2F8', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName}
              </span>
              <FiChevronDown size={14} style={{ color: '#6B7280', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {profileOpen && (
              <div className="animate-fade-in-down" style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#12151C', border: '1px solid #2A3045',
                borderRadius: '12px', minWidth: '200px', overflow: 'hidden',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1F2535' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F0F2F8' }}>{user?.firstName} {user?.lastName}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>@{user?.username}</p>
                  {user?.subscriptionTier !== 'free' && (
                    <span className="badge badge-accent" style={{ marginTop: '4px' }}>{user?.subscriptionTier}</span>
                  )}
                </div>
                {[
                  { icon: <FiUser size={15} />, label: 'Profile', to: '/profile' },
                  { icon: <FiSettings size={15} />, label: 'Settings', to: '/profile/settings' },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setProfileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 16px', color: '#9CA3AF', fontSize: '0.85rem',
                      textDecoration: 'none', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1A1F2C'; e.currentTarget.style.color = '#F0F2F8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}
                  >
                    {item.icon} {item.label}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid #1F2535' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 16px', color: '#EF4444', fontSize: '0.85rem',
                      background: 'none', border: 'none', cursor: 'pointer', width: '100%',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    id="navbar-logout-btn"
                  >
                    <FiLogOut size={15} /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
