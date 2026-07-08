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
    primary: 'bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-sm shadow-purple-500/5',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-sm shadow-emerald-500/5',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-sm shadow-amber-500/5',
    danger: 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-sm shadow-rose-500/5',
    info: 'bg-sky-500/10 border-sky-500/30 text-sky-300 shadow-sm shadow-sky-500/5',
    neutral: 'bg-slate-800/80 border-slate-700/60 text-slate-300',
    glass: 'bg-white/5 border-white/10 text-white backdrop-blur-md',
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
