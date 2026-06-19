import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  className = '',
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMap = { sm: '400px', md: '560px', lg: '720px', xl: '900px', full: '95vw' };
  const maxWidth = sizeMap[size] || '560px';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', animation: 'overlayIn 0.15s ease',
      }}
      onClick={closeOnOverlay ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal panel */}
      <div
        ref={modalRef}
        className={`animate-scale-in ${className}`}
        style={{
          position: 'relative', zIndex: 1,
          background: '#12151C',
          border: '1px solid #2A3045',
          borderRadius: '16px',
          width: '100%', maxWidth,
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        {(title || showClose) && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 0',
          }}>
            {title && (
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 700 }}>
                {title}
              </h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid #2A3045',
                  borderRadius: '8px', cursor: 'pointer',
                  color: '#6B7280', padding: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease', marginLeft: 'auto',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1A1F2C'; e.currentTarget.style.color = '#F0F2F8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6B7280'; }}
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
