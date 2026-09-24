import React from 'react';

interface CustomLabGridIconProps {
  className?: string;
  size?: number;
}

export const CustomLabGridIcon: React.FC<CustomLabGridIconProps> = ({
  className = '',
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded shadow-xs border border-slate-700 ${className}`}
    >
      <title>Lab Tracker Custom 6-Grid Icon</title>
      {/* Outer Rectangle Container */}
      <rect x="0" y="0" width="36" height="24" rx="3" fill="#0f172a" />

      {/* Row 1 (Top): Squares 1, 2, 3 - Dark Blue */}
      <rect x="2" y="2" width="10" height="9" rx="1.5" fill="#1e3a8a" />
      <rect x="13" y="2" width="10" height="9" rx="1.5" fill="#1e3a8a" />
      <rect x="24" y="2" width="10" height="9" rx="1.5" fill="#1e3a8a" />

      {/* Row 2 (Bottom): Square 4 - Light bluish-gray, Square 5 - White, Square 6 - Soft calm yellow */}
      <rect x="2" y="13" width="10" height="9" rx="1.5" fill="#94a3b8" />
      <rect x="13" y="13" width="10" height="9" rx="1.5" fill="#ffffff" />
      <rect x="24" y="13" width="10" height="9" rx="1.5" fill="#fef08a" />
    </svg>
  );
};
