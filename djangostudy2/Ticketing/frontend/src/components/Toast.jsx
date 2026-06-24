import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          icon: <CheckCircle size={20} />
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
          icon: <AlertTriangle size={20} />
        };
      case 'error':
        return {
          bg: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#f43f5e',
          icon: <AlertCircle size={20} />
        };
      default:
        return {
          bg: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: '#8b5cf6',
          icon: <CheckCircle size={20} />
        };
    }
  };

  const style = getStyles();

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 20px',
      borderRadius: '16px',
      backgroundColor: style.bg,
      border: style.border,
      color: style.color,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      zIndex: 9999,
      animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
    }}>
      <span style={{ color: style.color }}>{style.icon}</span>
      <p style={{ margin: 0, fontWeight: 500, fontSize: '0.95rem' }}>{message}</p>
      <button 
        onClick={onClose} 
        style={{
          background: 'none',
          border: 'none',
          color: style.color,
          cursor: 'pointer',
          padding: '2px',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.7}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
