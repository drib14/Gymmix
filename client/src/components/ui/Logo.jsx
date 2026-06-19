import React from 'react';

export const LogoIcon = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        <linearGradient id="dumbbell-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C8F135" />
          <stop offset="100%" stopColor="#A8D020" />
        </linearGradient>
      </defs>
      {/* Central bar connecting the weights */}
      <rect x="24" y="44" width="52" height="12" rx="4" fill="url(#dumbbell-glow)" />
      
      {/* Left Inner Weight Plate */}
      <rect x="14" y="24" width="8" height="52" rx="3" fill="#E5E7EB" />
      {/* Left Outer Weight Plate */}
      <rect x="4" y="32" width="8" height="36" rx="2" fill="url(#dumbbell-glow)" />

      {/* Right Inner Weight Plate */}
      <rect x="78" y="24" width="8" height="52" rx="3" fill="#E5E7EB" />
      {/* Right Outer Weight Plate */}
      <rect x="88" y="32" width="8" height="36" rx="2" fill="url(#dumbbell-glow)" />
      
      {/* Superposed heartbeat / pulse line representing fitness tracking */}
      <path
        d="M 38,50 L 44,50 L 48,34 L 52,66 L 56,50 L 62,50"
        stroke="#0D0F14"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 38,50 L 44,50 L 48,34 L 52,66 L 56,50 L 62,50"
        stroke="url(#dumbbell-glow)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const LogoFull = ({ size = 24, fontSize = '1.3rem', iconSize, className = '' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} className={className}>
      <LogoIcon size={iconSize || size * 1.5} />
      <span
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 900,
          fontSize: fontSize,
          letterSpacing: '2px',
          color: '#F0F2F8',
        }}
      >
        GYM<span style={{ color: '#C8F135' }}>MIX</span>
      </span>
    </div>
  );
};

export default LogoFull;
