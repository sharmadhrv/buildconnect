import React, { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  icon?: ReactNode;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, description, icon, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label className="text-xs font-semibold text-brand-slate-light uppercase tracking-wide select-none">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-brand-slate-light pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`w-full bg-white border ${
              error ? 'border-red-500/80 focus:ring-red-500/30' : 'border-brand-border focus:border-brand-orange focus:ring-brand-orange/20'
            } rounded-xl px-4 py-3 text-sm text-brand-slate placeholder-brand-slate-light/50 outline-none transition-all duration-300 focus:ring-4 ${
              icon ? 'pl-11' : ''
            } ${className}`}
            {...props}
          />
        </div>

        {description && !error && (
          <p className="text-xs text-brand-slate-light leading-normal">{description}</p>
        )}

        {error && (
          <p className="text-xs text-red-500 font-medium leading-normal animate-shake">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
