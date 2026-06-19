import { useState } from 'react';
import Modal from './Modal';
import { FiAlertTriangle, FiTrash2, FiCheck } from 'react-icons/fi';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // danger | warning | info
  isLoading = false,
}) => {
  const variantMap = {
    danger: { icon: <FiTrash2 size={24} />, iconBg: 'rgba(239,68,68,0.15)', iconColor: '#EF4444', btnClass: 'btn-danger' },
    warning: { icon: <FiAlertTriangle size={24} />, iconBg: 'rgba(245,158,11,0.15)', iconColor: '#F59E0B', btnClass: 'btn', btnStyle: { background: '#F59E0B', color: '#0D0F14', borderColor: '#F59E0B' } },
    info: { icon: <FiCheck size={24} />, iconBg: 'rgba(59,130,246,0.15)', iconColor: '#3B82F6', btnClass: 'btn', btnStyle: { background: '#3B82F6', color: 'white', borderColor: '#3B82F6' } },
  };

  const v = variantMap[variant] || variantMap.danger;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false} closeOnOverlay={!isLoading}>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: v.iconBg, color: v.iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          {v.icon}
        </div>

        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', marginBottom: '10px' }}>{title}</h3>
        <p style={{ color: '#9CA3AF', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '24px' }}>{message}</p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
            style={{ minWidth: '110px' }}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${v.btnClass}`}
            onClick={onConfirm}
            disabled={isLoading}
            style={{ minWidth: '110px', ...v.btnStyle }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                Processing...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
