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
          <label className="text-sm font-medium text-slate-300 select-none">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`w-full bg-slate-900/60 border ${
              error ? 'border-rose-500/80 focus:ring-rose-500/30' : 'border-slate-800 focus:border-purple-500/80 focus:ring-purple-500/30'
            } rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-300 focus:ring-4 ${
              icon ? 'pl-11' : ''
            } ${className}`}
            {...props}
          />
        </div>

        {description && !error && (
          <p className="text-xs text-slate-400 leading-normal">{description}</p>
        )}

        {error && (
          <p className="text-xs text-rose-400 font-medium leading-normal animate-shake">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
