import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  // Styles based on variants
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
  
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-brand-orange hover:bg-brand-orange-dark text-white shadow-md shadow-brand-orange/10 border border-brand-orange hover:shadow-lg hover:shadow-brand-orange/20',
    secondary: 'bg-brand-slate hover:bg-brand-slate-medium border border-brand-slate text-white',
    outline: 'border border-brand-orange bg-transparent text-brand-orange hover:bg-brand-orange-pale',
    ghost: 'bg-transparent hover:bg-brand-slate-pale text-brand-slate-light hover:text-brand-slate border border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm border border-red-700',
    glass: 'bg-white/80 hover:bg-white border border-brand-border text-brand-slate hover:bg-brand-slate-pale shadow-sm',
  };

  const spinner = (
    <svg
      className="animate-spin h-4 w-4 text-current"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading && spinner}
      {!loading && icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {!loading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
};

export default Button;
