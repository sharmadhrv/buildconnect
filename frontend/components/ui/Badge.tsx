import React, { HTMLAttributes } from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'glass';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full border transition-all duration-350 select-none';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] leading-3 tracking-wide',
    md: 'px-2.5 py-1 text-xs leading-4 tracking-normal',
  };

  const variantStyles = {
    primary: 'bg-brand-orange-pale border-brand-orange/20 text-brand-orange shadow-sm',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm',
    warning: 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm',
    danger: 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm',
    info: 'bg-sky-50 border-sky-200 text-sky-700 shadow-sm',
    neutral: 'bg-brand-slate-pale border-brand-slate-medium/10 text-brand-slate-light',
    glass: 'bg-white/40 border-brand-border text-brand-slate',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
