import { useEffect, useRef } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import useToastStore from '../../store/toastStore';

const ICONS = {
  success: <FiCheckCircle size={18} />,
  error: <FiXCircle size={18} />,
  warning: <FiAlertTriangle size={18} />,
  info: <FiInfo size={18} />,
};

const COLOR_MAP = {
  success: { border: '#22C55E', bg: 'rgba(34,197,94,0.08)', icon: '#22C55E' },
  error: { border: '#EF4444', bg: 'rgba(239,68,68,0.08)', icon: '#EF4444' },
  warning: { border: '#F59E0B', bg: 'rgba(245,158,11,0.08)', icon: '#F59E0B' },
  info: { border: '#3B82F6', bg: 'rgba(59,130,246,0.08)', icon: '#3B82F6' },
};

const Toast = ({ toast }) => {
  const removeToast = useToastStore((s) => s.removeToast);
  const colors = COLOR_MAP[toast.type] || COLOR_MAP.info;
  const progressRef = useRef(null);

  useEffect(() => {
    if (!progressRef.current || !toast.duration) return;
    progressRef.current.style.transition = `width ${toast.duration}ms linear`;
    progressRef.current.style.width = '0%';
  }, [toast.duration]);

  return (
    <div
      className="animate-slide-in-right"
      style={{
        background: '#1A1F2C',
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        maxWidth: '360px',
        width: '100%',
        boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px ${colors.border}20`,
        position: 'relative',
        overflow: 'hidden',
        animation: 'slideInRight 0.3s ease',
      }}
    >
      {/* Progress bar */}
      {toast.duration > 0 && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.05)' }}>
          <div
            ref={progressRef}
            style={{ height: '100%', width: '100%', background: colors.border, borderRadius: '0 0 12px 12px' }}
          />
        </div>
      )}

      {/* Icon */}
      <div style={{ color: colors.icon, flexShrink: 0, marginTop: '1px' }}>{ICONS[toast.type]}</div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F0F2F8', marginBottom: '2px', fontFamily: 'Outfit, sans-serif' }}>
            {toast.title}
          </p>
        )}
        <p style={{ fontSize: '0.8rem', color: '#9CA3AF', lineHeight: 1.5, margin: 0 }}>{toast.message}</p>
      </div>

      {/* Close */}
      <button
        onClick={() => removeToast(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '2px', flexShrink: 0, marginTop: '1px' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#F0F2F8')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
      >
        <FiX size={14} />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'all' }}>
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
